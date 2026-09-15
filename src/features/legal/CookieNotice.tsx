import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export const CookieNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem('wave_cookie_notice_ack');
    if (!acknowledged) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('wave_cookie_notice_ack', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-30 bg-surface-card/95 border border-surface-border backdrop-blur-xl p-4 rounded-2xl shadow-2xl animate-fade-in text-xs text-zinc-300 select-none">
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-wave-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-white">Essential Storage Only</p>
          <p className="text-zinc-400 leading-normal">
            Wave only uses essential browser storage to remember your queue, volume, and listening preferences. We use zero tracking or advertising cookies.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-lg bg-wave-600 hover:bg-wave-500 text-white font-medium text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CookieNotice;
