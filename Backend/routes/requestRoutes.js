import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import { verifyToken } from "./authRoutes.js";

const router = express.Router();

// Generate Request ID helper
const generateRequestId = async () => {
  const year = new Date().getFullYear();
  let unique = false;
  let requestId = "";
  
  while (!unique) {
    const randomDigits = Math.floor(100 + Math.random() * 900); // 3 digits
    requestId = `RD${year}${randomDigits}`;
    const existing = await BloodRequest.findOne({ requestId });
    if (!existing) unique = true;
  }
  return requestId;
};

// @route   POST /api/request/create
// @desc    Create a new blood request
// @access  Private
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { patientName, bloodGroup, units, hospital, city, urgency, neededBy, additionalInfo } = req.body;
    
    // Validate required
    if (!patientName || !bloodGroup || !units || !hospital) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const requestId = await generateRequestId();

    const newRequest = new BloodRequest({
      requestId,
      recipient: req.user.id,
      patientName,
      bloodGroup,
      units,
      hospital,
      city,
      urgency,
      neededBy,
      additionalInfo,
      status: "pending"
    });

    await newRequest.save();

    res.status(201).json({ success: true, message: "Request created successfully", data: newRequest });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/request/my-requests
// @desc    Get all requests by logged in user
// @access  Private
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/request/active
// @desc    Get all active/pending emergency requests
// @access  Public or Private (Donors)
router.get("/active", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: { $in: ["active", "pending"] } })
      .populate("recipient", "name mobile")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   GET /api/request/:requestId
// @desc    Get single request status by ID
// @access  Public (for WhatsApp sharing tracking)
router.get("/:requestId", async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ requestId: req.params.requestId })
      .populate("recipient", "name mobile")
      .populate("acceptedBy", "name mobile");
      
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PATCH /api/request/:requestId/status
// @desc    Update request status (Admin only in real app, but for now open or protected)
// @access  Private
router.patch("/:requestId/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await BloodRequest.findOne({ requestId: req.params.requestId });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.status = status;
    
    // Update timestamps based on status
    if (status === "active" && !request.donorsNotifiedAt) {
      request.adminSeenAt = new Date();
      request.donorsNotifiedAt = new Date();
    } else if (status === "fulfilled" && !request.fulfilledAt) {
      request.fulfilledAt = new Date();
    }

    await request.save();
    
    res.status(200).json({ success: true, message: "Status updated", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
