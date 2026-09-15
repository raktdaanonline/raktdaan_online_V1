import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, MapPin, Building, ShieldCheck, Ban, Plus, Eye, X, FileText, ExternalLink, RefreshCw, AlertTriangle, ShieldAlert, Clock, Copy, Check, Key, ChevronDown, ChevronLeft, ChevronRight, Edit3, Trash2, Save, CheckCircle2, Navigation } from "lucide-react";
import adminService from "../services/adminService";
import AdminInviteBloodBank from "./AdminInviteBloodBank";

export default function AdminBloodBanks() {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "pending" | "active" | "invited" | "rejected" | "all"
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPassId, setCopiedPassId] = useState(null);

  const [selectedCity, setSelectedCity] = useState("all");
  const [citiesList, setCitiesList] = useState([]);

  // Backend Pagination State (15 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Edit Blood Bank Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    managerName: "",
    email: "",
    mobile: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    city: "",
    state: "",
    address: "",
    pincode: "",
    emergencyContact: "",
    is24x7: false,
    openTime: "09:00",
    closeTime: "20:00",
    latitude: "",
    longitude: "",
    status: "active",
    isVerified: true,
  });

  // Status Summary Stats for Badge and Cards
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    invited: 0,
    rejected: 0,
    suspended: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await adminService.getBloodBankStats();
      if (res && res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.warn("Failed loading blood bank stats in AdminBloodBanks:", err);
    }
  };

  const fetchBloodBanks = async (page = currentPage, tab = activeTab, city = selectedCity, query = searchQuery) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        status: tab,
      };
      if (city && city !== "all") params.city = city;
      if (query && query.trim()) params.search = query.trim();

      const res = await adminService.getBloodBanks(params);
      if (res.success) {
        setBloodBanks(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
          setCurrentPage(res.pagination.page);
        }
      }
    } catch (err) {
      toast.error("Failed to fetch blood banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchBloodBanks(1, activeTab, selectedCity, searchQuery);
  }, [activeTab, selectedCity]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchBloodBanks(1, activeTab, selectedCity, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    adminService.getCities().then((res) => {
      if (res.success && res.data) {
        setCitiesList(res.data);
      }
    }).catch((err) => console.warn("Failed loading cities list in blood banks:", err));
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination.totalPages && newPage > pagination.totalPages) || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchBloodBanks(newPage, activeTab, selectedCity, searchQuery);
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
  };

  const handleCopyInviteLink = async (id) => {
    setActionLoading(true);
    try {
      const res = await adminService.getInviteLink(id);
      if (res.success && res.inviteLink) {
        await copyToClipboard(res.inviteLink);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
        toast.success("Registration link copied to clipboard!");
        fetchBloodBanks();
      } else {
        toast.error("Failed to generate registration link");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error generating registration link");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyPasswordLink = async (id) => {
    setActionLoading(true);
    try {
      const res = await adminService.getPasswordLink(id);
      const link = res.setupLink || res.passwordLink;
      if (res.success && link) {
        await copyToClipboard(link);
        setCopiedPassId(id);
        setTimeout(() => setCopiedPassId(null), 2500);
        toast.success("Password setup link copied to clipboard!");
        fetchBloodBanks();
      } else {
        toast.error("Failed to generate password setup link");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error generating password link");
    } finally {
      setActionLoading(false);
    }
  };


  const handleOpenEditModal = (bank) => {
    setEditingBank(bank);
    setEditForm({
      name: bank.name || "",
      managerName: bank.managerName || "",
      email: bank.email || "",
      mobile: bank.mobile || "",
      licenseNumber: bank.licenseNumber || "",
      licenseExpiryDate: bank.licenseExpiryDate ? bank.licenseExpiryDate.split("T")[0] : "",
      city: bank.city || "",
      state: bank.state || "Maharashtra",
      address: bank.address || "",
      pincode: bank.pincode || "",
      emergencyContact: bank.emergencyContact || "",
      is24x7: bank.is24x7 || bank.available24x7 || false,
      openTime: bank.openTime || bank.openingTime || "09:00",
      closeTime: bank.closeTime || bank.closingTime || "20:00",
      latitude: bank.latitude !== undefined && bank.latitude !== null ? bank.latitude : (bank.location?.coordinates?.[1] || ""),
      longitude: bank.longitude !== undefined && bank.longitude !== null ? bank.longitude : (bank.location?.coordinates?.[0] || ""),
      status: bank.status || "active",
      isVerified: bank.isVerified ?? true,
    });
    setShowEditModal(true);
  };

  const handleAutoGeocode = () => {
    const c = (editForm.city || "").toLowerCase().trim();
    if (c.includes("mumbai")) {
      setEditForm(prev => ({ ...prev, latitude: 19.0760, longitude: 72.8777, state: prev.state || "Maharashtra" }));
      toast.success("Set coordinates to Mumbai (19.0760, 72.8777)");
    } else if (c.includes("pune")) {
      setEditForm(prev => ({ ...prev, latitude: 18.5204, longitude: 73.8567, state: prev.state || "Maharashtra" }));
      toast.success("Set coordinates to Pune (18.5204, 73.8567)");
    } else if (c.includes("hyderabad")) {
      setEditForm(prev => ({ ...prev, latitude: 17.3850, longitude: 78.4867, state: prev.state || "Telangana" }));
      toast.success("Set coordinates to Hyderabad (17.3850, 78.4867)");
    } else if (c.includes("bengaluru") || c.includes("bangalore")) {
      setEditForm(prev => ({ ...prev, latitude: 12.9716, longitude: 77.5946, state: prev.state || "Karnataka" }));
      toast.success("Set coordinates to Bengaluru (12.9716, 77.5946)");
    } else if (c.includes("karnataka") || c.includes("athani") || c.includes("bagalkot")) {
      setEditForm(prev => ({ ...prev, latitude: 16.7333, longitude: 75.0560, state: prev.state || "Karnataka" }));
      toast.success("Set coordinates to Karnataka (16.7333, 75.0560)");
    } else {
      toast.info("Please enter custom latitude & longitude for this city");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email || !editForm.mobile || !editForm.licenseNumber || !editForm.city) {
      toast.error("Please fill in all required fields (Name, Email, Mobile, License, City)");
      return;
    }

    setEditLoading(true);
    try {
      const res = await adminService.updateBloodBank(editingBank._id, editForm);
      if (res.success) {
        toast.success(res.message || "Blood bank updated successfully!");
        setShowEditModal(false);
        setEditingBank(null);
        if (selectedBank?._id === editingBank._id) {
          setSelectedBank(res.data);
        }
        fetchBloodBanks();
        fetchStats();
      } else {
        toast.error(res.message || "Failed to update blood bank");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating blood bank");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete blood bank "${name}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await adminService.deleteBloodBank(id);
      if (res.success) {
        toast.success(res.message || "Blood bank deleted successfully.");
        if (selectedBank?._id === id) setSelectedBank(null);
        if (editingBank?._id === id) setShowEditModal(false);
        fetchBloodBanks();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting blood bank");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this blood bank? Password setup link will be generated and sent via email.")) return;
    setActionLoading(true);
    try {
      const res = await adminService.approveBloodBank(id);
      if (res.success) {
        toast.success(res.message || "Approved successfully!");
        setSelectedBank(null);
        fetchBloodBanks();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error approving blood bank");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      const res = await adminService.rejectBloodBank(id, rejectionReason);
      if (res.success) {
        toast.success(res.message || "Registration rejected successfully.");
        setSelectedBank(null);
        setIsRejecting(false);
        setRejectionReason("");
        fetchBloodBanks();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error rejecting blood bank");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    if (!suspensionReason.trim()) {
      toast.error("Please enter a reason for suspension");
      return;
    }
    setActionLoading(true);
    try {
      const res = await adminService.suspendBloodBank(id, suspensionReason);
      if (res.success) {
        toast.success(res.message || "Blood bank suspended successfully.");
        setSelectedBank(null);
        setIsSuspending(false);
        setSuspensionReason("");
        fetchBloodBanks();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error suspending blood bank");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Reactivate this suspended blood bank account?")) return;
    setActionLoading(true);
    try {
      const res = await adminService.reactivateBloodBank(id);
      if (res.success) {
        toast.success(res.message || "Blood bank reactivated successfully.");
        setSelectedBank(null);
        fetchBloodBanks();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error reactivating blood bank");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendInvite = async (id) => {
    setActionLoading(true);
    try {
      const res = await adminService.resendInvite(id);
      if (res.success) {
        toast.success(res.message || "Invitation resent successfully!");
        fetchBloodBanks();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error resending invitation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusOverride = async (id, newStatus) => {
    const note = window.prompt(`Enter a note/reason for changing status to ${newStatus} (optional):`);
    if (note === null) return; // Cancelled

    setActionLoading(true);
    try {
      const res = await adminService.updateBloodBankStatus(id, newStatus, note);
      if (res.success) {
        toast.success(res.message || `Status updated to ${newStatus}`);
        // Fetch updated data to sync UI
        const refreshed = await adminService.getBloodBanks({});
        if (refreshed.success) {
          const updated = refreshed.data.find(b => b._id === id);
          if (updated) setSelectedBank(updated);
        }
        fetchBloodBanks();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    } finally {
      setActionLoading(false);
    }
  };

  const isLicenseExpiringSoon = (date) => {
    if (!date) return false;
    const diffTime = new Date(date) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isLicenseExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const filteredBanks = bloodBanks.filter((bank) => {
    const name = (bank.name || "").toLowerCase();
    const city = (bank.city || "").toLowerCase();
    const license = (bank.licenseNumber || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query || name.includes(query) || city.includes(query) || license.includes(query);
    const matchesCity = selectedCity === "all" || city === selectedCity.toLowerCase().trim();

    return matchesSearch && matchesCity;
  });

  return (
    <div className="bg-[#0f172a] p-6 rounded-xl border border-zinc-800 text-white min-h-[500px]">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2 text-white">
            <Building className="w-6 h-6 text-red-500" />
            Blood Banks Directory
          </h2>
          <p className="text-zinc-400 text-xs mt-1">Manage registration requests, verify credentials, and handle operational states</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Invite Blood Bank
          </button>

          {/* City Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-3 pr-8 py-2 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-xs text-white appearance-none cursor-pointer"
            >
              <option value="all">All Cities</option>
              {citiesList.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          </div>
          
          <div className="relative flex-1 md:w-56">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search name, city, license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-xs text-white placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {/* Total Card */}
        <div
          onClick={() => setActiveTab("all")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "all"
              ? "bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/10"
              : "bg-[#11111f] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#16162a]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Banks</span>
            <Building className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats.total}</span>
            <span className="text-[10px] text-zinc-500 font-semibold">Registered</span>
          </div>
        </div>

        {/* Active Card */}
        <div
          onClick={() => setActiveTab("active")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "active"
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
              : "bg-[#11111f] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#16162a]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Active / Approved</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{stats.active}</span>
            <span className="text-[10px] text-emerald-500/70 font-semibold">Operational</span>
          </div>
        </div>

        {/* Pending Card */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "pending"
              ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10"
              : "bg-[#11111f] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#16162a]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{stats.pending}</span>
            <span className="text-[10px] text-amber-500/70 font-semibold">Need Action</span>
          </div>
        </div>

        {/* Invited Card */}
        <div
          onClick={() => setActiveTab("invited")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "invited"
              ? "bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10"
              : "bg-[#11111f] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#16162a]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Invited</span>
            <ExternalLink className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">{stats.invited}</span>
            <span className="text-[10px] text-blue-500/70 font-semibold">Invite Sent</span>
          </div>
        </div>

        {/* Suspended/Rejected Card */}
        <div
          onClick={() => setActiveTab("suspended")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "suspended" || activeTab === "rejected"
              ? "bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/10"
              : "bg-[#11111f] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#16162a]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Inactive / Susp</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{(stats.suspended || 0) + (stats.rejected || 0)}</span>
            <span className="text-[10px] text-rose-500/70 font-semibold">{stats.suspended || 0} Susp / {stats.rejected || 0} Rej</span>
          </div>
        </div>
      </div>

      {/* Tabs Row with Count Badges */}
      <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto gap-1.5 pb-1">
        {[
          { key: "all", label: "ALL", count: stats.total },
          { key: "pending", label: "PENDING", count: stats.pending, alert: stats.pending > 0 },
          { key: "active", label: "ACTIVE", count: stats.active },
          { key: "invited", label: "INVITED", count: stats.invited },
          { key: "rejected", label: "REJECTED", count: stats.rejected },
          { key: "suspended", label: "SUSPENDED", count: stats.suspended },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === t.key 
                ? "border-red-500 text-red-400 bg-red-500/5" 
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <span>{t.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === t.key
                ? "bg-red-500 text-white"
                : t.alert
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                  : "bg-zinc-800 text-zinc-400"
            }`}>
              {t.count ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Grid or Table list */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm">
          <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-3"></div>
          Loading blood banks...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Blood Bank Name</th>
                <th className="py-3 px-4 font-bold">Contact & License</th>
                <th className="py-3 px-4 font-bold">Location</th>
                <th className="py-3 px-4 font-bold">Expiry State</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bloodBanks.map((bank) => {
                const expiring = isLicenseExpiringSoon(bank.licenseExpiryDate);
                const expired = isLicenseExpired(bank.licenseExpiryDate);
                
                return (
                  <tr key={bank._id} className="border-b border-zinc-800 hover:bg-[#1e293b]/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-zinc-100">{bank.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">Manager: {bank.managerName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-zinc-200">{bank.mobile}</div>
                      <div className="text-[11px] text-zinc-500 mt-1">License: {bank.licenseNumber}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm flex items-center gap-1 text-zinc-200">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {bank.city}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{bank.state || "N/A"}</div>
                    </td>
                    <td className="py-4 px-4">
                      {bank.licenseExpiryDate ? (
                        <div>
                          <div className={`text-xs font-semibold ${
                            expired ? "text-red-500" : expiring ? "text-amber-500 animate-pulse" : "text-zinc-400"
                          }`}>
                            {new Date(bank.licenseExpiryDate).toLocaleDateString("en-IN")}
                          </div>
                          {expired && <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">Expired</span>}
                          {expiring && <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">Expires Soon</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">Not Submitted</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`w-24 inline-block text-center py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${
                        bank.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        bank.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        bank.status === 'suspended' ? 'bg-red-900/20 text-red-400 border-red-500/20' :
                        bank.status === 'rejected' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' :
                        'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}>
                        {bank.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedBank(bank)}
                          className="h-7 px-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md text-[11px] font-semibold flex items-center gap-1 border border-zinc-700 transition-all cursor-pointer shadow-sm"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          <span>View</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(bank)}
                          className="h-7 w-7 flex items-center justify-center bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-md border border-blue-500/30 transition-all cursor-pointer shadow-sm"
                          title="Edit Blood Bank Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Pass Link (Active/Approved) */}
                        {(bank.status === "approved" || bank.status === "active") && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCopyPasswordLink(bank._id)}
                            className="h-7 px-2 bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 rounded-md text-[11px] font-semibold flex items-center gap-1 border border-emerald-500/30 transition-all cursor-pointer shadow-sm"
                            title="Copy Password Setup Link (Pass Link)"
                          >
                            {copiedPassId === bank._id ? (
                              <>
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-green-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Key className="w-3 h-3" />
                                <span>Pass</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Invite Link & Resend (Invited) */}
                        {bank.status === "invited" && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleCopyInviteLink(bank._id)}
                              className="h-7 px-2 bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-md text-[11px] font-semibold flex items-center gap-1 border border-blue-500/30 transition-all cursor-pointer shadow-sm"
                              title="Copy Registration Invite Link"
                            >
                              {copiedId === bank._id ? (
                                <>
                                  <Check className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Link</span>
                                </>
                              )}
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() => handleResendInvite(bank._id)}
                              className="h-7 w-7 flex items-center justify-center bg-amber-600/15 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 rounded-md border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                              title="Resend Invite Email"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Delete */}
                        <button
                          disabled={actionLoading}
                          onClick={() => handleDelete(bank._id, bank.name)}
                          className="h-7 w-7 flex items-center justify-center bg-red-600/15 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-md border border-red-500/30 transition-all cursor-pointer shadow-sm"
                          title="Permanently Delete Blood Bank"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {bloodBanks.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-zinc-500 text-xs italic">
                    No blood banks found under the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Backend Pagination Controls (15 items per page) */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-4 border-t border-zinc-800 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-zinc-200">{((currentPage - 1) * pagination.limit) + 1}</strong> to{" "}
              <strong className="text-zinc-200">{Math.min(currentPage * pagination.limit, pagination.total)}</strong> of{" "}
              <strong className="text-white font-bold">{pagination.total}</strong> blood banks
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500 text-[11px]">15 per page</span>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-8 px-3 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 1;
                  })
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-zinc-600">...</span>}
                        <button
                          disabled={loading}
                          onClick={() => handlePageChange(p)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            p === currentPage
                              ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                              : "border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                disabled={!pagination.hasNextPage || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-8 px-3 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 font-semibold cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#11111f] rounded-xl border border-zinc-800 shadow-2xl w-full max-w-2xl p-6 relative">
            <button 
              onClick={() => {
                setShowInviteModal(false);
                fetchBloodBanks();
              }} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
            <AdminInviteBloodBank />
          </div>
        </div>
      )}

      {/* Edit Blood Bank Modal */}
      {showEditModal && editingBank && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0f172a] rounded-2xl border border-zinc-700 shadow-2xl w-full max-w-4xl p-6 sm:p-8 relative my-8 text-white max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                    <Edit3 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-white">Edit Blood Bank Details</h3>
                    <p className="text-xs text-zinc-400">Update all fields, contact info, coordinates, and operational status</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingBank(null); }}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              
              {/* Section 1: Basic Information */}
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                  <Building className="w-4 h-4" /> 1. Basic & Management Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Blood Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. Sassoon General Hospital Blood Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Manager / Authorized Person Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.managerName}
                      onChange={(e) => setEditForm({ ...editForm, managerName: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. Dr. Rajesh Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. bloodbank@hospital.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Primary Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="10 digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Emergency Contact Number</label>
                    <input
                      type="tel"
                      value={editForm.emergencyContact}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="24x7 emergency helpline"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: License & Legal */}
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                  <FileText className="w-4 h-4" /> 2. License & Legal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Drug License Number *</label>
                    <input
                      type="text"
                      required
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. MH-PUN-12345"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">License Expiry Date</label>
                    <input
                      type="date"
                      value={editForm.licenseExpiryDate}
                      onChange={(e) => setEditForm({ ...editForm, licenseExpiryDate: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Location & Coordinates */}
              <div>
                <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-1.5">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> 3. Location, Address & GPS Coordinates
                  </h4>
                  <button
                    type="button"
                    onClick={handleAutoGeocode}
                    className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded text-[11px] font-bold border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" /> Auto-fill GPS from City
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">City *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="city-options"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                        placeholder="e.g. Pune, Mumbai"
                      />
                      <datalist id="city-options">
                        {citiesList.map(c => (
                          <option key={c._id} value={c.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Full Street Address</label>
                  <textarea
                    rows="2"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 leading-relaxed"
                    placeholder="Complete hospital address with landmark..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">GPS Latitude (e.g. 18.5204)</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.latitude}
                      onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                      className="w-full p-2 bg-[#1e293b] border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="Latitude"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">GPS Longitude (e.g. 73.8567)</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.longitude}
                      onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                      className="w-full p-2 bg-[#1e293b] border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-red-500"
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Operational Timing */}
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                  <Clock className="w-4 h-4" /> 4. Operational Timing & Schedule
                </h4>
                
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="edit-is24x7"
                    checked={editForm.is24x7}
                    onChange={(e) => setEditForm({ ...editForm, is24x7: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded bg-zinc-900 border-zinc-700 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="edit-is24x7" className="text-xs font-bold text-zinc-200 cursor-pointer">
                    Available 24x7 (Open Round the Clock)
                  </label>
                </div>

                {!editForm.is24x7 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">Opening Time</label>
                      <input
                        type="time"
                        value={editForm.openTime}
                        onChange={(e) => setEditForm({ ...editForm, openTime: e.target.value })}
                        className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">Closing Time</label>
                      <input
                        type="time"
                        value={editForm.closeTime}
                        onChange={(e) => setEditForm({ ...editForm, closeTime: e.target.value })}
                        className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Status & Verification */}
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                  <ShieldCheck className="w-4 h-4" /> 5. Account Status & Verification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Status State</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full p-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="active">🟢 Active</option>
                      <option value="approved">✅ Approved</option>
                      <option value="pending">⏳ Pending Review</option>
                      <option value="invited">✉️ Invited</option>
                      <option value="suspended">⚠️ Suspended</option>
                      <option value="rejected">❌ Rejected</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="edit-isVerified"
                      checked={editForm.isVerified}
                      onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded bg-zinc-900 border-zinc-700 focus:ring-green-500 cursor-pointer"
                    />
                    <label htmlFor="edit-isVerified" className="text-xs font-bold text-zinc-200 cursor-pointer flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Account Verified (Public Visibility Enabled)
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete(editingBank._id, editingBank.name)}
                  className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg text-xs font-bold border border-red-800/40 transition-colors flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Trash2 className="w-4 h-4" /> Delete Blood Bank
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingBank(null); }}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {editLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save All Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer slide-out */}
      {selectedBank && (
        <>
          <div onClick={() => { setSelectedBank(null); setIsRejecting(false); setIsSuspending(false); }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" />
          
          <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0c0c16] border-l border-zinc-800 shadow-2xl z-[100] flex flex-col text-white transform transition-transform duration-300">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
              <div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider mb-2 inline-block ${
                  selectedBank.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  selectedBank.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {selectedBank.status}
                </span>
                <h3 className="text-xl font-black text-white">{selectedBank.name}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">ID: {selectedBank._id}</p>
              </div>
              <button onClick={() => { setSelectedBank(null); setIsRejecting(false); setIsSuspending(false); }} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm">
              
              {/* Quick Actions in Drawer */}
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedBank)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Edit3 className="w-4 h-4" /> Edit Details
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleDelete(selectedBank._id, selectedBank.name)}
                  className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-red-500/30 cursor-pointer"
                  title="Delete Blood Bank"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1">Operational Info</h4>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Manager</span>
                  <span className="font-semibold text-zinc-200">{selectedBank.managerName}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Mobile</span>
                    <span className="font-semibold text-zinc-200">{selectedBank.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Email</span>
                    <span className="font-semibold text-zinc-200 truncate block">{selectedBank.email}</span>
                  </div>
                </div>
              </div>

              {/* License Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1">License & Validity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">License No</span>
                    <span className="font-semibold text-zinc-200">{selectedBank.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Expiry Date</span>
                    <span className="font-semibold text-zinc-200">
                      {selectedBank.licenseExpiryDate ? new Date(selectedBank.licenseExpiryDate).toLocaleDateString("en-IN") : "N/A"}
                    </span>
                  </div>
                </div>

                {selectedBank.licenseDocumentUrl && (
                  <div className="pt-2">
                    <span className="text-[10px] text-zinc-500 block uppercase mb-1.5">Verification Document</span>
                    <a 
                      href={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}${selectedBank.licenseDocumentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-blue-400 rounded border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> View License Document <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Location details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1">Address & Location</h4>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Address</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedBank.address || "N/A"}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">City</span>
                    <span className="font-semibold text-zinc-200">{selectedBank.city}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">State</span>
                    <span className="font-semibold text-zinc-200">{selectedBank.state || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Pincode</span>
                    <span className="font-semibold text-zinc-200">{selectedBank.pincode || "N/A"}</span>
                  </div>
                </div>

                {selectedBank.latitude && selectedBank.longitude && (
                  <div className="pt-2">
                    <span className="text-[10px] text-zinc-500 block uppercase mb-1">Maps Preview</span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedBank.latitude},${selectedBank.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E24B4A] hover:underline"
                    >
                      <MapPin className="w-4.5 h-4.5" /> Locate on Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Timing */}
              {(selectedBank.openTime || selectedBank.is24x7) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1">Operational Timing</h4>
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <Clock className="w-4 h-4 text-[#E24B4A]" />
                    {selectedBank.is24x7 ? (
                      <span className="text-green-500">Open 24 Hours / 7 Days</span>
                    ) : (
                      <span>Open: {selectedBank.openTime} | Close: {selectedBank.closeTime}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Audit logs history */}
              {selectedBank.statusHistory && selectedBank.statusHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1">History Audit Trail</h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedBank.statusHistory.map((hist, idx) => (
                      <div key={idx} className="text-xs bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80">
                        <div className="flex justify-between font-bold text-zinc-300">
                          <span className="capitalize text-[#E24B4A]">{hist.status}</span>
                          <span className="text-zinc-500 text-[10px]">{new Date(hist.updatedAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">{hist.action} - {hist.note}</p>
                        <span className="text-[9px] text-zinc-600 block mt-1">By: {hist.updatedBy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedBank.status === "invited" && (
                <div className="pt-4 border-t border-zinc-800 flex gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleCopyInviteLink(selectedBank._id)}
                    className="flex-1 py-2.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 rounded font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-blue-500/30 cursor-pointer"
                  >
                    {copiedId === selectedBank._id ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" /> <span className="text-green-400">Registration Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy Registration Link
                      </>
                    )}
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleResendInvite(selectedBank._id)}
                    className="flex-1 py-2.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 rounded font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-red-500/30 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Resend Invite Email
                  </button>
                </div>
              )}

              {selectedBank.status === "pending" && (
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  {!isRejecting ? (
                    <div className="flex gap-3">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleApprove(selectedBank._id)}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs transition-colors cursor-pointer"
                      >
                        Approve Account
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => setIsRejecting(true)}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs transition-colors cursor-pointer"
                      >
                        Reject Request
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-zinc-900/50 p-4 rounded border border-zinc-800">
                      <label className="block text-xs text-zinc-400 font-bold uppercase">Reason for Rejection *</label>
                      <textarea
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide reason for rejecting..."
                        className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-xs text-white focus:outline-none focus:border-red-500"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setIsRejecting(false); setRejectionReason(""); }}
                          className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleReject(selectedBank._id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(selectedBank.status === "approved" || selectedBank.status === "active") && (
                <div className="pt-4 border-t border-zinc-800">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleCopyPasswordLink(selectedBank._id)}
                    className="w-full py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 rounded font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30 cursor-pointer"
                    title="Copy Password Setup Link (Pass Link)"
                  >
                    {copiedPassId === selectedBank._id ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" /> <span className="text-green-400">Password Setup Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" /> Copy Pass Link (Password Setup)
                      </>
                    )}
                  </button>
                </div>
              )}

              {selectedBank.status === "active" && (
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  {!isSuspending ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => setIsSuspending(true)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" /> Suspend Account
                    </button>
                  ) : (
                    <div className="space-y-3 bg-zinc-900/50 p-4 rounded border border-zinc-800">
                      <label className="block text-xs text-zinc-400 font-bold uppercase">Reason for Suspension *</label>
                      <textarea
                        required
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        placeholder="Provide details for suspension..."
                        className="w-full p-2 bg-zinc-950 border border-zinc-850 rounded text-xs text-white focus:outline-none focus:border-red-500"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setIsSuspending(false); setSuspensionReason(""); }}
                          className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSuspend(selectedBank._id)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Confirm Suspend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedBank.status === "suspended" && (
                <div className="pt-4 border-t border-zinc-800">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReactivate(selectedBank._id)}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" /> Reactivate Account
                  </button>
                </div>
              )}

              {/* Direct Status Selector Override */}
              <div className="pt-6 border-t border-zinc-800 space-y-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Status Override (Force State)</label>
                <div className="relative">
                  <select
                    disabled={actionLoading}
                    value={selectedBank.status}
                    onChange={(e) => handleStatusOverride(selectedBank._id, e.target.value)}
                    className="w-full p-2.5 bg-[#181827] border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="invited">✉️ Invited</option>
                    <option value="pending">⏳ Pending Review</option>
                    <option value="approved">✅ Approved (Awaiting PW Set)</option>
                    <option value="active">🟢 Active / Activated</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="suspended">⚠️ Suspended</option>
                  </select>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">Manually force this blood bank's state. Bypasses standard step transitions and logs audit trial.</p>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
