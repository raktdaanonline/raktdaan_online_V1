import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import {
  Droplet,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Building,
  Mail,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Phone,
} from "lucide-react";

export default function HospitalRegistration() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Verification states
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState(null);
  const [invitationData, setInvitationData] = useState(null);

  // Form states
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError({
          title: "Missing Invitation Token",
          message: "No registration token found in URL. Please click the full link sent to your email.",
        });
        setValidating(false);
        return;
      }

      try {
        setValidating(true);
        const res = await api.get(`/hospital/invitation/${token}`);
        if (res.data.success) {
          setInvitationData(res.data);
          setTokenError(null);
        }
      } catch (err) {
        console.error("Token verification error:", err);
        const resData = err.response?.data;
        setTokenError({
          title: "Invitation Token Notice",
          message:
            resData?.message ||
            "This invitation link is invalid or has expired. Please contact the platform administration for a fresh invitation.",
          code: resData?.code,
        });
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // GPS Auto-detect
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGpsDetecting(false);
        toast.success("GPS Coordinates retrieved successfully!", { icon: "📍" });
      },
      (error) => {
        setGpsDetecting(false);
        console.error("Geolocation error:", error);
        toast.error("Unable to access GPS location. Please type coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address.trim()) {
      toast.error("Please enter the complete physical hospital address");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be a valid number between -90 and 90");
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be a valid number between -180 and 180");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/hospital/register", {
        token,
        address: address.trim(),
        latitude: lat,
        longitude: lng,
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      if (res.data.success) {
        setIsSuccess(true);
        toast.success("Registration submitted for review!", { icon: "📋", duration: 5000 });
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        err.response?.data?.message || "Registration failed. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between font-sans text-slate-800 bg-slate-100 selection:bg-red-500 selection:text-white">
      {/* Background Hospital Room Image with Clean, Soft Light Wash */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/hospital-bg.jpg')" }}
      >
        {/* Soft, clean light wash so the hospital image is clearly visible without dark overlays */}
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px]" />
      </div>

      {/* Global Top Header */}
      <header className="relative z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
            <Droplet className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">Raktdaan</span>
              <span className="font-extrabold text-red-600 tracking-tight text-lg">LifeDrop</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Hospital Clinical Onboarding
            </span>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition shadow-xs flex items-center gap-1"
        >
          <span>Staff Login</span>
          <span>&rarr;</span>
        </Link>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        {/* State 1: Validating Token */}
        {validating && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Verifying Invitation Token</h2>
            <p className="text-xs text-slate-500">
              Checking token validity and loading designated hospital profile...
            </p>
          </div>
        )}

        {/* State 2: Token Error / Expired / Invalid */}
        {!validating && tokenError && (
          <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">{tokenError.title}</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">{tokenError.message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition"
              >
                Go to Hospital Login
              </Link>
              <a
                href="mailto:support@raktdaan.online"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
              >
                Contact Platform Admin
              </a>
            </div>
          </div>
        )}

        {/* State 3: Registration Success Banner */}
        {!validating && isSuccess && (
          <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-10 max-w-xl w-full text-center shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9" />
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Registration Request Received
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3 mb-2">Hospital Account Pending Approval</h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 my-5 text-left text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                Your hospital registration request for{" "}
                <strong className="text-slate-900">{invitationData?.hospitalName}</strong> has been submitted
                successfully.
              </p>
              <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Your account is currently in PENDING status awaiting Administrator verification.</span>
              </p>
              <p className="text-xs text-slate-500">
                You will receive an official approval email once your registration is reviewed and activated. You
                cannot log in until authorization is finalized.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition"
            >
              <span>Go to Hospital Login Desk</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* State 4: Registration Form (Crisp White Theme) */}
        {!validating && !tokenError && !isSuccess && invitationData && (
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-fadeIn">
            {/* Form Top Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-red-50/60 via-white to-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-100 text-red-700 border border-red-200">
                  Step 2 of 2: Hospital Onboarding
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Complete Hospital Registration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Verify your institutional credentials, set physical coordinates, and establish console access.
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              {/* Pre-filled Read-Only Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90">
                {/* Hospital Name (Read-only) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-red-600" />
                    <span>Hospital Name (Verified)</span>
                  </label>
                  <input
                    type="text"
                    value={invitationData.hospitalName}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 cursor-not-allowed select-none shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Configured by Admin invitation</span>
                </div>

                {/* Hospital Email (Read-only) */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    <span>Invited Email (Read-Only)</span>
                  </label>
                  <input
                    type="email"
                    value={invitationData.email}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-700 cursor-not-allowed select-none shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Official communication desk</span>
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Complete Physical Address <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Plot No. 40, Sassoon Road, Near Pune Railway Station, Pune, Maharashtra 411001"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
                ></textarea>
              </div>

              {/* Coordinates Section with Auto GPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Triage Geographical Coordinates <span className="text-red-600">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={gpsDetecting}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition shadow-xs"
                  >
                    <Navigation className={`w-3 h-3 ${gpsDetecting ? "animate-spin" : ""}`} />
                    <span>{gpsDetecting ? "Detecting..." : "Detect Current GPS"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Latitude (-90 to 90)"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block font-medium">Latitude (-90.0 to 90.0)</span>
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Longitude (-180 to 180)"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block font-medium">Longitude (-180.0 to 180.0)</span>
                  </div>
                </div>
              </div>

              {/* Contact Phone (Optional) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  <span>Emergency Desk Helpline / Phone (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 20 6645 5100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                      <span>Create Password <span className="text-red-600">*</span></span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Min 6 chars</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Confirm Password <span className="text-red-600">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Registration Application...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Hospital Registration</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500 leading-normal">
                By submitting this registration, you confirm that you are an authorized representative of{" "}
                <span className="text-slate-800 font-bold">{invitationData.hospitalName}</span>. Your registration will
                be reviewed by the Platform Administration before account activation.
              </p>
            </form>
          </div>
        )}
      </main>

      {/* Global Clean Light Footer */}
      <footer className="relative z-10 bg-white/90 backdrop-blur-md border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Raktdaan LifeDrop Healthcare Network. All rights reserved.
      </footer>
    </div>
  );
}
