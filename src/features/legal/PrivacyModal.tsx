import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-wave-400" />
            <h3 className="font-bold text-lg text-white">Privacy Policy</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p>
            <strong>1. Local-First & Anonymous by Default:</strong> Wave is designed to function seamlessly without requiring an account. Your listening history, liked tracks, and personalized taste profiles are stored locally on your device in standard browser storage.
          </p>
          <p>
            <strong>2. Cloud Synchronization (Optional):</strong> When you choose to authenticate via Auth0 and connect to Supabase, your playlist, like, and history records are synchronized securely to your personal account protected by Postgres Row Level Security (RLS).
          </p>
          <p>
            <strong>3. No Tracking / No Ads:</strong> Wave contains zero third-party advertising trackers, no ad networks, and no data broker partnerships.
          </p>
          <p>
            <strong>4. Cookies & Storage:</strong> Wave uses only essential browser localStorage/session storage for saving your volume preferences, active queue, theme, and taste metrics.
          </p>
          <p>
            <strong>5. Data Deletion:</strong> You have the absolute right to delete all your stored history and taste profile data at any moment via the Settings page.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-wave-600 hover:bg-wave-500 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
