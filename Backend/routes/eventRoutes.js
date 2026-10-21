import express from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  buildRemindersList,
  reconcileReminders,
  formatEventDateIST,
  calculateNextOccurrence,
} from "../utils/eventReminderUtils.js";
import { processReminder } from "../cron/eventReminderScheduler.js";

const router = express.Router();

/**
 * Helper: Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/admin/events/analytics
 * Returns overview statistics and upcoming/failed event summaries
 */
router.get("/analytics", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const next10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalEvents,
      upcomingEventsCount,
      eventsThisMonthCount,
      todayEvents,
      next10DaysEvents,
      remindersScheduledAgg,
      remindersSentAgg,
      failedRemindersAgg,
      recentNotifications,
    ] = await Promise.all([
      Event.countDocuments({ status: { $ne: "archived" } }),
      Event.countDocuments({ status: "active", startDate: { $gte: startOfToday } }),
      Event.countDocuments({
        status: "active",
        startDate: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Event.find({
        status: "active",
        startDate: { $gte: startOfToday, $lte: endOfToday },
      }).sort({ startDate: 1 }),
      Event.find({
        status: "active",
        startDate: { $gte: startOfToday, $lte: next10Days },
      }).sort({ startDate: 1 }).limit(10),
      // Reminders pending
      Event.aggregate([
        { $unwind: "$reminders" },
        { $match: { "reminders.status": "pending", "reminders.enabled": true } },
        { $count: "count" },
      ]),
      // Reminders sent
      Event.aggregate([
        { $unwind: "$reminders" },
        { $match: { "reminders.status": "sent" } },
        { $count: "count" },
      ]),
      // Failed reminders
      Event.aggregate([
        { $unwind: "$reminders" },
        { $match: { "reminders.status": "failed" } },
        {
          $project: {
            title: "$title",
            startDate: "$startDate",
            category: "$category",
            reminder: "$reminders",
          },
        },
      ]),
      // Recent notifications
      Notification.find({ recipientRole: "admin" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("eventId", "title category startDate"),
    ]);

    const remindersScheduled = remindersScheduledAgg[0]?.count || 0;
    const remindersSent = remindersSentAgg[0]?.count || 0;
    const failedReminders = failedRemindersAgg || [];

    res.json({
      success: true,
      stats: {
        totalEvents,
        upcomingEvents: upcomingEventsCount,
        eventsThisMonth: eventsThisMonthCount,
        remindersScheduled,
        remindersSent,
        failedRemindersCount: failedReminders.length,
      },
      todayEvents,
      next10DaysEvents,
      failedReminders,
      recentNotifications,
    });
  } catch (err) {
    console.error("Error fetching event analytics:", err);
    res.status(500).json({ success: false, message: "Error fetching event analytics", error: err.message });
  }
});

/**
 * GET /api/admin/events
 * Fetch events with pagination, date range, search, category, and status filters
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      status,
      reminderStatus,
      search,
      page = 1,
      limit = 50,
      sortBy = "startDate",
      sortOrder = "asc",
    } = req.query;

    const query = {};

    // Filter by status (default excludes archived unless explicitly requested)
    if (status && status !== "all") {
      query.status = status;
    } else if (!status) {
      query.status = { $ne: "archived" };
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }

    // Search query
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { contactName: regex },
      ];
    }

    // Filter by reminder status if specified
    if (reminderStatus && reminderStatus !== "all") {
      query["reminders.status"] = reminderStatus;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate("createdBy", "email")
        .populate("updatedBy", "email"),
      Event.countDocuments(query),
    ]);

    // Enhance events with nextReminderDate for frontend display
    const enhancedEvents = events.map((evt) => {
      const obj = evt.toObject();
      const pendingReminders = (obj.reminders || [])
        .filter((r) => r.status === "pending" && r.enabled && new Date(r.scheduledAt) >= new Date())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

      obj.nextReminderDate = pendingReminders[0]?.scheduledAt || null;
      obj.nextReminderDaysBefore = pendingReminders[0]?.daysBefore ?? null;
      return obj;
    });

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      count: enhancedEvents.length,
      data: enhancedEvents,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Error fetching events", error: err.message });
  }
});

/**
 * GET /api/admin/events/:id
 * Fetch single event details
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID format" });
    }

    const event = await Event.findById(id)
      .populate("createdBy", "email")
      .populate("updatedBy", "email");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const obj = event.toObject();
    const pendingReminders = (obj.reminders || [])
      .filter((r) => r.status === "pending" && r.enabled && new Date(r.scheduledAt) >= new Date())
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    obj.nextReminderDate = pendingReminders[0]?.scheduledAt || null;
    obj.nextReminderDaysBefore = pendingReminders[0]?.daysBefore ?? null;

    res.json({ success: true, data: obj });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ success: false, message: "Error fetching event", error: err.message });
  }
});

/**
 * POST /api/admin/events
 * Create a new event and schedule its reminders
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      allDay = true,
      timezone = "Asia/Kolkata",
      location,
      contactName,
      contactPhone,
      contactEmail,
      imageUrl,
      recurrenceRule,
      reminders = [],
      status = "active",
    } = req.body;

    // Required fields validation
    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Event title is required" });
    }
    if (!startDate) {
      return res.status(400).json({ success: false, message: "Event start date is required" });
    }

    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid event start date format" });
    }

    let parsedEndDate = null;
    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid event end date format" });
      }
      if (parsedEndDate < parsedStartDate) {
        return res.status(400).json({ success: false, message: "End date cannot be earlier than start date" });
      }
    }

    const adminId = req.admin?.id && isValidObjectId(req.admin.id) ? req.admin.id : null;

    // Calculate reminder schedule with idempotency keys
    const builtReminders = buildRemindersList(parsedStartDate, reminders, null, Boolean(allDay));

    const newEvent = new Event({
      title: title.trim(),
      description: (description || "").trim(),
      category: category || "General Event",
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      allDay: Boolean(allDay),
      timezone: timezone || "Asia/Kolkata",
      location: (location || "").trim(),
      contactName: (contactName || "").trim(),
      contactPhone: (contactPhone || "").trim(),
      contactEmail: (contactEmail || "").trim(),
      imageUrl: imageUrl || "",
      recurrenceRule: recurrenceRule || { frequency: "none", interval: 1 },
      reminders: builtReminders,
      status: status || "active",
      createdBy: adminId,
      updatedBy: adminId,
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ success: false, message: "Error creating event", error: err.message });
  }
});

/**
 * PUT /api/admin/events/:id
 * Update event details and rebuild pending reminders safely
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID format" });
    }

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const {
      title,
      description,
      category,
      startDate,
      endDate,
      allDay,
      timezone,
      location,
      contactName,
      contactPhone,
      contactEmail,
      imageUrl,
      recurrenceRule,
      reminders,
      status,
    } = req.body;

    if (title && title.trim() === "") {
      return res.status(400).json({ success: false, message: "Event title cannot be empty" });
    }

    let parsedStartDate = existingEvent.startDate;
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid start date format" });
      }
    }

    let parsedEndDate = existingEvent.endDate;
    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        parsedEndDate = null;
      } else {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid end date format" });
        }
        if (parsedEndDate < parsedStartDate) {
          return res.status(400).json({ success: false, message: "End date cannot be earlier than start date" });
        }
      }
    }

    const isAllDay = allDay !== undefined ? Boolean(allDay) : existingEvent.allDay;

    // Reconcile reminders: preserve sent history and rebuild pending offsets
    let updatedReminders = existingEvent.reminders;
    if (reminders !== undefined || startDate !== undefined) {
      const targetConfigs = reminders !== undefined ? reminders : existingEvent.reminders;
      updatedReminders = reconcileReminders(
        existingEvent.reminders,
        parsedStartDate,
        targetConfigs,
        existingEvent._id,
        isAllDay
      );
    }

    const adminId = req.admin?.id && isValidObjectId(req.admin.id) ? req.admin.id : null;

    if (title !== undefined) existingEvent.title = title.trim();
    if (description !== undefined) existingEvent.description = description.trim();
    if (category !== undefined) existingEvent.category = category;
    existingEvent.startDate = parsedStartDate;
    existingEvent.endDate = parsedEndDate;
    if (allDay !== undefined) existingEvent.allDay = isAllDay;
    if (timezone !== undefined) existingEvent.timezone = timezone;
    if (location !== undefined) existingEvent.location = location.trim();
    if (contactName !== undefined) existingEvent.contactName = contactName.trim();
    if (contactPhone !== undefined) existingEvent.contactPhone = contactPhone.trim();
    if (contactEmail !== undefined) existingEvent.contactEmail = contactEmail.trim();
    if (imageUrl !== undefined) existingEvent.imageUrl = imageUrl;
    if (recurrenceRule !== undefined) existingEvent.recurrenceRule = recurrenceRule;
    if (status !== undefined) existingEvent.status = status;
    existingEvent.reminders = updatedReminders;
    if (adminId) existingEvent.updatedBy = adminId;

    await existingEvent.save();

    res.json({
      success: true,
      message: "Event updated successfully",
      data: existingEvent,
    });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ success: false, message: "Error updating event", error: err.message });
  }
});

/**
 * DELETE /api/admin/events/:id
 * Delete an event and cancel any pending reminders
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID format" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Cancel pending reminders
    await Event.updateOne(
      { _id: id },
      { $set: { "reminders.$[elem].status": "cancelled" } },
      { arrayFilters: [{ "elem.status": "pending" }] }
    );

    // Delete event document
    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Event and scheduled reminders successfully deleted",
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ success: false, message: "Error deleting event", error: err.message });
  }
});

/**
 * GET /api/admin/events/:id/reminders
 * View reminder schedule and delivery history for an event
 */
router.get("/:id/reminders", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID format" });
    }

    const event = await Event.findById(id).select("title startDate reminders");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({
      success: true,
      data: {
        eventId: event._id,
        eventTitle: event.title,
        startDate: event.startDate,
        reminders: event.reminders,
      },
    });
  } catch (err) {
    console.error("Error fetching event reminders:", err);
    res.status(500).json({ success: false, message: "Error fetching event reminders", error: err.message });
  }
});

/**
 * PATCH /api/admin/events/:id/status
 * Activate, cancel, or archive an event
 */
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID format" });
    }

    if (!["active", "cancelled", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, cancelled, archived",
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    event.status = status;
    const now = new Date();

    if (status === "cancelled" || status === "archived") {
      // Cancel all pending reminders
      event.reminders.forEach((r) => {
        if (r.status === "pending") {
          r.status = "cancelled";
        }
      });
    } else if (status === "active") {
      // Re-enable reminders that are still in the future
      event.reminders.forEach((r) => {
        if (r.status === "cancelled" && new Date(r.scheduledAt) > now) {
          r.status = "pending";
        }
      });
    }

    if (req.admin?.id && isValidObjectId(req.admin.id)) {
      event.updatedBy = req.admin.id;
    }

    await event.save();

    res.json({
      success: true,
      message: `Event status updated to ${status}`,
      data: event,
    });
  } catch (err) {
    console.error("Error updating event status:", err);
    res.status(500).json({ success: false, message: "Error updating event status", error: err.message });
  }
});

/**
 * POST /api/admin/events/:id/reminders/:reminderId/trigger
 * Manually test / trigger a reminder immediately (useful for admin testing)
 */
router.post("/:id/reminders/:reminderId/trigger", verifyToken, async (req, res) => {
  try {
    const { id, reminderId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(reminderId)) {
      return res.status(400).json({ success: false, message: "Invalid event or reminder ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const reminder = event.reminders.id(reminderId);
    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    const result = await processReminder(event, reminder);
    res.json({
      success: result.success,
      message: result.success ? "Reminder triggered successfully" : "Reminder failed to deliver",
      error: result.error,
    });
  } catch (err) {
    console.error("Error triggering reminder manually:", err);
    res.status(500).json({ success: false, message: "Error triggering reminder", error: err.message });
  }
});

export default router;
