import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminOrganizers from "./pages/AdminOrganizers";
import CampDonorList from "./pages/CampDonarList";
import CompleteCamp from "./pages/admin/CompleteCamp";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("admin-token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/enquiries" element={<ProtectedRoute><AdminEnquiries /></ProtectedRoute>} />
        <Route path="/organizers" element={<ProtectedRoute><AdminOrganizers /></ProtectedRoute>} />
        <Route path="/camp/:campName" element={<ProtectedRoute><CampDonorList /></ProtectedRoute>} />
        <Route path="/camps/:campId/complete" element={<ProtectedRoute><CompleteCamp /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
