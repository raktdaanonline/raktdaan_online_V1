import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "/api",
});

// Automatic token injection via interceptors for Admin App
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("admin-token");
    const organizerToken = localStorage.getItem("organizer-token");
    const jwtToken = localStorage.getItem("jwt_token");
    const bloodBankToken = localStorage.getItem("bloodBankToken");

    // In Admin dashboard, always prioritize admin-token for all authorized requests
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (organizerToken) {
      config.headers.Authorization = `Bearer ${organizerToken}`;
    } else if (bloodBankToken) {
      config.headers.Authorization = `Bearer ${bloodBankToken}`;
    } else if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
