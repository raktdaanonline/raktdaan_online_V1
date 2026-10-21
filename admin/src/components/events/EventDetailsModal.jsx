import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Bell,
  Repeat,
  Edit2,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";
import { getCategoryMeta } from "./eventConstants";
import eventService from "../../services/eventService";

export default function EventDetailsModal({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
  onRefresh,
}) {
  const [testingReminderId, setTestingReminderId] = useState(null);

  if (!isOpen || !event) return null;

  const meta = getCategoryMeta(event.category);
  const formattedStartDate = new Date(event.startDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleTestReminder = async (reminderId) => {
    setTestingReminderId(reminderId);
    try {
      const res = await eventService.triggerReminder(event._id, reminderId);
      if (res.success) {
        toast.success("Reminder triggered and delivered successfully!");
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.error || "Reminder delivery failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to trigger reminder");
    } finally {
      setTestingReminderId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Banner image if present */}
        {event.imageUrl && (
          <div className="w-full h-36 overflow-hidden relative bg-slate-100 shrink-0">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors border-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 relative bg-slate-50/50 shrink-0">
          {!event.imageUrl && (
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex items-center gap-2 mb-2">
            <span
              style={{ backgroundColor: meta.bg, color: meta.color, borderColor: meta.border }}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1"
            >
              <span>{meta.icon}</span>
              <span>{event.category}</span>
            </span>

            {event.recurrenceRule?.frequency !== "none" && (
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Repeat size={12} />
                Repeats {event.recurrenceRule?.frequency}
              </span>
            )}

            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                event.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : event.status === "cancelled"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {event.status}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 m-0">{event.title}</h2>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs flex-1">
          {/* Timing & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Calendar size={13} className="text-rose-500" /> Date & Time
              </span>
              <p className="font-bold text-slate-800 m-0">{formattedStartDate}</p>
              <p className="text-slate-500 m-0 text-[11px]">
                {event.allDay ? "All-day event" : `Time: ${new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                {" • "}Asia/Kolkata
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <MapPin size={13} className="text-amber-500" /> Location
              </span>
              <p className="font-bold text-slate-800 m-0">{event.location || "Not specified"}</p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <span className="font-bold text-slate-700 block mb-1">Description</span>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 m-0 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Contact Details */}
          {(event.contactName || event.contactPhone || event.contactEmail) && (
            <div>
              <span className="font-bold text-slate-700 block mb-1.5">Contact Person</span>
              <div className="flex flex-wrap gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {event.contactName && (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <User size={13} className="text-slate-400" /> {event.contactName}
                  </span>
                )}
                {event.contactPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> {event.contactPhone}
                  </span>
                )}
                {event.contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" /> {event.contactEmail}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Scheduled Reminders Table */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Bell size={13} className="text-rose-600" />
                Scheduled Reminders ({(event.reminders || []).length})
              </span>
            </div>

            {(event.reminders || []).length === 0 ? (
              <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center m-0">
                No reminders configured for this event.
              </p>
            ) : (
              <div className="space-y-1.5">
                {event.reminders.map((rem, i) => {
                  const scheduledDateStr = new Date(rem.scheduledAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={rem._id || i}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {rem.daysBefore === 0 ? "Same Day Reminder" : `${rem.daysBefore} Days Before`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              rem.status === "sent"
                                ? "bg-emerald-100 text-emerald-800"
                                : rem.status === "failed"
                                ? "bg-rose-100 text-rose-800"
                                : rem.status === "processing"
                                ? "bg-blue-100 text-blue-800 animate-pulse"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {rem.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 m-0">
                          Channel: <strong>{rem.channel}</strong> • Scheduled for:{" "}
                          <strong>{scheduledDateStr}</strong> at 09:00 AM IST
                        </p>
                        {rem.sentAt && (
                          <p className="text-emerald-600 text-[10px] mt-0.5 m-0">
                            ✓ Delivered on {new Date(rem.sentAt).toLocaleString("en-IN")}
                          </p>
                        )}
                        {rem.lastError && (
                          <p className="text-rose-600 text-[10px] mt-0.5 m-0">
                            Error: {rem.lastError} (Attempt #{rem.attemptCount})
                          </p>
                        )}
                      </div>

                      {/* Manual trigger button */}
                      <button
                        onClick={() => handleTestReminder(rem._id)}
                        disabled={testingReminderId === rem._id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200 cursor-pointer self-end sm:self-center"
                        title="Trigger this reminder immediately for testing"
                      >
                        <Send size={11} />
                        <span>{testingReminderId === rem._id ? "Sending..." : "Send Test Now"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between py-2.5 px-5 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Edit2 size={13} />
              <span>Edit Event</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(event);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete Event</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors border-none cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
