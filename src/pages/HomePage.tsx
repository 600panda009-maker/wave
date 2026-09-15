import React, { useEffect, useState } from 'react';
import { Play, Sparkles, Flame, Clock, Radio, Compass, Heart } from 'lucide-react';
import { Track } from '../types/music';
import { usePlayer } from '../features/player/PlayerContext';
import SongCard from '../components/cards/SongCard';
import SongRow from '../components/cards/SongRow';
import {
  getFeaturedTracks,
  getTracksByMood,
  getTracksByLanguage,
  fallbackTracks,
} from '../services/jamendoService';
import { getStoredHistory, getStoredTasteProfile, isOnboardingCompleted } from '../utils/storage';
import OnboardingModal from '../features/recommendations/OnboardingModal';

interface HomePageProps {
  onAddToPlaylist?: (track: Track) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToPlaylist }) => {
  const { playTrack, currentTrack } = usePlayer();
  const [greeting, setGreeting] = useState('');
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [calmTracks, setCalmTracks] = useState<Track[]>([]);
  const [emotionalTracks, setEmotionalTracks] = useState<Track[]>([]);
  const [hindiTracks, setHindiTracks] = useState<Track[]>([]);
  const [englishTracks, setEnglishTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Greeting by time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Check onboarding
    if (!isOnboardingCompleted()) {
      setShowOnboarding(true);
    }

    // Load recently played
    const history = getStoredHistory();
    const uniqueRecent = Array.from(new Set(history.map(h => h.track.id)))
      .map(id => history.find(h => h.track.id === id)!.track)
      .slice(0, 6);
    setRecentTracks(uniqueRecent);

    // Fetch categorized streams
    const loadTracks = async () => {
      setLoading(true);
      try {
        const [feat, calm, emot, hindi, eng] = await Promise.all([
          getFeaturedTracks(10),
          getTracksByMood('calm', 8),
          getTracksByMood('emotional', 8),
          getTracksByLanguage('hindi', 8),
          getTracksByLanguage('english', 8),
        ]);

        setFeaturedTracks(feat.length > 0 ? feat : fallbackTracks);
        setCalmTracks(calm.length > 0 ? calm : fallbackTracks.slice(0, 3));
        setEmotionalTracks(emot.length > 0 ? emot : fallbackTracks.slice(1, 4));
        setHindiTracks(hindi.length > 0 ? hindi : fallbackTracks.filter(t => t.language === 'Hindi'));
        setEnglishTracks(eng.length > 0 ? eng : fallbackTracks.filter(t => t.language === 'English'));
      } catch (err) {
        console.warn('Error loading home tracks:', err);
        setFeaturedTracks(fallbackTracks);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  return (
    <div className="space-y-10 pb-28 pt-2">
      {/* Greeting Banner & Quick Picks */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          {greeting}
          <Sparkles className="w-6 h-6 text-wave-400 animate-pulse-subtle" />
        </h1>

        {/* Quick Picks / Continue Listening grid */}
        {recentTracks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {recentTracks.map((track) => (
              <div
                key={`recent-${track.id}`}
                onClick={() => playTrack(track, recentTracks)}
                className="flex items-center gap-3 p-2 rounded-xl bg-surface-card/60 hover:bg-surface-hover border border-surface-border transition-all cursor-pointer group shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 relative">
                  <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white">
                    {track.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured / Trending Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Discoveries
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Streamable via Jamendo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {featuredTracks.slice(0, 10).map((track) => (
            <SongCard
              key={track.id}
              track={track}
              tracks={featuredTracks}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      </section>

      {/* Emotional & Soulful (Crucial for same-language emotional autoplay testing) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Emotional & Soulful
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Smart language radio</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {emotionalTracks.map((track) => (
            <SongCard
              key={`emot-${track.id}`}
              track={track}
              tracks={emotionalTracks}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      </section>

      {/* Language row: Hindi Melodies */}
      {hindiTracks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Hindi & Indian Melodies
              </h2>
            </div>
            <span className="text-xs text-zinc-400">Regional selection</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {hindiTracks.map((track) => (
              <SongCard
                key={`hindi-${track.id}`}
                track={track}
                tracks={hindiTracks}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        </section>
      )}

      {/* Calm & Focus */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-wave-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Calm & Focus
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Ambient & Lo-Fi</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {calmTracks.map((track) => (
            <SongCard
              key={`calm-${track.id}`}
              track={track}
              tracks={calmTracks}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      </section>

      {/* Onboarding Modal for first-time visitors */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default HomePage;
