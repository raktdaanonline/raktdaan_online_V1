import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Droplet, 
  Users, 
  Building2, 
  BarChart3, 
  Bell, 
  LogOut,
  Cross
} from "lucide-react";

export default function HospitalSidebar({ activeAlertsCount = 0 }) {
  const location = useLocation();
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Accident Alerts", path: "/accident-alerts", icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : 3 },
    { name: "Blood Requests", path: "/blood-requests", icon: Droplet },
    { name: "Donor Management", path: "/donor-management", icon: Users },
    { name: "Hospital Profile", path: "/hospital-profile", icon: Building2 },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  const navigate = useNavigate();

  const isItemActive = (path) => {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname === "/dashbord" ||
        location.pathname === "/"
      );
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of the Hospital Panel?")) {
      localStorage.removeItem("hospital-token");
      localStorage.removeItem("hospital-user");
      navigate("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#182234] text-slate-100 z-50 flex flex-col justify-between shadow-xl font-sans">
      
      {/* Brand & Hospital Identity */}
      <div className="flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60 bg-[#141d2d]">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-600/30 shrink-0">
            <span className="text-2xl leading-none font-bold">+</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-tight leading-tight">City Care</span>
            <span className="text-[10px] font-black tracking-wider uppercase text-red-300">
              Hospital Panel
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 px-3 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium ${
                  active
                    ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[11px] font-black animate-pulse shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout at bottom */}
      <div className="p-4 border-t border-slate-800/60">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition text-sm font-semibold cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

