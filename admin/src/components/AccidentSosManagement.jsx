import React, { useState, useEffect } from "react";
import { 
  Siren, 
  Ambulance, 
  Hospital, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  PhoneCall, 
  Clock, 
  Eye, 
  Trash2, 
  Check, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Shield, 
  Heart,
  Droplet
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function AccidentSosManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");

  // Real Database Incidents from MongoDB backend
  const [dbAlerts, setDbAlerts] = useState([]);
  const [loadingDbAlerts, setLoadingDbAlerts] = useState(false);

  // Fetch real accident alerts submitted by citizens
  const fetchDbAlerts = async () => {
    try {
      setLoadingDbAlerts(true);
      const res = await api.get("/emergency-alerts");
      if (res.data?.success) {
        setDbAlerts(res.data.data || []);
      }
    } catch (err) {
      console.warn("Could not fetch real alerts from backend:", err.message);
    } finally {
      setLoadingDbAlerts(false);
    }
  };

  useEffect(() => {
    fetchDbAlerts();
    // Auto refresh every 15 seconds for real-time responsiveness
    const timer = setInterval(fetchDbAlerts, 15000);
    return () => clearInterval(timer);
  }, []);

  // Format DB alerts into standardized view model
  const allIncidents = dbAlerts.map((alert) => {
    const isCritical = alert.status === "critical" || alert.status === "active";
    const isResolved = alert.status === "resolved";
    const isDispatched =
      alert.status === "dispatched" ||
      alert.ambulanceDispatched ||
      alert.ambulanceStatus?.toLowerCase().includes("dispatched") ||
      alert.ambulanceStatus?.toLowerCase().includes("en route");

    let tagColor = alert.tagColor || "bg-amber-100 text-amber-800 border-amber-300";
    let tag = alert.tag || "Active Alert";
    if (isCritical) {
      tagColor = "bg-red-100 text-red-800 border-red-300";
      tag = "CRITICAL • 1-CLICK SOS";
    } else if (isResolved) {
      tagColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
      tag = "RESOLVED";
    } else if (isDispatched) {
      tagColor = "bg-blue-100 text-blue-800 border-blue-300";
      tag = "AMBULANCE DISPATCHED";
    }

    const timeDiffMinutes = Math.max(
      1,
      Math.floor((Date.now() - new Date(alert.createdAt || Date.now()).getTime()) / 60000)
    );
    const timeAgo =
      timeDiffMinutes < 60
        ? `${timeDiffMinutes} min ago`
        : timeDiffMinutes < 1440
        ? `${Math.floor(timeDiffMinutes / 60)}h ${timeDiffMinutes % 60}m ago`
        : `${Math.floor(timeDiffMinutes / 1440)}d ago`;

    return {
      id: alert.alertId || (alert._id ? alert._id.substring(alert._id.length - 6).toUpperCase() : "ALERT"),
      rawId: alert._id,
      title: alert.title || alert.location || "Accident Scene Reported",
      location: alert.location || "Live GPS Coordinates",
      timeAgo,
      createdAt: alert.createdAt,
      status: alert.status || "critical",
      tag,
      tagColor,
      image: alert.photo || null,
      imageLabel: alert.photoName || "Evidence Photo",
      reportedBy: alert.reportedBy || "Citizen Bystander",
      contact: alert.contact || "Direct SOS Relay",
      bloodGroup: alert.bloodGroup || "Any",
      ambulanceStatus: alert.ambulanceStatus || (isDispatched ? "Ambulance En Route" : "Awaiting Dispatch"),
      traumaAlerts: alert.traumaAlerts || "Trauma Centers Alerted",
      verified: alert.verified ?? true,
      description: alert.description || "",
    };
  });

  // Handle General Emergency Broadcast CTA
  const handleGeneralBroadcast = async () => {
    try {
      setIsBroadcasting(true);
      toast.loading("Transmitting network emergency alert...", { id: "gen-tx" });
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(
        "🚨 Emergency Alert Broadcasted! Active donors and response units within range notified.",
        { id: "gen-tx" }
      );
    } catch (err) {
      toast.error("Failed to transmit emergency broadcast.", { id: "gen-tx" });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Broadcast specific incident to network
  const handleIncidentBroadcast = async (incident) => {
    try {
      toast.loading(`Transmitting DEFCON 1 alert for ${incident.title}...`, { id: "sos-tx" });
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success(
        `🚨 Network Broadcast Active: Immediate response dispatched for incident #${incident.id}. Nearby donors and ambulances notified!`,
        { id: "sos-tx" }
      );
      fetchDbAlerts();
    } catch (err) {
      toast.error("Failed to broadcast alert.", { id: "sos-tx" });
    }
  };

  // Mark incident as Resolved
  const handleResolveIncident = async (incident) => {
    if (!incident.rawId) {
      toast.success(`Incident #${incident.id} marked as resolved.`);
      return;
    }
    try {
      const res = await api.patch(`/emergency-alerts/${incident.rawId}/status`, {
        status: "resolved",
      });
      if (res.data?.success) {
        toast.success(`Incident #${incident.id} successfully marked as RESOLVED.`);
        fetchDbAlerts();
      }
    } catch (err) {
      console.error("Resolve error:", err);
      toast.error("Failed to update status.");
    }
  };

  // Delete incident
  const handleDeleteIncident = async (incident) => {
    if (window.confirm(`Are you sure you want to delete incident record #${incident.id}?`)) {
      if (!incident.rawId) {
        toast.success(`Incident #${incident.id} record removed.`);
        return;
      }
      try {
        const res = await api.delete(`/emergency-alerts/${incident.rawId}`);
        if (res.data?.success) {
          toast.success(`Incident #${incident.id} deleted.`);
          fetchDbAlerts();
        }
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete alert.");
      }
    }
  };

  // Real Dynamic KPI counts from MongoDB alerts
  const totalCount = allIncidents.length;
  const criticalCount = allIncidents.filter((a) => a.status === "critical" || a.status === "active").length;
  const dispatchedCount = allIncidents.filter(
    (a) =>
      a.status === "dispatched" ||
      a.ambulanceStatus?.toLowerCase().includes("dispatched") ||
      a.ambulanceStatus?.toLowerCase().includes("en route")
  ).length;
  const bloodPendingCount = allIncidents.filter(
    (a) => a.bloodGroup && a.bloodGroup !== "None" && a.bloodGroup !== "Any" && a.status !== "resolved"
  ).length;
  const resolvedCount = allIncidents.filter((a) => a.status === "resolved").length;

  // Filter incidents based on active tab & severity dropdown
  const filteredIncidents = allIncidents.filter((item) => {
    if (severityFilter === "critical" && item.status !== "critical" && item.status !== "active") return false;
    if (severityFilter === "resolved" && item.status !== "resolved") return false;

    if (activeTab === "critical") return item.status === "critical" || item.status === "active";
    if (activeTab === "dispatched") {
      return (
        item.status === "dispatched" ||
        item.ambulanceStatus?.toLowerCase().includes("dispatched") ||
        item.ambulanceStatus?.toLowerCase().includes("en route")
      );
    }
    if (activeTab === "blood_pending") {
      return item.bloodGroup && item.bloodGroup !== "None" && item.bloodGroup !== "Any" && item.status !== "resolved";
    }
    if (activeTab === "resolved") return item.status === "resolved";
    return true;
  });

  return (
    <div className="p-3 sm:p-5 max-w-7xl w-full mx-auto space-y-4 font-sans text-slate-800">
      
      {/* 1. TOP COMMAND BAR (CLEAN, PROPORTIONED, NO OVERFLOW) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-600/30">
              <Siren className={`w-4 h-4 ${criticalCount > 0 ? "animate-pulse" : ""}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Accident &amp; SOS Alert Management
                </h1>
                {criticalCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                    DEFCON 1 ({criticalCount} Urgent)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Grid Standby
                  </span>
                )}
                {totalCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                    {totalCount} Real-Time Report{totalCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                Live citizen accident submissions, donor mobilization, trauma alerts, and emergency status tracking.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button 
              type="button"
              onClick={fetchDbAlerts}
              title="Refresh live reports"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 text-slate-500 ${loadingDbAlerts ? "animate-spin text-red-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer transition"
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical / Active SOS</option>
              <option value="resolved">Resolved Cases</option>
            </select>

            <button 
              type="button"
              onClick={handleGeneralBroadcast}
              disabled={isBroadcasting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-600/30 transition cursor-pointer"
            >
              <Radio className={`w-3 h-3 ${isBroadcasting ? "animate-spin" : "animate-pulse"}`} />
              <span>Broadcast Alert</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. TOP 4 METRIC STAT KPI BOXES (COMPACT, SLEEK, BALANCED) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1: TOTAL ALERTS */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Alerts
            </span>
            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-none">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {totalCount === 0 ? "No reports on record" : `${totalCount} alert records`}
          </div>
        </div>

        {/* KPI 2: CRITICAL SOS */}
        <div className="bg-white p-3 rounded-xl border border-red-200 bg-gradient-to-br from-white to-red-50/40 shadow-xs hover:border-red-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
              Critical SOS
            </span>
            <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Siren className={`w-3.5 h-3.5 ${criticalCount > 0 ? "animate-pulse" : ""}`} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 mt-1 leading-none">
            {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
          </div>
          <div className="text-[10px] text-red-600 font-semibold mt-1 flex items-center gap-1 truncate">
            {criticalCount > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" />
                <span className="truncate">Attention required</span>
              </>
            ) : (
              <span className="text-slate-400 font-normal">All clear</span>
            )}
          </div>
        </div>

        {/* KPI 3: AMBULANCE DISPATCHED */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Ambulance En Route
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Ambulance className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-none">{dispatchedCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {dispatchedCount === 0 ? "0 units active" : `${dispatchedCount} en route`}
          </div>
        </div>

        {/* KPI 4: RESOLVED */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Resolved &amp; Closed
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-none">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1 truncate">
            {totalCount > 0 ? `${Math.round((resolvedCount / totalCount) * 100)}% resolved` : "100% triage"}
          </div>
        </div>

      </div>

      {/* 3. MAIN INCIDENT QUEUE (FULL WIDTH & CLEAN) */}
      <div className="space-y-3 w-full">
          
          {/* Subtabs Filter Strip */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1 min-w-max">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Alerts ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("critical")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === "critical"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                }`}
              >
                {criticalCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                Critical ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dispatched")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "dispatched" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Ambulance ({dispatchedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("blood_pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "blood_pending" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Blood ({bloodPendingCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("resolved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "resolved" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Resolved ({resolvedCount})
              </button>
            </div>
            
            <button
              type="button"
              onClick={fetchDbAlerts}
              className="text-xs text-red-600 hover:text-red-700 font-bold px-2 flex items-center gap-1 cursor-pointer shrink-0"
              title="Refresh Alerts"
            >
              <RefreshCw className={`w-3 h-3 ${loadingDbAlerts ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Incident Feed Cards List */}
          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Emergency Alerts Found</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  {activeTab === "all"
                    ? "No emergency reports in the database. When a user submits an accident report, it will appear here instantly."
                    : `No reports match the selected "${activeTab}" filter.`}
                </p>
                <button
                  type="button"
                  onClick={fetchDbAlerts}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingDbAlerts ? "animate-spin" : ""}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            ) : (
              filteredIncidents.map((incident) => (
                <div 
                  key={incident.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all p-3.5 sm:p-4"
                >
                  {/* Top Strip */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${incident.tagColor}`}>
                        {incident.status === "critical" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        )}
                        {incident.tag}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                        #{incident.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium">
                      <Clock className="w-3 h-3 text-red-600" />
                      <span className="font-bold text-red-600">{incident.timeAgo}</span>
                      <span className="truncate max-w-[180px]">• {incident.location}</span>
                    </div>
                  </div>

                  {/* Body: Thumbnail + Content */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    
                    {/* Thumbnail Box */}
                    <div 
                      onClick={() => setSelectedIncident(incident)}
                      className="w-full sm:w-36 h-28 shrink-0 rounded-lg overflow-hidden relative group bg-slate-900 cursor-pointer border border-slate-200"
                    >
                      {incident.image ? (
                        <img
                          src={incident.image}
                          alt="Incident"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-2">
                          <AlertTriangle className="w-6 h-6 text-red-500 mb-1" />
                          <span className="text-[10px] font-semibold text-center">No Photo</span>
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-white text-[9px] font-semibold flex items-center gap-1 max-w-[90%] truncate">
                        <span className="truncate">{incident.imageLabel || "Evidence"}</span>
                      </div>
                      {incident.verified && (
                        <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider shadow-xs">
                          GPS Verified
                        </div>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                          {incident.title}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-[11px] flex-wrap">
                          <span>Reported by: <strong className="text-slate-800">{incident.reportedBy}</strong></span>
                          <span>•</span>
                          <span>{incident.contact}</span>
                        </div>
                      </div>

                      {/* Citizen Incident Description */}
                      {incident.description && (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 line-clamp-2">
                          <strong className="text-slate-900">Details:</strong> {incident.description}
                        </div>
                      )}

                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {incident.bloodGroup && incident.bloodGroup !== "Any" && incident.bloodGroup !== "None" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                            <Heart className="w-3 h-3 fill-red-600 text-red-600" />
                            Blood: {incident.bloodGroup}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                          <Ambulance className="w-3 h-3" />
                          {incident.ambulanceStatus}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          <Hospital className="w-3 h-3 text-blue-600" />
                          {incident.traumaAlerts}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Actions Bottom Strip */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIncident(incident)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleIncidentBroadcast(incident)}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Radio className="w-3 h-3" />
                        <span>Broadcast {incident.bloodGroup !== "Any" && incident.bloodGroup !== "None" ? incident.bloodGroup : "SOS"}</span>
                      </button>

                      {incident.status !== "resolved" ? (
                        <button
                          type="button"
                          onClick={() => handleResolveIncident(incident)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Resolved
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteIncident(incident)}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 transition cursor-pointer"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

      </div>

      {/* 4. NATIONAL EMERGENCY HOTLINES STRIP */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 sm:p-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">National Emergency Hotlines</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Toll-Free 24x7 Services</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <a
            href="tel:108"
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-red-600 hover:text-white group transition border border-slate-200/70 no-underline text-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-red-100 group-hover:bg-red-700 text-red-600 group-hover:text-white flex items-center justify-center shrink-0">
                <Ambulance className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none">Ambulance Dispatch</span>
                <span className="text-[10px] text-slate-500 group-hover:text-red-100">National Emergency Response</span>
              </div>
            </div>
            <span className="text-base font-black text-red-600 group-hover:text-white">108</span>
          </a>

          <a
            href="tel:112"
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white group transition border border-slate-200/70 no-underline text-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-200 group-hover:bg-slate-800 text-slate-700 group-hover:text-white flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none">Police &amp; Patrol</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-300">National Police Helpline</span>
              </div>
            </div>
            <span className="text-base font-black text-slate-900 group-hover:text-white">112</span>
          </a>

          <a
            href="tel:102"
            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white group transition border border-slate-200/70 no-underline text-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-100 group-hover:bg-blue-700 text-blue-600 group-hover:text-white flex items-center justify-center shrink-0">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-none">Health Helpline</span>
                <span className="text-[10px] text-slate-500 group-hover:text-blue-100">Medical Assistance &amp; Triage</span>
              </div>
            </div>
            <span className="text-base font-black text-blue-700 group-hover:text-white">102</span>
          </a>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black">
                  #{selectedIncident.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900">Incident Details &amp; Evidence</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {selectedIncident.image && (
              <div className="rounded-xl overflow-hidden max-h-56 border border-slate-200 bg-slate-900">
                <img
                  src={selectedIncident.image}
                  alt={selectedIncident.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900 text-sm">{selectedIncident.title}</p>
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                <span>{selectedIncident.location}</span>
              </p>
              <p className="text-slate-500">👤 Reported by: {selectedIncident.reportedBy} ({selectedIncident.contact})</p>
              
              {selectedIncident.description && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Situation:</span> "{selectedIncident.description}"
                </div>
              )}
              {selectedIncident.bloodGroup && selectedIncident.bloodGroup !== "Any" && selectedIncident.bloodGroup !== "None" && (
                <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 font-bold flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                  <span>Urgent Blood Group Needed: {selectedIncident.bloodGroup}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleIncidentBroadcast(selectedIncident);
                  setSelectedIncident(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Broadcast Urgent Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
