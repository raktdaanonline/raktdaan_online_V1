import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HospitalLayout from "./components/HospitalLayout";
import Dashboard from "./pages/Dashboard";
import AccidentAlerts from "./pages/AccidentAlerts";
import BloodRequests from "./pages/BloodRequests";
import DonorManagement from "./pages/DonorManagement";
import HospitalProfile from "./pages/HospitalProfile";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalRegistration from "./pages/HospitalRegistration";

export default function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: "text-xs font-bold rounded-xl shadow-lg",
          duration: 4000
        }}
      />
      <Routes>
        {/* Dedicated Hospital Login Route */}
        <Route path="/login" element={<HospitalLogin />} />

        {/* Dedicated Hospital Registration by Token Routes */}
        <Route path="/register/:token" element={<HospitalRegistration />} />
        <Route path="/hospital/register/:token" element={<HospitalRegistration />} />

        {/* Hospital Dashboard & Console Layout */}
        <Route path="/" element={<HospitalLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashbord" element={<Navigate to="/dashboard" replace />} />
          <Route path="accident-alerts" element={<AccidentAlerts />} />
          <Route path="blood-requests" element={<BloodRequests />} />
          <Route path="donor-management" element={<DonorManagement />} />
          <Route path="hospital-profile" element={<HospitalProfile />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
