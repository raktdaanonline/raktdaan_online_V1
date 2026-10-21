import React, { useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Trash2, X } from "lucide-react";
import eventService from "../../services/eventService";

export default function DeleteEventConfirmationModal({
  isOpen,
  event,
  onClose,
  onSuccess,
}) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await eventService.deleteEvent(event._id);
      toast.success("Event and pending reminders deleted");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-base font-bold text-slate-900 m-0 mb-1">Delete Event</h3>
        <p className="text-xs text-slate-500 m-0 mb-4">
          Are you sure you want to delete <strong>"{event.title}"</strong>? Any scheduled pending reminders for this event will be cancelled immediately.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors bg-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors border-none cursor-pointer flex items-center gap-2"
          >
            {deleting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
