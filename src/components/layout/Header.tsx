import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogIn, LogOut, Settings } from 'lucide-react';
import WaveLogo from '../common/WaveLogo';
import { isAuth0Configured } from '../../lib/auth0';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-surface-base/80 backdrop-blur-md border-b border-surface-border">
      {/* Mobile Logo (< md) */}
      <div className="md:hidden flex items-center">
        <WaveLogo size={32} showText={false} />
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-3 sm:mx-6">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, moods, genres..."
            className="w-full bg-surface-card/80 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-wave-500 focus:ring-1 focus:ring-wave-500 transition-all"
          />
        </div>
      </form>

      {/* Right: Guest / Auth Profile */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card/60 border border-surface-border text-xs text-zinc-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Guest Mode</span>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
