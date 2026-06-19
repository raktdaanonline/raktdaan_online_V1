import React, { useEffect } from "react";
import { Shield, Eye, Lock, FileText, ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page bg-[#050505] text-white min-height-screen font-sans">
      <style>{`
        .privacy-page {
          background: #050505;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          padding: 120px 24px 80px 24px;
        }

        .privacy-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .gradient-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 1200px;
          height: 300px;
          background: radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }

        .policy-card {
          background: rgba(13, 13, 13, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .policy-section {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 28px;
          margin-bottom: 28px;
        }

        .policy-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .privacy-page {
            padding: 100px 16px 60px 16px;
          }
          .policy-card {
            padding: 24px 18px;
          }
        }
      `}</style>

      <div className="gradient-glow"></div>

      <div className="privacy-container relative z-10">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#e11d48] transition-colors duration-200 mb-8 no-underline text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#e11d48] mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            Privacy <span className="text-[#e11d48]">Policy</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Your privacy is of utmost importance to us. Learn how we protect and manage your data on Raktdaan.
          </p>
          <div className="text-xs text-slate-500 mt-4">
            Last Updated: June 19, 2026
          </div>
        </div>

        {/* Policy Content */}
        <div className="policy-card">
          {/* Section 1 */}
          <div className="policy-section">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
              <Eye className="w-5 h-5 text-[#e11d48]" />
              1. Information We Collect
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-3">
              We collect information to provide a better experience and connect donors with blood camps and requesters effectively:
            </p>
            <ul className="list-disc list-inside text-slate-400 text-sm md:text-base space-y-2 pl-2">
              <li>
                <strong className="text-slate-300">Personal Information:</strong> Name, age, gender, contact number, email address, and home/work address.
              </li>
              <li>
                <strong className="text-slate-300">Health & Medical Info:</strong> Blood group, history of donations, and eligibility check details.
              </li>
              <li>
                <strong className="text-slate-300">Location Data:</strong> Geolocation coordinates to help you find nearby blood camps and blood banks.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="policy-section">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
              <Lock className="w-5 h-5 text-[#e11d48]" />
              2. How We Use Your Data
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-3">
              Your details are used solely to improve blood donation coordination:
            </p>
            <ul className="list-disc list-inside text-slate-400 text-sm md:text-base space-y-2 pl-2">
              <li>Matching eligible donors with urgent blood requests in real time.</li>
              <li>Registering and issuing passes for blood donation camps.</li>
              <li>Sending important notifications, updates, and OTPs via SMS or WhatsApp.</li>
              <li>Providing location-based search options for blood banks.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="policy-section">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
              <Shield className="w-5 h-5 text-[#e11d48]" />
              3. Data Security & Storage
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              We implement industry-standard security measures to protect your sensitive healthcare information from unauthorized access, alteration, or disclosure. All transaction details, contact records, and profiles are secured using encrypted network channels.
            </p>
          </div>

          {/* Section 4 */}
          <div className="policy-section">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
              <FileText className="w-5 h-5 text-[#e11d48]" />
              4. Third-Party Integrations
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              We leverage reliable third-party providers (e.g., Firebase Authentication, database hosts, and communication services like WhatsApp integration) to facilitate user registration, login, and camp coordination. These partners access data solely to perform their services securely and are obligated not to disclose or use it for any other purpose.
            </p>
          </div>

          {/* Section 5 */}
          <div className="policy-section">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
              <Heart className="w-5 h-5 text-[#e11d48]" />
              5. Contact Us
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-3">
              If you have any questions, suggestions, or concerns regarding your privacy or data protection:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-300">
              <p className="m-0">📍 India</p>
              <p className="m-0 mt-1">✉️ raktdaan.online@gmail.com</p>
              <p className="m-0 mt-1">📞 +91 99234 00442</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
