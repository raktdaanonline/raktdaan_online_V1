import express from "express";
import crypto from "crypto";
import InvitedHospital from "../models/InvitedHospital.js";
import Hospital from "../models/Hospital.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { hashToken } from "../utils/tokenUtils.js";
import { sendEmail } from "../utils/sendEmail.js";
import { emailTemplates } from "../utils/emailTemplates.js";

const router = express.Router();

/**
 * Helper to get Hospital frontend base URL
 */
const getHospitalFrontendUrl = () => {
  return process.env.HOSPITAL_FRONTEND_URL || "http://localhost:5175";
};

// =========================================================================
// 1. SEND HOSPITAL INVITATION
// POST /api/admin/hospitals/invite
// =========================================================================
router.post("/invite", verifyToken, async (req, res) => {
  try {
    const { hospitalName, email } = req.body;

    if (!hospitalName || !hospitalName.trim()) {
      return res.status(400).json({ success: false, message: "Hospital name is required" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Hospital email address is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = hospitalName.trim();

    // Check if hospital is already registered
    const existingHospital = await Hospital.findOne({ email: cleanEmail });
    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: `A hospital with email "${cleanEmail}" is already registered (Status: ${existingHospital.status}).`,
      });
    }

    // Check if an active invitation exists
    const existingInvite = await InvitedHospital.findOne({
      email: cleanEmail,
      invitationStatus: "INVITED",
      invitationExpiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: `An active invitation already exists for "${cleanEmail}". You can resend it from the table below.`,
      });
    }

    // Generate unique 32-byte secure token and hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const invitationTokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 Hours

    const newInvitation = await InvitedHospital.create({
      hospitalName: cleanName,
      email: cleanEmail,
      invitationTokenHash,
      rawToken,
      invitationExpiresAt: expiresAt,
      invitationStatus: "INVITED",
      invitedBy: req.admin?._id || req.admin?.id || null,
      invitedAt: new Date(),
    });

    const registrationUrl = `${getHospitalFrontendUrl()}/register/${rawToken}`;

    // Send invitation email
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: "You Are Invited to Register Your Hospital",
      html: emailTemplates.hospitalInvitation(cleanName, registrationUrl),
    });

    return res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${cleanEmail}`,
      invitation: newInvitation,
      emailDelivered: emailResult.success,
      registrationUrl: process.env.NODE_ENV !== "production" ? registrationUrl : undefined,
    });
  } catch (error) {
    console.error("Error in /admin/hospitals/invite:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 2. GET ALL INVITATIONS (Auto-mark expired ones)
// GET /api/admin/hospitals/invitations
// =========================================================================
router.get("/invitations", verifyToken, async (req, res) => {
  try {
    // Automatically update expired invitations
    await InvitedHospital.updateMany(
      {
        invitationStatus: "INVITED",
        invitationExpiresAt: { $lt: new Date() },
      },
      {
        $set: { invitationStatus: "EXPIRED" },
      }
    );

    const rawInvitations = await InvitedHospital.find()
      .sort({ createdAt: -1 })
      .populate("invitedBy", "name email");

    const invitations = rawInvitations.map((inv) => {
      const obj = inv.toObject();
      if (obj.rawToken) {
        obj.registrationUrl = `${getHospitalFrontendUrl()}/register/${obj.rawToken}`;
      }
      return obj;
    });

    return res.json({ success: true, count: invitations.length, invitations });
  } catch (error) {
    console.error("Error fetching hospital invitations:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 3. RESEND INVITATION
// POST /api/admin/hospitals/invitations/:id/resend
// =========================================================================
router.post("/invitations/:id/resend", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await InvitedHospital.findById(id);

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation record not found" });
    }

    if (invitation.invitationStatus === "REGISTERED") {
      return res.status(400).json({
        success: false,
        message: "This hospital has already registered and cannot be re-invited.",
      });
    }

    // Generate new raw token and update hash & expiry
    const rawToken = crypto.randomBytes(32).toString("hex");
    invitation.rawToken = rawToken;
    invitation.invitationTokenHash = hashToken(rawToken);
    invitation.invitationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    invitation.invitationStatus = "INVITED";
    invitation.invitedAt = new Date();
    await invitation.save();

    const registrationUrl = `${getHospitalFrontendUrl()}/register/${rawToken}`;

    const emailResult = await sendEmail({
      to: invitation.email,
      subject: "You Are Invited to Register Your Hospital",
      html: emailTemplates.hospitalInvitation(invitation.hospitalName, registrationUrl),
    });

    return res.json({
      success: true,
      message: `Invitation resent successfully to ${invitation.email}`,
      invitation,
      emailDelivered: emailResult.success,
      registrationUrl: registrationUrl,
    });
  } catch (error) {
    console.error("Error resending invitation:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 3.1 GET REGISTRATION LINK (For Copy Link Action)
// GET /api/admin/hospitals/invitations/:id/link
// =========================================================================
router.get("/invitations/:id/link", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await InvitedHospital.findById(id);

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    if (invitation.invitationStatus === "REGISTERED") {
      return res.status(400).json({
        success: false,
        message: "This hospital has already completed registration.",
      });
    }

    // If invitation was created without rawToken, generate one and update hash
    if (!invitation.rawToken) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      invitation.rawToken = rawToken;
      invitation.invitationTokenHash = hashToken(rawToken);
      if (new Date() > new Date(invitation.invitationExpiresAt)) {
        invitation.invitationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        invitation.invitationStatus = "INVITED";
      }
      await invitation.save();
    }

    const registrationUrl = `${getHospitalFrontendUrl()}/register/${invitation.rawToken}`;

    return res.json({
      success: true,
      registrationUrl,
      rawToken: invitation.rawToken,
    });
  } catch (error) {
    console.error("Error retrieving invitation link:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 4. CANCEL INVITATION
// DELETE /api/admin/hospitals/invitations/:id
// =========================================================================
router.delete("/invitations/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await InvitedHospital.findById(id);

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation record not found" });
    }

    if (invitation.invitationStatus === "REGISTERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an invitation that is already registered.",
      });
    }

    invitation.invitationStatus = "CANCELLED";
    await invitation.save();

    return res.json({ success: true, message: "Invitation successfully cancelled", invitation });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 5. GET HOSPITAL REGISTRATION REQUESTS
// GET /api/admin/hospitals/requests
// =========================================================================
router.get("/requests", verifyToken, async (req, res) => {
  try {
    const requests = await Hospital.find()
      .sort({ createdAt: -1 })
      .populate("approvedBy", "name email")
      .populate("invitationId");

    return res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error("Error fetching hospital requests:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 6. GET SINGLE REGISTRATION REQUEST DETAILS
// GET /api/admin/hospitals/requests/:id
// =========================================================================
router.get("/requests/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Hospital.findById(id)
      .populate("approvedBy", "name email")
      .populate("invitationId");

    if (!request) {
      return res.status(404).json({ success: false, message: "Hospital registration request not found" });
    }

    return res.json({ success: true, request });
  } catch (error) {
    console.error("Error fetching request details:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 7. APPROVE HOSPITAL REGISTRATION
// PATCH /api/admin/hospitals/:id/approve
// =========================================================================
router.patch("/:id/approve", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    hospital.status = "APPROVED";
    hospital.approvedAt = new Date();
    hospital.approvedBy = req.admin?._id || req.admin?.id || null;
    hospital.rejectionReason = "";
    await hospital.save();

    const loginUrl = `${getHospitalFrontendUrl()}/login`;

    // Send approval email
    const emailResult = await sendEmail({
      to: hospital.email,
      subject: "Your Hospital Account Has Been Approved",
      html: emailTemplates.hospitalApproval(hospital.hospitalName, hospital.email, loginUrl),
    });

    return res.json({
      success: true,
      message: `Hospital "${hospital.hospitalName}" approved successfully. Approval notification dispatched.`,
      hospital,
      emailDelivered: emailResult.success,
    });
  } catch (error) {
    console.error("Error approving hospital:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// =========================================================================
// 8. REJECT HOSPITAL REGISTRATION
// PATCH /api/admin/hospitals/:id/reject
// =========================================================================
router.patch("/:id/reject", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    hospital.status = "REJECTED";
    hospital.rejectionReason = reason ? reason.trim() : "Registration requirements not satisfied.";
    await hospital.save();

    // Send rejection email
    const emailResult = await sendEmail({
      to: hospital.email,
      subject: "Hospital Registration Update",
      html: emailTemplates.hospitalRejection(hospital.hospitalName, hospital.rejectionReason),
    });

    return res.json({
      success: true,
      message: `Hospital registration rejected. Notification dispatched to ${hospital.email}.`,
      hospital,
      emailDelivered: emailResult.success,
    });
  } catch (error) {
    console.error("Error rejecting hospital:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
