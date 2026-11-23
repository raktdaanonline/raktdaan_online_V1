import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { 
  AlertTriangle, 
  Siren, 
  MapPin, 
  Clock, 
  Activity, 
  Heart, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  PhoneCall, 
  Ambulance, 
  Droplet, 
  Building2, 
  Send,
  Eye,
  Check
} from "lucide-react";

export default function HospitalDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Blood Requisition Form State
  const [reqBloodGroup, setReqBloodGroup] = useState("O-");
  const [reqUnits, setReqUnits] = useState(2);
  const [reqUrgency, setReqUrgency] = useState("Immediate Trauma Triage");
  const [reqPatientNotes, setReqPatientNotes] = useState("");
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Hospital Facility Status
  const [hospitalStatus, setHospitalStatus] = useState("Trauma Ready");
  const [icuBeds, setIcuBeds] = useState(4);

  // Fetch live alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/emergency-alerts");
      if (res.data?.success) {
        setAlerts(res.data.data || []);
      }
    } catch (err) {
      console.warn("Error fetching emergency alerts for hospital:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Accept emergency case at hospital
  const handleAcceptAlert = async (alert) => {
    try {
      await api.patch(`/emergency-alerts/${alert._id}/status`, { status: "stabilized" });
      toast.success(`Trauma Bay & ICU prepped for alert #${alert.alertId}! Case accepted.`, {
        icon: "🏥",
      });
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Mark alert resolved
  const handleResolveAlert = async (alert) => {
    try {
      await api.patch(`/emergency-alerts/${alert._id}/status`, { status: "resolved" });
      toast.success(`Case #${alert.alertId} marked resolved & stabilized.`, {
        icon: "✅",
      });
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Submit Blood Requisition to Network
  const handleBloodRequisition = async (e) => {
    e.preventDefault();
    setIsSubmittingReq(true);

    try {
      await api.post("/emergency-alerts", {
        location: "Hospital Trauma Center (Ruby Hall Clinic - Trauma Wing)",
        bloodGroup: reqBloodGroup,
        description: `Hospital Requisition: ${reqUnits} units of ${reqBloodGroup} requested for ${reqUrgency}. Patient Notes: ${reqPatientNotes || "Trauma stabilization required."}`,
        reportedBy: "Trauma Care Desk / Doctor On Duty",
        contact: "+91 20 2612 8000"
      });
      toast.success(`🚨 Blood Requisition dispatched for ${reqUnits} units of ${reqBloodGroup}!`, {
        duration: 5000
      });
      setReqPatientNotes("");
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to dispatch blood requisition.");
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== "resolved");
  const criticalAlerts = alerts.filter(a => a.status === "critical");
  const resolvedAlerts = alerts.filter(a => a.status === "resolved");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* 1. TOP HOSPITAL STATUS & TRIAGE BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Ruby Hall Clinic - Trauma Wing
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {hospitalStatus}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Ward ID: MH-PUN-RUBY-01
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Connected to Raktdaan Emergency Network. Live citizen accident alerts and donor coordination.
              </p>
            </div>
          </div>

          {/* Quick Facility Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Available ICU Beds</span>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setIcuBeds(Math.max(0, icuBeds - 1))}
                  className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-xs"
                >-</button>
                <span className="text-xl font-black text-slate-900">{icuBeds}</span>
                <button
                  type="button"
                  onClick={() => setIcuBeds(icuBeds + 1)}
                  className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-xs"
                >+</button>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchAlerts}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
              title="Refresh live alerts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. STATS KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Active Accidents Reported</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{activeAlerts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <Siren className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">Real-time SOS from nearby citizen dispatch</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Critical Trauma Dispatch</span>
              <div className="text-3xl font-black text-red-600 mt-1">{criticalAlerts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <span className="text-xs text-red-700 font-bold mt-2 block">Requires trauma bay &amp; blood support</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total Network Alerts</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{alerts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">Total incidents logged in Raktdaan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Resolved Cases</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{resolvedAlerts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-emerald-700 font-bold mt-2 block">
            {alerts.length > 0 ? `${Math.round((resolvedAlerts.length / alerts.length) * 100)}% stabilized & discharged` : "No resolved cases"}
          </span>
        </div>

      </div>

      {/* 3. MAIN DASHBOARD CONTENT (8 COLS : 4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================
            LEFT COLUMN (8 COLUMNS): LIVE ACCIDENT ALERTS QUEUE
            ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-xl font-black text-slate-900">Incoming Citizen Emergency Alerts</h2>
              <p className="text-xs text-slate-500">Live accident reports requiring hospital preparation and blood supply.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
              {alerts.length} Total Alerts
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Emergency Alerts Currently</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All triage corridors clear. When a user reports an accident on the emergency portal, details and photos will appear here instantly.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                      alert.status === "critical"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : alert.status === "stabilized"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}>
                      {alert.status === "critical" ? "🚨 CRITICAL TRAUMA" : alert.status === "stabilized" ? "🟡 STABILIZING" : "✅ RESOLVED"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">#{alert.alertId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>{alert.time || "Recently Reported"}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Photo Thumbnail */}
                  {alert.photo && (
                    <div 
                      onClick={() => setSelectedAlert(alert)}
                      className="w-full md:w-44 h-32 rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer relative group"
                    >
                      <img 
                        src={alert.photo} 
                        alt="Accident scene"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                        View Photo
                      </div>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {alert.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{alert.location}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5" />
                        Blood Needed: <strong>{alert.bloodGroup || "Any"}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1">
                        <Ambulance className="w-3.5 h-3.5 text-teal-600" />
                        {alert.ambulanceStatus || "Ambulance Dispatched"}
                      </span>
                    </div>

                    {alert.description && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{alert.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Strip */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    Reported by: <strong>{alert.reportedBy || "Citizen Bystander"}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {alert.status === "critical" && (
                      <button
                        type="button"
                        onClick={() => handleAcceptAlert(alert)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Accept Patient &amp; Prep ICU
                      </button>
                    )}

                    {alert.status !== "resolved" ? (
                      <button
                        type="button"
                        onClick={() => handleResolveAlert(alert)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}

        </div>

        {/* ============================================================
            RIGHT COLUMN (4 COLUMNS): BLOOD REQUISITION & HOTLINES
            ============================================================ */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Requisition Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Hospital Blood Requisition</h3>
                <p className="text-[11px] text-slate-500">Dispatch request to nearby Blood Banks</p>
              </div>
            </div>

            <form onSubmit={handleBloodRequisition} className="space-y-3.5">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Required Blood Group
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setReqBloodGroup(grp)}
                      className={`py-1.5 text-xs font-black rounded-lg transition ${
                        reqBloodGroup === grp
                          ? "bg-red-600 text-white shadow"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Units Required
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={reqUnits}
                  onChange={(e) => setReqUnits(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs p-2.5 rounded-xl outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Urgency / Ward
                </label>
                <select
                  value={reqUrgency}
                  onChange={(e) => setReqUrgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs p-2.5 rounded-xl outline-none"
                >
                  <option>Immediate Trauma Triage (Level 1)</option>
                  <option>Operating Theatre (Surgery)</option>
                  <option>ICU Critical Care</option>
                  <option>Emergency Ward Reserve</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={reqPatientNotes}
                  onChange={(e) => setReqPatientNotes(e.target.value)}
                  placeholder="Patient ID, specific cross-matching requirements..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs p-2.5 rounded-xl outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReq}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReq ? "Submitting..." : "Send Blood Requisition"}</span>
              </button>

            </form>
          </div>

          {/* Emergency Hotlines Directory */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-black text-slate-900">Emergency Hotlines</h3>
            <div className="space-y-2">
              <a 
                href="tel:108"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 no-underline"
              >
                <div className="flex items-center gap-2">
                  <Ambulance className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold">Ambulance Dispatch</span>
                </div>
                <span className="font-black text-red-600 text-sm">108</span>
              </a>

              <a 
                href="tel:112"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 no-underline"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold">Police Emergency</span>
                </div>
                <span className="font-black text-slate-900 text-sm">112</span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* PHOTO PREVIEW MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Incident Evidence Photo - #{selectedAlert.alertId}</h3>
              <button 
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedAlert.photo && (
              <div className="rounded-2xl overflow-hidden max-h-96 bg-slate-900">
                <img 
                  src={selectedAlert.photo} 
                  alt="Incident evidence" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <p className="text-xs text-slate-600">
              📍 Location: <strong>{selectedAlert.location}</strong>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

