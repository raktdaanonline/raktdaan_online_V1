import React, { useState } from 'react';
import { X, Send, Phone } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, onSend, title }) {
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (phone.length !== 10) {
      alert('Kripya 10 digit ka number darj karein');
      return;
    }
    setSending(true);
    await onSend(phone);
    setSending(false);
    setPhone('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#25D366] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-medium">
            <Send className="w-5 h-5" /> WhatsApp pe share karein
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-gray-500 text-sm mb-4 font-medium leading-tight">{title}</p>
          
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">+91</span>
            </div>
            <input
              type="tel"
              placeholder="10 digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition font-medium"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || phone.length !== 10}
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-[#25D366] text-white font-bold rounded-xl transition ${sending || phone.length !== 10 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1DA851] shadow-sm'}`}
            >
              {sending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>Send</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
