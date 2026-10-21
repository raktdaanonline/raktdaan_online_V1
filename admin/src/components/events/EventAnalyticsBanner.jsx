import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Sparkles,
} from "lucide-react";

export default function EventAnalyticsBanner({ stats = {}, onCardClick }) {
  const cards = [
    {
      key: "total",
      label: "Total Events",
      value: stats.totalEvents || 0,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      filterStatus: "all",
    },
    {
      key: "upcoming",
      label: "Upcoming Events",
      value: stats.upcomingEvents || 0,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      filterStatus: "active",
    },
    {
      key: "thisMonth",
      label: "Events This Month",
      value: stats.eventsThisMonth || 0,
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      key: "scheduled",
      label: "Reminders Scheduled",
      value: stats.remindersScheduled || 0,
      icon: Bell,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      filterReminder: "pending",
    },
    {
      key: "sent",
      label: "Reminders Sent",
      value: stats.remindersSent || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      filterReminder: "sent",
    },
    {
      key: "failed",
      label: "Failed Reminders",
      value: stats.failedRemindersCount || 0,
      icon: AlertTriangle,
      color: stats.failedRemindersCount > 0 ? "text-rose-600" : "text-slate-500",
      bgColor: stats.failedRemindersCount > 0 ? "bg-rose-50" : "bg-slate-50",
      borderColor: stats.failedRemindersCount > 0 ? "border-rose-200" : "border-slate-100",
      badge: stats.failedRemindersCount > 0 ? "Requires Attention" : null,
      filterReminder: "failed",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <div
            key={c.key}
            onClick={() => onCardClick && onCardClick(c)}
            className={`p-3.5 rounded-xl border ${c.borderColor} ${c.bgColor} transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 truncate">{c.label}</span>
              <div className={`p-1.5 rounded-lg bg-white/80 shadow-xs ${c.color}`}>
                <IconComponent size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{c.value}</span>
              {c.badge && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-full animate-pulse">
                  {c.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
