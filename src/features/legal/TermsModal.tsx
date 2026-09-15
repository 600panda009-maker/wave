import React from 'react';
import { X, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-wave-400" />
            <h3 className="font-bold text-lg text-white">Terms of Service</h3>
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
            <strong>1. Personal & Non-Commercial Use:</strong> Wave is a non-commercial, personal hobby application designed strictly for streaming music permitted by authorized third-party APIs. Wave does not sell music, subscriptions, or commercial licenses.
          </p>
          <p>
            <strong>2. Audio Streaming & Content:</strong> Audio tracks made accessible through Wave are provided directly by external sources such as Jamendo under their respective terms and Creative Commons licenses. Wave does not download, copy, or rehost audio files on its own infrastructure.
          </p>
          <p>
            <strong>3. Third-Party Integrations:</strong> Features connecting to Spotify, Last.fm, or Discord operate strictly through their official developer APIs. Spotify is utilized exclusively for playlist metadata and does not supply audio streaming. All respective trademarks and logos remain the property of their respective owners.
          </p>
          <p>
            <strong>4. User Conduct:</strong> Users agree not to abuse the streaming endpoints or scrape proprietary assets. Wave reserves the right to rate-limit access to protect service availability.
          </p>
          <p>
            <strong>5. Disclaimer of Warranties:</strong> The service is provided "as is" without warranty of any kind. Availability of specific songs or metadata is subject to external provider uptime.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-wave-600 hover:bg-wave-500 text-white text-xs font-semibold"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
