import api from "./api";

const notificationService = {
  getNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data.count;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  },
};

export default notificationService;
