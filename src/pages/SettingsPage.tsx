import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Palette,
  Volume2,
  Mic2,
  Share2,
  Database,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredHistory,
  saveStoredHistory,
  getStoredTasteProfile,
  saveStoredTasteProfile,
  defaultTasteProfile,
} from '../utils/storage';
import { AppSettings } from '../types/user';
import { isLastFmConfigured } from '../services/lastfmService';
import { getJamendoClientId } from '../services/jamendoService';
import { isSupabaseConfigured } from '../lib/supabase';
import { isAuth0Configured } from '../lib/auth0';
import { isSpotifyConfigured, initiateSpotifyAuth } from '../services/spotifyService';
import { isDiscordConfigured, checkDesktopBridge, BridgeStatus } from '../services/discordService';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus | null>(null);
  const [checkingBridge, setCheckingBridge] = useState(false);

  useEffect(() => {
    handleCheckBridge();
  }, []);

  const handleCheckBridge = async () => {
    setCheckingBridge(true);
    const status = await checkDesktopBridge();
    setBridgeStatus(status);
    setCheckingBridge(false);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all your listening history?')) {
      saveStoredHistory([]);
      alert('Listening history cleared.');
    }
  };

  const handleResetTaste = () => {
    if (confirm('Reset your personalized recommendation taste profile?')) {
      saveStoredTasteProfile(defaultTasteProfile);
      alert('Taste profile reset.');
    }
  };

  const handleExportData = () => {
    const data = {
      history: getStoredHistory(),
      tasteProfile: getStoredTasteProfile(),
      settings: getStoredSettings(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wave_data_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 pb-32 pt-2 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Settings & Integrations
          <SettingsIcon className="w-6 h-6 text-wave-400" />
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure playback, dynamic visualizer, APIs, and privacy settings.
        </p>
      </div>

      {/* Appearance Section */}
      <section className="p-6 rounded-3xl bg-surface-card/70 border border-surface-border space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Palette className="w-5 h-5 text-wave-400" />
          <h2 className="text-lg font-bold text-white">Appearance & WebGL Visualizer</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Dynamic Background</p>
              <p className="text-xs text-zinc-400">
                Raymarched OGL wave shader reacts to the current song's album artwork colors.
              </p>
            </div>
            <button
              onClick={() => updateSetting('dynamicBackground', !settings.dynamicBackground)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.dynamicBackground ? 'bg-wave-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.dynamicBackground ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Reduced Motion</p>
              <p className="text-xs text-zinc-400">
                Stops continuous WebGL wave motion to conserve battery or prevent motion fatigue.
              </p>
            </div>
            <button
              onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.reducedMotion ? 'bg-wave-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Playback Section */}
      <section className="p-6 rounded-3xl bg-surface-card/70 border border-surface-border space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Volume2 className="w-5 h-5 text-wave-400" />
          <h2 className="text-lg font-bold text-white">Playback & Radio</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Infinite Autoplay</p>
              <p className="text-xs text-zinc-400">
                Automatically queue similar songs based on mood, tags, and language affinity.
              </p>
            </div>
            <button
              onClick={() => updateSetting('autoplay', !settings.autoplay)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.autoplay ? 'bg-wave-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoplay ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Explicit Content Filter</p>
              <p className="text-xs text-zinc-400">Filter or show tracks tagged with explicit content.</p>
            </div>
            <select
              value={settings.explicitContentFilter}
              onChange={(e) => updateSetting('explicitContentFilter', e.target.value as any)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-wave-500"
            >
              <option value="show">Show explicit songs</option>
              <option value="hide">Hide explicit songs</option>
              <option value="warn">Warn before playback</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lyrics Configuration */}
      <section className="p-6 rounded-3xl bg-surface-card/70 border border-surface-border space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Mic2 className="w-5 h-5 text-wave-400" />
          <h2 className="text-lg font-bold text-white">Lyrics Provider</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Preferred Lyrics Source</p>
              <p className="text-xs text-zinc-400">Primary provider with automatic fallback cascade.</p>
            </div>
            <select
              value={settings.preferredLyricsProvider}
              onChange={(e) => updateSetting('preferredLyricsProvider', e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-wave-500"
            >
              <option value="lrclib">LRCLIB (Default synced)</option>
              <option value="paxsenix">Paxsenix</option>
              <option value="simpmusic">SimpMusic</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Auto-Scroll Lyrics</p>
              <p className="text-xs text-zinc-400">Keep the active singing line centered.</p>
            </div>
            <button
              onClick={() => updateSetting('autoScrollLyrics', !settings.autoScrollLyrics)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.autoScrollLyrics ? 'bg-wave-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoScrollLyrics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* API Integrations Status */}
      <section className="p-6 rounded-3xl bg-surface-card/70 border border-surface-border space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Share2 className="w-5 h-5 text-wave-400" />
          <h2 className="text-lg font-bold text-white">API Services & Connections</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Jamendo */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Jamendo Audio</span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Active Client ID: <code className="text-zinc-300">{getJamendoClientId()}</code>
            </p>
          </div>

          {/* Last.fm */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Last.fm Metadata</span>
              {isLastFmConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" /> Key Missing
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">Provides artist similarity and tag discovery.</p>
          </div>

          {/* Supabase */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Supabase Cloud</span>
              {isSupabaseConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  Offline (Local Mode)
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">Stores Global Top 50 play statistics and user backups.</p>
          </div>

          {/* Auth0 */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Auth0 Identity</span>
              {isAuth0Configured ? (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  Guest Mode
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">Single Sign-On authentication for cross-device sync.</p>
          </div>
        </div>

        {/* Spotify OAuth */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Spotify Playlist Import</p>
            <p className="text-xs text-zinc-400">
              Connect your Spotify account to import playlists and find streamable Jamendo matches. (Wave never streams proprietary Spotify audio).
            </p>
          </div>
          <button
            onClick={initiateSpotifyAuth}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex-shrink-0 transition-colors"
          >
            Connect Spotify
          </button>
        </div>

        {/* Discord Rich Presence Bridge */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">Discord Rich Presence</p>
              <p className="text-xs text-zinc-400">
                Desktop companion bridge status for "Listening to Wave" presence.
              </p>
            </div>
            <button
              onClick={handleCheckBridge}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingBridge ? 'animate-spin' : ''}`} />
              Check Bridge
            </button>
          </div>

          <div className="p-3 rounded-xl bg-black/40 text-xs text-zinc-400 font-mono space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>Status: {bridgeStatus?.connected ? 'Connected' : 'Offline'}</span>
            </div>
            <p className="text-[11px] text-zinc-500">{bridgeStatus?.message}</p>
          </div>
        </div>
      </section>

      {/* Privacy & Data Management */}
      <section className="p-6 rounded-3xl bg-surface-card/70 border border-surface-border space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Database className="w-5 h-5 text-wave-400" />
          <h2 className="text-lg font-bold text-white">Privacy & Local Storage</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-xs font-semibold text-zinc-200 transition-all"
          >
            <Download className="w-4 h-4" />
            Export My Data (JSON)
          </button>

          <button
            onClick={handleResetTaste}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Taste Profile
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear Listening History
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
