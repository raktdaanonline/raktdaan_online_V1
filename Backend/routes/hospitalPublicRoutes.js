import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import InvitedHospital from "../models/InvitedHospital.js";
import Hospital from "../models/Hospital.js";
import { hashToken } from "../utils/tokenUtils.js";

const router = express.Router();

/**
 * Middleware to verify hospital JWT
 */
export const verifyHospitalToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt_123");
    if (decoded.role !== "hospital") {
      return res.status(403).json({ success: false, message: "Unauthorized access: Hospital credentials required" });
    }

    const hospital = await Hospital.findById(decoded.id).select("-password");
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital account not found" });
    }

    if (hospital.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: `Account is not authorized. Current status: ${hospital.status}`,
      });
    }

    req.hospital = hospital;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
};

// =========================================================================
// 1. VALIDATE INVITATION TOKEN & PRE-FILL DETAILS
// GET /api/hospital/invitation/:token
// =========================================================================
router.get("/invitation/:token", async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: "Invitation token is required" });
    }

    const tokenHash = hashToken(token);
    const invitation = await InvitedHospital.findOne({ invitationTokenHash: tokenHash });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invalid invitation link. Please verify the URL from your invitation email.",
      });
    }

    if (invitation.invitationStatus === "REGISTERED") {
      return res.status(400).json({
        success: false,
        code: "ALREADY_REGISTERED",
        message: "This invitation link has already been used to register. Please login or contact Admin.",
      });
    }

    if (invitation.invitationStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        code: "CANCELLED",
        message: "This invitation has been cancelled by the platform administration.",
      });
    }

    if (new Date() > new Date(invitation.invitationExpiresAt)) {
      invitation.invitationStatus = "EXPIRED";
      await invitation.save();
      return res.status(400).json({
        success: false,
        code: "EXPIRED",
        message: "This invitation link has expired (48 hours limit exceeded). Please request a new invitation from Admin.",
      });
    }

    return res.json({
      success: true,
      hospitalName: invitation.hospitalName,
      email: invitation.email,
      expiresAt: invitation.invitationExpiresAt,
    });
  } catch (error) {
    console.error("Error validating invitation token:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 2. SUBMIT HOSPITAL REGISTRATION
// POST /api/hospital/register
// =========================================================================
router.post("/register", async (req, res) => {
  try {
    const { token, address, latitude, longitude, password, confirmPassword, phone } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Invitation token is required" });
    }

    // Token verification
    const tokenHash = hashToken(token);
    const invitation = await InvitedHospital.findOne({ invitationTokenHash: tokenHash });

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invalid or nonexistent invitation token" });
    }

    if (invitation.invitationStatus === "REGISTERED") {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been used to complete registration.",
      });
    }

    if (invitation.invitationStatus === "CANCELLED") {
      return res.status(400).json({ success: false, message: "This invitation has been cancelled." });
    }

    if (new Date() > new Date(invitation.invitationExpiresAt)) {
      invitation.invitationStatus = "EXPIRED";
      await invitation.save();
      return res.status(400).json({ success: false, message: "This invitation has expired." });
    }

    // Field validations
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: "Complete physical address is required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude. Must be a valid number between -90 and 90.",
      });
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude. Must be a valid number between -180 and 180.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match.",
      });
    }

    // Check if hospital already registered with this email
    const existing = await Hospital.findOne({ email: invitation.email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Hospital with email "${invitation.email}" is already registered.`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create hospital with PENDING status
    const newHospital = await Hospital.create({
      hospitalName: invitation.hospitalName,
      email: invitation.email,
      address: address.trim(),
      location: {
        latitude: lat,
        longitude: lng,
      },
      password: hashedPassword,
      status: "PENDING",
      invitationId: invitation._id,
      phone: phone ? phone.trim() : "",
    });

    // Mark invitation as REGISTERED
    invitation.invitationStatus = "REGISTERED";
    invitation.registeredAt = new Date();
    await invitation.save();

    return res.status(201).json({
      success: true,
      message:
        "Your hospital registration request has been submitted successfully. Your account is pending Admin approval. You will receive an email notification once your registration is approved.",
      hospitalId: newHospital._id,
    });
  } catch (error) {
    console.error("Error submitting hospital registration:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 3. HOSPITAL LOGIN SYSTEM
// POST /api/hospital/login
// =========================================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hospital = await Hospital.findOne({ email: cleanEmail });

    if (!hospital) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check account status
    if (hospital.status === "PENDING") {
      return res.status(403).json({
        success: false,
        status: "PENDING",
        message: "Your registration is awaiting Admin approval.",
      });
    }

    if (hospital.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        status: "REJECTED",
        message: "Your registration request has been rejected. Please contact Admin.",
        rejectionReason: hospital.rejectionReason,
      });
    }

    if (hospital.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        status: hospital.status,
        message: "Your hospital account is currently inactive.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: hospital._id,
        email: hospital.email,
        role: "hospital",
        hospitalName: hospital.hospitalName,
      },
      process.env.JWT_SECRET || "jwt_123",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Hospital login successful",
      token,
      hospital: {
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email,
        address: hospital.address,
        location: hospital.location,
        phone: hospital.phone,
        status: hospital.status,
      },
    });
  } catch (error) {
    console.error("Error during hospital login:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 4. HOSPITAL PROFILE
// GET /api/hospital/profile
// =========================================================================
router.get("/profile", verifyHospitalToken, async (req, res) => {
  try {
    return res.json({
      success: true,
      hospital: req.hospital,
    });
  } catch (error) {
    console.error("Error fetching hospital profile:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
