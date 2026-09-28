import api from "./api";

const adminService = {
  login: async (email, password) => {
    const res = await api.post("/admin/login", { email, password });
    return res.data;
  },
  getOrganizers: async () => {
    const res = await api.get("/admin/organizers");
    return res.data;
  },
  getTotalUsers: async () => {
    const res = await api.get("/admin/users/count");
    return res.data.count;
  },
  getAllUsers: async () => {
    const res = await api.get("/admin/users");
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
  updateOrganizer: async (id, data) => {
    const res = await api.put(`/admin/organizers/${id}`, data);
    return res.data;
  },
  deleteOrganizer: async (id) => {
    const res = await api.delete(`/admin/organizers/${id}`);
    return res.data;
  },
  getEnquiries: async () => {
    const res = await api.get("/admin/enquiries");
    return res.data;
  },
  updateEnquiry: async (id, data) => {
    const res = await api.put(`/admin/enquiries/${id}`, data);
    return res.data;
  },
  assignBloodBank: async (id, bloodBankId) => {
    const res = await api.put(`/admin/enquiries/${id}/assign-bloodbank`, { bloodBankId });
    return res.data;
  },
  approveEnquiry: async (id, password) => {
    const res = await api.patch(`/organizer-enquiry/${id}/approve`, password ? { password } : {});
    return res.data;
  },
  rejectEnquiry: async (id, reason) => {
    const res = await api.patch(`/organizer-enquiry/${id}/reject`, { reason });
    return res.data;
  },
  resetOrganizerPassword: async (id, password) => {
    const res = await api.put(`/admin/enquiries/${id}/reset-password`, { password });
    return res.data;
  },
  deleteEnquiry: async (id) => {
    const res = await api.delete(`/admin/enquiries/${id}`);
    return res.data;
  },
  getBloodRequests: async () => {
    const res = await api.get("/admin/blood-requests");
    return res.data;
  },
  updateBloodRequestStatus: async (id, status) => {
    const res = await api.patch(`/admin/blood-requests/${id}/status`, { status });
    return res.data;
  },
  getBloodBanks: async (params) => {
    const res = await api.get("/blood-bank/all", { params });
    return res.data;
  },
  getBloodBankStats: async () => {
    const res = await api.get("/blood-bank/stats");
    return res.data;
  },
  getAvailableBloodBanks: async (campDate, excludeEnquiryId) => {
    const res = await api.get("/admin/blood-banks/available", {
      params: { campDate, excludeEnquiryId }
    });
    return res.data;
  },
  getPendingBloodBanks: async () => {
    const res = await api.get("/blood-bank/all?status=pending");
    return res.data;
  },
  approveBloodBank: async (id) => {
    const res = await api.put(`/blood-bank/${id}/approve`);
    return res.data;
  },
  rejectBloodBank: async (id, rejectionReason) => {
    const res = await api.put(`/blood-bank/${id}/reject`, { reason: rejectionReason });
    return res.data;
  },
  inviteBloodBank: async (inviteData) => {
    // Map bloodBankName to name for the backend API
    const data = {
      name: inviteData.bloodBankName,
      managerName: inviteData.managerName,
      email: inviteData.email,
      mobile: inviteData.mobile,
      city: inviteData.city,
      licenseNumber: inviteData.licenseNumber,
    };
    const res = await api.post("/blood-bank/invite", data);
    return res.data;
  },
  resendInvite: async (id) => {
    const res = await api.post(`/blood-bank/${id}/resend-invite`);
    return res.data;
  },
  getInviteLink: async (id) => {
    const res = await api.post(`/blood-bank/${id}/invite-link`);
    return res.data;
  },
  getPasswordLink: async (id) => {
    const res = await api.post(`/blood-bank/${id}/password-link`);
    return res.data;
  },
  suspendBloodBank: async (id, note) => {
    const res = await api.put(`/blood-bank/${id}/suspend`, { note });
    return res.data;
  },
  reactivateBloodBank: async (id) => {
    const res = await api.put(`/blood-bank/${id}/reactivate`);
    return res.data;
  },
  updateBloodBankStatus: async (id, status, note) => {
    const res = await api.put(`/blood-bank/${id}/status`, { status, note });
    return res.data;
  },
  updateBloodBank: async (id, updateData) => {
    const res = await api.put(`/blood-bank/${id}`, updateData);
    return res.data;
  },
  deleteBloodBank: async (id) => {
    const res = await api.delete(`/blood-bank/${id}`);
    return res.data;
  },

  // City Management
  getCities: async () => {
    const res = await api.get("/cities");
    return res.data;
  },
  getStates: async () => {
    const res = await api.get("/cities/states");
    return res.data;
  },
  getAllCitiesAdmin: async (params) => {
    const res = await api.get("/cities/admin/all", { params });
    return res.data;
  },
  createCity: async (cityData) => {
    const res = await api.post("/cities", cityData);
    return res.data;
  },
  updateCity: async (id, cityData) => {
    const res = await api.put(`/cities/${id}`, cityData);
    return res.data;
  },
  toggleCityStatus: async (id) => {
    const res = await api.patch(`/cities/${id}/toggle-status`);
    return res.data;
  },
  deleteCity: async (id) => {
    const res = await api.delete(`/cities/${id}`);
    return res.data;
  },
  clearAllCities: async () => {
    const res = await api.delete("/cities/admin/clear-all");
    return res.data;
  },
  uploadCityImage: async (formData) => {
    const res = await api.post("/cities/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default adminService;
