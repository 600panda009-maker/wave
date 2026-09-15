import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Library,
  Heart,
  History,
  Trophy,
  Plus,
  Settings,
  ShieldCheck,
  Info,
} from 'lucide-react';
import WaveLogo from '../common/WaveLogo';
import { usePlayer } from '../../features/player/PlayerContext';
import { getStoredPlaylists } from '../../utils/storage';

interface SidebarProps {
  onOpenPlaylistModal?: () => void;
  onOpenAboutModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenPlaylistModal, onOpenAboutModal }) => {
  const { isPlaying } = usePlayer();
  const playlists = getStoredPlaylists();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/library', label: 'Library', icon: Library },
    { to: '/liked', label: 'Liked Songs', icon: Heart },
    { to: '/history', label: 'History', icon: History },
    { to: '/top50', label: 'Top 50', icon: Trophy },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 h-screen bg-surface-card/60 backdrop-blur-xl border-r border-surface-border p-4 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="px-2 py-3 mb-4">
        <NavLink to="/" className="inline-block">
          <WaveLogo isSpinning={isPlaying} size={38} />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-wave-500/15 text-wave-300 font-semibold border border-wave-500/25 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Playlists Section */}
      <div className="mt-8 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            Playlists
          </span>
          {onOpenPlaylistModal && (
            <button
              onClick={onOpenPlaylistModal}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Create playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {playlists.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500 italic">No playlists yet</p>
          ) : (
            playlists.map((pl) => (
              <NavLink
                key={pl.id}
                to={`/playlist/${pl.id}`}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-lg text-xs font-medium truncate transition-colors ${
                    isActive
                      ? 'text-wave-300 bg-white/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`
                }
              >
                {pl.name}
              </NavLink>
            ))
          )}
        </div>
      </div>

      {/* Footer / About / Non-commercial badge */}
      <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-zinc-500">
        <div className="flex items-center justify-between px-2">
          <NavLink
            to="/settings"
            className="flex items-center gap-2 hover:text-zinc-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>
          {onOpenAboutModal && (
            <button
              onClick={onOpenAboutModal}
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          )}
        </div>

        <div className="px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-[11px] font-medium leading-none">Non-commercial & Ad-free</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
