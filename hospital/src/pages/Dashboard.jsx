import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Car, 
  Droplet, 
  Users, 
  ArrowRight, 
  Phone, 
  Heart, 
  CheckCircle2, 
  Hourglass, 
  Siren, 
  Camera, 
  X, 
  Ambulance, 
  Sparkles,
  RefreshCw,
  Building2
} from "lucide-react";

export default function Dashboard() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dbAlerts, setDbAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Time state
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  // Base fallback incidents from file2.html
  const baseIncidents = [
    {
      id: "SOS-FC-01",
      title: "Accident at FC Road, Pune",
      location: "FC Road, Pune",
      time: "Today, 04:15 PM",
      statusText: "Starting Phase",
      description: "Two-wheeler and car accident, people are injured.",
      image: "https://lh3.googleusercontent.com/aida/ALJJyrDmHr-J_DKwZ7Mu5c_DgEXxJ7EhNLmE8UpOkDf_Euar1dY0diC8vf-nU-98Sw-4C6T7VblUFwqXG35cAgd6rDlAIPpTWocoewBTffJfYLqvxtMkdotAYQqg1qoBiPfw0F7w5RQlMnWzFA3K-Br5lUrReJpcuIZyERHfAZ90DM6mj_TiR7E0bxO3hmlSgy8gQa1Y9e4tcbtvnI-4DSagz9rMs7wRI3RpfAG6M7zJ8tPBog",
      coordinates: "18.5204° N, 73.8567° E (FC Road Junction)"
    },
    {
      id: "SOS-EXP-02",
      title: "Accident on Mumbai-Pune Expressway",
      location: "Expressway, Pune",
      time: "Today, 02:30 PM",
      statusText: "Starting Phase",
      description: "Bike rider injured, need immediate help.",
      image: "https://lh3.googleusercontent.com/aida/ALJJyrCtehljCrNdfZmMHx2VOE-fWMg4ZRHgl9Y4om50o6LF-HcaGoKlWJKgSKyCPjse4BPY4POFaGIOViYtgY52ERQqapNR5Pgj1gnFMi_8eYilUJKEB0V-7ehD0ayTc-sO1vIWg2RwwKYJvV81ZybtzRmYNHvmJZXTvnJNgBuLaW4NQC1mYgY-IhcNu0cRPbv1GXrRRPJAO9no27a-Lg9DAAHuf_yjOryT38uMQzLvzQmqgw",
      coordinates: "18.7542° N, 73.4351° E (KM 42 Lonavala Exit)"
    }
  ];

  // Fetch real-time DB alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/emergency-alerts");
      if (res.data?.success) {
        setDbAlerts(res.data.data || []);
      }
    } catch (err) {
      console.warn("Could not fetch emergency alerts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Merge live DB alerts at top with base incidents
  const mappedDbAlerts = dbAlerts.map(a => ({
    id: a.alertId || a._id,
    mongoId: a._id,
    title: a.title,
    location: a.location,
    time: a.time ? `Today, ${a.time}` : "Just Now",
    statusText: a.status === "critical" ? "Starting Phase" : a.status === "stabilized" ? "Triage Responding" : "Resolved",
    description: a.description || "Citizen accident reported. Triage bay alerted.",
    image: a.photo || "https://lh3.googleusercontent.com/aida/ALJJyrDmHr-J_DKwZ7Mu5c_DgEXxJ7EhNLmE8UpOkDf_Euar1dY0diC8vf-nU-98Sw-4C6T7VblUFwqXG35cAgd6rDlAIPpTWocoewBTffJfYLqvxtMkdotAYQqg1qoBiPfw0F7w5RQlMnWzFA3K-Br5lUrReJpcuIZyERHfAZ90DM6mj_TiR7E0bxO3hmlSgy8gQa1Y9e4tcbtvnI-4DSagz9rMs7wRI3RpfAG6M7zJ8tPBog",
    coordinates: a.location.includes("GPS:") ? a.location.replace(/^GPS:\s*/i, "") : "18.6298° N, 73.7997° E (Pimpri Hub)",
    isLiveUser: true,
    bloodGroup: a.bloodGroup
  }));

  const allAlertsList = [...mappedDbAlerts, ...baseIncidents];
  const activeAlertsCount = allAlertsList.length;

  const handleDispatchAmbulance = (incident) => {
    toast.success(`Ambulance #108 dispatched to ${incident.location}!`, {
      icon: "🚑",
      duration: 5000
    });
    setSelectedIncident(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP SUB-HEADER: GREETINGS & LOCATION INFO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <Droplet className="w-5 h-5 fill-red-600" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Welcome, Dr. Mehta!
            </h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-slate-700">City Care Hospital</span>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-red-500" />
                Pimpri-Chinchwad, Pune
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
          <Clock className="w-3.5 h-3.5 text-red-600" />
          <span className="font-bold text-slate-800">{currentDate}</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-600">{currentTime}</span>
        </div>
      </div>

      {/* 2. ALERT HERO BANNER */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 min-h-[148px] flex items-center">
        {/* Ambient Gradient & Image */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-right opacity-60 z-0"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBICQudsQp1YOeLnGeqBQ5MDGQHmg_nijO6YTodN32yC1YE53mquDKRTRFBh07vzPp50torPWQy-ZzaMsh3NhBFwpKgM1I_arFwiZHnJywmDMP9u8E0IplTdgja8-tRJkZAbwRZ4vXdujU5IDzC_6Bx4KoO3dJb3o_JAaJB4Tyav2fplyBSyhWNF6FkpRK-48yFi74M1_5jfDnR3ZBYuOe9AY7BgQxFvmoqTPquHtLP')`
          }}
        />

        {/* Content */}
        <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between w-full p-6 sm:p-7 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 shrink-0 ring-4 ring-red-600/20">
              <Siren className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-red-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-Time Emergency Feed</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Accident Alert Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Real-time accident reports. Be ready to help.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/30 backdrop-blur-md text-red-200 border border-red-500/30 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              System Live: Dispatch 24/7
            </span>
          </div>
        </div>
      </div>

      {/* 3. 4 STAT METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Alerts */}
        <Link 
          to="/accident-alerts"
          className="group bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between no-underline"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {activeAlertsCount}
              </span>
              <span className="text-xs text-slate-500 font-semibold mt-1">
                Active Alerts
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 2: Nearby Accident */}
        <Link 
          to="/accident-alerts"
          className="group bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between no-underline"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900 leading-none">
                1
              </span>
              <span className="text-xs text-slate-500 font-semibold mt-1">
                Nearby Accident
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 3: Blood Request */}
        <Link 
          to="/blood-requests"
          className="group bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between no-underline"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6 fill-red-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900 leading-none">
                0
              </span>
              <span className="text-xs text-slate-500 font-semibold mt-1">
                Blood Request
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 4: People Helped */}
        <Link 
          to="/reports"
          className="group bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between no-underline"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900 leading-none">
                12
              </span>
              <span className="text-xs text-slate-500 font-semibold mt-1">
                People Helped <span className="text-slate-400 text-[10px] font-normal">(This Month)</span>
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

      </div>

      {/* 4. MAIN TWO-COLUMN SECTION (8 COLS : 4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================
            LEFT COLUMN (8 COLUMNS): ACTIVE ACCIDENT ALERTS
            ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Active Accident Alerts
              </h2>
            </div>
            <Link 
              to="/accident-alerts"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition no-underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Alert Cards Container */}
          <div className="space-y-4">
            {allAlertsList.map((incident) => (
              <div 
                key={incident.id}
                className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full min-w-0">
                  
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-inner group">
                    <img 
                      src={incident.image} 
                      alt={incident.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Camera className="w-3 h-3 text-red-400" />
                      <span>Photo Attached</span>
                    </div>
                    {incident.isLiveUser && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                        Live User
                      </div>
                    )}
                  </div>

                  {/* Alert Details */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {incident.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        {incident.location.length > 25 ? incident.location.substring(0, 25) + "..." : incident.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {incident.time}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-red-200">
                        <Hourglass className="w-3 h-3 text-red-600" />
                        {incident.statusText}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 font-normal">
                      {incident.description}
                    </p>
                  </div>

                </div>

                {/* Action Button */}
                <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(incident)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 text-red-600 font-bold text-xs hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* ============================================================
            RIGHT COLUMN (4 COLUMNS): HOSPITAL STATUS
            ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
            
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-black">📊</span>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Hospital Status
                </h2>
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
              </span>
            </div>

            {/* Ready to Respond Banner */}
            <div className="rounded-xl p-4 bg-red-50/80 border border-red-100 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                <Heart className="w-5 h-5 animate-pulse fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 leading-tight">
                  Ready to Respond
                </span>
                <span className="text-xs text-slate-500 mt-0.5 font-medium">
                  Your support can save lives!
                </span>
              </div>
            </div>

            {/* Readiness Checklist */}
            <div className="space-y-3 text-xs">
              
              {/* Item 1: Blood Stock */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-red-600 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <span>Blood Stock</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                  Adequate
                </span>
              </div>

              {/* Item 2: Emergency Team */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-red-600 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <span>Emergency Team</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                  On Standby
                </span>
              </div>

              {/* Item 3: Contact Hotline */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-red-600 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <span>Contact</span>
                </div>
                <a 
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-red-600 transition no-underline"
                >
                  <Phone className="w-3 h-3 text-red-600" />
                  <span>+91 98765 43210</span>
                </a>
              </div>

            </div>

            {/* Bottom Together Banner */}
            <div className="rounded-xl bg-red-50 p-3 flex items-center justify-center gap-2 text-center border border-red-100">
              <Heart className="w-4 h-4 text-red-600 fill-red-600" />
              <span className="text-xs font-bold text-slate-800">Together, we can save lives</span>
            </div>

          </div>

          {/* Quick Blood Inventory Preview Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Priority Units Required
              </span>
              <span className="text-xs font-black text-red-600">
                O- &amp; A+ Needed
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] font-bold text-slate-500">A+</div>
                <div className="text-base font-black text-red-600 mt-0.5">4 U</div>
              </div>
              <div className="p-2.5 bg-red-100 border border-red-200 rounded-xl text-center">
                <div className="text-[10px] font-black text-red-800">O-</div>
                <div className="text-base font-black text-red-700 mt-0.5">1 U</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] font-bold text-slate-500">B+</div>
                <div className="text-base font-black text-slate-800 mt-0.5">8 U</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] font-bold text-slate-500">AB+</div>
                <div className="text-base font-black text-slate-800 mt-0.5">5 U</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. INTERACTIVE DETAILS MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedIncident.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedIncident.image && (
              <div className="rounded-xl overflow-hidden max-h-56 bg-slate-900 border border-slate-200">
                <img 
                  src={selectedIncident.image} 
                  alt="Incident Spot" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">
                {selectedIncident.description}
              </p>
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Dispatch Coordinate</span>
                  <span className="font-mono text-slate-700 font-bold">{selectedIncident.coordinates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Reported Time</span>
                  <span className="text-slate-800 font-semibold">{selectedIncident.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Current Status</span>
                  <span className="text-red-700 font-bold">{selectedIncident.statusText}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => handleDispatchAmbulance(selectedIncident)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
              >
                <Ambulance className="w-4 h-4" />
                <span>Dispatch Ambulance</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

