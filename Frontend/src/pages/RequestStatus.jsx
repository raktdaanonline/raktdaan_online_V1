import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Share2, User, Droplet, Layers, MapPin, Hospital, 
  Check, Users, UserCheck, Clock, ShieldCheck, 
  Facebook, Copy, Phone, MessageCircle, PhoneCall
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const RequestStatus = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // For testing UI without backend, we can fallback to mock data if API fails.
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/request/${requestId}`);
        if (res.data.success) {
          setRequest(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch request status");
        // Mock data for UI testing if API fails
        setRequest({
          requestId: requestId || "RD2026578",
          patientName: "Gita Bade",
          bloodGroup: "A+",
          units: 1,
          hospital: "Latur Hospital",
          city: "Latur",
          urgency: "Emergency",
          status: "fulfilled",
          createdAt: new Date("2026-06-01T10:41:00"),
          adminSeenAt: new Date("2026-06-01T10:42:00"),
          donorsNotifiedAt: new Date("2026-06-01T10:43:00"),
          acceptedAt: new Date("2026-06-01T10:45:00"), // Blood Arranged
          fulfilledAt: new Date("2026-06-01T10:50:00"),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E24B4A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!request) return null;

  // Helpers
  const formatDateStr = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const formatTimeOnly = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getBadgeConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "fulfilled": return { bg: "bg-[#1A3B2E]/60", text: "text-[#2ECC71]", border: "border-[#2ECC71]/30", icon: <Check size={14} className="mr-1" />, label: "Fulfilled" };
      case "active": return { bg: "bg-[#1E293B]/60", text: "text-[#3B82F6]", border: "border-[#3B82F6]/30", icon: <Clock size={14} className="mr-1" />, label: "Active" };
      default: return { bg: "bg-[#2D1B1B]/60", text: "text-[#E63946]", border: "border-[#E63946]/30", icon: <Clock size={14} className="mr-1" />, label: status || "Pending" };
    }
  };
  
  const badge = getBadgeConfig(request.status);

  return (
    <div className="min-h-screen bg-[#050508] text-white p-4 md:p-8 font-sans pb-20 pt-24 relative overflow-hidden">
      {/* Dynamic Background Elements for Glassmorphism Refraction */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E63946] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.15] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.15] pointer-events-none"></div>
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] bg-[#8C7BFF] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.1] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto space-y-6 relative z-10">
        
        {/* Header - Glass Card */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="absolute left-0 top-0 w-48 h-48 bg-[#E63946]/20 blur-[60px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex items-center gap-8 relative z-10 w-full">
            {/* Blood Drop Icon glowing */}
            <div className="relative flex-shrink-0 hidden sm:block ml-4">
               <div className="w-16 h-20 bg-gradient-to-b from-[#E63946] to-[#8B0000] rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] shadow-[0_0_40px_#E63946] flex items-center justify-center relative">
                 <div className="w-6 h-10 bg-white/20 rounded-full absolute top-2 left-2 blur-[2px]"></div>
                 <Droplet className="text-white w-8 h-8 relative z-10" fill="currentColor" />
               </div>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div>
                  <div className="text-white/60 text-xs font-bold mb-1 uppercase tracking-wider">Request ID</div>
                  <h1 className="text-3xl font-black text-white drop-shadow-md">#{request.requestId}</h1>
                  <div className="mt-2 inline-flex">
                     <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}>
                       {badge.icon} {badge.label}
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-col md:items-end gap-3">
                 <button className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
                   <Share2 size={16} /> Share
                 </button>
                 <div className="text-right mt-4 md:mt-0">
                   <div className="text-white/60 text-[10px] mb-1">Last Updated</div>
                   <div className="text-white/80 text-xs flex items-center gap-1 justify-end">
                     <Clock size={12} /> {formatDateStr(request.updatedAt || request.fulfilledAt || new Date())}
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 4 Info Cards - Glass */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Card 1 */}
           <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.06] transition-all shadow-lg">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#8C7BFF] flex items-center justify-center shrink-0">
                 <User size={20} />
              </div>
              <div className="min-w-0">
                 <div className="text-white/60 text-[10px] font-bold uppercase mb-0.5">Patient</div>
                 <div className="font-bold text-sm text-white truncate">{request.patientName}</div>
              </div>
           </div>
           {/* Card 2 */}
           <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.06] transition-all shadow-lg">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#E63946] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(230,57,70,0.2)]">
                 <Droplet size={20} fill="currentColor" />
              </div>
              <div className="min-w-0">
                 <div className="text-white/60 text-[10px] font-bold uppercase mb-0.5">Blood Group</div>
                 <div className="font-bold text-sm text-white truncate">{request.bloodGroup}</div>
              </div>
           </div>
           {/* Card 3 */}
           <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.06] transition-all shadow-lg">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#3B82F6] flex items-center justify-center shrink-0">
                 <Layers size={20} />
              </div>
              <div className="min-w-0">
                 <div className="text-white/60 text-[10px] font-bold uppercase mb-0.5">Units Required</div>
                 <div className="font-bold text-sm text-white truncate">{request.units} Unit{request.units > 1 ? 's' : ''}</div>
              </div>
           </div>
           {/* Card 4 */}
           <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.06] transition-all shadow-lg">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#2ECC71] flex items-center justify-center shrink-0">
                 <MapPin size={20} />
              </div>
              <div className="min-w-0">
                 <div className="text-white/60 text-[10px] font-bold uppercase mb-0.5">City</div>
                 <div className="font-bold text-sm text-white truncate">{request.city}</div>
              </div>
           </div>
        </div>

        {/* Hospital Details Card - Glass */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-5 relative overflow-hidden shadow-lg">
           <div className="flex items-center gap-2 mb-6">
              <Hospital size={16} className="text-[#E63946]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hospital Details</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
              <div>
                 <div className="text-white/60 text-[11px] mb-1">Hospital Name</div>
                 <div className="font-bold text-sm text-white">{request.hospital}</div>
              </div>
              <div>
                 <div className="text-white/60 text-[11px] mb-1">Location</div>
                 <div className="font-bold text-sm text-white">{request.city}, Maharashtra</div>
              </div>
              <div>
                 <div className="text-white/60 text-[11px] mb-1">Urgency</div>
                 <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 backdrop-blur-md">
                    {request.urgency || "Emergency"}
                 </div>
              </div>
           </div>
           {/* Faded Hospital Icon Background */}
           <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none hidden sm:block mix-blend-overlay">
              <Hospital size={120} />
           </div>
        </div>

        {/* Tracking Status - Glass */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 overflow-x-auto shadow-lg">
           <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-8">Tracking Status</h3>
           <div className="relative min-w-[600px] py-2">
              {/* Line */}
              <div className="absolute top-7 left-12 right-12 h-[2px] bg-white/10 z-0"></div>
              {/* Progress Line */}
              <div className="absolute top-7 left-12 h-[2px] bg-gradient-to-r from-[#E63946] via-[#E63946] to-[#2ECC71] z-0 shadow-[0_0_10px_rgba(230,57,70,0.5)]" style={{ width: '100%' }}></div>
              
              <div className="flex justify-between relative z-10 text-center">
                 {/* Step 1 */}
                 <div className="flex flex-col items-center gap-3 w-24">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E63946] to-[#A31C22] text-white flex items-center justify-center shadow-[0_0_20px_rgba(230,57,70,0.4)] border-4 border-[#0F1015]">
                       <Check size={16} strokeWidth={3} />
                    </div>
                    <div>
                       <div className="text-[11px] font-bold text-white mb-1">Request Submitted</div>
                       <div className="text-[9px] text-white/50">{formatTimeOnly(request.createdAt)}</div>
                    </div>
                 </div>
                 {/* Step 2 */}
                 <div className="flex flex-col items-center gap-3 w-24">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E63946] to-[#A31C22] text-white flex items-center justify-center shadow-[0_0_20px_rgba(230,57,70,0.4)] border-4 border-[#0F1015]">
                       <Check size={16} strokeWidth={3} />
                    </div>
                    <div>
                       <div className="text-[11px] font-bold text-white mb-1">Admin Verified</div>
                       <div className="text-[9px] text-white/50">{formatTimeOnly(request.adminSeenAt || request.createdAt)}</div>
                    </div>
                 </div>
                 {/* Step 3 */}
                 <div className="flex flex-col items-center gap-3 w-24">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E63946] to-[#A31C22] text-white flex items-center justify-center shadow-[0_0_20px_rgba(230,57,70,0.4)] border-4 border-[#0F1015]">
                       <Check size={16} strokeWidth={3} />
                    </div>
                    <div>
                       <div className="text-[11px] font-bold text-white mb-1">Donors Notified</div>
                       <div className="text-[9px] text-white/50">{formatTimeOnly(request.donorsNotifiedAt || request.createdAt)}</div>
                    </div>
                 </div>
                 {/* Step 4 */}
                 <div className="flex flex-col items-center gap-3 w-24">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#1A8D49] text-white border-4 border-[#0F1015] shadow-[0_0_20px_rgba(46,204,113,0.3)] flex items-center justify-center">
                       <UserCheck size={16} />
                    </div>
                    <div>
                       <div className="text-[11px] font-bold text-white mb-1">Blood Arranged</div>
                       <div className="text-[9px] text-white/50">{formatTimeOnly(request.acceptedAt || request.fulfilledAt)}</div>
                    </div>
                 </div>
                 {/* Step 5 */}
                 <div className="flex flex-col items-center gap-3 w-24">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#1A8D49] text-white border-4 border-[#0F1015] shadow-[0_0_20px_rgba(46,204,113,0.3)] flex items-center justify-center">
                       <ShieldCheck size={16} />
                    </div>
                    <div>
                       <div className="text-[11px] font-bold text-white mb-1">Completed (Fulfilled)</div>
                       <div className="text-[9px] text-white/50">{formatTimeOnly(request.fulfilledAt)}</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Left Column */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Donor Activity - Glass */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
                 <div className="flex items-center gap-2 mb-6">
                    <Users size={16} className="text-[#3B82F6]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Donor Activity</h3>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                       <div className="flex items-center gap-2 mb-1">
                          <Users size={16} className="text-[#8C7BFF]" />
                          <span className="text-2xl font-bold text-white">25</span>
                       </div>
                       <div className="text-[10px] text-white/60 font-medium">Donors Notified</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                       <div className="flex items-center gap-2 mb-1">
                          <Users size={16} className="text-[#3B82F6]" />
                          <span className="text-2xl font-bold text-white">8</span>
                       </div>
                       <div className="text-[10px] text-white/60 font-medium">Interested Donors</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                       <div className="flex items-center gap-2 mb-1">
                          <Check size={16} className="text-[#F59E0B]" />
                          <span className="text-2xl font-bold text-white">2</span>
                       </div>
                       <div className="text-[10px] text-white/60 font-medium">Confirmed Donors</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                       <div className="flex items-center gap-2 mb-1">
                          <Droplet size={16} className="text-[#2ECC71]" fill="currentColor" />
                          <span className="text-2xl font-bold text-white">1</span>
                       </div>
                       <div className="text-[10px] text-white/60 font-medium">Blood Donated</div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <div className="text-xs text-white/60">Blood Availability</div>
                       <div className="text-right">
                          <div className="text-xs font-bold text-[#2ECC71] drop-shadow-[0_0_5px_rgba(46,204,113,0.5)]">High</div>
                          <div className="text-[10px] text-white/60">95%</div>
                       </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                       <div className="h-full bg-gradient-to-r from-[#E63946] to-[#ff5a68] w-[95%] rounded-full shadow-[0_0_10px_#E63946]"></div>
                    </div>
                 </div>
              </div>

              {/* Request Timeline - Glass */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
                 <div className="flex items-center gap-2 mb-6">
                    <Clock size={16} className="text-[#3B82F6]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Request Timeline</h3>
                 </div>
                 <div className="space-y-6 relative ml-2">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-white/10"></div>
                    
                    {/* Event 1 */}
                    <div className="flex gap-4 relative z-10 hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors">
                       <div className="w-4 h-4 rounded-full bg-[#E63946] border-[3px] border-[#15161C] shadow-[0_0_10px_rgba(230,57,70,0.5)] flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={8} className="text-white" />
                       </div>
                       <div className="flex-1 flex flex-col sm:flex-row sm:gap-4 gap-1">
                          <div className="w-24 shrink-0 text-xs text-white/50 mt-0.5">{formatTimeOnly(request.createdAt)}</div>
                          <div>
                             <div className="text-sm font-bold text-white mb-0.5">Request Submitted</div>
                             <div className="text-[11px] text-white/60">Your blood request has been submitted successfully.</div>
                          </div>
                       </div>
                    </div>
                    {/* Event 2 */}
                    <div className="flex gap-4 relative z-10 hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors">
                       <div className="w-4 h-4 rounded-full bg-[#E63946] border-[3px] border-[#15161C] shadow-[0_0_10px_rgba(230,57,70,0.5)] flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={8} className="text-white" />
                       </div>
                       <div className="flex-1 flex flex-col sm:flex-row sm:gap-4 gap-1">
                          <div className="w-24 shrink-0 text-xs text-white/50 mt-0.5">{formatTimeOnly(request.adminSeenAt || request.createdAt)}</div>
                          <div>
                             <div className="text-sm font-bold text-white mb-0.5">Admin Verified</div>
                             <div className="text-[11px] text-white/60">Request has been verified by admin.</div>
                          </div>
                       </div>
                    </div>
                    {/* Event 3 */}
                    <div className="flex gap-4 relative z-10 hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors">
                       <div className="w-4 h-4 rounded-full bg-[#E63946] border-[3px] border-[#15161C] shadow-[0_0_10px_rgba(230,57,70,0.5)] flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={8} className="text-white" />
                       </div>
                       <div className="flex-1 flex flex-col sm:flex-row sm:gap-4 gap-1">
                          <div className="w-24 shrink-0 text-xs text-white/50 mt-0.5">{formatTimeOnly(request.donorsNotifiedAt || request.createdAt)}</div>
                          <div>
                             <div className="text-sm font-bold text-white mb-0.5">Donors Notified</div>
                             <div className="text-[11px] text-white/60">25 donors have been notified in your area.</div>
                          </div>
                       </div>
                    </div>
                    {/* Event 4 */}
                    <div className="flex gap-4 relative z-10 hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors">
                       <div className="w-4 h-4 rounded-full bg-[#2ECC71] border-[3px] border-[#15161C] shadow-[0_0_10px_rgba(46,204,113,0.5)] flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={8} className="text-[#050505]" strokeWidth={4} />
                       </div>
                       <div className="flex-1 flex flex-col sm:flex-row sm:gap-4 gap-1">
                          <div className="w-24 shrink-0 text-xs text-white/50 mt-0.5">{formatTimeOnly(request.acceptedAt || request.fulfilledAt)}</div>
                          <div>
                             <div className="text-sm font-bold text-[#2ECC71] mb-0.5">Blood Arranged</div>
                             <div className="text-[11px] text-white/60">A donor has been confirmed and blood is being arranged.</div>
                          </div>
                       </div>
                    </div>
                    {/* Event 5 */}
                    <div className="flex gap-4 relative z-10 hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors">
                       <div className="w-4 h-4 rounded-full bg-[#2ECC71] border-[3px] border-[#15161C] shadow-[0_0_10px_rgba(46,204,113,0.5)] flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={8} className="text-[#050505]" strokeWidth={4} />
                       </div>
                       <div className="flex-1 flex flex-col sm:flex-row sm:gap-4 gap-1">
                          <div className="w-24 shrink-0 text-xs text-white/50 mt-0.5">{formatTimeOnly(request.fulfilledAt)}</div>
                          <div>
                             <div className="text-sm font-bold text-[#2ECC71] mb-0.5">Request Fulfilled</div>
                             <div className="text-[11px] text-white/60">Blood has been successfully arranged. Thank you!</div>
                          </div>
                       </div>
                    </div>

                 </div>
              </div>

           </div>

           {/* Right Column */}
           <div className="space-y-6">
              
              {/* Estimated Arrival - Glass */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ECC71]/10 blur-[40px] pointer-events-none"></div>
                 
                 <div className="flex items-center gap-2 mb-6 relative z-10">
                    <Clock size={16} className="text-[#3B82F6]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Estimated Arrival</h3>
                 </div>
                 <div className="flex items-center justify-between relative z-10">
                    <div>
                       <div className="text-[10px] text-white/60 mb-1">Estimated Time</div>
                       <div className="text-2xl font-bold text-[#2ECC71] mb-4 drop-shadow-[0_0_12px_rgba(46,204,113,0.4)]">30-45 mins</div>
                       <div className="text-[10px] text-white/60 mb-1">Nearest Donor</div>
                       <div className="flex items-center gap-1 text-xs text-white">
                          <MapPin size={12} className="text-[#2ECC71]" /> 2.4 km away
                       </div>
                    </div>
                    {/* Radar Animation */}
                    <div className="w-24 h-24 relative flex items-center justify-center shrink-0">
                       <div className="absolute inset-0 border border-[#2ECC71]/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                       <div className="absolute inset-2 border border-[#2ECC71]/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
                       <div className="absolute inset-4 border border-[#2ECC71]/50 rounded-full"></div>
                       <div className="absolute inset-6 border border-[#2ECC71]/60 rounded-full flex items-center justify-center bg-[#1A3B2E]/50 backdrop-blur-md">
                          <Droplet size={14} className="text-[#E63946]" fill="currentColor" />
                       </div>
                       <div className="absolute w-1.5 h-1.5 bg-[#E63946] rounded-full top-2 right-4 shadow-[0_0_8px_#E63946]"></div>
                    </div>
                 </div>
              </div>

              {/* Share & Spread Hope - Glass */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
                 <div className="flex items-center gap-2 mb-4">
                    <Share2 size={16} className="text-[#3B82F6]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Share & Spread Hope</h3>
                 </div>
                 <p className="text-xs text-white/60 mb-5">Share your request and help save a life.</p>
                 <div className="flex gap-4">
                    <div className="flex-1 space-y-3">
                       <div className="flex gap-2">
                          <button onClick={() => window.open(`https://wa.me/?text=Urgent%20Blood%20Required:%20${request.bloodGroup}%20at%20${request.hospital}`, '_blank')} className="flex-1 bg-[#2ECC71]/10 border border-[#2ECC71]/30 hover:bg-[#2ECC71]/20 text-[#2ECC71] py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors backdrop-blur-md">
                             <MessageCircle size={14} /> WhatsApp
                          </button>
                          <button className="flex-1 bg-[#3B82F6]/10 border border-[#3B82F6]/30 hover:bg-[#3B82F6]/20 text-[#3B82F6] py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors backdrop-blur-md">
                             <Facebook size={14} /> Facebook
                          </button>
                       </div>
                       <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors backdrop-blur-md">
                          <Copy size={14} /> Copy Link
                       </button>
                    </div>
                    <div className="w-24 h-24 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center ml-auto shadow-[0_4px_15px_rgba(255,255,255,0.1)]">
                       <QRCodeSVG value={window.location.href} size={84} />
                    </div>
                 </div>
              </div>

              {/* Need Help? - Glass */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
                 <div className="flex items-center gap-2 mb-4">
                    <Phone size={16} className="text-[#8C7BFF]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Need Help?</h3>
                 </div>
                 <p className="text-xs text-white/60 mb-5">Our support team is here to help you 24/7.</p>
                 
                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-4 cursor-pointer hover:bg-white/10 transition-all group backdrop-blur-md">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PhoneCall size={16} />
                       </div>
                       <div>
                          <div className="font-bold text-sm text-white mb-0.5">+91 98765 43210</div>
                          <div className="text-[10px] text-white/50">Call Support</div>
                       </div>
                    </div>
                    <div className="text-white/40 group-hover:text-white transition-colors">&gt;</div>
                 </div>

                 <button className="w-full bg-gradient-to-r from-[#E63946] to-[#C1272D] hover:from-[#C1272D] hover:to-[#A31C22] text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:shadow-[0_0_25px_rgba(230,57,70,0.5)]">
                    <MessageCircle size={18} /> Chat on WhatsApp
                 </button>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default RequestStatus;
