import React, { useState } from 'react';
import { Moon, X, Check, Clock } from 'lucide-react';
import { usePlayer } from './PlayerContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimer, sleepTimerLabel, setSleepTimer, duration, currentTime } = usePlayer();
  const [customMinutes, setCustomMinutes] = useState('');

  if (!isOpen) return null;

  const handleSelect = (mins: number, label: string) => {
    setSleepTimer(mins, label);
    onClose();
  };

  const handleEndOfSong = () => {
    const remainingSeconds = Math.max(10, duration - currentTime);
    const remainingMinutes = remainingSeconds / 60;
    setSleepTimer(remainingMinutes, 'End of Song');
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customMinutes, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 360) {
      setSleepTimer(parsed, `${parsed}m`);
      onClose();
    }
  };

  const handleTurnOff = () => {
    setSleepTimer(null);
    onClose();
  };

  const timerOptions = [
    { mins: 5, label: '5 minutes' },
    { mins: 10, label: '10 minutes' },
    { mins: 15, label: '15 minutes' },
    { mins: 30, label: '30 minutes' },
    { mins: 45, label: '45 minutes' },
    { mins: 60, label: '1 hour' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Moon className="w-5 h-5 text-wave-400" />
            <h3 className="font-semibold text-lg text-white">Sleep Timer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sleepTimer && (
          <div className="my-4 p-3 rounded-xl bg-wave-500/10 border border-wave-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-wave-300">
              <Clock className="w-4 h-4" />
              <span>Active: {sleepTimerLabel}</span>
            </div>
            <button
              onClick={handleTurnOff}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline"
            >
              Turn Off
            </button>
          </div>
        )}

        <div className="mt-3 space-y-1">
          {timerOptions.map((opt) => {
            const isSelected = sleepTimerLabel === opt.label || sleepTimerLabel === `${opt.mins}m`;
            return (
              <button
                key={opt.mins}
                onClick={() => handleSelect(opt.mins, opt.label)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-wave-600/30 text-wave-300 border border-wave-500/30'
                    : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-wave-400" />}
              </button>
            );
          })}

          <button
            onClick={handleEndOfSong}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              sleepTimerLabel === 'End of Song'
                ? 'bg-wave-600/30 text-wave-300 border border-wave-500/30'
                : 'text-zinc-200 hover:bg-white/5'
            }`}
          >
            <span>End of current song</span>
            {sleepTimerLabel === 'End of Song' && <Check className="w-4 h-4 text-wave-400" />}
          </button>
        </div>

        <form onSubmit={handleCustomSubmit} className="mt-4 pt-4 border-t border-white/10 flex gap-2">
          <input
            type="number"
            min="1"
            max="360"
            placeholder="Custom mins"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-wave-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-wave-600 hover:bg-wave-500 text-white text-sm font-medium transition-colors"
          >
            Set
          </button>
        </form>
      </div>
    </div>
  );
};

export default SleepTimerModal;
