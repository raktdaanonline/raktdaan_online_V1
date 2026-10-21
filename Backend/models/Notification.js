import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  recipientRole: { type: String, enum: ["admin", "user", "bloodbank", "organizer"], default: "admin" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bloodRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ["in_app", "email", "whatsapp"], default: "in_app" },
  state: { type: String },
  city: { type: String },
  bloodGroup: { type: String },
  type: { type: String, default: "event_reminder" },
  status: { type: String, default: "unread" },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

notificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ adminId: 1, isRead: 1 });
notificationSchema.index({ eventId: 1 });

export default mongoose.model("Notification", notificationSchema);

