import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Droplet, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Calendar,
  Download
} from "lucide-react";

export default function Reports() {
  const summaryMetrics = [
    { label: "Total Emergencies Handled", value: "38", sub: "+12% vs last month", icon: Activity, color: "text-red-600 bg-red-100" },
    { label: "Blood Units Utilized", value: "114 U", sub: "Universal O- & A+ most required", icon: Droplet, color: "text-blue-600 bg-blue-100" },
    { label: "Average Triage Arrival Time", value: "7.4 min", sub: "-1.8 min response improvement", icon: Clock, color: "text-amber-600 bg-amber-100" },
    { label: "Successful Stabilization Rate", value: "97.4%", sub: "37/38 patients stabilized", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100" },
  ];

  const bloodGroupStats = [
    { group: "O-", units: 28, percentage: 85, color: "bg-red-600" },
    { group: "A+", units: 36, percentage: 70, color: "bg-blue-600" },
    { group: "B+", units: 30, percentage: 60, color: "bg-emerald-600" },
    { group: "AB+", units: 12, percentage: 40, color: "bg-amber-600" },
    { group: "Others", units: 8, percentage: 25, color: "bg-slate-600" }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Hospital Trauma &amp; Triage Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monthly incident summary, blood unit transfusion audit, and trauma response KPIs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Downloading Monthly Hospital PDF Summary...")}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary Report</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{m.label}</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{m.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-2 block font-medium">{m.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Blood Transfusion Demand Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Emergency Blood Transfusion Demand</h2>
          <p className="text-xs text-slate-500">Distribution of blood units utilized across trauma bays and surgeries.</p>

          <div className="space-y-3.5 pt-2">
            {bloodGroupStats.map((item) => (
              <div key={item.group} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{item.group} Blood Group</span>
                  <span className="text-red-600">{item.units} Units Utilized</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Readiness Log (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Hospital Operational Log</h2>
          <p className="text-xs text-slate-500">Recent benchmarks and readiness verification audits.</p>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Trauma Ward 24/7 Audit</span>
                <span className="text-emerald-700">PASSED ✓</span>
              </div>
              <p className="text-slate-500">All oxygen lines, ventilators, and emergency packs verified.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Blood Bank Interlink Sync</span>
                <span className="text-blue-700">SYNCED 100%</span>
              </div>
              <p className="text-slate-500">Connected with Ruby Hall &amp; Sassoon General Hospital blood reserves.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Emergency Hotline 108 Bridge</span>
                <span className="text-emerald-700">ACTIVE</span>
              </div>
              <p className="text-slate-500">Direct audio &amp; GPS coordinates relay operating normally.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

