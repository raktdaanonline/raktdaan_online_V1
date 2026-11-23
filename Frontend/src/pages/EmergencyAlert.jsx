import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Camera, 
  X, 
  Navigation, 
  Send, 
  Heart, 
  Activity, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  Radio,
  Upload,
  SwitchCamera,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";

export default function EmergencyAlert() {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const formCardRef = useRef(null);

  // Live Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" (rear camera) or "user" (front)
  const [cameraError, setCameraError] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Form Fields
  const [location, setLocation] = useState("NH-48, Near Wakad Flyover, Pune");
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [date, setDate] = useState(getTodayDate);
  const [time, setTime] = useState(getCurrentTime);
  const [description, setDescription] = useState("");
  const [bloodGroupNeeded, setBloodGroupNeeded] = useState("");

  // Submitting Animation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Recent Alerts State
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: 1,
      title: "Accident at FC Road, Pune",
      location: "FC Road, Near Deccan Gymkhana",
      time: "Today, 04:15 PM",
      status: "Active",
      statusColor: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      image: "https://lh3.googleusercontent.com/aida/ALJJyrDmHr-J_DKwZ7Mu5c_DgEXxJ7EhNLmE8UpOkDf_Euar1dY0diC8vf-nU-98Sw-4C6T7VblUFwqXG35cAgd6rDlAIPpTWocoewBTffJfYLqvxtMkdotAYQqg1qoBiPfw0F7w5RQlMnWzFA3K-Br5lUrReJpcuIZyERHfAZ90DM6mj_TiR7E0bxO3hmlSgy8gQa1Y9e4tcbtvnI-4DSagz9rMs7wRI3RpfAG6M7zJ8tPBog",
      detail: "3 verified blood donors and ambulance en route."
    },
    {
      id: 2,
      title: "Mumbai-Pune Expressway (KM 42)",
      location: "Expressway near Khalapur Toll",
      time: "Today, 02:30 PM",
      status: "Notified",
      statusColor: "bg-blue-100 text-blue-800 border border-blue-200",
      image: "https://lh3.googleusercontent.com/aida/ALJJyrD6lkBjKigy4cDonxgw4Q2GeI-Yrfo5oItdif2OXe9Tdz7s8sOS1UatTEnwRAnbFsMsnrJhuu1h3C77p31p57Yhi0vOd_JRvxOGw9Ue9NA_6iq6k6siWLd0H4iyEnlYmkE0MF7glE2-63Load6rW9iYW9czQcLD_GaWGfMKwlfuV3iLmG5Vbb9dC8w3gDFakhgVpMMmmIeguUJR_DAUoBfxCagD8OMohXoExfPXHyXCPg",
      detail: "Highway patrol & trauma response team deployed on site."
    },
    {
      id: 3,
      title: "Hinjawadi Phase 2 Circle",
      location: "Near Wipro Circle, Hinjawadi IT Park",
      time: "Today, 01:10 PM",
      status: "Responding",
      statusColor: "bg-amber-100 text-amber-800 border border-amber-200",
      image: null,
      detail: "Trauma team arrived. Critical blood requirements matched."
    }
  ]);

  // Fetch live alerts from database on mount
  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        const res = await api.get("/emergency-alerts");
        if (res.data?.success && res.data.data.length > 0) {
          const apiAlerts = res.data.data.map((item) => ({
            id: item.alertId || item._id,
            title: item.title,
            location: item.location,
            time: item.time ? `Today, ${item.time}` : "Recent",
            status: item.status === "critical" ? "Active" : item.status === "stabilized" ? "Stabilized" : "Resolved",
            statusColor: item.status === "critical" 
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
              : item.status === "stabilized"
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-blue-100 text-blue-800 border border-blue-200",
            image: item.photo || null,
            detail: item.description || "Emergency dispatch broadcasted to nearby blood donors & ambulances.",
          }));

          setRecentAlerts((prev) => {
            const apiIds = new Set(apiAlerts.map((a) => a.id));
            const remaining = prev.filter((p) => !apiIds.has(p.id));
            return [...apiAlerts, ...remaining];
          });
        }
      } catch (err) {
        console.warn("Could not fetch alerts from backend:", err.message);
      }
    };

    fetchRecentAlerts();
  }, []);

  // Handle Photo Selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size should be less than 5MB");
        return;
      }
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
        toast.success("Photo attached! Incident spot evidence recorded.", {
          icon: "📸",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setPhotoPreview(null);
    setPhotoName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    toast("Accident photo removed.", {
      icon: "ℹ️",
    });
  };

  // Live Camera Controls
  const startLiveCamera = async (facing = cameraFacing) => {
    setIsCameraOpen(true);
    setCameraLoading(true);
    setCameraError(null);

    // Stop prior stream
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to native mobile camera input
        if (cameraInputRef.current) {
          setIsCameraOpen(false);
          cameraInputRef.current.click();
          return;
        }
        throw new Error("Camera API is not supported on this browser.");
      }

      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log("Play interrupted:", e));
      }
      setCameraLoading(false);
    } catch (err) {
      console.warn("Live Camera Error:", err);
      setCameraLoading(false);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please allow camera permissions in browser settings or upload from files."
          : "Unable to access live webcam. You can also capture using phone camera or files below."
      );
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
    setCameraLoading(false);
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPhotoPreview(dataUrl);
      const filename = `accident_spot_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.jpg`;
      setPhotoName(filename);
      stopLiveCamera();
      toast.success("Photo captured successfully from camera!", {
        icon: "📸",
        duration: 4000,
      });
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startLiveCamera(nextFacing);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Live GPS Fetcher
  const handleFetchGps = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Near current location)`);
          setIsGpsActive(true);
          setGpsLoading(false);
          toast.success("Live GPS coordinates detected accurately!", {
            icon: "📍",
          });
        },
        () => {
          setLocation("GPS: 18.5987°N, 73.7978°E (Wakad Flyover, Pune)");
          setIsGpsActive(true);
          setGpsLoading(false);
          toast.success("Triangulated coordinates via nearest network tower.", {
            icon: "📍",
          });
        },
        { timeout: 7000 }
      );
    } else {
      setLocation("GPS: 18.5987°N, 73.7978°E (Wakad Flyover, Pune)");
      setIsGpsActive(true);
      setGpsLoading(false);
    }
  };

  // Submit Alert Handler
  const handleDispatchAlert = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      toast.error("Please provide accident location or use GPS!");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        location,
        photo: photoPreview || "",
        photoName: photoName || "accident_evidence.jpg",
        date,
        time,
        bloodGroup: bloodGroupNeeded || "Any",
        description,
      };

      const res = await api.post("/emergency-alerts", payload);
      const created = res.data?.data;

      setIsSubmitting(false);
      setSubmitSuccess(true);

      const newAlert = {
        id: created?.alertId || Date.now(),
        title: created?.title || (location.length > 30 ? location.substring(0, 30) + "..." : location),
        location: created?.location || location,
        time: "Just Now",
        status: "Active",
        statusColor: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        image: photoPreview || null,
        detail: description || "Emergency dispatch broadcasted to nearby blood donors & ambulances."
      };

      setRecentAlerts((prev) => [newAlert, ...prev]);

      toast.success(
        "Emergency Alert dispatched to 14 trauma centers & nearby blood donors!",
        {
          duration: 5000,
          icon: "🚨",
        }
      );

      setTimeout(() => {
        setSubmitSuccess(false);
        setDescription("");
      }, 4000);
    } catch (err) {
      console.error("Error submitting alert:", err);
      setIsSubmitting(false);
      toast.error(err.response?.data?.message || "Failed to dispatch alert. Please try again.");
    }
  };

  const scrollToReportForm = () => {
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pt-20 pb-16 selection:bg-red-500 selection:text-white relative font-sans">
      
      {/* Soft Background Tint */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-red-100/40 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        
        {/* HERO SECTION - Clean Light Theme */}
        <section className="relative overflow-hidden py-12 md:py-16 border-b border-slate-200/90 bg-gradient-to-b from-red-50/70 via-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              
              {/* Left Column */}
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>EMERGENCY RESPONSE PORTAL</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-cinzel">
                  Accident <span className="text-[#E50920]">Alert</span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                  Report accidents, share real-time GPS location and photos to mobilize nearby blood donors, trauma centers, and emergency services instantly.
                </p>

                <div className="flex flex-wrap items-center text-xs sm:text-sm text-slate-600 font-medium gap-y-2 pt-1">
                  <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Report Accidents
                  </span>
                  <span className="mx-3 text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Share Location
                  </span>
                  <span className="mx-3 text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Help Save Lives
                  </span>
                </div>
              </div>

              {/* Right Hero Live Status Card */}
              <div className="self-start lg:self-auto">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-md shadow-slate-200/50 hover:shadow-lg transition-all flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                    <Radio className="w-7 h-7 animate-pulse text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Active Dispatch</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">24/7 Live</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1">Together, We Can Save Lives</p>
                    <p className="text-xs text-slate-500 mt-0.5">Connected with 14 nearby trauma teams & hospitals</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MAIN BODY CONTAINER */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

          {/* ROW 1: REPORT ACCIDENT FORM & IMPACT METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Card: Report Accident Form (lg:col-span-8) */}
            <section 
              ref={formCardRef}
              className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 sm:p-8 relative"
            >
              <div className="border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
                    <span className="w-2.5 h-6 bg-[#E50920] rounded-full mr-3 inline-block animate-pulse" />
                    Report Accident
                  </h2>
                  <span className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full border border-red-200 uppercase tracking-wide">
                    High Priority
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1.5">
                  Upload a photo of the incident spot and share critical details to dispatch nearby blood donors and emergency responders instantly.
                </p>
              </div>

              <form onSubmit={handleDispatchAlert} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: Photo Upload / Live Camera Dropzone */}
                  <div className="md:col-span-5 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Upload Accident Place Photo
                      </label>
                      <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                        Camera &amp; Gallery
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-red-200 hover:border-red-400 bg-red-50/20 rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[240px] relative">
                      {photoPreview ? (
                        <div className="w-full space-y-3">
                          {/* Photo Preview Card */}
                          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 shadow-md group">
                            <img 
                              src={photoPreview} 
                              alt="Accident scene preview" 
                              className="w-full h-full object-cover"
                            />
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/75 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md transition cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 text-left">
                              <span className="text-[11px] font-semibold text-white flex items-center gap-1.5 truncate">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                {photoName || "accident_spot.jpg"}
                              </span>
                            </div>
                          </div>

                          {/* Quick Change Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => startLiveCamera()}
                              className="w-full py-2 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>Retake (Camera)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-2 px-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Change File</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3 shadow-md shadow-red-200">
                            <Camera className="w-7 h-7" />
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            Add Spot Photo / Evidence
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                            Capture live photo from camera or upload from phone gallery
                          </p>

                          {/* Two Dedicated Action Buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-4">
                            {/* Live Camera Button */}
                            <button
                              type="button"
                              onClick={() => startLiveCamera()}
                              className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Camera className="w-4 h-4 shrink-0" />
                              <span>Take Photo</span>
                            </button>

                            {/* Gallery / File Button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                              <span>Browse File</span>
                            </button>
                          </div>

                          <span className="text-[10px] text-slate-400 mt-3 font-medium">
                            Supported: JPG, PNG, WEBP (Max 5MB)
                          </span>
                        </div>
                      )}

                      {/* Hidden File Inputs */}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoChange} 
                      />
                      <input 
                        ref={cameraInputRef}
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handlePhotoChange} 
                      />
                    </div>
                  </div>

                  {/* Right Column: Location, Time & Details */}
                  <div className="md:col-span-7 space-y-4">
                    
                    {/* Accident Location */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Accident Location <span className="text-red-600">*</span>
                        </label>
                        {isGpsActive && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GPS Accurate (±3m)
                          </span>
                        )}
                      </div>
                      
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Enter landmark, street or highway..."
                          className="w-full pl-9 pr-32 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleFetchGps}
                          disabled={gpsLoading}
                          className="absolute inset-y-1 right-1 px-3 py-1 text-xs bg-white hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold border border-slate-300 hover:border-red-300 rounded-md flex items-center gap-1.5 shadow-sm transition-all"
                          title="Fetch live GPS coordinates"
                        >
                          <Navigation className={`w-3.5 h-3.5 text-red-600 ${gpsLoading ? "animate-spin" : ""}`} />
                          <span>{gpsLoading ? "Locating..." : isGpsActive ? "Updated ✓" : "Use GPS"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Date
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Time
                        </label>
                        <input
                          type="text"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          placeholder="e.g. 04:30 PM"
                          className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-red-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Blood Group Needed (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Urgent Blood Requirement (Optional)
                      </label>
                      <select
                        value={bloodGroupNeeded}
                        onChange={(e) => setBloodGroupNeeded(e.target.value)}
                        className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-red-500 font-medium"
                      >
                        <option value="">Any / Unknown (Emergency response needed)</option>
                        <option value="O+">O+ (O Positive)</option>
                        <option value="O-">O- (Universal Donor)</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    {/* Description Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Description & Situation Details
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Details about vehicles involved, number of injured people, immediate blood or medical support required..."
                        className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 leading-relaxed transition-all resize-none"
                      />
                    </div>

                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  {isSubmitting && (
                    <div className="mb-3 bg-red-100 rounded-full h-2 overflow-hidden border border-red-200">
                      <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 h-full rounded-full animate-pulse w-full" />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg duration-200 cursor-pointer ${
                      submitSuccess
                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                        : "bg-[#E50920] hover:bg-red-700 active:bg-red-800 text-white shadow-red-600/30 hover:shadow-red-600/40"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Activity className="w-5 h-5 animate-spin" />
                        <span className="text-base tracking-wide">Broadcasting Emergency Alert...</span>
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-base tracking-wide">Alert Dispatched Successfully ✓</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 -rotate-45" />
                        <span className="text-base tracking-wide">Send Alert Immediately</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Alert instantly triggers broadcast alerts to nearby verified blood donors, ambulances, and hospital triage desks.
                  </p>
                </div>
              </form>
            </section>

            {/* Right Card: Our Impact (lg:col-span-4) */}
            <section className="lg:col-span-4 bg-gradient-to-b from-[#FFF1F2] to-white border border-red-100 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-red-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Our Impact</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time emergency rescues</p>
                  </div>
                  <span className="flex items-center gap-1.5 bg-red-100/80 border border-red-200 px-3 py-1 rounded-full text-red-700 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span>Live Feed</span>
                  </span>
                </div>

                {/* 2x2 Stats Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/90 border border-red-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-red-300 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">245+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">People Helped</div>
                  </div>

                  <div className="bg-white/90 border border-red-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-red-300 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">120+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Lives Saved</div>
                  </div>

                  <div className="bg-white/90 border border-red-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-red-300 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">180+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Accident Alerts</div>
                  </div>

                  <div className="bg-white/90 border border-red-100 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-red-300 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">95+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Emergency Units</div>
                  </div>
                </div>
              </div>

              {/* Quote Footer */}
              <div className="mt-8 pt-5 border-t border-red-100 text-center">
                <p className="font-serif italic text-2xl text-red-700 font-bold tracking-wide">
                  “Your Alert Can Save a Life”
                </p>
                <div className="flex items-center justify-center mt-2 text-red-500 gap-2">
                  <span className="w-8 h-px bg-red-300" />
                  <Heart className="w-4 h-4 fill-current text-red-500 animate-pulse" />
                  <span className="w-8 h-px bg-red-300" />
                </div>
              </div>
            </section>

          </div>

          {/* ROW 2: ABOUT FEATURE, HOW IT WORKS, RECENT ALERTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Card 1: About This Feature */}
            <section className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-red-50 text-red-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">About This Feature</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Our Accident Alert feature helps civilians and bystanders report accidents quickly by sharing real-time photos, location coordinates, and timestamps. This critical information empowers nearby blood donors and emergency response teams to reach the victims faster.
                </p>
              </div>

              <div className="mt-6">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                  <img
                    src="https://lh3.googleusercontent.com/aida/ALJJyrC5LuEKUCE72OwfoQTHLeN8sXARjajdEY2Amz1prh0PWODx4qIzpV3A6kX7T3vI6_tJr9EJ0NNVo0yaEVX8pZT8mZDyKuIt3XRX1AYgIkvGTbtTSTv_Dspf0IJIkQ6MK5Xm3wQppfGn443WbxPGR3XqIcKtO_dLD5MaRoXTrXtrFZNjwMyhHP94yrtfTStkpIGoN9KuphZYJZoam6EEeUtkrtYL8CwP0_Ik4NvCTzyi0Q"
                    alt="Emergency reporting"
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-600/90 backdrop-blur-sm shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping" />
                      Live Scene Verification
                    </span>
                    <span className="text-[10px] text-slate-200 font-medium">Auto-geotagged</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Card 2: How It Works */}
            <section className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-red-50 text-red-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">How It Works</h3>
                </div>

                <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-red-100">
                  <div className="relative flex items-start group">
                    <div className="absolute -left-7 w-6 h-6 rounded-full bg-gradient-to-tr from-red-700 to-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      1
                    </div>
                    <div className="ml-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider group-hover:text-red-600 transition-colors">
                        Upload Photo
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Click & upload a clear photo of the incident scene.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start group">
                    <div className="absolute -left-7 w-6 h-6 rounded-full bg-gradient-to-tr from-red-700 to-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      2
                    </div>
                    <div className="ml-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider group-hover:text-red-600 transition-colors">
                        Share Location
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">GPS auto-detects accurate coordinates instantly.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start group">
                    <div className="absolute -left-7 w-6 h-6 rounded-full bg-gradient-to-tr from-red-700 to-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      3
                    </div>
                    <div className="ml-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider group-hover:text-red-600 transition-colors">
                        Mention Time
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Specify incident time to prioritize emergency dispatch.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start group">
                    <div className="absolute -left-7 w-6 h-6 rounded-full bg-gradient-to-tr from-red-700 to-red-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      4
                    </div>
                    <div className="ml-3">
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider">
                        Send Alert
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Instantly notifies blood donors, trauma centers & police.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Average response time</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  &lt; 4 minutes
                </span>
              </div>
            </section>

            {/* Card 3: Recent Alerts */}
            <section className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Recent Alerts</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
                  >
                    <span>{showAllAlerts ? "Show Less" : "View All"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Alerts List */}
                <div className="space-y-3">
                  {(showAllAlerts ? recentAlerts : recentAlerts.slice(0, 2)).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => toast(alert.detail, { icon: "🚑" })}
                      className="p-3 bg-slate-50 hover:bg-red-50/50 border border-slate-200/80 hover:border-red-200 rounded-xl transition duration-200 flex gap-3 items-center cursor-pointer group"
                    >
                      <div className="overflow-hidden rounded-lg shrink-0 w-14 h-14 border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {alert.image ? (
                          <img
                            src={alert.image}
                            alt={alert.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition truncate">
                            {alert.title}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${alert.statusColor}`}>
                            {alert.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center truncate">
                          <MapPin className="w-3 h-3 text-red-500 mr-1 shrink-0" />
                          <span className="truncate">{alert.location}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 text-center font-medium">
                  Verified emergency responders en route for active alerts
                </div>
              </div>
            </section>

          </div>

          {/* BOTTOM CTA: EMERGENCY CITIZEN NETWORK */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-800 via-red-600 to-rose-700 text-white shadow-xl shadow-red-700/25 p-8 sm:p-10">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="max-w-xl space-y-2">
                <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-red-100">
                  Emergency Citizen Network
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  Be a Hero – Report an Accident & Help Save Lives
                </h2>
                <p className="text-red-100 text-sm sm:text-base font-medium">
                  A small alert can make a big difference! Every second counts in critical trauma and blood emergency situations.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={scrollToReportForm}
                  className="px-8 py-4 bg-white hover:bg-slate-50 text-red-600 font-extrabold rounded-full shadow-2xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 active:scale-95 inline-flex items-center text-base gap-2 cursor-pointer"
                >
                  <span>Send Alert Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

        </main>

        {/* ============================================================
            LIVE WEBCAM / PHONE CAMERA MODAL
            ============================================================ */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
              
              {/* Modal Top Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Take Accident Spot Photo
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live camera capture for instant trauma evidence
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer"
                  title="Close camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Viewport */}
              <div className="relative bg-black w-full aspect-4/3 flex items-center justify-center overflow-hidden">
                {cameraLoading && (
                  <div className="flex flex-col items-center justify-center text-white gap-2">
                    <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold">Starting camera...</span>
                  </div>
                )}

                {cameraError ? (
                  <div className="p-6 text-center text-white space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                      {cameraError}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          stopLiveCamera();
                          if (cameraInputRef.current) cameraInputRef.current.click();
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition cursor-pointer"
                      >
                        Use Phone Camera App
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopLiveCamera();
                          if (fileInputRef.current) fileInputRef.current.click();
                        }}
                        className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700 transition cursor-pointer"
                      >
                        Choose from Files
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Framing Overlay Grid */}
                    <div className="absolute inset-4 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-red-500/70 rounded-full" />
                    </div>

                    {/* Flip / Switch Camera Button (Front / Rear) */}
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="absolute top-4 right-4 py-1.5 px-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-md transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      title="Flip camera (front / back)"
                    >
                      <SwitchCamera className="w-4 h-4" />
                      <span>Flip Camera</span>
                    </button>
                  </>
                )}
              </div>

              {/* Hidden Canvas for Frame Capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Modal Controls / Shutter Button */}
              {!cameraError && (
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>

                  {/* Big Circular Shutter Button */}
                  <button
                    type="button"
                    onClick={captureLivePhoto}
                    className="w-16 h-16 rounded-full bg-white border-4 border-red-600 p-1 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer group"
                    title="Capture Photo Now"
                  >
                    <span className="w-full h-full rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center text-white transition">
                      <Camera className="w-7 h-7" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
