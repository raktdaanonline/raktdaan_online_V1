import api from "./api";

const eventService = {
  // Fetch events with filters and pagination
  getEvents: async (params = {}) => {
    const res = await api.get("/admin/events", { params });
    return res.data;
  },

  // Fetch event analytics and summary stats
  getEventAnalytics: async () => {
    const res = await api.get("/admin/events/analytics");
    return res.data;
  },

  // Fetch single event
  getEventById: async (id) => {
    const res = await api.get(`/admin/events/${id}`);
    return res.data;
  },

  // Create new event
  createEvent: async (eventData) => {
    const res = await api.post("/admin/events", eventData);
    return res.data;
  },

  // Update existing event
  updateEvent: async (id, eventData) => {
    const res = await api.put(`/admin/events/${id}`, eventData);
    return res.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const res = await api.delete(`/admin/events/${id}`);
    return res.data;
  },

  // Update event status (active, cancelled, archived)
  updateEventStatus: async (id, status) => {
    const res = await api.patch(`/admin/events/${id}/status`, { status });
    return res.data;
  },

  // Get reminder schedule & history for an event
  getEventReminders: async (id) => {
    const res = await api.get(`/admin/events/${id}/reminders`);
    return res.data;
  },

  // Test / manual trigger of a reminder
  triggerReminder: async (id, reminderId) => {
    const res = await api.post(`/admin/events/${id}/reminders/${reminderId}/trigger`);
    return res.data;
  },

  // Upload event banner / image
  uploadEventImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const res = await api.get("/admin/notifications", { params });
    return res.data;
  },

  getUnreadNotificationCount: async () => {
    const res = await api.get("/admin/notifications/unread-count");
    return res.data?.count ?? 0;
  },

  markNotificationRead: async (id) => {
    const res = await api.patch(`/admin/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await api.patch("/admin/notifications/read-all");
    return res.data;
  },
};

export default eventService;
