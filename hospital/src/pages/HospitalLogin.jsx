import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { 
  Droplet, 
  Phone, 
  User, 
  Terminal, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Radio, 
  KeyRound, 
  Share2, 
  ShieldAlert
} from "lucide-react";

export default function HospitalLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered hospital email ID");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/hospital/login", {
        email: email.trim(),
        password: password,
      });

      if (res.data.success) {
        localStorage.setItem("hospital-token", res.data.token);
        localStorage.setItem("hospital-user", JSON.stringify(res.data.hospital));
        toast.success(`Access granted! Welcome, ${res.data.hospital.hospitalName}`, {
          icon: "🏥",
          duration: 4000,
        });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const resData = err.response?.data;
      if (resData?.status === "PENDING") {
        toast.error(resData.message || "Your registration is awaiting Admin approval.", {
          duration: 5000,
          icon: "⏳",
        });
      } else if (resData?.status === "REJECTED") {
        toast.error(
          resData.message || "Your registration request has been rejected. Please contact Admin.",
          {
            duration: 6000,
            icon: "⚠️",
          }
        );
      } else {
        toast.error(resData?.message || "Invalid credentials. Please verify your email and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between font-sans text-slate-800 bg-[#343e4d] overflow-x-hidden selection:bg-red-500 selection:text-white">
      
      {/* Background Hospital Trauma Room Image with Professional Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/hospital-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px]" />
      </div>

      {/* 1. TOP GLOBAL PORTAL HEADER */}
      <header className="relative z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 h-14 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        {/* Left Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">Raktadaan</span>
              <span className="font-extrabold text-red-600 tracking-tight text-base">LifeDrop</span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 -mt-0.5">
              Clinical Staff Portal
            </span>
          </div>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Hotline Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold tracking-tight">
            <span className="text-red-600 font-extrabold text-sm leading-none">*</span>
            <span>24/7 ER HOTLINE:</span>
            <span className="font-black">1800-LIFEDROP</span>
          </div>

          <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block">
            Portal Login
          </span>

          <span className="text-slate-300 hidden sm:inline-block">|</span>

          {/* Network Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Network Status</span>
          </div>

          {/* Avatar Icon */}
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
            <User className="w-4 h-4" />
          </div>

        </div>
      </header>

      {/* 2. MAIN CENTERED LOGIN CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 px-4 sm:px-6">
        
        <div className="max-w-[780px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700/40 bg-white grid grid-cols-1 md:grid-cols-12">
          
          {/* ============================================================
              LEFT HALF (DARK / NAVY GRADIENT) ~42%
              ============================================================ */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#181926] via-[#101422] to-[#0a0e18] text-slate-100 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Ambient Red Glow */}
            <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              
              {/* Hospital Identity Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0 font-bold text-2xl leading-none">
                  +
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                    City Care Hospital
                  </h2>
                  <span className="text-[9px] font-bold tracking-widest text-red-300 uppercase block mt-0.5">
                    HOSPITAL PANEL • STAFF LOGIN
                  </span>
                </div>
              </div>

              {/* Clinical Gateway Status Pill Card */}
              <div className="p-3 rounded-xl bg-[#161f30]/90 border border-slate-700/60 backdrop-blur-md space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                  Clinical Gateway
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Raktadaan LifeDrop Network
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-950/90 text-teal-300 text-[10px] font-bold border border-teal-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    ONLINE SYNC
                  </span>
                </div>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-3.5 pt-1">
                
                {/* Feature 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Radio className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      STAT Golden Hour Dispatch
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5 font-normal">
                      Real-time automated blood matching and drone/ER ambulance routing.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <KeyRound className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      Critical Reserve Locking
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5 font-normal">
                      Direct terminal reservation for emergency trauma suites and ICUs.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      Hardware Node Verification
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5 font-normal">
                      DPDP &amp; NABH Level 3 certified authenticated terminal access.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom 24/7 Helpline Strip */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    24/7 Hospital ER Helpline
                  </span>
                  <span className="text-xs font-bold text-white tracking-tight">
                    +91 20 6645 5100
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700 tracking-wider">
                Ext 9
              </span>
            </div>

          </div>

          {/* ============================================================
              RIGHT HALF (CRISP WHITE FORM) ~58%
              ============================================================ */}
          <div className="md:col-span-7 bg-white p-5 sm:p-7 flex flex-col justify-center gap-3.5">
            
            {/* Header & Terminal Version */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Hospital Staff Portal
                </h1>
                
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold font-mono">
                  <Terminal className="w-3 h-3" />
                  <span>Terminal v4.8</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Sign in with verified clinical credentials to access trauma console.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5 mt-1">
              
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email ID
                </label>
                <div className="relative flex items-center rounded-xl border border-slate-300 hover:border-slate-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/15 bg-white transition shadow-xs">
                  <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. dr.mehta@citycarehospital.in"
                    className="w-full pl-2.5 pr-4 py-2.5 text-sm text-slate-900 font-medium bg-transparent outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => toast("Please contact hospital IT helpdesk or Ext 9 to reset credentials.", { icon: "ℹ️" })}
                    className="text-xs font-bold text-red-600 hover:text-red-700 transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                
                <div className="relative flex items-center rounded-xl border border-slate-300 hover:border-slate-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/15 bg-white transition shadow-xs">
                  <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter clinical password"
                    className="w-full pl-2.5 pr-10 py-2.5 text-sm text-slate-900 font-medium bg-transparent outline-none placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input 
                  type="checkbox"
                  id="keepLogged"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer accent-red-600"
                />
                <label htmlFor="keepLogged" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Keep logged in for 12h Duty Shift
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>{isLoading ? "AUTHENTICATING NODE..." : "➔ SECURE LOGIN TO HOSPITAL PANEL ➔"}</span>
              </button>

            </form>

            {/* Bottom DPDP / PHI Audit Notice */}
            <div className="pt-1 flex items-start gap-2 text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                <strong>Protected Health Information (PHI)</strong> console under India Digital Personal Data Protection (DPDP) Act. All terminal queries, unit requisitions, and emergency requests are logged with timestamped IP audit trails.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* 3. BOTTOM LEGAL FOOTER */}
      <footer className="relative z-20 h-10 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-300 font-medium bg-slate-950/60 backdrop-blur-md border-t border-white/10">
        <span>© 2025 Raktadaan LifeDrop Healthcare Network. All rights reserved.</span>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <span className="hover:text-white cursor-pointer">Clinical Guidelines</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">NABH Compliance</span>
          <span>•</span>
          <span className="hover:text-white cursor-pointer">Emergency Dispatch Desk</span>
        </div>
      </footer>

    </div>
  );
}
