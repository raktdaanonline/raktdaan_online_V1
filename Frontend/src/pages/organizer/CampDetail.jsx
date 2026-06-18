import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tent, FileText, Image, Users, LogOut, KeyRound, Droplet, ArrowLeft, Clock, MapPin, Calendar, CheckCircle2, MessageCircle, QrCode } from 'lucide-react';
import organizerService from '../../services/organizerService';
import ShareModal from '../../components/ShareModal';
import WAStatus from '../../components/WAStatus';
import QRPoster from '../../components/QRPoster';

const CampDetail = () => {
  const { campId } = useParams();
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareModal, setShareModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCamp = async () => {
      try {
        const data = await organizerService.getCampDetails(campId);
        if (data.success) {
          setCamp(data.camp);
        } else {
          setError(data.message || 'Failed to load camp details');
        }
      } catch (err) {
        console.error("Error fetching camp details", err);
        setError(err.response?.data?.message || 'Failed to load camp details');
      } finally {
        setLoading(false);
      }
    };
    fetchCamp();
  }, [campId]);

  const handleLogout = () => {
    localStorage.removeItem('organizer-token');
    localStorage.removeItem('user');
    navigate('/organizer-login');
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Upcoming</span>;
      case 'completed': return <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Completed</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Cancelled</span>;
      default: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{status}</span>;
    }
  };

  const handleWhatsAppShare = async (phone) => {
    try {
      const data = await organizerService.shareCamp(camp.campId || camp._id, phone);
      if (!data.success) alert('WhatsApp message send karne mein problem aayi.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const calculateCountdown = () => {
    if (!camp || camp.status !== 'upcoming') return null;
    const diff = new Date(camp.date) - new Date();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  const [countdown, setCountdown] = useState(calculateCountdown());

  useEffect(() => {
    if (camp && camp.status === 'upcoming') {
      const timer = setInterval(() => {
        setCountdown(calculateCountdown());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [camp]);

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">Loading camp details...</div>;
  if (error || !camp) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-red-500 font-bold">{error || "Camp not found."}</div>;

  const filledPercentage = Math.min(100, (camp.registeredCount / camp.totalSlots) * 100);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row font-sans relative">

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between bg-[#1C1C28] text-white p-4 fixed top-0 left-0 right-0 z-50 border-b border-white/5 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 rounded-full p-1.5"><Droplet className="w-4 h-4 text-white" /></div>
          <span className="font-bold text-lg">Raktdaan</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/55 z-30 transition-opacity" />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-[#1C1C28] text-gray-300 flex flex-col z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 pb-2">
          <div className="flex items-center justify-between gap-2.5 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-red-500 rounded-full p-1.5"><Droplet className="w-4 h-4 text-white" /></div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Raktdaan</h1>
                <p className="text-[10px] text-gray-400">Organizer Panel</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] font-semibold tracking-wider text-gray-500 mb-3 px-2">MAIN</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Link to="/organizer-dashboard/dashboard" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition text-gray-400 hover:text-white hover:bg-white/5">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/organizer-dashboard/my-camps" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition bg-[#E74C3C] text-white shadow-sm">
            <Tent className="w-4 h-4" /> My Camps
          </Link>
          <Link to="/organizer-dashboard/registrations" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition text-gray-400 hover:text-white hover:bg-white/5">
            <Users className="w-4 h-4" /> Registrations
          </Link>
          <Link to="/organizer-dashboard/reports" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition text-gray-400 hover:text-white hover:bg-white/5">
            <FileText className="w-4 h-4" /> Reports
          </Link>
          <Link to="/organizer-dashboard/gallery" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition text-gray-400 hover:text-white hover:bg-white/5">
            <Image className="w-4 h-4" /> Gallery
          </Link>
        </nav>

        <div className="p-3 border-t border-white/10 mt-auto">
          <Link to="/organizer/change-password" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-2.5 hover:bg-white/5 px-3 py-2 rounded-xl transition text-gray-400 hover:text-white text-sm mb-1.5">
            <KeyRound className="w-4 h-4" />
            <span className="font-medium">Change Password</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-between hover:bg-white/5 px-3 py-2 rounded-xl transition group">
            <div className="flex items-center gap-2.5 text-left">
              <div className="bg-red-500/20 text-red-500 font-bold w-8 h-8 rounded-full flex items-center justify-center text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <p className="text-white text-xs font-semibold truncate w-24">{user.name || 'Organizer'}</p>
                <p className="text-[10px] text-gray-500">Personal</p>
              </div>
            </div>
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 pt-24 md:pt-10 w-full md:w-[calc(100%-16rem)] md:ml-64">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* SECTION 1 - TOP BAR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <Link to="/organizer-dashboard/my-camps" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">{camp.title} <WAStatus /></h2>
                <p className="text-sm text-gray-500 mt-1 font-mono">ID: {camp.campId || camp._id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {getStatusBadge(camp.status)}
              <button onClick={() => setShowQR(true)} className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white px-4 py-2 rounded-xl font-medium transition shadow-sm">
                <QrCode className="w-4 h-4" /> Generate QR
              </button>
              <button onClick={() => setShareModal(true)} className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-4 py-2 rounded-xl font-medium transition shadow-sm">
                <MessageCircle className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* SECTION 2 - COUNTDOWN BANNER */}
          {camp.status === 'upcoming' && countdown && (
            <div className="bg-[#FCEBEB] border border-[#F7C1C1] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm text-red-500"><Clock className="w-5 h-5" /></div>
                <p className="text-red-800 font-medium">Camp mein <strong className="text-xl">{countdown.days}</strong> din baaki hain!</p>
              </div>
              <div className="flex gap-2">
                {['hours', 'minutes', 'seconds'].map((unit, idx) => (
                  <div key={unit} className="flex items-center">
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100 text-red-600 font-mono font-bold w-12 text-center">
                      {String(countdown[unit]).padStart(2, '0')}
                    </div>
                    {idx < 2 && <span className="mx-1 text-red-300 font-bold">:</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3 - CAMP INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-gray-900 font-bold mb-4">Camp details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-medium">{new Date(camp.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-medium">9:00 AM – 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-medium">{camp.venue}</p>
                    <p className="text-gray-500 text-sm">{camp.city}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <h3 className="text-gray-900 font-bold mb-4">Registration status</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-[#E24B4A]">{camp.registeredCount}</span>
                <span className="text-gray-500 font-medium">/ {camp.totalSlots}</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full mb-2 overflow-hidden">
                <div className="bg-[#E24B4A] h-full rounded-full transition-all duration-1000" style={{ width: `${filledPercentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mb-4 font-medium">Expected: {camp.expectedDonors} donors</p>

              {camp.registeredCount === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-lg text-sm font-medium">
                  Slots bhar rahe hain — share karo!
                </div>
              ) : filledPercentage > 80 ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm font-medium">
                  Almost full!
                </div>
              ) : null}
            </div>
          </div>

          {/* SECTION 5 - CAMP PROGRESS TIMELINE */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <h3 className="text-gray-900 font-bold mb-8">Camp Progress</h3>
            <div className="flex items-center justify-between min-w-[600px] px-4">
              {[
                { title: "Request", status: "completed" },
                { title: "Approved", status: "completed" },
                { title: "Live", status: camp.status !== 'cancelled' ? "completed" : "pending" },
                { title: "Camp day", status: camp.status === 'completed' ? "completed" : "pending", subtitle: new Date(camp.date).toLocaleDateString('en-GB') },
                { title: "Report", status: camp.status === 'completed' ? "completed" : "pending" }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.title}>
                  <div className="flex flex-col items-center relative z-10 w-24">
                    {step.status === 'completed' ? (
                      <div className="w-8 h-8 rounded-full bg-[#E24B4A] flex items-center justify-center text-white mb-2 shadow-sm ring-4 ring-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300 mb-2 ring-4 ring-white"></div>
                    )}
                    <span className={`text-xs font-bold uppercase tracking-wide ${step.status === 'completed' ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</span>
                    {step.subtitle && <span className="text-[10px] text-gray-400 mt-1">{step.subtitle}</span>}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-1 -mx-8 -mt-6 z-0 ${arr[idx + 1].status === 'completed' ? 'bg-[#E24B4A]' : 'bg-gray-100'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* SECTION 4 - REGISTERED DONORS LIST */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900 font-bold">Registered donors</h3>
              {camp.registeredCount > 0 && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{camp.registeredCount}</span>}
            </div>

            {camp.registeredCount === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Users className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-1">Abhi koi registered nahi</h4>
                <p className="text-gray-500 mb-6">Camp share karo — log aayenge!</p>
                <button onClick={() => setShareModal(true)} className="bg-[#E24B4A] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-sm inline-flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Share camp
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {camp.registeredDonors.slice(0, 10).map((donor, idx) => {
                  const colors = ['bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700'];
                  const colorClass = colors[idx % colors.length];
                  const initial = donor.name.charAt(0).toUpperCase();

                  return (
                    <div key={donor._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${colorClass}`}>
                          {initial}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{donor.name}</p>
                          <p className="text-xs text-gray-400 font-medium">Registered: {new Date(donor.registeredAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-red-50 text-red-600 font-bold text-xs rounded-lg border border-red-100">
                        {donor.bloodGroup}
                      </span>
                    </div>
                  );
                })}
                {camp.registeredCount > 10 && (
                  <button className="w-full py-3 mt-2 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition">
                    View all {camp.registeredCount} donors
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* SHARE MODAL */}
      <ShareModal
        isOpen={shareModal}
        onClose={() => setShareModal(false)}
        title={`Share ${camp.title} on WhatsApp`}
        onSend={handleWhatsAppShare}
      />

      {/* QR POSTER MODAL */}
      {showQR && (
        <QRPoster camp={camp} onClose={() => setShowQR(false)} />
      )}

    </div>
  );
};

export default CampDetail;
