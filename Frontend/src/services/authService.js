import api from "./api";

export const getMe = async (token) => {
  const res = await api.get("/auth/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const sendOtpApi = async (mobile) => {
  const res = await api.post("/auth/send-otp", { mobile });
  return res.data;
};

export const verifyOtpApi = async (mobile, otp) => {
  const res = await api.post("/auth/verify-otp", { mobile, otp });
  return res.data;
};

export const changePassword = async (data, token) => {
  const res = await api.post("/auth/change-password", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
};
