import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, User, Droplet, Calendar, Award, Heart, 
  Search, FileText, AlertCircle, MessageSquare, 
  Settings, HelpCircle, MapPin, Clock, ArrowRight, Star, Activity, Bell
} from "lucide-react";
import dashboardImg from "../assets/dashbord.png";
import { io } from "socket.io-client";
import notificationService from "../services/notificationService";
import api from "../services/api";

const Dashboard = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeRequests, setActiveRequests] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/register");
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      fetchActiveRequests();

      // Setup socket
      const socketUrl = import.meta.env.VITE_SOCKET_URL || "/";
      socketRef.current = io(socketUrl);
      socketRef.current.emit("join", currentUser._id);

      socketRef.current.on("newEmergencyRequest", (data) => {
        // Increment count and show popup or just update list
        setUnreadCount(prev => prev + 1);
        fetchNotifications();
        fetchActiveRequests();
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveRequests = async () => {
    try {
      const res = await api.get("/request/active");
      setActiveRequests(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch active requests", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-900/10 blur-3xl opacity-50"></div>
        <div className="w-12 h-12 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin relative z-10 shadow-[0_0_20px_rgba(225,29,72,0.5)]"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { icon: Activity, label: "Dashboard" },
    { icon: Droplet, label: "My Donations" },
    { icon: FileText, label: "My Certificates" },
    { icon: AlertCircle, label: "Emergency", badge: activeRequests.length },
  ];

  const quickActions = [
    { icon: Droplet, title: "Donate Blood", desc: "Make an impact" },
    { icon: FileText, title: "My Certificates", desc: "View your certificates" },
  ];

  const upcomingCamps = [
    { date: "02", month: "Jun", title: "Symbiosis College Camp", location: "Symbiosis, Pune", time: "10:00 AM - 04:00 PM", reg: 120, total: 150 },
    { date: "05", month: "Jun", title: "MIT World Peace University", location: "Kothrud, Pune", time: "09:00 AM - 02:00 PM", reg: 80, total: 100 },
    { date: "08", month: "Jun", title: "Pune City Blood Drive", location: "FC Road, Pune", time: "11:00 AM - 05:00 PM", reg: 200, total: 250 },
  ];

  const emergencies = [
    { bg: "A+", label: "Platelets", hospital: "Ruby Hall Clinic", dist: "2.4 km away" },
    { bg: "B+", label: "Whole Blood", hospital: "Sassoon Hospital", dist: "3.1 km away" },
    { bg: "O-", label: "Packed Cells", hospital: "Jehangir Hospital", dist: "4.7 km away" },
  ];

  const achievements = [
    { title: "New Donor", desc: "Just Started", icon: Droplet, color: "text-red-500", glow: "shadow-[0_0_15px_rgba(239,68,68,0.5)]" },
    { title: "Life Saver", desc: "1st Donation", icon: Heart, color: "text-orange-400", glow: "shadow-[0_0_15px_rgba(251,146,60,0.5)]" },
    { title: "Regular Donor", desc: "Stay Consistent", icon: Award, color: "text-red-500", glow: "shadow-[0_0_15px_rgba(239,68,68,0.5)]" },
    { title: "Hero Donor", desc: "10+ Donations", icon: Star, color: "text-yellow-500", glow: "shadow-[0_0_15px_rgba(234,179,8,0.5)]" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "My Profile":
        return (
          <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-zinc-800/50">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">My Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-zinc-400 text-xs font-medium mb-1 block">Full Name</label>
                <input type="text" value={currentUser.name || ""} disabled className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium mb-1 block">Blood Group</label>
                <input type="text" value={currentUser.bloodGroup || "O-"} disabled className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium mb-1 block">Phone Number</label>
                <input type="text" value={currentUser.mobile || ""} disabled className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none" />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium mb-1 block">City</label>
                <input type="text" placeholder="e.g. Pune" className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>
            <button className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold transition-all">Save Changes</button>
          </div>
        );
      case "My Donations":
        return (
          <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-zinc-800/50">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">My Donations</h2>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-red-950/30 rounded-full flex items-center justify-center mb-4 border border-red-900/50">
                <Droplet size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Donations Yet</h3>
              <p className="text-zinc-500 text-sm max-w-md">Your donation history will appear here once you participate in a camp or emergency request.</p>
            </div>
          </div>
        );
      case "Emergency":
        return (
          <div className="bg-[#0a0a0a] rounded-2xl p-8 border border-zinc-800/50">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-4 flex items-center gap-3">
              Emergency Requests <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{activeRequests.length} Active</span>
            </h2>
            <div className="space-y-4">
              {activeRequests.length === 0 ? (
                <p className="text-zinc-500 text-center py-10">No active emergency requests right now.</p>
              ) : (
                activeRequests.map((req, i) => (
                  <div key={i} className="bg-[#121212] border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-700 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-xl bg-red-950/30 flex items-center justify-center border border-red-900/50">
                        <span className="text-red-500 font-black text-xl">{req.bloodGroup}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-1">{req.patientName} Needs Blood</div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                          <MapPin size={12} className="text-zinc-500" /> {req.hospital}, {req.city}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          Units: {req.units} | Needed by: {req.neededBy}
                        </div>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-bold transition-all">Accept Request</button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case "Dashboard":
      default:
        return (
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* LEFT & CENTER COLUMN (col-span-3) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* HERO BANNER */}
              <div 
                className="relative rounded-2xl bg-[#0a0a0a] border border-red-900/30 overflow-hidden flex items-center p-6 min-h-[200px]"
                style={{ backgroundImage: `url(${dashboardImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
              >
                {/* Massive red glow on left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/30 blur-[80px] rounded-full pointer-events-none"></div>
                {/* Dark right gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0a0a]/80 to-[#1a0508] pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-6 w-full">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-full bg-red-600 flex items-center justify-center border-4 border-[#0a0a0a] shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                      <User size={50} className="text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-800 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <span className="text-red-500 text-xs font-bold bg-red-950/40 px-2 py-0.5 rounded-md border border-red-900/50 mb-1 inline-block">Welcome Back</span>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      Welcome, {currentUser.name}! <span className="inline-block hover:animate-wave">👋</span>
                    </h1>
                    <p className="text-zinc-400 text-xs mb-4">Thank you for being a lifesaver. Keep donating, keep saving lives.</p>
                    
                    {/* Pills */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-[#121212] border border-zinc-800 rounded-lg px-3 py-1.5">
                        <Droplet size={14} className="text-red-500" fill="currentColor" />
                        <div>
                          <div className="text-[9px] text-zinc-500 leading-none">Blood Group</div>
                          <div className="text-xs font-bold text-white leading-tight">{currentUser.bloodGroup || "O-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-[#121212] border border-zinc-800 rounded-lg px-3 py-1.5">
                        <Calendar size={14} className="text-red-500" />
                        <div>
                          <div className="text-[9px] text-zinc-500 leading-none">Member Since</div>
                          <div className="text-xs font-bold text-white leading-tight">May 2025</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-[#121212] border border-zinc-800 rounded-lg px-3 py-1.5">
                        <User size={14} className="text-red-500" />
                        <div>
                          <div className="text-[9px] text-zinc-500 leading-none">Donor ID</div>
                          <div className="text-xs font-bold text-white leading-tight">RD5173</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative right side blood drop */}
                <div className="absolute right-10 h-full flex items-center justify-center opacity-70 pointer-events-none">
                   <div className="w-32 h-32 bg-red-600 rounded-full blur-3xl absolute"></div>
                   <Droplet size={120} className="text-red-600 drop-shadow-[0_0_20px_#dc2626]" fill="currentColor" />
                </div>
              </div>

              {/* 3 STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Blood Group Stat */}
                <div className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center shrink-0">
                    <Droplet size={24} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-medium">Blood Group</div>
                    <div className="text-xl font-bold text-white leading-tight">{currentUser.bloodGroup || "O-"}</div>
                    <div className="text-[9px] text-red-500">Universal Donor</div>
                  </div>
                </div>
                {/* Badge Stat */}
                <div className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-yellow-950/40 border border-yellow-900/50 flex items-center justify-center shrink-0">
                    <Award size={24} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-medium">Donor Badge</div>
                    <div className="text-base font-bold text-white leading-tight">New Donor</div>
                    <div className="text-[9px] text-zinc-500">Keep it up!</div>
                  </div>
                </div>
                {/* Donations Stat */}
                <div className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-green-950/40 border border-green-900/50 flex items-center justify-center shrink-0">
                    <Heart size={24} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-medium">Total Donations</div>
                    <div className="text-xl font-bold text-white leading-tight">{currentUser.totalDonations || 0}</div>
                    <div className="text-[9px] text-green-500">You can do it!</div>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, i) => (
                  <button key={i} className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-900 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center">
                        <action.icon size={18} className="text-red-500" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{action.title}</div>
                        <div className="text-[9px] text-zinc-500">{action.desc}</div>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-red-950/50 transition-colors">
                      <ArrowRight size={12} className="text-red-500" />
                    </div>
                  </button>
                ))}
              </div>

              {/* UPCOMING CAMPS */}
              <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="text-red-500" size={16} /> Upcoming Registered Camps
                  </h3>
                  <button className="text-xs text-red-500 font-medium hover:underline">View All</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingCamps.map((camp, i) => (
                    <div key={i} className="bg-[#121212] border border-zinc-800 rounded-xl p-4 relative hover:border-zinc-700 transition-colors">
                      <div className="flex gap-3 mb-4">
                        {/* Date box */}
                        <div className="w-12 shrink-0 flex flex-col rounded-lg overflow-hidden border border-zinc-700">
                          <div className="bg-red-600 text-[10px] font-bold text-center py-0.5">{camp.month}</div>
                          <div className="bg-[#1a1a1a] text-lg font-bold text-center py-1">{camp.date}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white leading-tight mb-2 truncate" title={camp.title}>{camp.title}</h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                              <MapPin size={10} className="text-zinc-500" /> {camp.location}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                              <Clock size={10} className="text-zinc-500" /> {camp.time}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                              <User size={10} /> <span className="text-red-500 font-bold">{camp.reg}</span> <span className="text-zinc-500">/ {camp.total} Registered</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs font-bold transition-colors">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* DONATION HISTORY & ACHIEVEMENTS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* History */}
                <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5 relative">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
                    <Droplet className="text-red-500" size={16} /> Donation History
                  </h3>
                  
                  <div className="flex items-center h-full pb-8">
                    {/* Timeline track */}
                    <div className="w-8 flex flex-col items-center mr-4">
                      <div className="w-8 h-8 rounded-full bg-red-950/30 border border-red-900/50 flex items-center justify-center mb-1">
                        <Droplet size={14} className="text-red-500" fill="currentColor" />
                      </div>
                      <div className="flex flex-col gap-1 my-1">
                        <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                        <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                        <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                        <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center flex-1 pr-8">
                      <h4 className="text-sm font-bold text-white mb-1">No donations yet</h4>
                      <p className="text-[10px] text-zinc-500 mb-4">Your first donation can save up to 3 lives.</p>
                      <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs font-bold transition-colors inline-flex items-center gap-2">
                        <Heart size={12} fill="currentColor" /> Donate Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="text-red-500" size={16} /> Achievements
                    </h3>
                    <button className="text-xs text-red-500 font-medium hover:underline">View All</button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {achievements.map((badge, i) => (
                      <div key={i} className="flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-full bg-[#121212] border border-zinc-800 flex items-center justify-center mb-2 relative group cursor-pointer hover:border-zinc-600 ${i===0 ? badge.glow : ''}`}>
                           <badge.icon size={24} className={badge.color} fill={i < 3 ? "currentColor" : "none"} />
                           <div className="absolute inset-0 rounded-full border-2 border-transparent"></div>
                        </div>
                        <div className="text-[10px] font-bold text-white whitespace-nowrap">{badge.title}</div>
                        <div className="text-[8px] text-zinc-500 whitespace-nowrap">{badge.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (col-span-1) */}
            <div className="lg:col-span-1 space-y-6 sticky top-6 self-start">
              
              {/* EMERGENCY REQUESTS */}
              <div className="bg-[#0a0a0a] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={16} /> Emergency Requests
                  </h3>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeRequests.length}</span>
                </div>
                
                <div className="space-y-3">
                  {activeRequests.length === 0 ? (
                    <p className="text-zinc-500 text-center text-xs py-4">No active requests.</p>
                  ) : (
                    activeRequests.slice(0, 3).map((req, i) => (
                      <div key={i} className="bg-[#121212] border border-zinc-800 rounded-xl p-3 flex justify-between items-center hover:border-zinc-700 transition-colors group cursor-pointer" onClick={() => setActiveTab("Emergency")}>
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex flex-col items-center justify-center border border-zinc-800">
                            <span className="text-red-500 font-bold text-sm leading-none">{req.bloodGroup}</span>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-white">{req.patientName}</div>
                            <div className="text-[9px] text-zinc-400">{req.hospital}</div>
                            <div className="text-[9px] text-zinc-500">{req.city}</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-white bg-red-950 px-2 py-1 rounded border border-red-900/50">Urgent</span>
                      </div>
                    ))
                  )}
                </div>
                
                <button onClick={() => setActiveTab("Emergency")} className="w-full mt-4 py-2 bg-[#121212] border border-zinc-800 hover:bg-[#1a1a1a] rounded-lg text-white text-xs font-medium transition-colors flex items-center justify-center gap-2">
                  View All Requests <ArrowRight size={12} className="text-zinc-400" />
                </button>
              </div>

              {/* DID YOU KNOW */}
              <div className="bg-gradient-to-br from-[#1a0508] to-[#0a0002] border border-red-900/30 rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-red-600/10 blur-[40px]"></div>
                
                {/* Fake ECG background line */}
                <div className="absolute top-0 right-0 w-full h-1/2 opacity-20 pointer-events-none">
                  <svg viewBox="0 0 100 50" className="w-full h-full stroke-red-500 stroke-[1px] fill-none" preserveAspectRatio="none">
                    <path d="M0,25 L30,25 L40,10 L50,40 L60,25 L100,25"></path>
                  </svg>
                </div>

                <div className="relative z-10">
                  <h3 className="text-base font-bold text-red-500 mb-1 flex items-center gap-1.5">
                    Did <span className="text-white">You Know?</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    One donation can save up to <span className="text-red-500 font-bold">3</span> precious lives.
                  </p>
                  <button className="py-2 px-4 rounded-lg bg-red-600/20 text-red-500 text-xs font-bold border border-red-600/30 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 w-max">
                    Learn More <ArrowRight size={12} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      
      <aside className="w-[260px] fixed inset-y-0 left-0 border-r border-zinc-800/50 bg-[#080808] flex flex-col z-40 h-screen">
        <div className="flex-1 py-6 px-4 space-y-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                activeTab === item.label
                  ? "bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={activeTab === item.label ? "text-white" : "text-zinc-500"} />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Every Drop Counts Banner in Sidebar */}
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-b from-[#1a0508] to-[#0a0002] border border-red-900/30 rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600/10 blur-xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <Droplet size={40} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] mb-3" fill="currentColor" />
              <h4 className="text-white font-bold mb-1">Every <span className="text-red-500">Drop</span> Counts</h4>
              <p className="text-[10px] text-zinc-400 mb-4 leading-tight">Your one donation can save up to 3 lives.</p>
              <button className="w-full py-2 rounded-lg bg-red-600/20 text-red-500 text-xs font-bold border border-red-600/30 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                <Heart size={12} fill="currentColor" /> Donate Now
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] min-h-screen bg-[#080808] flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="text-zinc-400 font-medium">Dashboard / <span className="text-white">{activeTab}</span></div>
          <div className="flex items-center gap-6">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#0a0a0a] animate-pulse"></span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-[#121212] border border-zinc-800/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0a0a0a]">
                    <h3 className="text-white font-bold text-sm">Notifications</h3>
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-xs">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`p-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors ${!n.isRead ? 'bg-red-950/10' : ''}`}>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-950/50 flex items-center justify-center shrink-0 border border-red-900/30">
                              <Droplet size={14} className="text-red-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-zinc-300'}`}>{n.title}</h4>
                              <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{n.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[9px] text-zinc-500">{new Date(n.createdAt).toLocaleString()}</span>
                                {!n.isRead && (
                                  <button onClick={() => markAsRead(n._id)} className="text-[10px] text-red-500 font-medium hover:underline">Mark read</button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
