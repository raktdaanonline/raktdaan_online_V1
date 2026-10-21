import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Bell,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import {
  EVENT_CATEGORIES,
  REMINDER_OFFSET_PRESETS,
  REMINDER_CHANNELS,
} from "./eventConstants";
import eventService from "../../services/eventService";

export default function EventFormModal({
  isOpen,
  onClose,
  initialDate,
  editingEvent = null,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General Event",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    allDay: true,
    location: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    imageUrl: "",
    recurrence: "none",
    status: "active",
  });

  // Reminders state: array of { daysBefore: number, channel: string, enabled: boolean }
  const [reminders, setReminders] = useState([
    { daysBefore: 30, channel: "in_app", enabled: true },
    { daysBefore: 15, channel: "in_app", enabled: true },
    { daysBefore: 10, channel: "in_app", enabled: true },
  ]);

  const [customDays, setCustomDays] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingEvent) {
      const sDate = new Date(editingEvent.startDate);
      const sDateStr = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, "0")}-${String(
        sDate.getDate()
      ).padStart(2, "0")}`;
      const sTimeStr = `${String(sDate.getHours()).padStart(2, "0")}:${String(sDate.getMinutes()).padStart(2, "0")}`;

      let eDateStr = "";
      if (editingEvent.endDate) {
        const eDate = new Date(editingEvent.endDate);
        eDateStr = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, "0")}-${String(
          eDate.getDate()
        ).padStart(2, "0")}`;
      }

      setFormData({
        title: editingEvent.title || "",
        description: editingEvent.description || "",
        category: editingEvent.category || "General Event",
        startDate: sDateStr,
        startTime: sTimeStr,
        endDate: eDateStr,
        allDay: editingEvent.allDay !== false,
        location: editingEvent.location || "",
        contactName: editingEvent.contactName || "",
        contactPhone: editingEvent.contactPhone || "",
        contactEmail: editingEvent.contactEmail || "",
        imageUrl: editingEvent.imageUrl || "",
        recurrence: editingEvent.recurrenceRule?.frequency || "none",
        status: editingEvent.status || "active",
      });

      if (editingEvent.reminders && editingEvent.reminders.length > 0) {
        setReminders(
          editingEvent.reminders.map((r) => ({
            daysBefore: r.daysBefore,
            channel: r.channel || "in_app",
            enabled: r.enabled !== false,
          }))
        );
      } else {
        setReminders([]);
      }
    } else {
      // Add mode with preselected date if provided
      let defaultDateStr = "";
      if (initialDate) {
        const d = new Date(initialDate);
        defaultDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
      } else {
        const d = new Date();
        defaultDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
      }

      setFormData({
        title: "",
        description: "",
        category: "General Event",
        startDate: defaultDateStr,
        startTime: "09:00",
        endDate: "",
        allDay: true,
        location: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        imageUrl: "",
        recurrence: "none",
        status: "active",
      });

      setReminders([
        { daysBefore: 30, channel: "in_app", enabled: true },
        { daysBefore: 15, channel: "in_app", enabled: true },
        { daysBefore: 10, channel: "in_app", enabled: true },
      ]);
    }
    setErrors({});
  }, [editingEvent, initialDate, isOpen]);

  if (!isOpen) return null;

  // Add reminder offset
  const handleAddReminderOffset = (days) => {
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 0) return;

    // Check if duplicate offset & channel already exists
    const exists = reminders.some((r) => r.daysBefore === daysNum && r.channel === "in_app");
    if (exists) {
      toast("This reminder offset is already added", { icon: "ℹ️" });
      return;
    }

    setReminders([...reminders, { daysBefore: daysNum, channel: "in_app", enabled: true }]);
    setCustomDays("");
  };

  const handleRemoveReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleUpdateReminder = (index, field, value) => {
    const updated = [...reminders];
    updated[index] = { ...updated[index], [field]: value };
    setReminders(updated);
  };

  // Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const res = await eventService.uploadEventImage(file);
      if (res.success && res.fileUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.fileUrl }));
        toast.success("Event image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.title || formData.title.trim() === "") {
      errs.title = "Event title is required";
    }
    if (!formData.startDate) {
      errs.startDate = "Event start date is required";
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errs.endDate = "End date cannot be earlier than start date";
    }
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errs.contactEmail = "Please enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Build ISO Date objects
      let startDateTimeStr = formData.startDate;
      if (!formData.allDay && formData.startTime) {
        startDateTimeStr = `${formData.startDate}T${formData.startTime}:00`;
      } else {
        startDateTimeStr = `${formData.startDate}T00:00:00`;
      }
      const finalStartDate = new Date(startDateTimeStr);

      let finalEndDate = null;
      if (formData.endDate) {
        finalEndDate = new Date(`${formData.endDate}T23:59:59`);
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        startDate: finalStartDate,
        endDate: finalEndDate,
        allDay: formData.allDay,
        location: formData.location.trim(),
        contactName: formData.contactName.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
        imageUrl: formData.imageUrl,
        recurrenceRule: {
          frequency: formData.recurrence,
          interval: 1,
        },
        reminders: reminders.map((r) => ({
          daysBefore: r.daysBefore,
          channel: r.channel,
          enabled: r.enabled !== false,
        })),
        status: formData.status,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, payload);
        toast.success("Event updated successfully!");
      } else {
        await eventService.createEvent(payload);
        toast.success("Event created successfully!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save event error:", err);
      toast.error(err.response?.data?.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate preview of reminder date for a given offset
  const getReminderPreviewDate = (daysBefore) => {
    if (!formData.startDate) return "";
    const [y, m, d] = formData.startDate.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d) - daysBefore * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h3>
            <p className="text-[11px] text-slate-500 m-0 mt-0.5">
              Fill in the event details and configure automated reminders
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="event-form"
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs flex-1"
        >
          {/* 1. Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Rutuja's Birthday, Blood Donation Camp"
                className={`w-full px-3 py-1.5 text-xs border rounded-xl focus:outline-none transition-colors ${
                  errors.title ? "border-rose-400 bg-rose-50/30" : "border-slate-200 focus:border-rose-500"
                }`}
              />
              {errors.title && <p className="text-[11px] text-rose-600 mt-1 m-0">{errors.title}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 bg-white cursor-pointer"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Schedule & Timing */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar size={13} className="text-rose-500" />
                Schedule & Timing
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                All-Day Event
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none bg-white ${
                    errors.startDate ? "border-rose-400" : "border-slate-200 focus:border-rose-500"
                  }`}
                />
                {errors.startDate && <p className="text-[10px] text-rose-600 mt-0.5 m-0">{errors.startDate}</p>}
              </div>

              {!formData.allDay && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white"
                />
                {errors.endDate && <p className="text-[10px] text-rose-600 mt-0.5 m-0">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* 3. Location / Venue */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-500" />
              Location / Venue
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Community Hall, Mumbai / Online"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 bg-white"
            />
          </div>

          {/* 4. Automated Reminders Configuration */}
          <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Bell size={13} className="text-rose-600" />
                  Automated Reminder Schedules
                </span>
                <p className="text-[10px] text-slate-500 m-0 mt-0.5">
                  Configure offsets to send automatic in-app, email, or WhatsApp alerts before the event.
                </p>
              </div>
            </div>

            {/* Quick offset preset buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-600 mr-1">Add Preset:</span>
              {REMINDER_OFFSET_PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => handleAddReminderOffset(p.days)}
                  className="px-2 py-0.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  +{p.label}
                </button>
              ))}

              {/* Custom days offset */}
              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Days"
                  className="w-16 px-1.5 py-0.5 text-[10px] border border-slate-200 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddReminderOffset(customDays)}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold border-none cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Configured Reminders List */}
            {reminders.length === 0 ? (
              <div className="p-2.5 bg-white/80 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-[11px]">
                No reminders scheduled. Use the buttons above to add reminders.
              </div>
            ) : (
              <div className="space-y-1.5">
                {reminders.map((rem, idx) => {
                  const previewDate = getReminderPreviewDate(rem.daysBefore);
                  return (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[10px]">
                          {rem.daysBefore === 0 ? "Same day" : `${rem.daysBefore} days before`}
                        </span>
                        {previewDate && (
                          <span className="text-[10px] text-slate-500">
                            → Scheduled for: <strong>{previewDate}</strong> (09:00 AM IST)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <select
                          value={rem.channel}
                          onChange={(e) => handleUpdateReminder(idx, "channel", e.target.value)}
                          className="px-1.5 py-0.5 text-[10px] border border-slate-200 rounded-md bg-white cursor-pointer"
                        >
                          {REMINDER_CHANNELS.map((ch) => (
                            <option key={ch.value} value={ch.value}>
                              {ch.icon} {ch.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveReminder(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors border-none bg-transparent cursor-pointer"
                          title="Remove reminder"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                <User size={11} /> Contact Person
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Name"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                <Phone size={11} /> Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                <Mail size={11} /> Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="email@example.com"
                className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none ${
                  errors.contactEmail ? "border-rose-400" : "border-slate-200 focus:border-rose-500"
                }`}
              />
              {errors.contactEmail && (
                <p className="text-[10px] text-rose-600 mt-0.5 m-0">{errors.contactEmail}</p>
              )}
            </div>
          </div>

          {/* 6. Description & Image Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide context, meeting links, or details..."
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-slate-500" />
                Event Banner / Image
              </label>
              <div className="flex items-center gap-2.5 mt-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                  <Upload size={13} />
                  <span>{uploadingImage ? "Uploading..." : "Upload Banner"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {formData.imageUrl && (
                  <div className="flex items-center gap-1.5">
                    <img
                      src={formData.imageUrl}
                      alt="Banner preview"
                      className="w-10 h-8 object-cover rounded-md border border-slate-200 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="text-[11px] text-rose-600 hover:underline border-none bg-transparent cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Sticky Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors bg-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={submitting || uploadingImage}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors border-none cursor-pointer flex items-center gap-1.5"
          >
            {submitting && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{editingEvent ? "Save Changes" : "Create Event"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
