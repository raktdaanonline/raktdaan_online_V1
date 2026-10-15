import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe, registerUser, sendOtpApi } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const checkToken = async () => {
      const token = localStorage.getItem("jwt_token");
      if (token) {
        try {
          // Verify token and fetch user
          const data = await getMe(token);
          if (data && data.success) {
            setCurrentUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("user");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Token verification failed", error);
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("user");
          setCurrentUser(null);
        }
      } else {
        localStorage.removeItem("user");
        setCurrentUser(null);
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  const sendOtp = async (mobile) => {
    try {
      const res = await sendOtpApi(mobile);
      return res;
    } catch (error) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to send OTP",
      };
    }
  };

  const verifyOtpAndRegister = async (otp, userData) => {
    try {
      const data = await registerUser({ ...userData, otp });

      if (data && data.success) {
        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return {
        success: false,
        message: data?.message || "Invalid OTP or registration failed",
      };
    } catch (error) {
      console.error("Error verifying OTP and registering:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Invalid OTP or registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    currentUser,
    loading,
    sendOtp,
    verifyOtpAndRegister,
    logout,
    setCurrentUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
