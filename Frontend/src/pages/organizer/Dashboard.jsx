import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import organizerService from '../../services/organizerService';
import { LayoutDashboard, Tent, FileText, Image, Users, LogOut, ArrowUpRight, Plus, Droplet, MapPin, Clock, Calendar, Search, KeyRound, MessageSquare } from 'lucide-react';
import OrganizerWhatsAppConnect from '../OrganizerWhatsAppConnect';

const OrganizerDashboard = () => {
  const { tab } = useParams();
  const activeTab = tab || 'dashboard';
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const myCamps = await organizerService.getMyCamps();
        setCamps(myCamps);
      } catch (err) {
        console.error("Error fetching camps", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCamps();
  }, [user._id]);

  const handleLogout = () => {
    localStorage.removeItem('organizer-token');
    localStorage.removeItem('user');
    navigate('/organizer-login');
  };

  // Stats Calculations
  const totalCamps = camps.length;
  const completedCamps = camps.filter(c => c.status === 'completed');
  const upcomingCamps = camps.filter(c => c.status !== 'completed').sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalDonors = camps.reduce((sum, c) => sum + (c.totalDonors || c.registeredDonors?.length || 0), 0);
  const unitsCollected = completedCamps.reduce((sum, c) => sum + (c.totalUnitsCollected || 0), 0);
  const livesSaved = unitsCollected * 3;

  const nextCamp = upcomingCamps.length > 0 ? upcomingCamps[0] : null;

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const getShortDate = (dateStr) => {
    const d = new Date(dateStr);
    return { day: d.getDate().toString().padStart(2, '0'), month: d.toLocaleString('default', { month: 'short' }) };
  };

  const renderCampCard = (camp) => {
    const { day, month } = getShortDate(camp.date);
    const isCompleted = camp.status === 'completed';

    return (
      <div key={camp._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 transition hover:shadow-md">
        <div className="bg-red-50 text-red-600 font-bold rounded-xl w-16 h-16 flex flex-col items-center justify-center shrink-0 border border-red-100">
          <span className="text-xl leading-none">{day}</span>
          <span className="text-xs uppercase mt-1">{month}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            <h4 className="text-lg font-bold text-gray-900">{camp.title || camp.name}</h4>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600`}>
              {isCompleted ? 'Completed' : 'Upcoming'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {camp.venue || camp.location}, {camp.city || 'Pune'}</span>
            {isCompleted ? (
              <>
                <span className="flex items-center gap-1.5"><Droplet className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-700 font-medium">{camp.totalDonors} donors • {camp.totalUnitsCollected} units</span></span>
                <span className="flex items-center gap-1.5 text-red-500 font-medium">❤️ {camp.totalUnitsCollected * 3} lives saved</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {camp.registeredDonors?.length || 0}/{camp.expectedDonors || 'N/A'} registered</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 9am - 4pm</span>
              </>
            )}
          </div>
          {!isCompleted && (
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(100, ((camp.registeredDonors?.length || 0) / (camp.expectedDonors || 100)) * 100)}%` }}></div>
            </div>
          )}
        </div>
        <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <Link to={`/organizer/camp/${camp._id}`} className="w-full md:w-auto flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-600 font-medium px-5 py-2 rounded-xl transition">
            {isCompleted ? 'Report' : 'View'}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total camps</p>
          <p className="text-3xl font-bold text-red-500">{totalCamps}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total donors</p>
          <p className="text-3xl font-bold text-emerald-600">{totalDonors}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Units collected</p>
          <p className="text-3xl font-bold text-indigo-600">{unitsCollected}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lives saved</p>
          <p className="text-3xl font-bold text-amber-600">{livesSaved}</p>
        </div>
      </div>

      {nextCamp && (
        <div className="bg-red-50 border border-red-100 p-5 rounded-2xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-1"><Calendar className="w-6 h-6 text-red-500" /></div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{nextCamp.title || nextCamp.name} — {new Date(nextCamp.date).toLocaleString('default', { month: 'long', day: 'numeric' })}</h3>
              <p className="text-gray-600 text-sm mt-0.5">
                {nextCamp.venue || nextCamp.location} - {Math.ceil((new Date(nextCamp.date) - new Date()) / (1000 * 60 * 60 * 24))} din baad - {nextCamp.registeredDonors?.length || 0}/{nextCamp.expectedDonors || 'N/A'} registered
              </p>
            </div>
          </div>
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0">Upcoming</span>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">MY CAMPS</h3>
        <div className="space-y-4">
          {camps.length === 0 ? (
            <p className="text-gray-500 p-4">No camps found. Start by requesting a new camp.</p>
          ) : (
            camps.map(renderCampCard)
          )}
        </div>
      </div>
    </>
  );

  const renderMyCamps = () => {
    const filteredCamps = camps.filter(c => (c.title || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Camps</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search camps..." className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
        </div>
        <div className="space-y-4">
          {filteredCamps.length === 0 ? <p className="text-gray-500">No camps found matching "{searchQuery}"</p> : filteredCamps.map(renderCampCard)}
        </div>
      </div>
    );
  };

  const renderRegistrations = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrations Overview</h2>
      {upcomingCamps.length === 0 ? (
        <p className="text-gray-500">No upcoming camps with registrations.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingCamps.map(camp => (
            <div key={camp._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{camp.title || camp.name}</h3>
                <p className="text-gray-500 text-sm mb-4"><MapPin className="w-4 h-4 inline mr-1" /> {camp.venue || camp.location}</p>
                <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
                  <p className="text-3xl font-bold text-blue-600">{camp.registeredDonors?.length || 0}</p>
                  <p className="text-xs text-blue-800 uppercase font-semibold">Registered Donors</p>
                </div>
              </div>
              <Link to={`/organizer/camp/${camp._id}`} className="text-red-600 font-medium hover:underline text-sm inline-flex items-center">
                Manage Registration List <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Camp Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {completedCamps.length === 0 ? <p className="text-gray-500">No completed camps yet.</p> : completedCamps.map(camp => (
          <div key={camp._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{camp.title || camp.name}</h3>
            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6">
              <div className="text-center"><p className="text-2xl font-bold text-emerald-600">{camp.totalDonors}</p><p className="text-xs text-emerald-800 font-semibold uppercase mt-1">Donors</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-indigo-600">{camp.totalUnitsCollected}</p><p className="text-xs text-indigo-800 font-semibold uppercase mt-1">Units</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-red-500">{camp.totalUnitsCollected * 3}</p><p className="text-xs text-red-800 font-semibold uppercase mt-1">Lives</p></div>
            </div>
            <Link to={`/organizer/camp/${camp._id}`} className="w-full block text-center py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition">View Full Report</Link>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGallery = () => {
    const photos = completedCamps.filter(c => c.photos && c.photos.length > 0).flatMap(c => c.photos.map(p => ({ url: p, campTitle: c.title || c.name })));
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Camp Gallery</h2>
        {photos.length === 0 ? <p className="text-gray-500">No photos uploaded yet. Mark a camp as complete to upload photos.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square bg-gray-100 border border-gray-200">
                <img src={photo.url} alt="Camp" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-medium leading-tight">{photo.campTitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">Loading dashboard...</div>;

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
          <button onClick={() => { setIsSidebarOpen(false); navigate('/organizer-dashboard/dashboard'); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition ${activeTab === 'dashboard' ? 'bg-[#E74C3C] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => { setIsSidebarOpen(false); navigate('/organizer-dashboard/my-camps'); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition ${activeTab === 'my-camps' ? 'bg-[#E74C3C] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Tent className="w-4 h-4" /> My Camps
          </button>
          <button onClick={() => { setIsSidebarOpen(false); navigate('/organizer-dashboard/registrations'); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition ${activeTab === 'registrations' ? 'bg-[#E74C3C] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Users className="w-4 h-4" /> Registrations
          </button>
          <button onClick={() => { setIsSidebarOpen(false); navigate('/organizer-dashboard/reports'); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition ${activeTab === 'reports' ? 'bg-[#E74C3C] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <FileText className="w-4 h-4" /> Reports
          </button>
          <button onClick={() => { setIsSidebarOpen(false); navigate('/organizer-dashboard/gallery'); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition ${activeTab === 'gallery' ? 'bg-[#E74C3C] text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Image className="w-4 h-4" /> Gallery
          </button>
          <Link to="/organizer/dashboard/whatsapp-connect" onClick={() => setIsSidebarOpen(false)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-sm transition ${activeTab === 'whatsapp-connect' ? 'bg-[#E74C3C] text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Connect</span>
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
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome😊, {user.name?.split(' ')[0] || 'ji'}!</h2>
              <p className="text-sm text-gray-500 mt-1">{formatDate(new Date())}</p>
            </div>
            <Link to="/organizer-enquiry" className="inline-flex items-center gap-2 bg-[#E74C3C] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition shadow-sm shrink-0">
              <Plus className="w-4 h-4" /> New camp request
            </Link>
          </div>

          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'my-camps' && renderMyCamps()}
          {activeTab === 'registrations' && renderRegistrations()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'gallery' && renderGallery()}
          {activeTab === 'whatsapp-connect' && <OrganizerWhatsAppConnect />}

        </div>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
