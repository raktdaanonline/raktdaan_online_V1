import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Zap,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  Heart
} from "lucide-react";
import servicesImg from "../assets/servicesimg1.png";
import services2Img from "../assets/services2.png";

const Services = () => {
  useEffect(() => {
    // Scroll reveal animation initialization
    const handleScroll = () => {
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el.classList.add("visible");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-28 pb-12 overflow-x-hidden relative font-sans">
      
      {/* Dynamic Smooth Landing CSS styles injected locally */}
      <style>{`
        .landing-fade-bg {
          animation: fadeBg 1.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .landing-fade-title {
          opacity: 0;
          animation: fadeUp 1.0s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          animation-delay: 0.2s;
        }
        .landing-fade-desc {
          opacity: 0;
          animation: fadeUp 1.0s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          animation-delay: 0.4s;
        }
        .landing-fade-features {
          opacity: 0;
          animation: fadeUp 1.0s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          animation-delay: 0.6s;
        }

        @keyframes fadeBg {
          from {
            opacity: 0;
            transform: scale(1.08) translate(10px, -5px);
          }
          to {
            opacity: 0.9;
            transform: scale(1) translate(0, 0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .service-card {
          border: 1px solid transparent !important;
        }
        .service-card:hover {
          border: 1px solid rgba(220, 38, 38, 0.4) !important;
        }
      `}</style>

      {/* Background Services Image (As Requested: Used in background) */}
      <div
        className="absolute top-0 right-0 w-full lg:w-[65%] h-[600px] lg:h-[750px] bg-no-repeat bg-contain lg:bg-cover bg-center lg:bg-right-top pointer-events-none z-0 transition-opacity duration-500 landing-fade-bg"
        style={{
          backgroundImage: `url(${servicesImg})`,
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
        }}
      />

      {/* Background Decorative Red Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Hero / Top Section */}
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[450px] lg:min-h-[550px] items-center">

          {/* Left Column Text & Highlights */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4 landing-fade-title">
              <span className="text-red-500 font-extrabold tracking-[0.2em] text-xs uppercase">
                OUR SERVICES
              </span>
              <div className="h-[2px] w-12 bg-red-600"></div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 landing-fade-title">
              Smart Technology for <br />
              <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]">Saving Lives</span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed mb-10 landing-fade-desc">
              Our digital platform empowers donors, organizers, and hospitals with seamless tools for blood donation and camp management.
            </p>

            {/* Quick Features List */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center landing-fade-features">
              {/* Item 1 */}
              <div className="flex items-start gap-3 max-w-[240px]">
                <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-full flex items-center justify-center text-red-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">Secure & Reliable</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Data privacy you can trust</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3 max-w-[240px]">
                <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-full flex items-center justify-center text-red-500">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">Real-time Updates</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Live tracking of donations & camps</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3 max-w-[240px]">
                <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-full flex items-center justify-center text-red-500">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">Community Driven</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Stronger together to save more lives</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Kept empty for background image space on desktop */}
          <div className="lg:col-span-5 hidden lg:block" />

        </div>
      </div>

      {/* Decorative Separator "What We Offer" */}
      <div className="max-w-[1400px] mx-auto px-6 mt-20 mb-12 relative z-10 animate-on-scroll">
        <div className="flex items-center justify-center gap-6">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-red-600/50"></div>
          <h2 className="text-xl md:text-2xl font-bold tracking-wider text-gray-100 uppercase">
            What We Offer
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-red-600/50"></div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 animate-on-scroll">
          {/* Card 1: Find Blood */}
          <div className="service-card bg-[#0b0c10] rounded-[20px] p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-950/60 to-red-900/30 rounded-2xl flex items-center justify-center text-red-500 mb-5 shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <path d="M12 11v4M10 13h4" stroke="black" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-red-500 transition-colors">Find Blood</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Search available blood units by type and location instantly.
              </p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-red-500/90 group-hover:text-red-500 transition-colors py-2 px-4 border border-red-950 rounded-lg w-fit group-hover:border-red-600/40 hover:bg-red-950/25">
              Explore <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Request Blood */}
          <div className="service-card bg-[#0b0c10] rounded-[20px] p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-950/60 to-red-900/30 rounded-2xl flex items-center justify-center text-red-500 mb-5 shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <path d="M12 10v4M10 12h4" stroke="black" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-red-500 transition-colors">Request Blood</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Raise a blood request in seconds and get help from nearby donors.
              </p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-red-500/90 group-hover:text-red-500 transition-colors py-2 px-4 border border-red-950 rounded-lg w-fit group-hover:border-red-600/40 hover:bg-red-950/25">
              Explore <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: Camp Management */}
          <div className="service-card bg-[#0b0c10] rounded-[20px] p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-950/60 to-red-900/30 rounded-2xl flex items-center justify-center text-red-500 mb-5 shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                <Calendar size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-red-500 transition-colors">Camp Management</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Organize and manage blood donation camps with ease.
              </p>
            </div>
            <Link to="/organizer-enquiry" className="inline-flex items-center gap-2 text-xs font-bold text-red-500/90 group-hover:text-red-500 transition-colors py-2 px-4 border border-red-950 rounded-lg w-fit group-hover:border-red-600/40 hover:bg-red-950/25">
              Explore <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4: Donor Management */}
          <div className="service-card bg-[#0b0c10] rounded-[20px] p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-950/60 to-red-900/30 rounded-2xl flex items-center justify-center text-red-500 mb-5 shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                <Users size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-red-500 transition-colors">Donor Management</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Maintain donor records and build a strong donor network.
              </p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-red-500/90 group-hover:text-red-500 transition-colors py-2 px-4 border border-red-950 rounded-lg w-fit group-hover:border-red-600/40 hover:bg-red-950/25">
              Explore <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 5: Reports & Analytics */}
          <div className="service-card bg-[#0b0c10] rounded-[20px] p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-950/60 to-red-900/30 rounded-2xl flex items-center justify-center text-red-500 mb-5 shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-red-500 transition-colors">Reports & Analytics</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Get real-time insights and reports to track donations and impact.
              </p>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-red-500/90 group-hover:text-red-500 transition-colors py-2 px-4 border border-red-950 rounded-lg w-fit group-hover:border-red-600/40 hover:bg-red-950/25">
              Explore <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Call to Action Banner (No outline/border) */}
      <div className="max-w-[1400px] mx-auto px-6 relative z-10 animate-on-scroll">
        <div className="bg-[#08080c] rounded-[24px] p-8 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_15px_40px_rgba(220,38,38,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/5 to-transparent pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-red-950/60 border border-transparent rounded-full flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <Heart className="w-7 h-7 fill-red-500/20" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-white">
                Together, we can create a healthier tomorrow.
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Join our mission and be a part of saving lives.
              </p>
            </div>
          </div>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-[14px] text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_25px_rgba(220,38,38,0.4)] relative z-10 w-full md:w-auto hover:-translate-y-0.5 active:translate-y-0"
          >
            Register as Donor <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Blood Donation Camps Section (mockup based layout with services2.png background) */}
      <div className="max-w-[1400px] mx-auto px-6 mt-16 relative z-10 animate-on-scroll">
        <div
          className="relative rounded-[32px] overflow-hidden min-h-[420px] flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          style={{
            backgroundImage: `url(${services2Img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          {/* Gradients to keep the text on left readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/90 to-transparent z-0" />
          <div className="absolute inset-0 bg-black/30 z-0" />

          {/* Section Content */}
          <div className="relative z-10 p-8 md:p-12 flex flex-col justify-between h-full gap-8">
            
            {/* Header info */}
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                Blood Donation <span className="text-red-500">Camps</span>
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Join a blood donation camp near you and <pre></pre> be a hero in someone's life.
              </p>
            </div>

            {/* Combined Stats Container */}
            {/* <div className="inline-flex flex-wrap items-center bg-[#09090b]/85 backdrop-blur-md px-6 py-4 rounded-2xl max-w-full w-fit"> */}
              {/* Stat 1 */}
              {/* <div className="flex items-center gap-3.5 pr-8 py-1">
                <div className="p-2.5 bg-red-950/60 rounded-xl text-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">850+</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Camps Organized</div>
                </div>
              </div> */}

              {/* Vertical divider */}
              {/* <div className="hidden md:block h-8 w-[1px] bg-zinc-800/60 mx-2" /> */}

              {/* Stat 2 */}
              {/* <div className="flex items-center gap-3.5 px-0 md:px-4 pr-8 py-1">
                <div className="p-2.5 bg-red-950/60 rounded-xl text-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">120K+</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Lives Impacted</div>
                </div>
              </div> */}

              {/* Vertical divider */}
              <div className="hidden md:block h-8 w-[1px] bg-zinc-800/60 mx-2" />

              {/* Stat 3 */}
              {/* <div className="flex items-center gap-3.5 pl-0 md:pl-4 py-1">
                <div className="p-2.5 bg-red-950/60 rounded-xl text-red-500 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black text-white leading-tight">50K+</div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Units Collected</div>
                </div>
              </div> */}
            {/* </div> */}

          </div>
        </div>
      </div>

      {/* ===== Complete Support Section ===== */}
      <div className="max-w-[1400px] mx-auto px-6 mt-24 mb-20 relative z-10 animate-on-scroll">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-red-500 font-extrabold tracking-[0.2em] text-xs uppercase mb-3 block">OUR SERVICES</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Complete Support for Successful Blood Camps
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-[2px] w-10 bg-red-600/60 rounded" />
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <div className="h-[2px] w-10 bg-red-600/60 rounded" />
          </div>
        </div>

        {/* 6 Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {[
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              ),
              title: "Blood Donation Camp Setup",
              desc: "We help you plan and organize blood donation camps successfully."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
              title: "Hospital Partnership",
              desc: "Partner with trusted hospitals and ensure safe blood collection."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
              title: "Medical Staff Support",
              desc: "Trained medical staff and professionals for smooth operations."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h9l2-2zM3 7h13M16 16h2a1 1 0 001-1v-4l-3-5h-1" />
                </svg>
              ),
              title: "Mobile Blood Collection Van",
              desc: "Our mobile vans reach your location for hassle-free blood collection."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: "Location Planning",
              desc: "We assist in selecting the best location and camp arrangements."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Camp Analytics & Reports",
              desc: "Detailed reports and analytics of your camp and its impact."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="group bg-[#0a0a0e] border border-zinc-800/60 rounded-[20px] p-6 flex flex-col gap-4 hover:border-red-600/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#110a0a] border border-red-900/30 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-950/40 group-hover:shadow-[0_0_18px_rgba(220,38,38,0.25)] transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-100 group-hover:text-red-400 transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{item.desc}</p>
              <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500/80 group-hover:text-red-400 transition-colors mt-auto">
                Learn More <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===== How It Works - Simple Steps Section ===== */}
      <div className="max-w-[1400px] mx-auto px-6 mt-8 mb-24 relative z-10 animate-on-scroll">
        <div className="text-center mb-16">
          <span className="text-red-500 font-extrabold tracking-[0.2em] text-xs uppercase mb-3 block">HOW IT WORKS</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
            Simple Steps, <span className="relative inline-block">Greater Impact<span className="absolute left-0 bottom-0 w-full h-[3px] bg-red-600/60 rounded" /></span>
          </h2>
        </div>

        <div className="relative flex flex-col md:flex-row items-start justify-between gap-8 md:gap-0">
          <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] border-t-2 border-dashed border-red-800/40 z-0" />

          {[
            {
              step: "01",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: "Organizer Enquiry",
              desc: "You fill out the enquiry form with camp details."
            },
            {
              step: "02",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: "Admin Verification",
              desc: "Our team verifies and confirms your request."
            },
            {
              step: "03",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              title: "Camp Planning",
              desc: "We plan the camp, allocate resources and staff."
            },
            {
              step: "04",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              ),
              title: "Blood Collection",
              desc: "Camp is conducted and blood is collected safely."
            },
            {
              step: "05",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: "Report & Impact",
              desc: "You receive the camp report and impact stats."
            }
          ].map((s, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center flex-1 group">
              <div className="text-[10px] font-black text-red-500/70 tracking-widest mb-2">{s.step}</div>
              <div className="w-[100px] h-[100px] rounded-full bg-[#0d0608] border-2 border-red-900/40 flex items-center justify-center text-red-500 mb-4 group-hover:border-red-500/60 group-hover:shadow-[0_0_24px_rgba(220,38,38,0.3)] transition-all duration-300">
                {s.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-100 mb-2 group-hover:text-red-400 transition-colors">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[140px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
