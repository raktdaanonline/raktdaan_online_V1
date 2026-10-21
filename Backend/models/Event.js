import mongoose from "mongoose";

const reminderConfigSchema = new mongoose.Schema({
  daysBefore: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  channel: {
    type: String,
    enum: ["in_app", "email", "whatsapp"],
    default: "in_app",
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "sent", "failed", "cancelled"],
    default: "pending",
  },
  sentAt: {
    type: Date,
  },
  attemptCount: {
    type: Number,
    default: 0,
  },
  lastError: {
    type: String,
    default: "",
  },
  idempotencyKey: {
    type: String,
    required: true,
  },
}, { _id: true });

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Event title is required"],
    trim: true,
    maxlength: 250,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  category: {
    type: String,
    enum: [
      "Birthday",
      "Anniversary",
      "Blood Donation Camp",
      "Awareness Day",
      "Health Campaign",
      "Meeting",
      "Festival",
      "General Event",
      "Other",
    ],
    default: "General Event",
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
  },
  allDay: {
    type: Boolean,
    default: true,
  },
  timezone: {
    type: String,
    default: "Asia/Kolkata",
  },
  location: {
    type: String,
    default: "",
    trim: true,
  },
  contactName: {
    type: String,
    default: "",
    trim: true,
  },
  contactPhone: {
    type: String,
    default: "",
    trim: true,
  },
  contactEmail: {
    type: String,
    default: "",
    trim: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  recurrenceRule: {
    frequency: {
      type: String,
      enum: ["none", "weekly", "monthly", "yearly"],
      default: "none",
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
    endDate: {
      type: Date,
    },
    count: {
      type: Number,
    },
  },
  reminders: [reminderConfigSchema],
  status: {
    type: String,
    enum: ["active", "cancelled", "archived"],
    default: "active",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
}, {
  timestamps: true,
});

// Indexes for high performance
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ status: 1, "reminders.status": 1, "reminders.scheduledAt": 1 });
eventSchema.index({ "reminders.idempotencyKey": 1 });
eventSchema.index({ title: "text", description: "text", location: "text" });

const Event = mongoose.model("Event", eventSchema);
export default Event;
