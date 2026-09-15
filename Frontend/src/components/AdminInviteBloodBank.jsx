import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, User, Building, MapPin, Shield, Send, Copy, Check, ChevronDown, Edit3 } from "lucide-react";
import adminService from "../services/adminService";

export default function AdminInviteBloodBank() {
  const [formData, setFormData] = useState({
    bloodBankName: "",
    managerName: "",
    email: "",
    mobile: "",
    city: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  
  // Cities list from City Management
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);

  useEffect(() => {
    fetchActiveCities();
  }, []);

  const fetchActiveCities = async () => {
    setLoadingCities(true);
    try {
      const res = await adminService.getCities();
      if (res.success && res.data) {
        setCities(res.data);
      }
    } catch (err) {
      console.warn("Error fetching cities for invite:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitySelectChange = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomCity(true);
      setFormData({ ...formData, city: "" });
    } else {
      setIsCustomCity(false);
      setFormData({ ...formData, city: val });
    }
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
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    toast.success("Registration link copied to clipboard!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.city.trim()) {
      toast.error("Please select or enter a city.");
      return;
    }

    setLoading(true);
    setCreatedInviteLink("");
    try {
      const res = await adminService.inviteBloodBank(formData);
      if (res.success) {
        toast.success(res.message || "Invitation sent successfully!");
        if (res.inviteLink) {
          setCreatedInviteLink(res.inviteLink);
        }
        setFormData({
          bloodBankName: "",
          managerName: "",
          email: "",
          mobile: "",
          city: "",
          licenseNumber: "",
        });
        setIsCustomCity(false);
      } else {
        toast.error(res.message || "Failed to send invitation.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white w-full">
      <div className="flex items-center gap-3 mb-6">
        <Send className="w-8 h-8 text-red-500" />
        <div>
          <h2 className="text-2xl font-bold">Invite Blood Bank</h2>
          <p className="text-zinc-400 text-sm">Send a secure registration invite email to a new blood bank partner</p>
        </div>
      </div>

      {createdInviteLink && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Registration Invite Link Created
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(createdInviteLink)}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <p className="text-xs text-zinc-300 break-all bg-[#0d0d17] p-2.5 rounded border border-zinc-800 font-mono select-all">
            {createdInviteLink}
          </p>
          <p className="text-[11px] text-zinc-400">
            Aap is link ko directly copy karke blood bank ko share kar sakte hain ya email par bhi send ho gaya hai.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Blood Bank Name */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Blood Bank Name *</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
              <input
                required
                type="text"
                name="bloodBankName"
                value={formData.bloodBankName}
                onChange={handleChange}
                placeholder="e.g. Red Cross Blood Bank"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>

          {/* Manager Name */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Manager Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
              <input
                required
                type="text"
                name="managerName"
                value={formData.managerName}
                onChange={handleChange}
                placeholder="e.g. Dr. John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. contact@bloodbank.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Mobile Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
              <input
                required
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* City Selection / Dropdown */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm text-zinc-400">City *</label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCity(!isCustomCity);
                  setFormData({ ...formData, city: "" });
                }}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                {isCustomCity ? "← Choose from list" : "+ Type other city"}
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-500 z-10 pointer-events-none" />
              
              {!isCustomCity ? (
                <div className="relative">
                  <select
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleCitySelectChange}
                    className="w-full pl-10 pr-8 py-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#1e293b] text-zinc-400">
                      {loadingCities ? "Loading cities..." : "-- Select City --"}
                    </option>
                    {cities.map((c) => (
                      <option key={c._id} value={c.name} className="bg-[#1e293b] text-white">
                        {c.name} {c.state ? `(${c.state})` : ""}
                      </option>
                    ))}
                    <option value="__custom__" className="bg-[#1e293b] text-red-400 font-bold">
                      + Type other custom city...
                    </option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              ) : (
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Type city name (e.g. Mumbai, Pune)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">License Number *</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
              <input
                required
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="e.g. DL-12345"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending..." : (
              <>
                <Send className="w-4 h-4" /> Send Invite
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
