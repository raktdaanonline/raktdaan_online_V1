import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Calendar, Hospital, User, Send, Droplet, Clock, Activity } from "lucide-react";
import bgImage from "../assets/ragister.png";

const BloodRequestForm = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/register?role=recipient");
    }
  }, [currentUser, loading, navigate]);

  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    units: "",
    urgency: "",
    hospital: "",
    neededBy: "",
    additionalInfo: ""
  });
  
  const [submitting, setSubmitting] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const unitOptions = ["1", "2", "3", "4+"];
  const urgencyOptions = [
    { value: "urgent", label: "🚨 Urgent", desc: "Need within 24 hours" },
    { value: "planned", label: "📅 Planned", desc: "Surgery/Planned requirement" }
  ];
  const timeOptions = ["Aaj", "Kal", "2-3 din mein", "1 hafte mein"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.bloodGroup || !formData.units || !formData.urgency || !formData.hospital || !formData.neededBy) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("jwt_token");
      const res = await axios.post("/api/request/create", {
        ...formData,
        units: formData.units === "4+" ? 4 : parseInt(formData.units),
        city: currentUser?.city || "Pune"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Request submitted successfully!");
        navigate(`/request-status/${res.data.data.requestId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#E24B4A] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div 
      className="min-h-screen flex flex-col p-4 pt-28 pb-12 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="absolute inset-0 z-0 bg-black/80"></div>

      <div className="w-full relative z-10 p-8 sm:p-10 m-auto mt-8 max-w-[600px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#D85A30]/30 rounded-[30px] shadow-[0_0_40px_rgba(216,90,48,0.15)]">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-[#D85A30]/20 rounded-full flex items-center justify-center mb-4 border border-[#D85A30]/50 shadow-[0_0_20px_rgba(216,90,48,0.4)]">
            <Activity className="text-[#D85A30] w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 font-cinzel">Request Blood</h2>
          <p className="text-zinc-400 text-sm">Fill details to notify donors in your city immediately</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Patient Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-[#D85A30]" />
              </div>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full bg-[#141414] text-white px-4 py-3.5 pl-11 rounded-xl border border-zinc-800 focus:border-[#D85A30] focus:ring-1 focus:ring-[#D85A30] outline-none transition-all"
                placeholder="Enter patient's full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Blood Group Needed</label>
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                      formData.bloodGroup === bg
                        ? "bg-[#E24B4A] border-[#E24B4A] text-white shadow-[0_0_15px_rgba(226,75,74,0.4)]"
                        : "bg-[#141414] border-zinc-800 text-zinc-400 hover:border-[#E24B4A]/50 hover:text-white"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Units */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Units Needed</label>
              <div className="grid grid-cols-4 gap-2">
                {unitOptions.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setFormData({ ...formData, units: unit })}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      formData.units === unit
                        ? "bg-[#D85A30] border-[#D85A30] text-white shadow-[0_0_15px_rgba(216,90,48,0.4)]"
                        : "bg-[#141414] border-zinc-800 text-zinc-400 hover:border-[#D85A30]/50 hover:text-white"
                    }`}
                  >
                    <Droplet size={10} fill={formData.units === unit ? "currentColor" : "none"} /> {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Urgency</label>
            <div className="grid grid-cols-2 gap-3">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: opt.value })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.urgency === opt.value
                      ? "bg-[#1a0f0d] border-[#E24B4A] shadow-[0_0_15px_rgba(226,75,74,0.2)]"
                      : "bg-[#141414] border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <div className={`font-bold text-sm mb-0.5 ${formData.urgency === opt.value ? "text-[#E24B4A]" : "text-zinc-300"}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* When Needed */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">When do you need it?</label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData({ ...formData, neededBy: time })}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                    formData.neededBy === time
                      ? "bg-[#D85A30]/20 border-[#D85A30] text-[#D85A30]"
                      : "bg-[#141414] border-zinc-800 text-zinc-400 hover:border-[#D85A30]/50 hover:text-white"
                  }`}
                >
                  <Clock size={12} className="inline mr-1" /> {time}
                </button>
              ))}
            </div>
          </div>

          {/* Hospital */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Hospital Name & Area</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hospital size={18} className="text-[#D85A30]" />
              </div>
              <input
                type="text"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="w-full bg-[#141414] text-white px-4 py-3.5 pl-11 rounded-xl border border-zinc-800 focus:border-[#D85A30] focus:ring-1 focus:ring-[#D85A30] outline-none transition-all"
                placeholder="e.g. Ruby Hall Clinic, Pune"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Additional Information (Optional)</label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="w-full bg-[#141414] text-white px-4 py-3 rounded-xl border border-zinc-800 focus:border-[#D85A30] focus:ring-1 focus:ring-[#D85A30] outline-none transition-all min-h-[80px] resize-none text-sm"
              placeholder="Any specific instructions for donors..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
            style={{
              background: "linear-gradient(90deg, #D85A30 0%, #E24B4A 100%)",
              boxShadow: "0 0 20px rgba(226,75,74,0.3)"
            }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                <span>Request Submit Karo</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default BloodRequestForm;
