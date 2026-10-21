import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Calendar,
  ListFilter,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { EVENT_CATEGORIES } from "./eventConstants";

export default function EventCalendarToolbar({
  currentViewType, // "month" | "week" | "day" | "list"
  onViewTypeChange,
  currentDate,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  onChangeMonth,
  onChangeYear,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  reminderFilter,
  onReminderFilterChange,
  onOpenAddModal,
  periodTitle,
}) {
  const currentMonth = currentDate ? currentDate.getMonth() : new Date().getMonth();
  const currentYear = currentDate ? currentDate.getFullYear() : new Date().getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Year options around current year (e.g., 2023 - 2032)
  const baseYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => baseYear - 3 + i);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
      {/* Top Row: Title, Subtitle, Add Event Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight m-0">Event Calendar</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Manage important events and scheduled automatic reminders
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer border-none"
        >
          <Plus size={18} />
          <span>Add Event</span>
        </button>
      </div>

      {/* Middle Row: Navigation controls & View toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
        {/* Date Navigation & Month/Year Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Prev, Today, Next buttons */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={onNavigatePrev}
              title="Previous"
              className="p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={onNavigateToday}
              className="px-3 py-1 text-xs font-semibold hover:bg-white text-slate-700 hover:text-slate-900 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={onNavigateNext}
              title="Next"
              className="p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Month Dropdown (All 12 Months) */}
          <select
            value={currentMonth}
            onChange={(e) => onChangeMonth && onChangeMonth(Number(e.target.value))}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer hover:bg-white transition-colors"
            title="Select Month"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={currentYear}
            onChange={(e) => onChangeYear && onChangeYear(Number(e.target.value))}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer hover:bg-white transition-colors"
            title="Select Year"
          >
            {yearOptions.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            ({periodTitle})
          </span>
        </div>

        {/* View Switcher (Month, Week, Day, List) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onViewTypeChange("month")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
              currentViewType === "month"
                ? "bg-white text-rose-600 shadow-xs"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar size={14} />
            <span>Month</span>
          </button>
          <button
            onClick={() => onViewTypeChange("week")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
              currentViewType === "week"
                ? "bg-white text-rose-600 shadow-xs"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarRange size={14} />
            <span>Week</span>
          </button>
          <button
            onClick={() => onViewTypeChange("day")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
              currentViewType === "day"
                ? "bg-white text-rose-600 shadow-xs"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays size={14} />
            <span>Day</span>
          </button>
          <button
            onClick={() => onViewTypeChange("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
              currentViewType === "list"
                ? "bg-white text-rose-600 shadow-xs"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListFilter size={14} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-3 border-t border-slate-100">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events by title, location..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reminder Status Filter */}
        <div className="relative">
          <select
            value={reminderFilter}
            onChange={(e) => onReminderFilterChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
          >
            <option value="all">All Reminder Statuses</option>
            <option value="pending">⏳ Reminders Scheduled</option>
            <option value="sent">✅ Reminders Sent</option>
            <option value="failed">❌ Reminders Failed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
