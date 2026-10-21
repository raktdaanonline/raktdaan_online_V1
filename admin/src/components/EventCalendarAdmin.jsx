import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import EventCalendarToolbar from "./events/EventCalendarToolbar";
import EventAnalyticsBanner from "./events/EventAnalyticsBanner";
import EventCalendarView from "./events/EventCalendarView";
import EventFormModal from "./events/EventFormModal";
import EventDetailsModal from "./events/EventDetailsModal";
import DeleteEventConfirmationModal from "./events/DeleteEventConfirmationModal";
import eventService from "../services/eventService";

export default function EventCalendarAdmin() {
  const [currentViewType, setCurrentViewType] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reminderFilter, setReminderFilter] = useState("all");

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedInitialDate, setSelectedInitialDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEventForDelete, setSelectedEventForDelete] = useState(null);

  // Fetch events based on current view and filters
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Determine date range according to viewType
      let startDateStr = null;
      let endDateStr = null;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      if (currentViewType === "month") {
        // Broaden range to include leading/trailing month days
        const start = new Date(year, month - 1, 20);
        const end = new Date(year, month + 2, 10);
        startDateStr = start.toISOString();
        endDateStr = end.toISOString();
      } else if (currentViewType === "week") {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay() - 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 9);
        startDateStr = start.toISOString();
        endDateStr = end.toISOString();
      } else if (currentViewType === "day") {
        const start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        startDateStr = start.toISOString();
        endDateStr = end.toISOString();
      }

      const params = {
        limit: 200,
        sortBy: "startDate",
        sortOrder: "asc",
      };

      if (startDateStr) params.startDate = startDateStr;
      if (endDateStr) params.endDate = endDateStr;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (reminderFilter !== "all") params.reminderStatus = reminderFilter;

      const res = await eventService.getEvents(params);
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [currentDate, currentViewType, searchQuery, categoryFilter, reminderFilter]);

  // Fetch Analytics stats
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await eventService.getEventAnalytics();
      if (res.success) {
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error("Error loading event analytics:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Navigation handlers
  const handleNavigatePrev = () => {
    const next = new Date(currentDate);
    if (currentViewType === "month") {
      next.setMonth(next.getMonth() - 1);
    } else if (currentViewType === "week") {
      next.setDate(next.getDate() - 7);
    } else if (currentViewType === "day") {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNavigateNext = () => {
    const next = new Date(currentDate);
    if (currentViewType === "month") {
      next.setMonth(next.getMonth() + 1);
    } else if (currentViewType === "week") {
      next.setDate(next.getDate() + 7);
    } else if (currentViewType === "day") {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleNavigateToday = () => {
    setCurrentDate(new Date());
  };

  const handleChangeMonth = (monthIndex) => {
    const next = new Date(currentDate);
    next.setMonth(parseInt(monthIndex, 10));
    setCurrentDate(next);
  };

  const handleChangeYear = (year) => {
    const next = new Date(currentDate);
    next.setFullYear(parseInt(year, 10));
    setCurrentDate(next);
  };

  // Period title calculation
  const getPeriodTitle = () => {
    if (currentViewType === "month") {
      return currentDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }
    if (currentViewType === "week") {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (currentViewType === "day") {
      return currentDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    }
    return "All Scheduled Events";
  };

  // Click on empty calendar date -> open Add modal with that date preselected!
  const handleDateClick = (date) => {
    setSelectedInitialDate(date);
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  // Click on event item -> open Details modal
  const handleEventClick = (event) => {
    setSelectedEventForDetails(event);
    setIsDetailsModalOpen(true);
  };

  // Open Edit modal
  const handleEditClick = (event) => {
    setEditingEvent(event);
    setSelectedInitialDate(null);
    setIsFormModalOpen(true);
  };

  // Open Delete confirmation
  const handleDeleteClick = (event) => {
    setSelectedEventForDelete(event);
    setIsDeleteModalOpen(true);
  };

  // Open Add modal from button
  const handleOpenAddModal = () => {
    setSelectedInitialDate(new Date());
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  // Handle analytics card click filters
  const handleAnalyticsCardClick = (card) => {
    if (card.filterReminder) {
      setReminderFilter(card.filterReminder);
    }
  };

  return (
    <div className="w-full">
      {/* Top Analytics Banner */}
      <EventAnalyticsBanner
        stats={stats}
        onCardClick={handleAnalyticsCardClick}
      />

      {/* Main Toolbar with View Toggles, Period Navigation, Search, and Filters */}
      <EventCalendarToolbar
        currentViewType={currentViewType}
        onViewTypeChange={setCurrentViewType}
        currentDate={currentDate}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        onNavigateToday={handleNavigateToday}
        onChangeMonth={handleChangeMonth}
        onChangeYear={handleChangeYear}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        reminderFilter={reminderFilter}
        onReminderFilterChange={setReminderFilter}
        onOpenAddModal={handleOpenAddModal}
        periodTitle={getPeriodTitle()}
      />

      {/* Interactive Calendar Views */}
      <EventCalendarView
        viewType={currentViewType}
        currentDate={currentDate}
        events={events}
        loading={loading}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Add / Edit Event Form Modal */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialDate={selectedInitialDate}
        editingEvent={editingEvent}
        onSuccess={() => {
          fetchEvents();
          fetchAnalytics();
        }}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        event={selectedEventForDetails}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={(evt) => handleEditClick(evt)}
        onDelete={(evt) => handleDeleteClick(evt)}
        onRefresh={() => {
          fetchEvents();
          fetchAnalytics();
          if (selectedEventForDetails) {
            eventService.getEventById(selectedEventForDetails._id).then((res) => {
              if (res.success) setSelectedEventForDetails(res.data);
            });
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEventConfirmationModal
        isOpen={isDeleteModalOpen}
        event={selectedEventForDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          fetchEvents();
          fetchAnalytics();
        }}
      />
    </div>
  );
}
