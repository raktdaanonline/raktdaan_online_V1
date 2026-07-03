import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { LogOut, Activity, RefreshCw, Droplet, Clock, Building2, Menu, X, Bell, CheckCircle, AlertTriangle, Package, Search, Download, User, FileText, Filter, Calendar, FlaskConical, Layers } from "lucide-react";
import toast from "react-hot-toast";
import bloodBankService from "../services/bloodBankService";
import notificationService from "../services/notificationService";

export default function BloodBankLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bloodBank, setBloodBank] = useState(null);
  const [requests, setRequests] = useState([]);
  const [dbNotifications, setDbNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const activeMenu = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/bloodbank/inventory")) return "inventory";
    if (path.startsWith("/bloodbank/units")) return "units";
    if (path.startsWith("/bloodbank/testing")) return "testing";
    if (path.startsWith("/bloodbank/expiry")) return "expiry";
    if (path.startsWith("/blood-bank/blood-request") || path.startsWith("/blood-bank/requests") || path.startsWith("/bloodbank/requests")) return "requests";
    if (path.startsWith("/blood-bank/camp-assignments")) return "camp-assignments";
    if (path.startsWith("/blood-bank/profile")) return "profile";
    return "";
  }, [location.pathname]);

  const viewDetails = useMemo(() => {
    switch (activeMenu) {
      case "inventory":
        return { title: "Inventory & Component Matrix", subtitle: "Real-time monitoring of cleared/available blood units by group and product type" };
      case "units":
        return { title: "Blood Units Ledger", subtitle: "List of collected and processed blood units with verification status" };
      case "testing":
        return { title: "Lab Screening & Testing", subtitle: "Record disease screening results and clear units for inventory" };
      case "expiry":
        return { title: "Expiry Alerts", subtitle: "Track blood units nearing their expiry date and take necessary action" };
      case "requests":
        return { title: "Blood Requests", subtitle: "Manage incoming blood requests from users, hospitals and organizations" };
      case "camp-assignments":
        return { title: "Camp Assignments", subtitle: "Review and confirm resource availability for assigned camps" };
      case "profile":
        return { title: "Account Profile", subtitle: "Manage your blood bank settings and profile information" };
      default:
        return { title: "Blood Bank Panel", subtitle: "" };
    }
  }, [activeMenu]);

  useEffect(() => {
    const token = localStorage.getItem("bloodBankToken");
    if (!token) {
      navigate("/blood-bank/login");
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const data = await bloodBankService.getProfile();
      if (data.success) {
        setBloodBank(data.data);
      } else {
        toast.error("Session expired. Please login again.");
        handleLogout();
        return;
      }

      // Fetch requests
      const reqData = await bloodBankService.getRequests();
      if (reqData.success) {
        setRequests(reqData.data);
      }

      // Fetch db notifications
      try {
        const notifData = await notificationService.getNotifications();
        if (Array.isArray(notifData)) {
          setDbNotifications(notifData);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch profile");
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bloodBankToken");
    navigate("/blood-bank/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E24B4A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bloodBank) return null;

  return (
    <div className="bb-dashboard-wrapper">
      <style>{`
        .bb-dashboard-wrapper {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background-color: #f4f4f5; /* Light gray main bg */
          font-family: 'Inter', sans-serif;
          color: #000000;
        }
        
        /* SIDEBAR */
        .bb-sidebar {
          width: 260px;
          background-color: #000000; /* Pure Black Sidebar */
          color: #ffffff;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          flex-shrink: 0;
          border-right: 1px solid #27272a;
          transition: all 0.3s ease;
        }
        .bb-sidebar.collapsed {
          width: 80px;
          padding: 1.5rem 0.5rem;
        }
        .bb-sidebar.collapsed .brand-name,
        .bb-sidebar.collapsed .brand-subtitle,
        .bb-sidebar.collapsed .menu-section-title,
        .bb-sidebar.collapsed .menu-item-text {
          display: none;
        }
        .brand-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.5rem;
          margin-bottom: 2.5rem;
        }
        .brand-logo { font-size: 1.8rem; }
        .brand-name {
          font-size: 1.2rem;
          font-weight: 800;
          color: #ffffff;
        }
        .brand-name span { color: #ef4444; /* Red accent */ }
        .brand-subtitle {
          font-size: 0.7rem;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .menu-section { margin-bottom: 2rem; }
        .menu-section-title {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #71717a;
          font-weight: 700;
          margin-bottom: 0.75rem;
          padding: 0 0.75rem;
          letter-spacing: 0.05em;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #d4d4d8;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          margin-bottom: 0.25rem;
        }
        .menu-item:hover {
          color: #ffffff;
          background-color: #27272a;
        }
        .menu-item.active {
          color: #ffffff;
          background-color: #dc2626; /* Red active state */
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
        }

        /* MAIN CONTENT */
        .bb-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow-y: auto;
          background-color: #f4f4f5; /* Light Theme */
        }
        
        /* HEADER */
        .bb-top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #ffffff;
          border-bottom: 1px solid #e4e4e7;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #000000;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-title-sub {
          display: flex;
          flex-direction: column;
        }
        .header-title-sub span.title { font-size: 1.1rem; font-weight: 700; }
        .header-title-sub span.subtitle { font-size: 0.7rem; color: #71717a; font-weight: 500; }

        .toggle-sidebar-btn {
          color: #52525b;
          transition: background-color 0.2s;
        }
        .toggle-sidebar-btn:hover { background-color: #f4f4f5; color: #000000; }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .notification-bell {
          position: relative;
          color: #71717a;
          cursor: pointer;
        }
        .notification-bell:hover { color: #000000; }
        .notification-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background-color: #dc2626;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 1px solid #ffffff;
        }
        .notification-dropdown {
          position: absolute;
          top: 2.5rem;
          right: 0;
          width: 320px;
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 50;
          max-height: 400px;
          overflow-y: auto;
        }
        .notification-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e4e4e7;
          font-weight: 600;
          font-size: 0.875rem;
          color: #18181b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notification-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f4f4f5;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .notification-item:hover {
          background-color: #f4f4f5;
        }
        .notification-item:last-child {
          border-bottom: none;
        }
        .notification-empty {
          padding: 2rem;
          text-align: center;
          color: #71717a;
          font-size: 0.875rem;
        }
        .bb-user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: #ffffff;
          padding: 0.4rem 1rem 0.4rem 0.4rem;
          border-radius: 2rem;
          border: 1px solid #e4e4e7;
        }
        .bb-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #b91c1c); /* Red gradient */
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
        }
        .bb-user-info {
          display: flex;
          flex-direction: column;
          max-width: 140px;
        }
        .bb-user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #000000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
        }
        .bb-user-role {
          font-size: 0.7rem;
          color: #71717a;
          font-weight: 600;
        }
      `}</style>

      {/* 1. Sidebar Panel */}
      <aside className={`bb-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`} data-lenis-prevent="true">
        <div className="brand-container">
          <div className="brand-logo" title="Blood Bank Panel">🏥</div>
          <div>
            <div className="brand-name">Life<span>Drop</span></div>
            <div className="brand-subtitle">Blood Bank Panel</div>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-section-title">Main Menu</div>
          <button
            className={`menu-item ${activeMenu === "inventory" ? "active" : ""}`}
            onClick={() => navigate("/bloodbank/inventory")}
          >
            <Package className="w-5 h-5" />
            <span className="menu-item-text">Inventory Matrix</span>
          </button>
          <button
            className={`menu-item ${activeMenu === "units" ? "active" : ""}`}
            onClick={() => navigate("/bloodbank/units")}
          >
            <Layers className="w-5 h-5" />
            <span className="menu-item-text">Blood Units Ledger</span>
          </button>
          <button
            className={`menu-item ${activeMenu === "testing" ? "active" : ""}`}
            onClick={() => navigate("/bloodbank/testing")}
          >
            <FlaskConical className="w-5 h-5" />
            <span className="menu-item-text">Lab Screening</span>
          </button>
          <button
            className={`menu-item ${activeMenu === "expiry" ? "active" : ""}`}
            onClick={() => navigate("/bloodbank/expiry")}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="menu-item-text">Expiry Alerts</span>
          </button>
          <button
            className={`menu-item ${activeMenu === "requests" ? "active" : ""}`}
            onClick={() => navigate("/blood-bank/blood-request")}
          >
            <FileText className="w-5 h-5" />
            <span className="menu-item-text">Blood Requests</span>
          </button>
          <button
            className={`menu-item ${activeMenu === "camp-assignments" ? "active" : ""}`}
            onClick={() => navigate("/blood-bank/camp-assignments")}
          >
            <Calendar className="w-5 h-5" />
            <span className="menu-item-text">Camp Assignments</span>
          </button>
          <button
            className={`menu-item ${activeMenu === "profile" ? "active" : ""}`}
            onClick={() => navigate("/blood-bank/profile")}
          >
            <Building2 className="w-5 h-5" />
            <span className="menu-item-text">Account Profile</span>
          </button>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button className="menu-item" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            <span className="menu-item-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="bb-main-content" data-lenis-prevent="true">
        {/* Top Header Bar */}
        <header className="bb-top-header">
          <div className="header-title">
            <button className="toggle-sidebar-btn border-none bg-transparent cursor-pointer flex items-center justify-center p-1 rounded-md" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="header-title-sub">
              <span className="title">{viewDetails.title}</span>
              {viewDetails.subtitle && <span className="subtitle">{viewDetails.subtitle}</span>}
            </div>
          </div>

          <div className="header-actions">
            <div className="notification-bell" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} style={{ position: "relative" }}>
              <Bell className="w-5 h-5" />
              {(dbNotifications.filter(n => !n.isRead).length + requests.filter(req => req.status === "active" || req.status === "pending").length) > 0 && (
                <div className="notification-badge">
                  {dbNotifications.filter(n => !n.isRead).length + requests.filter(req => req.status === "active" || req.status === "pending").length}
                </div>
              )}
              
              {isNotificationsOpen && (
                <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="notification-header">
                    <span>Notifications</span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {dbNotifications.filter(n => !n.isRead).length + requests.filter(req => req.status === "active" || req.status === "pending").length} New
                    </span>
                  </div>
                  <div className="notification-list">
                    {dbNotifications.length === 0 && requests.filter(req => req.status === "active" || req.status === "pending").length === 0 ? (
                      <div className="notification-empty">No new notifications.</div>
                    ) : (
                      <>
                        {dbNotifications.map(notif => (
                          <div 
                            key={notif._id}
                            className={`notification-item ${!notif.isRead ? 'bg-red-50/50' : ''}`}
                            onClick={async () => {
                              try {
                                await notificationService.markAsRead(notif._id);
                                setDbNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="font-semibold text-red-600" style={{ fontSize: "12px" }}>{notif.title}</span>
                              <span className="text-[9px] text-zinc-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-zinc-600" style={{ fontSize: "11px", textAlign: "left", marginTop: "2px" }}>
                              {notif.message}
                            </div>
                          </div>
                        ))}
                        {requests.filter(req => req.status === "active" || req.status === "pending").map((req) => (
                          <div 
                            key={req._id} 
                            className="notification-item"
                            onClick={() => {
                              navigate("/blood-bank/blood-request");
                              setIsNotificationsOpen(false);
                            }}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="font-semibold text-zinc-800" style={{ fontSize: "12px" }}>{req.bloodGroup} Needed</span>
                              <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-semibold uppercase">{req.urgency || "Normal"}</span>
                            </div>
                            <div className="text-zinc-600" style={{ fontSize: "11px", textAlign: "left" }}>
                              Patient: <strong>{req.patientName}</strong> ({req.units} Units — {req.bloodComponent || "Not specified"})
                            </div>
                            <div className="text-zinc-400 flex justify-between mt-1" style={{ fontSize: "10px", width: "100%" }}>
                              <span className="truncate max-w-[150px]">{req.hospital}</span>
                              <span>ID: {req.requestId}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="bb-user-profile">
              <div className="bb-user-avatar">
                {bloodBank.name ? bloodBank.name[0] : "B"}
              </div>
              <div className="bb-user-info hidden sm:flex">
                <span className="bb-user-name">{bloodBank.name}</span>
                <span className="bb-user-role">Blood Bank</span>
              </div>
            </div>
          </div>
        </header>

        <div className="bb-dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
