import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import campService from "../services/campService";
import donorService from "../services/donorService";
import emailjs from "@emailjs/browser";
import logo from "../assets/images/blood donor.png";
import donarBg from "../assets/donar.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ Fast Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// EmailJS config from env (don't hardcode keys)
const EMAILJS_USER = import.meta.env.VITE_EMAILJS_USER || "";
const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE || "";
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE || "";

/** ✅ helpers to avoid timezone shift for yyyy-mm-dd */
const parseYMDToLocalDate = (ymd) => {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDateToYMD = (dateObj) => {
  if (!dateObj) return "";
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Shared input class — dark theme
const inputCls =
  "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200";

const DonorRegistration = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const campIdFromUrl = query.get("campId");

  const [camps, setCamps] = useState([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    weight: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: "",
    camp: "",
  });

  const [calculatedAge, setCalculatedAge] = useState(null);
  const [campLocked, setCampLocked] = useState(false);
  const [campNotice, setCampNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Toasts
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const notify = ({
    type = "info",
    title = "Notice",
    message = "",
    duration = 2500,
  }) => {
    const id =
      (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
      `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration !== null) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const toastMeta = (type) => {
    switch (type) {
      case "success": return { icon: "✅", bar: "#16a34a" };
      case "danger":  return { icon: "❌", bar: "#dc2626" };
      case "warning": return { icon: "⚠️", bar: "#f59e0b" };
      default:        return { icon: "ℹ️", bar: "#2563eb" };
    }
  };

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const isUpcoming = (isoDateString) => {
    if (!isoDateString) return false;
    try {
      const today = startOfDay(new Date());
      const campDay = startOfDay(new Date(isoDateString));
      return campDay.getTime() >= today.getTime();
    } catch { return false; }
  };

  const maxDobDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  })();

  const minDobDate = new Date(1950, 0, 1);

  useEffect(() => {
    if (!EMAILJS_USER) return;
    try { emailjs.init(EMAILJS_USER); }
    catch (err) { console.warn("EmailJS init failed:", err); }
  }, []);

  useEffect(() => {
    const fetchCamps = async () => {
      setLoadingCamps(true);
      setCampNotice("");
      try {
        const data = await campService.getCamps();
        const allCamps = Array.isArray(data) ? data : [];
        const upcoming = allCamps
          .filter((c) => isUpcoming(c?.date))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setCamps(upcoming);
        if (campIdFromUrl) {
          const selected = upcoming.find((c) => c._id === campIdFromUrl);
          if (selected) {
            setFormData((prev) => ({ ...prev, camp: selected._id }));
            setCampLocked(true);
          } else {
            setCampNotice("The camp link you followed is no longer available or already completed. Please pick another upcoming camp.");
            setCampLocked(false);
          }
        } else {
          if (upcoming.length === 1) {
            setFormData((prev) => ({ ...prev, camp: upcoming[0]._id }));
          }
        }
      } catch (err) {
        console.error("Error fetching camps:", err);
        setCamps([]);
        setCampNotice("Unable to load camps right now. Please try later.");
        notify({ type: "danger", title: "Error", message: "Unable to load camps. Please try again later." });
      } finally {
        setLoadingCamps(false);
      }
    };
    fetchCamps();
  }, [campIdFromUrl]);

  const calculateAge = (dobValue) => {
    if (!dobValue) return null;
    const birthDate = parseYMDToLocalDate(dobValue);
    if (!birthDate || Number.isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  useEffect(() => {
    if (formData.dob) setCalculatedAge(calculateAge(formData.dob));
    else setCalculatedAge(null);
  }, [formData.dob]);

  const handleChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;
    if (typeof value === "string") value = value.trimStart();
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const name = formData.name?.trim();
    if (!name) { notify({ type: "warning", title: "Validation", message: "Please enter your full name." }); return false; }
    const age = calculateAge(formData.dob);
    if (!age || age < 18) { notify({ type: "warning", title: "Validation", message: "Minimum age 18 required." }); return false; }
    const weight = Number(formData.weight);
    if (Number.isNaN(weight) || weight < 50) { notify({ type: "warning", title: "Validation", message: "Minimum weight 50kg required." }); return false; }
    if (!formData.bloodGroup) { notify({ type: "warning", title: "Validation", message: "Please select your blood group." }); return false; }
    const phoneRaw = (formData.phone || "").replace(/\s+/g, "");
    if (!phoneRaw || phoneRaw.length < 6 || !/^[0-9+()-]{6,}$/.test(phoneRaw)) { notify({ type: "warning", title: "Validation", message: "Please enter a valid phone number." }); return false; }
    if (!formData.camp) { notify({ type: "warning", title: "Validation", message: "Please select a camp." }); return false; }
    if (!camps.some((c) => c._id === formData.camp)) { notify({ type: "warning", title: "Validation", message: "Selected camp is no longer available. Please choose another." }); return false; }
    return true;
  };

  const sendEmail = async (donorData, ageToSend) => {
    if (!EMAILJS_SERVICE || !EMAILJS_TEMPLATE) { console.info("EmailJS not configured."); return; }
    try {
      const campName = camps.find((c) => c._id === donorData.camp)?.name || "Selected Camp";
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
        to_email: donorData.email,
        donor_name: donorData.name,
        donor_age: ageToSend,
        donor_weight: donorData.weight,
        donor_blood_group: donorData.bloodGroup,
        donor_phone: donorData.phone,
        donor_address: donorData.address,
        donor_camp: campName,
        registration_date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      notify({ type: "info", title: "Info", message: "Registration done. Email could not be sent (optional)." });
    }
  };

  const generateReceiptPDF = (donorPayload) => {
    const doc = new jsPDF();
    const camp = camps.find((c) => c._id === donorPayload.camp);
    const campName = camp?.name || "N/A";
    const campDate = camp?.date ? new Date(camp.date).toLocaleDateString() : "N/A";
    const campLocation = camp?.location || "N/A";
    const organizer = camp?.organizerName || "N/A";
    const organizerContact = camp?.organizerContact || "N/A";
    const pro = camp?.proName || "N/A";
    const hospital = camp?.hospitalName || "N/A";
    const campId = camp?._id || "N/A";
    const regDate = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text("Blood Donation Registration Receipt", 14, 15);
    doc.setFontSize(11);
    doc.text(`Generated: ${regDate}`, 14, 22);
    doc.setFontSize(13);
    doc.text("Camp Details", 14, 32);

    autoTable(doc, {
      startY: 36,
      head: [["Field", "Value"]],
      body: [
        ["Camp Name", campName], ["Camp Date", campDate], ["Location", campLocation],
        ["Organizer", organizer], ["Organizer Contact", organizerContact],
        ["PRO", pro], ["Hospital", hospital], ["Camp ID", campId],
      ],
      styles: { fontSize: 10 },
    });

    const afterCampY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.text("Donor Details", 14, afterCampY);

    autoTable(doc, {
      startY: afterCampY + 4,
      head: [["Field", "Value"]],
      body: [
        ["Name", donorPayload.name || ""],
        ["DOB", donorPayload.dob ? new Date(donorPayload.dob).toLocaleDateString() : "N/A"],
        ["Age", String(donorPayload.age ?? "")],
        ["Weight (kg)", String(donorPayload.weight ?? "")],
        ["Blood Group", donorPayload.bloodGroup || ""],
        ["Email", donorPayload.email || "N/A"],
        ["Phone", donorPayload.phone || ""],
        ["Address", donorPayload.address || ""],
      ],
      styles: { fontSize: 10 },
    });

    const afterDonorY = doc.lastAutoTable.finalY + 10;
    if (campLocation !== "N/A") {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campLocation)}`;
      doc.setFontSize(11);
      doc.text("Camp Location (Google Maps):", 14, afterDonorY);
      doc.setTextColor(0, 0, 255);
      doc.textWithLink(mapsUrl, 14, afterDonorY + 6, { url: mapsUrl });
      doc.setTextColor(0, 0, 0);
    }

    doc.save(`Receipt_${donorPayload.name}_${campName}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const finalAge = calculateAge(formData.dob);
    if (!finalAge || finalAge < 18) {
      notify({ type: "warning", title: "Validation", message: "Minimum age 18 required." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        age: finalAge,
        weight: Number(formData.weight),
        dob: formData.dob ? new Date(parseYMDToLocalDate(formData.dob)).toISOString() : undefined,
        bloodGroup: formData.bloodGroup,
        email: formData.email ? formData.email.trim() : "",
        phone: formData.phone ? formData.phone.trim() : "",
        address: formData.address ? formData.address.trim() : "",
        camp: formData.camp,
      };
      await donorService.registerDonor(payload);
      generateReceiptPDF(payload);
      sendEmail(payload, finalAge);
      notify({ type: "success", title: "Registered", message: "🎉 Registration successful! Receipt PDF downloaded ✅", duration: 3500 });
      setFormData((prev) => ({
        name: "", dob: "", weight: "", bloodGroup: "",
        email: "", phone: "", address: "", camp: campLocked ? prev.camp : "",
      }));
      setCalculatedAge(null);
    } catch (err) {
      console.error("Error submitting donor:", err);
      const msg = err?.response?.data?.message || "Error submitting form. Please try again later.";
      notify({ type: "danger", title: "Failed", message: msg, duration: 4000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* ── Fixed fullscreen background ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${donarBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />
      {/* ── Dark overlay ── */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1 }} />

      {/* ── Scrollable content ── */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-28" style={{ zIndex: 2 }}>

      {/* ── Toast Styles ── */}
      <style>{`
        .dr-toast-wrap{
          position:fixed; top:20px; right:20px; z-index:9999;
          display:flex; flex-direction:column; gap:10px; pointer-events:none;
        }
        .dr-toast{
          pointer-events:auto; min-width:280px; max-width:380px;
          background:#1e1e1e; border-radius:14px; border:1px solid rgba(255,255,255,.08);
          box-shadow:0 12px 30px rgba(0,0,0,.5); overflow:hidden;
          animation:drSlideIn .18s ease-out;
        }
        @keyframes drSlideIn{ from{transform:translateY(-8px);opacity:0} to{transform:translateY(0);opacity:1} }
        .dr-toast-bar{height:4px;}
        .dr-toast-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 6px;}
        .dr-toast-left{display:flex;align-items:center;gap:8px;}
        .dr-toast-title{font-weight:700;font-size:14px;color:#fff;}
        .dr-toast-body{padding:0 12px 12px;font-size:13px;color:#ccc;line-height:1.35;word-break:break-word;}
        .dr-toast-close{border:0;background:transparent;font-size:18px;cursor:pointer;line-height:1;color:#aaa;}
        .react-datepicker-wrapper{width:100%;}
        .react-datepicker__input-container input{
          width:100%; padding:12px 16px; border-radius:12px;
          border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05);
          font-size:14px; color:#fff; outline:none;
          transition:all .2s;
        }
        .react-datepicker__input-container input:focus{
          border-color:transparent; box-shadow:0 0 0 2px #e11d48;
        }
        .react-datepicker__input-container input::placeholder{color:rgba(255,255,255,0.3);}
        .dr-select option { background:#1a1a2e; color:#fff; }
      `}</style>

      {/* ── Toast Container ── */}
      <div className="dr-toast-wrap">
        {toasts.map((t) => {
          const meta = toastMeta(t.type);
          return (
            <div key={t.id} className="dr-toast">
              <div className="dr-toast-bar" style={{ background: meta.bar }} />
              <div className="dr-toast-head">
                <div className="dr-toast-left">
                  <span>{meta.icon}</span>
                  <div className="dr-toast-title">{t.title}</div>
                </div>
                <button className="dr-toast-close" onClick={() => removeToast(t.id)} aria-label="Close">×</button>
              </div>
              <div className="dr-toast-body">{t.message}</div>
            </div>
          );
        })}
      </div>

      {/* ── Main Card ── */}
      <div className="w-full max-w-2xl relative z-10">
        <div
          className="shine rounded-[32px] p-8 md:p-10"
          style={{
            background: "rgba(10,10,20,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          }}
        >

          {/* ── Header ── */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:"rgba(225,29,72,0.15)",border:"1px solid rgba(225,29,72,0.3)"}}>
              <span className="text-3xl">🩸</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Donor <span className="text-red-500">Registration</span></h1>
            <p className="text-white/50 text-sm">Join our life-saving community — every drop counts</p>
          </div>

          {/* ── Camp Notice ── */}
          {campNotice && (
            <div className="mb-5 px-4 py-3 rounded-xl text-amber-300 text-sm font-medium flex items-start gap-2" style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.25)"}}>
              <span className="mt-0.5">⚠️</span>
              <span>{campNotice}</span>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Row 1 — Full Name */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Full Name *</label>
              <input className={inputCls} name="name" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={handleChange} required />
            </div>

            {/* Row 2 — DOB + Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Date of Birth *</label>
                <DatePicker
                  selected={parseYMDToLocalDate(formData.dob)}
                  onChange={(date) => { const ymd = formatDateToYMD(date); setFormData((prev) => ({ ...prev, dob: ymd })); }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select DOB (18+ only)"
                  showMonthDropdown showYearDropdown dropdownMode="select"
                  yearDropdownItemNumber={80} scrollableYearDropdown
                  maxDate={maxDobDate} minDate={minDobDate}
                />
                {calculatedAge !== null && (
                  <p className="mt-1.5 text-xs font-semibold text-emerald-400 flex items-center gap-1">✓ Age: {calculatedAge} years</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Weight (kg) *</label>
                <input className={inputCls} name="weight" type="number" placeholder="Min. 50 kg" value={formData.weight} onChange={handleChange} required min="0" />
              </div>
            </div>

            {/* Row 3 — Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Blood Group *</label>
              <select className={`${inputCls} dr-select`} name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="">Select Blood Group</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-","Don't Know"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Row 4 — Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Email</label>
                <input className={inputCls} name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Phone Number *</label>
                <input className={inputCls} name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            {/* Row 5 — Address */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Address *</label>
              <textarea className={`${inputCls} resize-none`} name="address" placeholder="Your full address..." value={formData.address} onChange={handleChange} rows="2" required />
            </div>

            {/* Row 6 — Camp Selection */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Select Blood Donation Camp *</label>
              <select
                className={`${inputCls} dr-select ${campLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                name="camp" value={formData.camp} onChange={handleChange} required disabled={campLocked || loadingCamps}
              >
                {loadingCamps ? (
                  <option value="" disabled>Loading camps...</option>
                ) : camps.length === 0 ? (
                  <option value="" disabled>No upcoming camps available</option>
                ) : (
                  <>
                    {!campLocked && <option value="">Choose an upcoming camp</option>}
                    {camps.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} — {c.date ? new Date(c.date).toLocaleDateString() : "TBA"}</option>
                    ))}
                  </>
                )}
              </select>
              {campLocked && (
                <p className="mt-1.5 text-xs text-red-400 font-medium flex items-center gap-1">🔒 Camp is pre-selected from your link</p>
              )}
            </div>

            {/* ── Submit Button ── */}
            <button
              type="submit" disabled={submitting}
              className="w-full py-4 rounded-xl text-white font-bold text-base cursor-pointer border-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(225,29,72,0.45)] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: "linear-gradient(135deg,#e11d48,#dc2626)" }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Registering...
                </span>
              ) : "🩸 Register as Donor"}
            </button>
          </form>

          {/* ── Footer ── */}
          <p className="mt-6 text-center text-white/25 text-xs">
            🔒 Your information is secure. A receipt PDF will be downloaded after registration.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DonorRegistration;
