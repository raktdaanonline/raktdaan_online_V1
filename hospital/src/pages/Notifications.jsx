import React, { useState } from "react";
import toast from "react-hot-toast";
import { 
  Bell, 
  Siren, 
  Droplet, 
  CheckCircle2, 
  Clock, 
  Trash2,
  Check
} from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "critical",
      title: "🚨 Critical Accident Alert Reported: Wakad Flyover",
      description: "Severe multi-vehicle trauma reported. Urgent O-Negative blood needed at trauma bay.",
      time: "6 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "blood",
      title: "🩸 Blood Units Dispatched: Ruby Hall Clinic Blood Center",
      description: "2 units of O-Negative blood dispatched for Requisition #REQ-2026-104 via cold chain ambulance courier.",
      time: "24 minutes ago",
      read: false
    },
    {
      id: 3,
      type: "success",
      title: "✅ Patient Stabilized: Highway Patrol KM 42 Incident",
      description: "Trauma team at Talegaon General Hospital confirmed successful stabilization of patient.",
      time: "1 hour ago",
      read: true
    },
    {
      id: 4,
      type: "info",
      title: "ℹ️ Routine Triage Inventory Sync Completed",
      description: "ICU bed status and regional blood bank buffer reserves updated across Raktdaan network.",
      time: "3 hours ago",
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read!");
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast("Notifications cleared.");
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Hospital Notifications</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of emergency trauma dispatches, donor responses, and blood requisitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllRead}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          <button
            type="button"
            onClick={clearNotifications}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No new notifications</p>
            <span className="text-xs text-slate-400">All alerts and updates will show up here.</span>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id}
              className={`p-5 flex items-start gap-4 transition hover:bg-slate-50/80 ${
                !n.read ? "bg-red-50/30" : ""
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === "critical"
                  ? "bg-red-100 text-red-600"
                  : n.type === "blood"
                    ? "bg-blue-100 text-blue-600"
                    : n.type === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
              }`}>
                {n.type === "critical" && <Siren className="w-5 h-5 animate-pulse" />}
                {n.type === "blood" && <Droplet className="w-5 h-5" />}
                {n.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                {n.type === "info" && <Bell className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{n.title}</h3>
                  <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

