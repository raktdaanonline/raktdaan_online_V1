import React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Bell,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  Plus,
  Repeat,
  CheckCircle,
} from "lucide-react";
import { getCategoryMeta } from "./eventConstants";

export default function EventCalendarView({
  viewType = "month", // "month" | "week" | "day" | "list"
  currentDate,
  events = [],
  loading = false,
  onDateClick,
  onEventClick,
  onEditClick,
  onDeleteClick,
  onOpenAddModal,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper: Format date string YYYY-MM-DD
  const toDateKey = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  };

  // Group events by date key
  const eventsByDate = React.useMemo(() => {
    const map = new Map();
    events.forEach((evt) => {
      const key = toDateKey(evt.startDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(evt);
    });
    return map;
  }, [events]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Loading events and reminders...</p>
      </div>
    );
  }

  // ==========================================
  // 1. MONTH VIEW
  // ==========================================
  if (viewType === "month") {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevDays.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    const currentDays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      currentDays.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Next month filler days to complete 35 or 42 grid cells
    const totalSlots = (prevDays.length + currentDays.length) > 35 ? 42 : 35;
    const nextDaysNeeded = totalSlots - (prevDays.length + currentDays.length);
    const nextDays = [];
    for (let d = 1; d <= nextDaysNeeded; d++) {
      nextDays.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    const allDays = [...prevDays, ...currentDays, ...nextDays];
    const weekHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
          {weekHeaders.map((day, idx) => (
            <div
              key={day}
              className={`py-2.5 text-xs font-bold tracking-wider uppercase ${
                idx === 0 || idx === 6 ? "text-rose-600" : "text-slate-600"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 7-column calendar cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {allDays.map(({ date, isCurrentMonth }, index) => {
            const dateKey = toDateKey(date);
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isToday =
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate();

            return (
              <div
                key={index}
                onClick={() => onDateClick(date)}
                className={`min-h-[110px] p-1.5 transition-colors group relative cursor-pointer ${
                  !isCurrentMonth
                    ? "bg-slate-50/50 text-slate-400"
                    : "bg-white hover:bg-rose-50/20 text-slate-800"
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday
                        ? "bg-rose-600 text-white font-bold shadow-xs"
                        : isCurrentMonth
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Quick Add indicator on hover */}
                  <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5">
                    <Plus size={12} />
                  </span>
                </div>

                {/* Event Chips */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const meta = getCategoryMeta(evt.category);
                    return (
                      <div
                        key={evt._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(evt);
                        }}
                        style={{
                          backgroundColor: meta.bg,
                          borderColor: meta.border,
                          color: meta.color,
                        }}
                        className="px-1.5 py-0.5 rounded-md border text-[11px] font-semibold truncate flex items-center gap-1 shadow-2xs hover:brightness-95 transition-all"
                        title={`${evt.title} (${evt.category})`}
                      >
                        <span className="text-[10px]">{meta.icon}</span>
                        <span className="truncate">{evt.title}</span>
                      </div>
                    );
                  })}

                  {dayEvents.length > 3 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateClick(date);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-rose-600 px-1 text-center"
                    >
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. WEEK VIEW
  // ==========================================
  if (viewType === "week") {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDays.map((d) => {
            const isToday =
              d.getFullYear() === today.getFullYear() &&
              d.getMonth() === today.getMonth() &&
              d.getDate() === today.getDate();
            return (
              <div
                key={d.toISOString()}
                onClick={() => onDateClick(d)}
                className="py-3 px-2 text-center border-r border-slate-200 last:border-r-0 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="text-xs font-semibold text-slate-500 uppercase">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-7 h-7 mt-1 text-sm font-bold rounded-full ${
                    isToday ? "bg-rose-600 text-white" : "text-slate-800"
                  }`}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Day Columns */}
        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[420px]">
          {weekDays.map((d) => {
            const dateKey = toDateKey(d);
            const dayEvents = eventsByDate.get(dateKey) || [];

            return (
              <div
                key={dateKey}
                onClick={() => onDateClick(d)}
                className="p-2 space-y-2 hover:bg-rose-50/10 transition-colors cursor-pointer"
              >
                {dayEvents.map((evt) => {
                  const meta = getCategoryMeta(evt.category);
                  return (
                    <div
                      key={evt._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(evt);
                      }}
                      style={{
                        backgroundColor: meta.bg,
                        borderColor: meta.border,
                        borderLeftColor: meta.color,
                      }}
                      className="p-2 rounded-xl border border-l-4 text-xs shadow-2xs hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-1 font-bold text-slate-900 truncate">
                        <span>{meta.icon}</span>
                        <span className="truncate">{evt.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {evt.allDay ? "All Day" : new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {evt.nextReminderDate && (
                        <div className="text-[9px] font-semibold text-amber-700 bg-amber-100/70 rounded px-1 py-0.5 mt-1.5 flex items-center gap-1">
                          <Bell size={9} />
                          <span>Reminds {new Date(evt.nextReminderDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {dayEvents.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 text-slate-300">
                    <Plus size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. DAY VIEW
  // ==========================================
  if (viewType === "day") {
    const dateKey = toDateKey(currentDate);
    const dayEvents = eventsByDate.get(dateKey) || [];
    const formattedHeader = currentDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Daily Schedule
            </span>
            <h2 className="text-xl font-bold text-slate-900 m-0 mt-0.5">{formattedHeader}</h2>
          </div>
          <button
            onClick={() => onDateClick(currentDate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors border-none cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Event for this Day</span>
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CalendarIcon size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No events scheduled for this day</p>
            <button
              onClick={() => onDateClick(currentDate)}
              className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer"
            >
              + Click here to create an event
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((evt) => {
              const meta = getCategoryMeta(evt.category);
              return (
                <div
                  key={evt._id}
                  onClick={() => onEventClick(evt)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      {meta.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 m-0">{evt.title}</h4>
                        <span
                          style={{ backgroundColor: meta.bg, color: meta.color, borderColor: meta.border }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                        >
                          {evt.category}
                        </span>
                        {evt.recurrenceRule?.frequency !== "none" && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Repeat size={10} />
                            {evt.recurrenceRule.frequency}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 m-0">
                        {evt.allDay ? "All-day event" : `Time: ${new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        {evt.location && ` • 📍 ${evt.location}`}
                      </p>
                      {evt.description && (
                        <p className="text-xs text-slate-600 mt-2 m-0 line-clamp-2">{evt.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(evt);
                      }}
                      className="p-2 text-slate-600 hover:text-rose-600 bg-white border border-slate-200 rounded-lg hover:border-rose-200 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(evt);
                      }}
                      className="p-2 text-slate-600 hover:text-rose-600 bg-white border border-slate-200 rounded-lg hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 4. LIST VIEW
  // ==========================================
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          📅
        </div>
        <h3 className="text-base font-bold text-slate-800 m-0">No Events Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          There are no events matching your selected filters or date range. You can create a new event anytime.
        </p>
        <button
          onClick={() => onOpenAddModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors border-none cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Event</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Event & Category</th>
              <th className="py-3 px-4">Event Date</th>
              <th className="py-3 px-4">Next Reminder</th>
              <th className="py-3 px-4">Delivery Channels</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {events.map((evt) => {
              const meta = getCategoryMeta(evt.category);
              const eventDateStr = new Date(evt.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr
                  key={evt._id}
                  onClick={() => onEventClick(evt)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Event & Category */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg p-1.5 bg-slate-100 rounded-lg">{meta.icon}</span>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {evt.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            style={{ backgroundColor: meta.bg, color: meta.color, borderColor: meta.border }}
                            className="text-[10px] font-semibold px-1.5 py-0.2 rounded border"
                          >
                            {evt.category}
                          </span>
                          {evt.recurrenceRule?.frequency !== "none" && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Repeat size={10} />
                              {evt.recurrenceRule.frequency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Event Date */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{eventDateStr}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {evt.allDay ? "All Day" : new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Next Reminder */}
                  <td className="py-3 px-4">
                    {evt.nextReminderDate ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block w-fit text-[11px]">
                          📅 {new Date(evt.nextReminderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          ({evt.nextReminderDaysBefore} days before)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No pending reminders</span>
                    )}
                  </td>

                  {/* Channels */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {(evt.reminders || []).map((r, i) => (
                        <span
                          key={i}
                          title={`${r.channel} (${r.daysBefore} days before, status: ${r.status})`}
                          className={`p-1 rounded-md text-xs border ${
                            r.status === "sent"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : r.status === "failed"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {r.channel === "in_app" ? "🔔" : r.channel === "email" ? "📧" : "💬"}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : evt.status === "cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(evt);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(evt);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(evt);
                        }}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
