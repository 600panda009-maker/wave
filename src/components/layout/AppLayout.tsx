import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import DynamicBackground from '../background/DynamicBackground';
import MiniPlayer from '../../features/player/MiniPlayer';
import FullScreenPlayer from '../../features/player/FullScreenPlayer';
import QueueDrawer from '../../features/player/QueueDrawer';
import LyricsPanel from '../../features/lyrics/LyricsPanel';
import PlaylistModal from '../../features/playlists/PlaylistModal';
import AddToPlaylistMenu from '../../features/playlists/AddToPlaylistMenu';
import AboutModal from '../../features/legal/AboutModal';
import TermsModal from '../../features/legal/TermsModal';
import PrivacyModal from '../../features/legal/PrivacyModal';
import CookieNotice from '../../features/legal/CookieNotice';
import { usePlayer } from '../../features/player/PlayerContext';
import { Track, Playlist } from '../../types/music';
import { getStoredSettings } from '../../utils/storage';

export const AppLayout: React.FC = () => {
  const {
    currentTrack,
    isQueueOpen,
    setQueueOpen,
    isLyricsOpen,
    setLyricsOpen,
  } = usePlayer();

  const [isPlaylistModalOpen, setPlaylistModalOpen] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);

  const navigate = useNavigate();
  const settings = getStoredSettings();

  const handlePlaylistCreated = (pl: Playlist) => {
    navigate(`/playlist/${pl.id}`);
  };

  return (
    <div className="relative min-h-screen bg-surface-base text-zinc-100 flex flex-col selection:bg-wave-500/30 selection:text-white">
      {/* Dynamic Raymarched OGL Wave Background */}
      <DynamicBackground
        artworkUrl={currentTrack?.artworkUrl}
        enabled={settings.dynamicBackground}
        reducedMotion={settings.reducedMotion}
        intensity={settings.backgroundIntensity}
      />

      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar
          onOpenPlaylistModal={() => setPlaylistModalOpen(true)}
          onOpenAboutModal={() => setAboutOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header onOpenSettings={() => navigate('/settings')} />

          <main className="flex-1 px-4 sm:px-8 pt-6 pb-36 max-w-7xl w-full mx-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Persistent Audio Players */}
      <MiniPlayer />
      <FullScreenPlayer />

      {/* Floating Side Panels */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setQueueOpen(false)}
        onSaveQueueToPlaylist={() => setPlaylistModalOpen(true)}
      />
      <LyricsPanel
        isOpen={isLyricsOpen}
        onClose={() => setLyricsOpen(false)}
      />

      {/* Modals */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
      <AddToPlaylistMenu
        track={trackToAddToPlaylist}
        isOpen={Boolean(trackToAddToPlaylist)}
        onClose={() => setTrackToAddToPlaylist(null)}
        onOpenCreateModal={() => {
          setTrackToAddToPlaylist(null);
          setPlaylistModalOpen(true);
        }}
      />
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setAboutOpen(false)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenPrivacy={() => setPrivacyOpen(true)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setTermsOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />

      {/* Cookie / Storage Notice */}
      <CookieNotice />

      {/* Mobile Bottom Navigation (< md) */}
      <MobileNav />
    </div>
  );
};

export default AppLayout;
