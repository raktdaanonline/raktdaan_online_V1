import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/admin/notifications
 * Fetch in-app notifications for the admin
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { limit = 30, page = 1, isRead } = req.query;
    const query = {
      $or: [
        { recipientRole: "admin" },
        { adminId: req.admin?.id },
      ],
    };

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("eventId", "title category startDate"),
      Notification.countDocuments(query),
      Notification.countDocuments({
        $or: [
          { recipientRole: "admin" },
          { adminId: req.admin?.id },
        ],
        isRead: false,
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      total,
      unreadCount,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    console.error("Error fetching admin notifications:", err);
    res.status(500).json({ success: false, message: "Error fetching notifications", error: err.message });
  }
});

/**
 * GET /api/admin/notifications/unread-count
 * Quick fetch for the header notification bell badge
 */
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      $or: [
        { recipientRole: "admin" },
        { adminId: req.admin?.id },
      ],
      isRead: false,
    });

    res.json({ success: true, count: unreadCount });
  } catch (err) {
    console.error("Error fetching unread notification count:", err);
    res.status(500).json({ success: false, message: "Error fetching unread count", error: err.message });
  }
});

/**
 * PATCH /api/admin/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID format" });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        $set: {
          isRead: true,
          status: "read",
          readAt: new Date(),
        },
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (err) {
    console.error("Error marking notification read:", err);
    res.status(500).json({ success: false, message: "Error updating notification", error: err.message });
  }
});

/**
 * PATCH /api/admin/notifications/read-all
 * Mark all admin notifications as read
 */
router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        $or: [
          { recipientRole: "admin" },
          { adminId: req.admin?.id },
        ],
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          status: "read",
          readAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error marking all notifications read:", err);
    res.status(500).json({ success: false, message: "Error updating notifications", error: err.message });
  }
});

export default router;
