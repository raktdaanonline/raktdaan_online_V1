import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tent, FileText, Image, Users, LogOut, KeyRound, Droplet, Search, Download, MessageCircle } from 'lucide-react';
import organizerService from '../../services/organizerService';
import ShareModal from '../../components/ShareModal';
import WAStatus from '../../components/WAStatus';

const Registrations = () => {
  const [camps, setCamps] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleDonors, setVisibleDonors] = useState(10);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  // Fetch all camps for the dropdown
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const data = await organizerService.getMyCamps();
        
        if (data && data.length > 0) {
          setCamps(data);
          // Auto-select the first upcoming camp, or the first overall if none upcoming
          const upcoming = data.filter(c => c.status !== 'completed' && c.status !== 'cancelled').sort((a, b) => new Date(a.date) - new Date(b.date));
          if (upcoming.length > 0) {
            setSelectedCampId(upcoming[0]._id);
          } else {
            setSelectedCampId(data[0]._id);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching camps", err);
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  // Fetch registration data for the selected camp
  useEffect(() => {
    if (!selectedCampId) return;

    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const data = await organizerService.getCampRegistrations(selectedCampId);
        
        if (data.success) {
          setRegistrationData(data);
          setVisibleDonors(10); // reset visible count
        }
      } catch (err) {
        console.error("Error fetching registrations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [selectedCampId]);

  const handleLogout = () => {
    localStorage.removeItem('organizer-token');
    localStorage.removeItem('user');
    navigate('/organizer-login');
  };

  const handleWhatsAppShare = () => {
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (phone) => {
    if (!registrationData?.camp) return;
    await organizerService.shareCamp(selectedCampId, phone);
  };

  const downloadCSV = () => {
    if (!registrationData || !registrationData.donors.length) return;
    const headers = ['Sr No', 'Name', 'Blood Group', 'Registered At', 'Status'];
    const rows = registrationData.donors.map((donor, idx) => [
      idx + 1,
      donor.name,
      donor.bloodGroup,
      new Date(donor.registeredAt).toLocaleString(),
      donor.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date(registrationData.camp.date).toISOString().split('T')[0];
    link.setAttribute("download", `registrations_${registrationData.camp.title.replace(/\s+/g, '_')}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBloodGroupColor = (bg) => {
    if (bg.includes('A+ ') || bg === 'A+' || bg === 'A-') return 'bg-[#FCEBEB] text-[#A32D2D]';
    if (bg === 'B+' || bg === 'B-') return 'bg-[#E1F5EE] text-[#085041]';
    if (bg === 'O+' || bg === 'O-') return 'bg-[#FAEEDA] text-[#633806]';
    if (bg === 'AB+' || bg === 'AB-') return 'bg-[#EEEDFE] text-[#3C3489]';
    return 'bg-gray-100 text-gray-600';
  };

  // Filter donors client side
  const filteredDonors = registrationData?.donors?.filter(donor => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return donor.name.toLowerCase().includes(lowerQuery) || donor.bloodGroup.toLowerCase().includes(lowerQuery);
  }) || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row font-sans relative">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#1C1C28] text-gray-300 flex-col h-screen fixed top-0 left-0 z-40">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-500 rounded-full p-2"><Droplet className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Raktdaan</h1>
              <p className="text-xs text-gray-400">Organizer Panel</p>
            </div>
          </div>
          <WAStatus />
          <p className="text-xs font-semibold tracking-wider text-gray-500 mb-4 px-2 mt-6">MAIN</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link to="/organizer-dashboard/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-gray-400 hover:text-white hover:bg-white/5">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/organizer-dashboard/my-camps" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-gray-400 hover:text-white hover:bg-white/5">
            <Tent className="w-5 h-5" /> My Camps
          </Link>
          <Link to="/organizer-dashboard/registrations" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition bg-[#E74C3C] text-white shadow-sm">
            <Users className="w-5 h-5" /> Registrations
          </Link>
          <Link to="/organizer-dashboard/reports" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-gray-400 hover:text-white hover:bg-white/5">
            <FileText className="w-5 h-5" /> Reports
          </Link>
          <Link to="/organizer-dashboard/gallery" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-gray-400 hover:text-white hover:bg-white/5">
            <Image className="w-5 h-5" /> Gallery
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <Link to="/organizer/change-password" className="w-full flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition text-gray-400 hover:text-white mb-2">
            <KeyRound className="w-5 h-5" />
            <span className="font-medium">Change Password</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-between hover:bg-white/5 p-3 rounded-xl transition group">
            <div className="flex items-center gap-3 text-left">
              <div className="bg-red-500/20 text-red-500 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <p className="text-white text-sm font-semibold truncate w-24">{user.name || 'Organizer'}</p>
                <p className="text-xs text-gray-500">Personal</p>
              </div>
            </div>
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 w-full md:w-[calc(100%-16rem)] md:ml-64">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* SECTION 1 - HEADER ROW */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-medium text-gray-900">Registrations</h2>
              <p className="text-sm text-gray-500 mt-1">Kaun kaun donors aane wale hain</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select 
                className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#E24B4A] focus:border-transparent font-medium"
                value={selectedCampId}
                onChange={(e) => setSelectedCampId(e.target.value)}
                disabled={loading || camps.length === 0}
              >
                {camps.length === 0 ? (
                  <option value="">No camps available</option>
                ) : (
                  camps.map(camp => (
                    <option key={camp._id} value={camp._id}>
                      {camp.title || camp.name} ({new Date(camp.date).toLocaleDateString()})
                    </option>
                  ))
                )}
              </select>
              <button 
                onClick={handleWhatsAppShare}
                disabled={!registrationData}
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4" /> Share WhatsApp
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading registrations data...</div>
          ) : !registrationData ? (
            <div className="py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
              No camp selected or data not available.
            </div>
          ) : (
            <>
              {/* SECTION 2 - 4 STATS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-[10px] md:p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total registered</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#E24B4A]">{registrationData.stats.totalRegistered}</p>
                </div>
                <div className="bg-white p-[10px] md:p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Confirmed</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#0F6E56]">{registrationData.stats.confirmed}</p>
                </div>
                <div className="bg-white p-[10px] md:p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Slots bache</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#BA7517]">{registrationData.stats.slotsLeft}</p>
                </div>
                <div className="bg-white p-[10px] md:p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Slots total</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#534AB7]">{registrationData.stats.totalSlots}</p>
                </div>
              </div>

              {/* SECTION 3 - 2 COLUMN GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                  <h3 className="text-gray-900 font-bold mb-4">Registration progress</h3>
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-gray-700 font-medium">{registrationData.stats.totalRegistered} / {registrationData.stats.totalSlots} slots filled</p>
                    <p className="font-bold text-gray-900">{Math.round(registrationData.stats.progressPercent)}%</p>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-[20px] mb-5 overflow-hidden">
                    <div className="bg-[#E24B4A] h-full rounded-[20px]" style={{ width: `${registrationData.stats.progressPercent}%` }}></div>
                  </div>
                  
                  {registrationData.stats.progressPercent >= 100 ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                      Camp full ho gaya!
                    </div>
                  ) : registrationData.stats.progressPercent >= 80 ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                      Almost full! Jaldi register karo
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
                      {registrationData.stats.slotsLeft} slots baaki hain — share karo aur bharo!
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-gray-900 font-bold mb-4">Blood groups breakdown</h3>
                  {Object.keys(registrationData.stats.bloodGroupBreakdown).length === 0 ? (
                    <div className="text-center py-6 text-gray-500">Abhi koi registered nahi</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => {
                        const count = registrationData.stats.bloodGroupBreakdown[bg] || 0;
                        if (count === 0) return null;
                        return (
                          <div key={bg} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                            <span className="font-bold text-[#E24B4A] text-lg">{bg}</span>
                            <span className="font-medium text-gray-500">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4 - DONORS LIST */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-gray-900 font-medium text-lg">Registered donors list</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search donor..." 
                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl w-full sm:w-64 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={downloadCSV}
                      disabled={filteredDonors.length === 0}
                      className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
                      title="Export CSV"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {registrationData.donors.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1">Abhi koi registered nahi</h4>
                    <p className="text-gray-500 mb-6 text-sm">Camp share karo — log aayenge!</p>
                    <button onClick={handleWhatsAppShare} className="bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm inline-flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> WhatsApp share
                    </button>
                  </div>
                ) : filteredDonors.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No donors found matching "{searchQuery}"</div>
                ) : (
                  <div>
                    <div className="space-y-3">
                      {filteredDonors.slice(0, visibleDonors).map(donor => (
                        <div key={donor._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-sm ${getBloodGroupColor(donor.bloodGroup)}`}>
                              {donor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm leading-none mb-1">{donor.name}</p>
                              <p className="text-[11px] text-gray-400 font-medium">
                                {(() => {
                                  const diff = (new Date() - new Date(donor.registeredAt)) / 1000 / 60 / 60;
                                  if (diff < 24) return `${Math.max(1, Math.floor(diff))} hours ago`;
                                  if (diff < 48) return 'yesterday';
                                  return `${Math.floor(diff / 24)} days ago`;
                                })()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md border ${getBloodGroupColor(donor.bloodGroup)} border-transparent bg-opacity-50`}>
                              {donor.bloodGroup}
                            </span>
                            {donor.status === 'confirmed' ? (
                              <span className="bg-[#E1F5EE] text-[#085041] px-2 py-1 rounded-md text-[10px] font-bold uppercase">Confirmed</span>
                            ) : (
                              <span className="bg-[#FAEEDA] text-[#633806] px-2 py-1 rounded-md text-[10px] font-bold uppercase">Pending</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {visibleDonors < filteredDonors.length && (
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 mb-3 font-medium">+ {filteredDonors.length - visibleDonors} aur donors registered hain</p>
                        <button 
                          onClick={() => setVisibleDonors(prev => prev + 10)}
                          className="px-6 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition text-sm"
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSend={handleShareSubmit}
        title="Share Camp Link"
      />
    </div>
  );
};

export default Registrations;
  