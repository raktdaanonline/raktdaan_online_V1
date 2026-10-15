import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Organizer from "../models/Organizer.js";
import BloodRequest from "../models/BloodRequest.js";
import { calculateDonationEligibility } from "../utils/badgeCalculator.js";

const router = express.Router();

// JWT Secret Key (should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || "raktdaan-super-secret-key";

// Helper to get latest request ID for a user
const getLatestRequestId = async (userId, mobile) => {
  try {
    const latest = await BloodRequest.findOne({
      $or: [
        { recipient: userId },
        { userId: userId },
        { requestedBy: userId },
        { mobile: mobile }
      ]
    }).sort({ createdAt: -1 });
    return latest ? latest.requestId : null;
  } catch (err) {
    console.error("Error getting latest request ID:", err);
    return null;
  }
};

// Middleware to verify JWT
export const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Access Denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: verified.id || verified._id,
      role: verified.role
    };

    if (!req.user.role) {
      const user = await User.findById(req.user.id);
      if (user) {
        req.user.role = user.role;
      }
    }
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid Token" });
  }
};

// Middleware to verify roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    next();
  };
};

import Otp from "../models/Otp.js";
import { sendOtpSms } from "../utils/smsService.js";

// Check if mobile number exists in database
router.post("/check-mobile", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }
    const cleanMobile = mobile.toString().replace(/\D/g, "").slice(-10);
    const user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `+91 ${cleanMobile}` },
        { mobile: new RegExp(cleanMobile + "$") }
      ]
    });
    if (user) {
      return res.json({
        exists: true,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          bloodGroup: user.bloodGroup,
          role: user.role || "recipient"
        }
      });
    }
    return res.json({ exists: false });
  } catch (err) {
    console.error("Check mobile error:", err);
    res.status(500).json({ success: false, message: "Server error checking mobile number" });
  }
});

// Send OTP via SMS
router.post("/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    const cleanMobile = mobile.toString().replace(/\D/g, "").slice(-10);
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, message: "Please provide a valid 10-digit mobile number" });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP record
    await Otp.deleteMany({ mobile: cleanMobile });
    await Otp.create({
      mobile: cleanMobile,
      otp,
      expiresAt,
      attempts: 0
    });

    console.log(`[AUTH] Generated OTP for +91 ${cleanMobile}: ${otp}`);

    // Send SMS via Dreamz Technology gateway
    const smsRes = await sendOtpSms(cleanMobile, otp);

    if (!smsRes.success) {
      console.error("[AUTH] SMS dispatch failed:", smsRes.error);
      return res.status(500).json({
        success: false,
        message: `SMS could not be delivered: ${smsRes.error || "Gateway error"}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanMobile}`,
      messageId: smsRes.messageId
    });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ success: false, message: "Server error sending OTP" });
  }
});

// Verify OTP directly
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
    }

    const cleanMobile = mobile.toString().replace(/\D/g, "").slice(-10);
    const otpValue = otp.toString().trim();

    const isDevBypass = process.env.NODE_ENV === "development" && otpValue === "123456";

    if (!isDevBypass) {
      const record = await Otp.findOne({ mobile: cleanMobile });
      if (!record) {
        return res.status(400).json({ success: false, message: "OTP expired or not requested. Please request a new OTP." });
      }
      if (new Date() > record.expiresAt) {
        await Otp.deleteOne({ _id: record._id });
        return res.status(400).json({ success: false, message: "OTP has expired. Please request a new OTP." });
      }
      if (record.attempts >= 5) {
        await Otp.deleteOne({ _id: record._id });
        return res.status(400).json({ success: false, message: "Too many incorrect attempts. Please request a new OTP." });
      }
      if (record.otp !== otpValue) {
        record.attempts = (record.attempts || 0) + 1;
        await record.save();
        return res.status(400).json({ success: false, message: "Invalid OTP. Please check and try again." });
      }
    }

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ success: false, message: "Server error verifying OTP" });
  }
});

// Register or Login User after successful OTP verification
router.post("/register", async (req, res) => {
  try {
    const { name, mobile, bloodGroup, city, state, role, age, weight, otp, isLogin } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    const cleanMobile = mobile.toString().replace(/\D/g, "").slice(-10);

    // Verify OTP if provided
    if (otp) {
      const otpValue = otp.toString().trim();
      const isDevBypass = process.env.NODE_ENV === "development" && otpValue === "123456";

      if (!isDevBypass) {
        const record = await Otp.findOne({ mobile: cleanMobile });
        if (!record) {
          return res.status(400).json({ success: false, message: "OTP has expired or was not requested. Please request a new OTP." });
        }
        if (new Date() > record.expiresAt) {
          await Otp.deleteOne({ _id: record._id });
          return res.status(400).json({ success: false, message: "OTP has expired. Please request a new OTP." });
        }
        if (record.attempts >= 5) {
          await Otp.deleteOne({ _id: record._id });
          return res.status(400).json({ success: false, message: "Too many incorrect attempts. Please request a new OTP." });
        }
        if (record.otp !== otpValue) {
          record.attempts = (record.attempts || 0) + 1;
          await record.save();
          return res.status(400).json({ success: false, message: "Invalid OTP. Please check and try again." });
        }
        // Consumed successfully
        await Otp.deleteOne({ _id: record._id });
      }
    }

    if (role === "donor" || (!role && isLogin === false)) {
      if (age && parseInt(age) < 18) {
        return res.status(400).json({ success: false, message: "We appreciate your willingness to save lives, but you do not meet the minimum eligibility requirements to register on this platform." });
      }
      if (weight && parseFloat(weight) < 50) {
        return res.status(400).json({ success: false, message: "We appreciate your willingness to save lives, but you do not meet the minimum eligibility requirements to register on this platform." });
      }
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `+91 ${cleanMobile}` },
        { mobile: new RegExp(cleanMobile + "$") }
      ]
    });

    if (!user) {
      if (isLogin) {
        return res.status(400).json({ success: false, message: "Mobile number is not registered. Please register first." });
      }
      if (!name || !bloodGroup) {
         return res.status(400).json({ success: false, message: "Name and blood group are required for new registration" });
      }
      // Create new user
      user = new User({
        name,
        mobile: cleanMobile,
        bloodGroup,
        city,
        state,
        role: role || "donor",
        isVerified: true,
        health: {
          age: age ? parseInt(age) : undefined,
          weight: weight ? parseFloat(weight) : undefined
        }
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Successfully authenticated",
      token,
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        city: user.city,
        isActive: user.isActive,
        isVerified: user.isVerified,
        activeRequestId: await getLatestRequestId(user._id, user.mobile)
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get Current User Profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const gender = user.gender || user.health?.gender || "Male";
    const eligibility = calculateDonationEligibility(gender, user.lastDonationDate);

    // Sync state to DB if outdated
    if (user.donationEligibilityStatus !== eligibility.status || user.daysRemaining !== eligibility.daysRemaining) {
      user.donationEligibilityStatus = eligibility.status;
      user.daysRemaining = eligibility.daysRemaining;
      user.donationGapDays = eligibility.gapDays;
      user.nextEligibleDonationDate = eligibility.nextEligibleDate ? new Date(eligibility.nextEligibleDate) : undefined;
      user.nextEligibleDate = eligibility.nextEligibleDate ? new Date(eligibility.nextEligibleDate) : undefined;
      await user.save();
    }

    const userObj = user.toObject();
    userObj.activeRequestId = await getLatestRequestId(user._id, user.mobile);
    res.status(200).json({ success: true, user: userObj, eligibility });
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update Current User Profile (Basic/Location/Availability ONLY)
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { 
      name, bloodGroup, city, state, pincode, address, 
      latitude, longitude, availableForEmergency, 
      canTravelDistance, preferredContactMethod, 
      emergencyContactName, emergencyContactNumber 
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update only basic and location fields explicitly (prevents health data override)
    if (name !== undefined) user.name = name;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;
    if (address !== undefined) user.address = address;
    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;
    if (availableForEmergency !== undefined) user.availableForEmergency = availableForEmergency;
    if (canTravelDistance !== undefined && canTravelDistance !== "" && canTravelDistance !== null) {
      const dist = Number(canTravelDistance);
      if ([5, 10, 20].includes(dist)) {
        user.canTravelDistance = dist;
      }
    }
    if (preferredContactMethod !== undefined && preferredContactMethod !== "" && preferredContactMethod !== null) {
      if (["Call", "WhatsApp", "SMS"].includes(preferredContactMethod)) {
        user.preferredContactMethod = preferredContactMethod;
      }
    }
    if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber !== undefined) user.emergencyContactNumber = emergencyContactNumber;

    // Compute completion flags dynamically
    const isProfileCompleted = !!(user.name && user.bloodGroup && user.city && user.state);
    const isLocationAdded = !!(user.address && user.latitude && user.longitude);
    user.profileCompleted = isProfileCompleted;
    user.locationAdded = isLocationAdded;

    await user.save();

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  // Since we use stateless JWT, client handles token deletion. Just send a success message.
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Organizer Login (Email + Password)
router.post("/organizer-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Please provide email and password" });

    let user = await User.findOne({ email, role: "organizer" });
    if (!user) {
      const legacyOrg = await Organizer.findOne({ email });
      if (legacyOrg) {
        // Resolve corresponding User model to ensure alignment with Camp.organizer ID
        const correspondingUser = await User.findOne({
          role: "organizer",
          $or: [
            { email: legacyOrg.email },
            { mobile: legacyOrg.phone }
          ]
        });
        user = correspondingUser || legacyOrg;
      }
    }

    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials or not an organizer" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "organizer" }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "organizer",
        mustChangePassword: user.mustChangePassword || false
      }
    });
  } catch (error) {
    console.error("Organizer login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Change Password
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Convert Recipient to Donor
router.patch("/convert-to-donor", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "donor") {
      return res.status(400).json({
        success: false,
        message: "User is already a donor"
      });
    }

    if (user.role !== "recipient") {
      return res.status(403).json({
        success: false,
        message: "Only recipient users can convert to donor"
      });
    }

    user.role = "donor";
    user.isAvailable = true;
    user.availableForEmergency = true;
    user.totalDonations = 0;
    user.badge = "new donor";
    user.donationHistory = [];
    user.preferredContactMethod = "Call";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "You are now registered as a donor",
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        city: user.city,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error("Convert to donor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to convert recipient to donor",
      error: error.message
    });
  }
});

// Get Recipient Profile Details
router.get("/recipient/profile", verifyToken, requireRole("recipient", "donor"), async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let requests = [];

    if (typeof BloodRequest !== "undefined") {
      requests = await BloodRequest.find({
        $or: [
          { recipient: userId },
          { userId: userId },
          { requestedBy: userId },
          { mobile: user.mobile }
        ]
      }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      user,
      requests
    });

  } catch (error) {
    console.error("Recipient profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load recipient profile",
      error: error.message
    });
  }
});

export default router;
