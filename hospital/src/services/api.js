import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "/api",
});

api.interceptors.request.use(
  (config) => {
    const hospitalToken = localStorage.getItem("hospital-token");
    const adminToken = localStorage.getItem("admin-token");
    if (hospitalToken) {
      config.headers.Authorization = `Bearer ${hospitalToken}`;
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

