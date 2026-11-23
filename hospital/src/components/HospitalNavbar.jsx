import React from "react";
import { 
  Hospital, 
  Siren, 
  Activity, 
  Droplet, 
  PhoneCall, 
  ShieldCheck, 
  Bell,
  Building2,
  ChevronDown
} from "lucide-react";

export default function HospitalNavbar({ emergencyCount = 0 }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Hospital Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 tracking-tight">Raktdaan</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                  Hospital Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Emergency Triage &amp; Blood Command Console</p>
            </div>
          </div>

          {/* Quick Hospital Facility Switcher */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Ruby Hall Clinic - Trauma Wing (Pune)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            
            {/* Live Emergency Alert Indicator */}
            {emergencyCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-800 text-xs font-bold border border-red-200 shadow-xs animate-pulse">
                <Siren className="w-4 h-4 text-red-600" />
                <span>{emergencyCount} Active SOS Alert{emergencyCount > 1 ? "s" : ""}</span>
              </div>
            )}

            {/* Helpline CTA */}
            <a 
              href="tel:108"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition no-underline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
              <span>Dispatch: 108</span>
            </a>

            {/* User Profile Avatar */}
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-black text-xs flex items-center justify-center">
              DR
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}

