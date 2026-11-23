import React from "react";
import { Link } from "react-router-dom";
import { 
  Droplet, 
  Clock, 
  Bell, 
  ChevronDown, 
  User,
  ShieldAlert
} from "lucide-react";

export default function HospitalHeader({ activeAlertsCount = 0 }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const userStr = localStorage.getItem("hospital-user");
  let hospitalUser = null;
  try {
    hospitalUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    hospitalUser = null;
  }
  const displayName = hospitalUser?.hospitalName || hospitalUser?.name || "Hospital Partner";

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-6 shadow-xs font-sans">
      
      {/* Left Logo / Brand */}
      <div className="flex items-center gap-2">
        <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
        <span className="font-extrabold text-red-600 tracking-tight text-lg">Raktadaan</span>
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">
          | LifeDrop Network
        </span>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-5">
        
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Doctor Greeting & Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <span className="text-sm font-bold text-slate-800 hidden lg:inline-block">
            Welcome, {displayName}
          </span>

          {/* Notifications Bell */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition no-underline"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
          </Link>

          {/* Profile Avatar */}
          <div className="flex items-center gap-1.5 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

      </div>

    </header>
  );
}

