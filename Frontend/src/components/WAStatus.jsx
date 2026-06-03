import React, { useState, useEffect } from 'react';
import organizerService from '../services/organizerService';

export default function WAStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await organizerService.checkWAStatus();
        setConnected(data.connected);
      } catch (err) {
        setConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${connected ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-red-50 text-red-600'}`}>
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#25D366]' : 'bg-[#E24B4A] animate-pulse'}`} />
      {connected ? 'WhatsApp connected' : 'WhatsApp offline'}
    </div>
  );
}
