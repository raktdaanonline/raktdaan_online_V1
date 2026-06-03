import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// JWT Secret Key (should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || "raktdaan-super-secret-key";

// Middleware to verify JWT
export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Access Denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid Token" });
  }
};

// Register or Login User after successful Firebase OTP verification
router.post("/register", async (req, res) => {
  try {
    const { name, mobile, bloodGroup, city, role } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    // Check if user already exists
    let user = await User.findOne({ mobile });

    if (!user) {
      if (!name || !bloodGroup) {
         return res.status(400).json({ success: false, message: "Name and blood group are required for new registration" });
      }
      // Create new user
      user = new User({
        name,
        mobile,
        bloodGroup,
        city,
        role: role || "donor",
        isVerified: true,
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Successfully authenticated",
      token,
      user,
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

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
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

    const user = await User.findOne({ email, role: "organizer" });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials or not an organizer" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword
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

export default router;
