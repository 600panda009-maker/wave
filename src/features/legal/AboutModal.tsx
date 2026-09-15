import React from 'react';
import { X, ShieldCheck, Heart, Sparkles, Music } from 'lucide-react';
import WaveLogo from '../../components/common/WaveLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <WaveLogo size={36} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          <p>
            <strong className="text-white font-semibold">Wave</strong> is a personal, non-commercial music streaming web application designed to celebrate independent artists, intuitive player interactions, and responsive WebGL design.
          </p>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Non-Commercial</span>
            </div>
            <p className="text-xs text-emerald-300/80">
              No subscriptions, no ads, no fake premium badges, and no paywalls.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Third-Party Services & Music Attribution
            </h4>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-zinc-200">Jamendo:</strong> Audio tracks are streamed under Jamendo's official API terms and Creative Commons licenses.
              </li>
              <li>
                <strong className="text-zinc-200">Last.fm:</strong> Artist metadata, tags, and similarity signals are powered by the Last.fm Web Services.
              </li>
              <li>
                <strong className="text-zinc-200">LRCLIB:</strong> Synchronized and plain text lyrics provided by the LRCLIB open database.
              </li>
              <li>
                <strong className="text-zinc-200">OGL & React Bits:</strong> Raymarched dynamic waves background powered by OGL WebGL.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-400">
          <div className="flex gap-4">
            <button
              onClick={() => {
                onClose();
                onOpenTerms();
              }}
              className="hover:text-white underline"
            >
              Terms of Service
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenPrivacy();
              }}
              className="hover:text-white underline"
            >
              Privacy Policy
            </button>
          </div>
          <span className="text-zinc-500">Wave v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
