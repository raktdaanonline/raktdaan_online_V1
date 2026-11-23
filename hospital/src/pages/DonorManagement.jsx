import React, { useState } from "react";
import toast from "react-hot-toast";
import { 
  Users, 
  Search, 
  Phone, 
  Droplet, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare,
  Filter
} from "lucide-react";

export default function DonorManagement() {
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [search, setSearch] = useState("");

  const donors = [
    {
      id: "DNR-1021",
      name: "Rohit Shinde",
      bloodGroup: "O-",
      phone: "+91 98221 45678",
      location: "Wakad, Pune (2.4 km away)",
      lastDonation: "4 months ago",
      status: "Eligible Now",
      donationsCount: 6
    },
    {
      id: "DNR-1028",
      name: "Pooja Kulkarni",
      bloodGroup: "A+",
      phone: "+91 97654 32109",
      location: "Pimple Saudagar, Pune (3.8 km away)",
      lastDonation: "6 months ago",
      status: "Eligible Now",
      donationsCount: 4
    },
    {
      id: "DNR-1033",
      name: "Aditya Verma",
      bloodGroup: "O+",
      phone: "+91 99234 56789",
      location: "Hinjawadi Phase 1, Pune (5.1 km away)",
      lastDonation: "5 months ago",
      status: "Eligible Now",
      donationsCount: 8
    },
    {
      id: "DNR-1045",
      name: "Neha Joshi",
      bloodGroup: "B+",
      phone: "+91 98901 23456",
      location: "Chinchwad Station, Pune (4.2 km away)",
      lastDonation: "3 months ago",
      status: "Eligible Now",
      donationsCount: 3
    },
    {
      id: "DNR-1052",
      name: "Siddharth Deshmukh",
      bloodGroup: "AB-",
      phone: "+91 98230 98765",
      location: "Bavdhan, Pune (6.7 km away)",
      lastDonation: "8 months ago",
      status: "Eligible Now",
      donationsCount: 5
    }
  ];

  const handleNotifyDonor = (donor) => {
    toast.success(`Emergency SOS notification dispatched to ${donor.name} (${donor.bloodGroup})!`, {
      icon: "📲"
    });
  };

  const filtered = donors.filter(d => {
    if (selectedGroup !== "all" && d.bloodGroup !== selectedGroup) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.bloodGroup.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Hospital Donor Network</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered volunteer donors in vicinity ready for immediate trauma triage call.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
            {filtered.length} Donors Available
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor name, area..."
            className="w-full bg-transparent text-xs text-slate-800 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap self-start md:self-auto">
          {["all", "O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(grp => (
            <button
              key={grp}
              type="button"
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedGroup === grp 
                  ? "bg-red-600 text-white shadow-xs" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {grp === "all" ? "All Groups" : grp}
            </button>
          ))}
        </div>
      </div>

      {/* Donors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(donor => (
          <div 
            key={donor.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-red-600/30">
                  {donor.bloodGroup}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{donor.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {donor.id}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                {donor.status}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{donor.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{donor.phone}</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Last Donated: {donor.lastDonation} • {donor.donationsCount} Lifetime Donations
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`tel:${donor.phone}`}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 no-underline"
              >
                <Phone className="w-3 h-3 text-teal-600" />
                <span>Call</span>
              </a>

              <button
                type="button"
                onClick={() => handleNotifyDonor(donor)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Alert SOS</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

