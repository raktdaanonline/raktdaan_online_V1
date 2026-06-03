import express from "express";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.admin ? req.admin.id : null);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notifications = await Notification.find({ userId })
      .populate("bloodRequestId", "bloodGroup hospital city urgency")
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
});

// Get unread notification count
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.admin ? req.admin.id : null);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching count", error: err.message });
  }
});

// Mark a notification as read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.admin ? req.admin.id : null);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Error updating notification", error: err.message });
  }
});

// Mark all notifications as read
router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.admin ? req.admin.id : null);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications", error: err.message });
  }
});

export default router;
