import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { 
  Droplet, 
  Send, 
  Clock, 
  CheckCircle2, 
  Building2, 
  AlertTriangle,
  Plus,
  Filter
} from "lucide-react";

export default function BloodRequests() {
  const [bloodGroup, setBloodGroup] = useState("O-");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState("Immediate (Emergency Trauma)");
  const [ward, setWard] = useState("Emergency ICU Bay 3");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [requestsList, setRequestsList] = useState([
    {
      id: "REQ-2026-104",
      bloodGroup: "O-",
      units: 2,
      ward: "Trauma ICU Bed 4",
      urgency: "Immediate (Emergency Trauma)",
      status: "In Transit",
      statusColor: "bg-amber-100 text-amber-800 border-amber-200",
      bloodBank: "Ruby Hall Blood Centre (Sassoon Rd)",
      time: "Today, 10:15 AM"
    },
    {
      id: "REQ-2026-098",
      bloodGroup: "A+",
      units: 4,
      ward: "Operation Theatre 2 (Surgery)",
      urgency: "Urgent (Within 2 Hours)",
      status: "Fulfilled",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      bloodBank: "Poona Serological Institute",
      time: "Today, 08:30 AM"
    },
    {
      id: "REQ-2026-092",
      bloodGroup: "B+",
      units: 3,
      ward: "General Emergency Ward",
      urgency: "Normal (Elective)",
      status: "Fulfilled",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      bloodBank: "KEM Hospital Blood Centre",
      time: "Yesterday, 06:45 PM"
    }
  ]);

  const handleSubmitRequisition = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Broadcast via emergency alerts API as well
      await api.post("/emergency-alerts", {
        location: `Hospital Ward: ${ward}`,
        bloodGroup: bloodGroup,
        description: `Hospital Blood Requisition: ${units} units of ${bloodGroup} required for ${urgency}. ${notes}`,
        reportedBy: "City Care Hospital Blood Desk",
        contact: "+91 98765 43210"
      });

      const newReq = {
        id: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
        bloodGroup,
        units,
        ward,
        urgency,
        status: "Dispatched to Network",
        statusColor: "bg-red-100 text-red-800 border-red-200",
        bloodBank: "Broadcasting to Nearest Blood Banks",
        time: "Just Now"
      };

      setRequestsList([newReq, ...requestsList]);
      toast.success(`🚨 Blood Requisition dispatched for ${units} units of ${bloodGroup}!`, {
        duration: 5000
      });
      setNotes("");
    } catch (err) {
      toast.error("Failed to submit requisition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Hospital Blood Requests</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch urgent blood unit requests to regional blood banks and verified volunteer donors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Requisition Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Blood Requisition</h2>
              <span className="text-[11px] text-slate-400">Direct hospital dispatch form</span>
            </div>
          </div>

          <form onSubmit={handleSubmitRequisition} className="space-y-4">
            
            {/* Blood Group */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Blood Group
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setBloodGroup(grp)}
                    className={`py-2 text-xs font-black rounded-xl transition ${
                      bloodGroup === grp
                        ? "bg-red-600 text-white shadow-sm scale-102"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Units & Ward Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Units (Bags)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ward / Department
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Priority
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none"
              >
                <option>Immediate (Emergency Trauma)</option>
                <option>Urgent (Within 2 Hours)</option>
                <option>Operating Theatre (Surgery Standby)</option>
                <option>Routine Ward Replenishment</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Clinical Indication &amp; Patient Notes
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Patient age, trauma score, cross-matching requirements..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Dispatching..." : "Submit Blood Requisition"}</span>
            </button>

          </form>
        </div>

        {/* Requests List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-900">Recent Hospital Requisitions</h2>
            <span className="text-xs text-slate-500">{requestsList.length} Active Records</span>
          </div>

          <div className="space-y-3">
            {requestsList.map((req) => (
              <div 
                key={req.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-800 font-black text-xs border border-red-200">
                      {req.bloodGroup} • {req.units} Units
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">#{req.id}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${req.statusColor}`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Ward:</strong> {req.ward}</p>
                  <p><strong>Priority:</strong> <span className="text-red-700 font-semibold">{req.urgency}</span></p>
                  <p><strong>Fulfilling Blood Bank:</strong> {req.bloodBank}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{req.time}</span>
                  </div>
                  <span className="text-teal-700 font-semibold">Triage Track Active</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

