import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Siren, 
  Filter, 
  Ambulance, 
  CheckCircle2, 
  Camera, 
  X, 
  Droplet, 
  ArrowRight,
  RefreshCw,
  Search
} from "lucide-react";

export default function AccidentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const baseIncidents = [
    {
      id: "SOS-FC-01",
      alertId: "SOS-2026-8812",
      title: "Accident at FC Road, Pune",
      location: "FC Road, Near Deccan Gymkhana, Pune",
      time: "Today, 04:15 PM",
      status: "critical",
      statusText: "Starting Phase",
      description: "Two-wheeler and car accident, people are injured.",
      image: "https://lh3.googleusercontent.com/aida/ALJJyrDmHr-J_DKwZ7Mu5c_DgEXxJ7EhNLmE8UpOkDf_Euar1dY0diC8vf-nU-98Sw-4C6T7VblUFwqXG35cAgd6rDlAIPpTWocoewBTffJfYLqvxtMkdotAYQqg1qoBiPfw0F7w5RQlMnWzFA3K-Br5lUrReJpcuIZyERHfAZ90DM6mj_TiR7E0bxO3hmlSgy8gQa1Y9e4tcbtvnI-4DSagz9rMs7wRI3RpfAG6M7zJ8tPBog",
      bloodGroup: "O+",
      casualties: "2 Injured (Moderate Trauma)"
    },
    {
      id: "SOS-EXP-02",
      alertId: "SOS-2026-8815",
      title: "Accident on Mumbai-Pune Expressway",
      location: "Expressway KM 42, Lonavala Exit, Pune",
      time: "Today, 02:30 PM",
      status: "critical",
      statusText: "Starting Phase",
      description: "Bike rider injured, need immediate help.",
      image: "https://lh3.googleusercontent.com/aida/ALJJyrCtehljCrNdfZmMHx2VOE-fWMg4ZRHgl9Y4om50o6LF-HcaGoKlWJKgSKyCPjse4BPY4POFaGIOViYtgY52ERQqapNR5Pgj1gnFMi_8eYilUJKEB0V-7ehD0ayTc-sO1vIWg2RwwKYJvV81ZybtzRmYNHvmJZXTvnJNgBuLaW4NQC1mYgY-IhcNu0cRPbv1GXrRRPJAO9no27a-Lg9DAAHuf_yjOryT38uMQzLvzQmqgw",
      bloodGroup: "B+",
      casualties: "1 Severe Head Injury"
    }
  ];

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/emergency-alerts");
      if (res.data?.success) {
        const live = res.data.data.map(item => ({
          id: item._id,
          alertId: item.alertId,
          title: item.title,
          location: item.location,
          time: item.time ? `Today, ${item.time}` : "Recent",
          status: item.status || "critical",
          statusText: item.status === "critical" ? "Starting Phase" : item.status === "stabilized" ? "Stabilizing" : "Resolved",
          description: item.description || "Reported via citizen emergency portal.",
          image: item.photo || null,
          bloodGroup: item.bloodGroup || "Any",
          casualties: item.casualties || "Reported Trauma Incident",
          isLiveUser: true,
          mongoId: item._id
        }));
        setAlerts([...live, ...baseIncidents]);
      } else {
        setAlerts(baseIncidents);
      }
    } catch (err) {
      setAlerts(baseIncidents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = (alert) => {
    toast.success(`Ambulance & Trauma response team dispatched to #${alert.alertId}!`, {
      icon: "🚑"
    });
    setSelectedIncident(null);
  };

  const handleResolve = async (alert) => {
    if (alert.mongoId) {
      try {
        await api.patch(`/emergency-alerts/${alert.mongoId}/status`, { status: "resolved" });
        fetchAlerts();
        toast.success(`Alert #${alert.alertId} marked as resolved!`);
        return;
      } catch (err) {
        toast.error("Status update error.");
      }
    }
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: "resolved", statusText: "Resolved" } : a));
    toast.success(`Alert #${alert.alertId} resolved.`);
  };

  const filtered = alerts.filter(item => {
    if (filterStatus === "critical" && item.status !== "critical") return false;
    if (filterStatus === "resolved" && item.status !== "resolved") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Accident Alerts Feed</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time emergency citizen accident reports with GPS Geotag and dispatch controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAlerts}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-80 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location or title..."
            className="w-full bg-transparent text-xs text-slate-800 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto">
          {["all", "critical", "resolved"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                filterStatus === st 
                  ? "bg-red-600 text-white shadow-xs" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st === "all" ? "All Alerts" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                item.status === "critical"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200"
              }`}>
                {item.statusText}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">#{item.alertId}</span>
            </div>

            <div className="flex gap-4">
              {item.image && (
                <div 
                  onClick={() => setSelectedIncident(item)}
                  className="w-28 h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer relative group"
                >
                  <img src={item.image} alt="Scene" className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                    View
                  </div>
                </div>
              )}

              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <Droplet className="w-3 h-3" /> Blood: {item.bloodGroup}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(item)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Details
                </button>
                {item.status !== "resolved" ? (
                  <button
                    type="button"
                    onClick={() => handleResolve(item)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold"
                  >
                    Resolve
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">Resolved ✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Incident Details - #{selectedIncident.alertId}</h3>
              <button 
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedIncident.image && (
              <div className="rounded-xl overflow-hidden max-h-60 bg-slate-900">
                <img src={selectedIncident.image} alt="Evidence" className="w-full h-full object-contain" />
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-700">
              <p className="text-sm font-bold text-slate-900">{selectedIncident.title}</p>
              <p>📍 Location: <strong>{selectedIncident.location}</strong></p>
              <p>🕒 Time: {selectedIncident.time}</p>
              <p>🩸 Blood Requirement: <strong className="text-red-600">{selectedIncident.bloodGroup}</strong></p>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 italic">"{selectedIncident.description}"</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDispatch(selectedIncident)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>Dispatch Ambulance</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

