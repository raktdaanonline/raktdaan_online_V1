import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { submitOrganizerEnquiry } from "../services/enquiryService";
import INDIAN_STATES from "../utils/indianStates";
import bgHeroImage from "../assets/image.png";
import { 
  User, Phone, Mail, Building2, Calendar, Clock, MapPin, 
  MessageSquare, ArrowRight, ArrowLeft, Heart, CheckCircle2, Lock, 
  Globe, ShieldCheck, Users, Droplet, Play, X
} from "lucide-react";

const OrganizerEnquiry = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    organizerName: "",
    phone: "",
    email: "",
    organizationType: "Personal",
    organizationName: "",
    preferredDate: "",
    preferredTime: "",
    area: "",
    state: "Maharashtra",
    city: "",
    address: "",
    pincode: "",
    expectedDonors: "50-100",
    venueAvailable: true,
    message: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelect = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return (
        form.organizerName.trim() !== "" &&
        form.phone.trim() !== "" &&
        form.email.trim() !== ""
      );
    }
    if (currentStep === 2) {
      return form.organizationType !== "";
    }
    if (currentStep === 3) {
      return (
        form.preferredDate.trim() !== "" &&
        form.state.trim() !== "" &&
        form.city.trim() !== "" &&
        form.address.trim() !== ""
      );
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep < 4 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isStepValid()) return;
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await submitOrganizerEnquiry(form);
      setSuccessMsg("Enquiry submitted successfully! We will contact you soon.");
      setCurrentStep(5);
    } catch (err) {
      setErrorMsg("Failed to submit enquiry. " + (err.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Personal Info" },
    { num: 2, title: "Organization" },
    { num: 3, title: "Camp Details" },
    { num: 4, title: "Review & Submit" }
  ];

  const stats = [
    {
      icon: Users,
      value: "10K+",
      label: "Lives Saved"
    },
    {
      icon: Heart,
      value: "5K+",
      label: "Happy Donors"
    },
    {
      icon: Building2,
      value: "50+",
      label: "Partner Hospitals"
    },
    {
      icon: Droplet,
      value: "100+",
      label: "Blood Camps"
    }
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Safe & Secure",
      desc: "100% safe donation process with medical professionals"
    },
    {
      icon: Users,
      title: "Professional Support",
      desc: "Expert medical team and guidance"
    },
    {
      icon: MapPin,
      title: "Trusted Network",
      desc: "Partnered with certified blood banks"
    },
    {
      icon: Calendar,
      title: "Organize a Camp",
      desc: "Bring your community together"
    }
  ];

  return (
    <div className="min-h-screen bg-[#090907] text-[#e8e8e8] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#699073] selection:text-[#090907] relative overflow-hidden">
      
      {/* ============================================================== */}
      {/* HERO BACKGROUND IMAGE (c:\...\Frontend\src\assets\image.png)   */}
      {/* ============================================================== */}
      <div className="absolute top-0 left-0 w-full h-[900px] pointer-events-none z-0 overflow-hidden">
        <img 
          src={bgHeroImage} 
          alt="Blood Donation Background" 
          className="w-full h-full object-cover object-center min-w-[1200px] brightness-[0.98] contrast-[1.02]"
        />
        {/* Soft atmospheric gradient transitions to blend into #090907 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090907]/40 via-transparent to-[#090907]" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#090907] to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#090907]/60 pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-24 lg:pt-28 pb-12 relative z-10">
        
        {/* HERO GRID (Left text & stats + Center visual space + Right Form Card) */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Cursive Calligraphy Script ("Give Blood Give Hope ♡") */}
          <div className="hidden lg:block absolute left-[51%] xl:left-[50%] top-[25px] pointer-events-none z-20 text-right font-['Caveat',cursive] leading-tight select-none">
            <span className="text-[#cca062] text-2xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] block">
              Give
            </span>
            <span className="text-[#cca062] text-2xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] block -mt-1">
              Blood <span className="text-sm">✦</span>
            </span>
            <span className="text-[#cca062] text-2xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] block">
              Give Hope
            </span>
            <span className="text-[#cca062] text-xl block -mt-1">
              ♡
            </span>
          </div>

          {/* LEFT COLUMN: Hero Content & Stats Bar */}
          <div className="lg:col-span-7 flex flex-col justify-between relative z-10 space-y-7 lg:pr-4">
            
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181611]/80 text-[#cca062] text-[11px] font-bold tracking-widest uppercase backdrop-blur-md shadow-sm w-max"
              style={{ border: "1px solid rgba(96, 86, 54, 0.3)" }}
            >
              <Heart className="w-3.5 h-3.5 fill-[#cca062] text-[#cca062]" />
              <span>Donate • Support • Save Lives</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.08]">
                Your Blood
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#c88d4e] tracking-tight leading-[1.08] mt-1">
                Can Save Lives
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-zinc-300/90 text-sm sm:text-base max-w-md leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              A single act of kindness can save up to 3 lives. Join our blood donation camp and help build a healthier, stronger community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              <button
                type="button"
                onClick={scrollToForm}
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#8c5025] hover:bg-[#9c5a2c] text-white font-semibold text-sm shadow-[0_4px_25px_rgba(140,80,37,0.4)] border border-[#a86532]/40 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4 text-amber-100" />
                <span>Organize a Blood Camp</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="group flex items-center gap-3 text-left py-1.5 px-2 rounded-xl transition-all"
              >
                <div className="w-11 h-11 rounded-full border border-[#699073] bg-[#141815]/90 group-hover:bg-[#699073]/20 flex items-center justify-center transition-all backdrop-blur-sm shadow-md">
                  <Play className="w-4 h-4 text-[#699073] fill-[#699073] ml-0.5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="block text-white text-sm font-semibold group-hover:text-[#699073] transition-colors leading-tight">
                    Watch Video
                  </span>
                  <span className="block text-zinc-400 text-xs font-normal">
                    See the Impact
                  </span>
                </div>
              </button>
            </div>

            {/* Stats Bar Container */}
            <div 
              className="organizer-stats-card bg-[#14130f]/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl mt-4"
              style={{ border: "1px solid rgba(96, 86, 54, 0.22)" }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-2">
                      <div className="w-12 h-12 rounded-full bg-[#463825] border border-[#605636]/60 flex items-center justify-center shrink-0 shadow-inner">
                        <Icon className="w-5 h-5 text-[#caa062]" />
                      </div>
                      <div>
                        <div className="text-lg sm:text-xl font-bold text-white leading-tight">
                          {stat.value}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Multi-Step Form Card */}
          <div ref={formRef} className="lg:col-span-5 relative z-10">
            <div 
              className="organizer-form-card bg-[#14130f]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative"
              style={{ border: "1px solid rgba(96, 86, 54, 0.22)" }}
            >
              
              {/* Stepper Header (4 Steps) */}
              {currentStep < 5 && (
                <div className="relative mb-7">
                  {/* Connecting Line */}
                  <div className="absolute top-5 left-6 right-6 h-[1px] bg-zinc-800 -z-0" />
                  
                  <div className="flex items-start justify-between relative z-10">
                    {steps.map((s) => {
                      const isActive = s.num === currentStep;
                      const isCompleted = s.num < currentStep;

                      return (
                        <div 
                          key={s.num} 
                          onClick={() => {
                            if (isCompleted) setCurrentStep(s.num);
                          }}
                          className={`flex flex-col items-center group ${isCompleted ? "cursor-pointer" : ""}`}
                        >
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isActive
                                ? "bg-[#699073] text-[#090907] font-black shadow-[0_0_20px_rgba(105,144,115,0.5)] ring-4 ring-[#699073]/20"
                                : isCompleted
                                ? "bg-[#252f28] text-[#699073] border border-[#699073]/50"
                                : "bg-[#201e18] text-zinc-500 border border-[#3e3828]"
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                          </div>
                          
                          <span 
                            className={`text-[10px] sm:text-[11px] font-semibold mt-2 text-center transition-colors ${
                              isActive 
                                ? "text-[#699073]" 
                                : isCompleted 
                                ? "text-zinc-300" 
                                : "text-zinc-500"
                            }`}
                          >
                            {s.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-medium animate-fade-in">
                  {errorMsg}
                </div>
              )}

              {/* STEP 1: Personal Information */}
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      Let's start with your <br />
                      <span className="text-[#699073]">personal information</span>
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                      Fill in your details to organize a successful blood donation camp.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Top Row: Organizer Name & Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Organizer Name */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="organizerName"
                          value={form.organizerName}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          className="w-full pl-10 pr-3 py-3 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] focus:ring-1 focus:ring-[#699073] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 outline-none transition-all"
                          required
                        />
                        <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[10px] font-semibold text-zinc-400">
                          Organizer Name *
                        </label>
                      </div>

                      {/* Phone Number */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="w-full pl-10 pr-3 py-3 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] focus:ring-1 focus:ring-[#699073] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 outline-none transition-all"
                          required
                        />
                        <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[10px] font-semibold text-zinc-400">
                          Phone Number *
                        </label>
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="w-full pl-10 pr-3 py-3 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] focus:ring-1 focus:ring-[#699073] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 outline-none transition-all"
                        required
                      />
                      <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[10px] font-semibold text-zinc-400">
                        Email Address *
                      </label>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                      <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Your information is safe with us and will not be shared.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Organization */}
              {currentStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      Tell us about your <br />
                      <span className="text-[#699073]">organization</span>
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                      Choose organization category and provide relevant info.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-zinc-400 text-xs font-semibold mb-2.5 block">
                        Organization Type *
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {['Personal', 'College', 'Corporate', 'NGO', 'Society'].map((type) => {
                          const isSelected = form.organizationType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleSelect('organizationType', type)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-[#699073] text-[#090907] shadow-[0_0_15px_rgba(105,144,115,0.4)]"
                                  : "bg-[#201e18] text-zinc-400 border border-[#383324] hover:border-[#699073]/50 hover:text-white"
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="relative pt-2">
                      <div className="absolute inset-y-0 left-0 pl-3.5 pt-2 flex items-center pointer-events-none text-[#cca062]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="organizationName"
                        value={form.organizationName}
                        onChange={handleChange}
                        placeholder="Enter organization / institute name"
                        className="w-full pl-10 pr-3 py-3 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] focus:ring-1 focus:ring-[#699073] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 outline-none transition-all"
                      />
                      <label className="absolute top-0 left-3 bg-[#14130f] px-1 text-[10px] font-semibold text-zinc-400">
                        Organization Name (Optional)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Camp Details */}
              {currentStep === 3 && (
                <div className="animate-fade-in space-y-3.5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      Provide the <br />
                      <span className="text-[#699073]">camp details</span>
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
                      Specify the location, date, and expected donors.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        name="preferredDate"
                        value={form.preferredDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] rounded-xl text-xs text-white placeholder-zinc-600 outline-none [color-scheme:dark]"
                        required
                      />
                      <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[9px] font-semibold text-zinc-400">
                        Preferred Date *
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="preferredTime"
                        value={form.preferredTime}
                        onChange={handleChange}
                        placeholder="e.g. 10 AM - 4 PM"
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] rounded-xl text-xs text-white placeholder-zinc-600 outline-none"
                      />
                      <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[9px] font-semibold text-zinc-400">
                        Time Slot (Optional)
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <select
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] rounded-xl text-xs text-white outline-none cursor-pointer"
                        required
                      >
                        <option value="">Select State *</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[9px] font-semibold text-zinc-400">
                        State *
                      </label>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] rounded-xl text-xs text-white placeholder-zinc-600 outline-none"
                        required
                      />
                      <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[9px] font-semibold text-zinc-400">
                        City *
                      </label>
                    </div>

                    <div className="relative sm:col-span-2">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#cca062]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => ({ ...prev, address: val, area: val }));
                        }}
                        placeholder="Enter full venue address"
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] rounded-xl text-xs text-white placeholder-zinc-600 outline-none"
                        required
                      />
                      <label className="absolute -top-2 left-3 bg-[#14130f] px-1 text-[9px] font-semibold text-zinc-400">
                        Venue / Full Address *
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-xs font-semibold mb-1.5 block">
                      Expected Donors *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['10-25', '25-50', '50-100', '100-200', '200+'].map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => handleSelect('expectedDonors', range)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            form.expectedDonors === range
                              ? "bg-[#699073] text-[#090907]"
                              : "bg-[#201e18] text-zinc-400 border border-[#383324] hover:text-white"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 text-xs font-semibold mb-1.5 block">
                      Do you have a venue available? *
                    </label>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSelect('venueAvailable', true)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          form.venueAvailable
                            ? "bg-[#699073] text-[#090907]"
                            : "bg-[#201e18] text-zinc-400 border border-[#383324]"
                        }`}
                      >
                        {form.venueAvailable && <CheckCircle2 className="w-3.5 h-3.5" />}
                        Yes, I have
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelect('venueAvailable', false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          !form.venueAvailable
                            ? "bg-[#8c5025] text-white"
                            : "bg-[#201e18] text-zinc-400 border border-[#383324]"
                        }`}
                      >
                        {!form.venueAvailable && <CheckCircle2 className="w-3.5 h-3.5" />}
                        No, need help
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      Review & <span className="text-[#699073]">Submit</span>
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                      Check your submitted info before completing the enquiry.
                    </p>
                  </div>

                  <div className="bg-[#0d0d0a] border border-[#383324] rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-zinc-400">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Organizer Name</span>
                        <span className="text-white font-medium">{form.organizerName || "-"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Phone</span>
                        <span className="text-white font-medium">{form.phone || "-"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-500 block text-[10px]">Email</span>
                        <span className="text-white font-medium">{form.email || "-"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Organization</span>
                        <span className="text-white font-medium">{form.organizationType} {form.organizationName ? `(${form.organizationName})` : ''}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Date</span>
                        <span className="text-white font-medium">{form.preferredDate || "-"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Location</span>
                        <span className="text-white font-medium">{form.city}, {form.state}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-500 block text-[10px]">Address</span>
                        <span className="text-white font-medium">{form.address || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="absolute top-4 left-0 pl-3.5 flex items-start pointer-events-none text-[#cca062]">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Any special requirements or instructions for our team?"
                      rows={3}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#0d0d0a] border border-[#383324] focus:border-[#699073] rounded-xl text-xs text-white placeholder-zinc-600 outline-none resize-none"
                    />
                    <label className="absolute top-0 left-3 bg-[#14130f] px-1 text-[10px] font-semibold text-zinc-400">
                      Additional Message (Optional)
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: Success Screen */}
              {currentStep === 5 && (
                <div className="animate-fade-in text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#699073]/20 border border-[#699073] mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(105,144,115,0.3)]">
                    <CheckCircle2 className="w-9 h-9 text-[#699073]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Enquiry Submitted!</h3>
                    <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                      Thank you for taking the initiative to organize a blood camp. Our coordination team will reach out to you within 24-48 hours.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#699073] hover:bg-[#7ca887] text-[#090907] font-bold text-sm transition-all shadow-md"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}

              {/* Footer Step Navigation Buttons */}
              {currentStep < 5 && (
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#605636]/25">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-zinc-400 font-semibold text-xs sm:text-sm border border-[#383324] hover:bg-[#201e18] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#699073] hover:bg-[#7ba685] text-[#090907] font-bold text-xs sm:text-sm shadow-[0_2px_15px_rgba(105,144,115,0.35)] transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || !isStepValid()}
                      className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#699073] hover:bg-[#7ba685] text-[#090907] font-bold text-xs sm:text-sm shadow-[0_2px_20px_rgba(105,144,115,0.4)] transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>{loading ? "Submitting..." : "Submit Enquiry"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Login Link */}
              {currentStep < 5 && (
                <div className="mt-5 text-center text-xs text-zinc-500">
                  Already registered?{" "}
                  <Link 
                    to="/organizer-login" 
                    className="text-[#699073] hover:text-[#7ba685] hover:underline font-bold transition-all ml-1"
                  >
                    Organizer Login
                  </Link>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: 4 Feature Cards (Spans across entire container) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 mt-10 lg:mt-12">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="organizer-feature-card group p-4 rounded-2xl bg-[#14130f]/85 hover:bg-[#181713] transition-all duration-300 flex items-center justify-between gap-3 shadow-lg cursor-pointer backdrop-blur-md"
                style={{ border: "1px solid rgba(96, 86, 54, 0.22)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#699073]/20 border border-[#699073]/40 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#699073]/30 transition-all">
                    <Icon className="w-5 h-5 text-[#699073]" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold group-hover:text-[#699073] transition-colors leading-snug">
                      {feat.title}
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="text-zinc-600 group-hover:text-[#699073] group-hover:translate-x-1 transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14130f] border border-[#605636]/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-4 border-b border-[#605636]/20">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#cca062] fill-[#cca062]" />
                <h3 className="text-white font-bold text-sm">Blood Donation Awareness</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/1_1hQ1z8x1k?autoplay=1"
                title="Blood Donation Camp Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Styles & Animation */}
      <style>{`
        .organizer-form-card,
        .organizer-stats-card,
        .organizer-feature-card {
          border: 1px solid rgba(96, 86, 54, 0.22) !important;
        }
        .organizer-feature-card:hover {
          border-color: rgba(105, 144, 115, 0.5) !important;
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  );
};

export default OrganizerEnquiry;