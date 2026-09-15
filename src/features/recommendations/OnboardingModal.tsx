import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Music2 } from 'lucide-react';
import WaveLogo from '../../components/common/WaveLogo';
import {
  setOnboardingCompleted,
  saveStoredTasteProfile,
  getStoredTasteProfile,
  getStoredSettings,
  saveStoredSettings,
} from '../../utils/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Electronic', 'Lo-Fi']);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['Calm', 'Chill']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Instrumental']);
  const [enableDynamicBg, setEnableDynamicBg] = useState(true);

  if (!isOpen) return null;

  const genres = ['Lo-Fi', 'Electronic', 'Acoustic', 'Pop', 'Rock', 'Ambient', 'Synthwave', 'Indie', 'Jazz', 'Classical'];
  const moods = ['Calm', 'Emotional', 'Late Night', 'Focus', 'Energy', 'Romantic', 'Happy', 'Relaxing'];
  const languages = ['English', 'Hindi', 'Spanish', 'Tamil', 'Instrumental', 'French', 'Japanese'];

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = () => {
    const currentTaste = getStoredTasteProfile();

    for (const g of selectedGenres) {
      currentTaste.genres[g.toLowerCase()] = 1.0;
    }
    for (const m of selectedMoods) {
      currentTaste.moods[m.toLowerCase()] = 1.0;
    }
    for (const l of selectedLanguages) {
      currentTaste.languages[l] = 1.0;
    }

    saveStoredTasteProfile(currentTaste);

    const settings = getStoredSettings();
    saveStoredSettings({ ...settings, dynamicBackground: enableDynamicBg });

    setOnboardingCompleted(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <WaveLogo size={48} showText={false} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to Wave</h2>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            A free, ad-free music streaming experience. Tailor your starting taste profile below.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {/* Languages */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Preferred Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => {
                const active = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? 'bg-wave-500 text-white shadow-sm'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Favorite Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => {
                const active = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleItem(selectedGenres, setSelectedGenres, g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? 'bg-wave-500 text-white shadow-sm'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Moods */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Listening Moods
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => {
                const active = selectedMoods.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => toggleItem(selectedMoods, setSelectedMoods, m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? 'bg-wave-500 text-white shadow-sm'
                        : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Background Toggle */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-wave-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-200">Dynamic Artwork Waves</p>
                <p className="text-[11px] text-zinc-500">Raymarched WebGL background reacts to songs</p>
              </div>
            </div>
            <button
              onClick={() => setEnableDynamicBg(!enableDynamicBg)}
              className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                enableDynamicBg ? 'bg-wave-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  enableDynamicBg ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleSave}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Skip for now
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-wave-500 hover:bg-wave-400 text-white text-sm font-semibold shadow-lg shadow-wave-500/25 transition-all transform active:scale-95"
          >
            Start Listening
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
