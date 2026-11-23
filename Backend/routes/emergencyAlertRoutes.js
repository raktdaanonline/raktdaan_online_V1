import express from "express";
import EmergencyAlert from "../models/EmergencyAlert.js";
import { getIo } from "../socket.js";

const router = express.Router();

// Helper to generate Alert ID: SOS-YYYY-RANDOM
const generateAlertId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SOS-${year}-${randomNum}`;
};

// GET all emergency alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find().sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    console.error("Error fetching emergency alerts:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST new emergency alert (from User side EmergencyAlert.jsx)
router.post("/", async (req, res) => {
  try {
    const {
      location,
      photo,
      photoName,
      date,
      time,
      bloodGroup,
      description,
      reportedBy,
      contact,
    } = req.body;

    if (!location) {
      return res.status(400).json({ success: false, message: "Location is required" });
    }

    const alertId = generateAlertId();
    const cleanLocation = location.replace(/^GPS:\s*/i, "");
    const title = description && description.trim().length > 5
      ? description.length > 55 ? description.substring(0, 55) + "..." : description
      : `Accident reported near ${cleanLocation.length > 35 ? cleanLocation.substring(0, 35) + "..." : cleanLocation}`;

    const newAlert = new EmergencyAlert({
      alertId,
      title,
      location,
      photo: photo || "",
      photoName: photoName || "incident_evidence.jpg",
      date: date || new Date().toISOString().split("T")[0],
      time: time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      bloodGroup: bloodGroup || "Any",
      description: description || "",
      reportedBy: reportedBy || "Citizen Bystander",
      contact: contact || "Direct SOS Relay",
      status: "critical",
      tag: "CRITICAL • 1-CLICK SOS",
      tagColor: "bg-red-100 text-red-800 border-red-200",
      casualties: "Emergency Trauma Reported",
      requirement: bloodGroup && bloodGroup !== "Any" ? `${bloodGroup} (Urgent Units Needed)` : "Urgent Medical & Blood Support",
      ambulanceStatus: "Ambulance #108 Dispatched",
      traumaAlerts: "Trauma Centers Alerted",
      verified: true,
    });

    await newAlert.save();

    // Real-time broadcast via Socket.IO
    try {
      const io = getIo();
      if (io) {
        io.emit("newEmergencyAlert", newAlert);
      }
    } catch (socketErr) {
      console.warn("Socket broadcast error:", socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Emergency alert registered and dispatched successfully",
      data: newAlert,
    });
  } catch (error) {
    console.error("Error creating emergency alert:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// PATCH update status (Admin side)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    let alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) {
      alert = await EmergencyAlert.findOne({ alertId: req.params.id });
    }
    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }

    alert.status = status;
    if (status === "resolved") {
      alert.tag = "RESOLVED & CLOSED";
      alert.tagColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
    } else if (status === "stabilized") {
      alert.tag = "STABILIZED";
      alert.tagColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    await alert.save();

    try {
      const io = getIo();
      if (io) {
        io.emit("emergencyAlertUpdated", alert);
      }
    } catch (socketErr) {
      console.warn("Socket emit error:", socketErr.message);
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE emergency alert
router.delete("/:id", async (req, res) => {
  try {
    let alert = await EmergencyAlert.findByIdAndDelete(req.params.id);
    if (!alert) {
      alert = await EmergencyAlert.findOneAndDelete({ alertId: req.params.id });
    }
    res.json({ success: true, message: "Alert deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

