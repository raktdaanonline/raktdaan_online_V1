import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import HospitalSidebar from "./HospitalSidebar";
import HospitalHeader from "./HospitalHeader";
import api from "../services/api";

export default function HospitalLayout() {
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  const fetchCount = async () => {
    try {
      const res = await api.get("/emergency-alerts");
      if (res.data?.success) {
        const critical = (res.data.data || []).filter((a) => a.status === "critical");
        setActiveAlertsCount(critical.length);
      }
    } catch (err) {
      console.warn("Could not fetch alerts count:", err.message);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-800 font-sans flex flex-col">
      <HospitalSidebar activeAlertsCount={activeAlertsCount} />
      <div className="pl-64 flex flex-col flex-1">
        <HospitalHeader activeAlertsCount={activeAlertsCount} />
        <main className="pt-16 p-6 max-w-[1600px] w-full mx-auto flex-1">
          <Outlet context={{ activeAlertsCount, refreshCount: fetchCount }} />
        </main>
      </div>
    </div>
  );
}

