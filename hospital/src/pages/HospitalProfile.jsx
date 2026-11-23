import React, { useState } from "react";
import toast from "react-hot-toast";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Activity, 
  Save, 
  CheckCircle2,
  Clock
} from "lucide-react";

export default function HospitalProfile() {
  const [hospitalName, setHospitalName] = useState("City Care Hospital");
  const [wing, setWing] = useState("Trauma Wing & Critical Care Centre");
  const [address, setAddress] = useState("Sector 18, Old Mumbai-Pune Highway, Pimpri-Chinchwad, Pune - 411019");
  const [contactNumber, setContactNumber] = useState("+91 98765 43210");
  const [emergencyHotline, setEmergencyHotline] = useState("+91 20 2742 8000");
  const [icuBeds, setIcuBeds] = useState(8);
  const [traumaSurgeons, setTraumaSurgeons] = useState(4);
  const [headDoctor, setHeadDoctor] = useState("Dr. Rajiv Mehta (Chief of Trauma & Critical Surgery)");

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Hospital profile and trauma bay settings updated successfully!", {
      icon: "🏥"
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Hospital Profile &amp; Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage trauma facility credentials, triage contacts, and bed capacity.</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          NABH Accredited Level 1 Trauma Center
        </span>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Section 1: Facility Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            1. Hospital &amp; Facility Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hospital Name</label>
              <input 
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Department / Wing</label>
              <input 
                type="text"
                value={wing}
                onChange={(e) => setWing(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Complete Address &amp; GPS Location</label>
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-red-500"
              required
            />
          </div>
        </div>

        {/* Section 2: Contact Numbers */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            2. Emergency Contacts &amp; Hotline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Main Hospital Helpline</label>
              <input 
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">24/7 Trauma Emergency Hotline</label>
              <input 
                type="text"
                value={emergencyHotline}
                onChange={(e) => setEmergencyHotline(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-red-600 outline-none focus:border-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Trauma Bay & Staffing */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            3. Trauma Bay Capacity &amp; Medical Officer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Dedicated ICU Beds</label>
              <input 
                type="number"
                min="1"
                value={icuBeds}
                onChange={(e) => setIcuBeds(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">On-Duty Trauma Surgeons</label>
              <input 
                type="number"
                min="1"
                value={traumaSurgeons}
                onChange={(e) => setTraumaSurgeons(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Blood Bank Affiliation</label>
              <input 
                type="text"
                defaultValue="Ruby Hall Clinic Blood Center"
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Doctor / Medical Director</label>
            <input 
              type="text"
              value={headDoctor}
              onChange={(e) => setHeadDoctor(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-red-500"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
}

