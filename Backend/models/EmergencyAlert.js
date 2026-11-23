import mongoose from "mongoose";

const emergencyAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, unique: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    photo: { type: String },
    photoName: { type: String },
    date: { type: String },
    time: { type: String },
    bloodGroup: { type: String, default: "Any" },
    description: { type: String, default: "" },
    reportedBy: { type: String, default: "Citizen Bystander" },
    contact: { type: String, default: "Direct SOS Relay" },
    status: {
      type: String,
      enum: ["critical", "action_needed", "stabilized", "resolved"],
      default: "critical",
    },
    tag: { type: String, default: "CRITICAL • 1-CLICK SOS" },
    tagColor: { type: String, default: "bg-red-100 text-red-800 border-red-200" },
    casualties: { type: String, default: "Reported Trauma Incident" },
    requirement: { type: String, default: "Urgent Medical & Blood Support" },
    ambulanceStatus: { type: String, default: "Dispatching Nearby Responders" },
    traumaAlerts: { type: String, default: "Trauma Centers Alerted" },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("EmergencyAlert", emergencyAlertSchema);

