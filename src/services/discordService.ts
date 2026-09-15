import { Track } from '../types/music';

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '';
export const isDiscordConfigured = Boolean(DISCORD_CLIENT_ID && !DISCORD_CLIENT_ID.includes('YOUR_'));

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
}

export interface BridgeStatus {
  connected: boolean;
  rpcActive: boolean;
  message: string;
}

// Local RPC companion bridge port (typically localhost:6463 or custom WebSocket bridge)
const LOCAL_BRIDGE_URL = 'http://127.0.0.1:6463/wave-rpc';

export async function checkDesktopBridge(): Promise<BridgeStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${LOCAL_BRIDGE_URL}/status`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      return {
        connected: true,
        rpcActive: true,
        message: 'Discord Desktop Companion Bridge Connected',
      };
    }
  } catch {
    // Expected when no local bridge daemon is running on client machine
  }

  return {
    connected: false,
    rpcActive: false,
    message: 'Desktop companion not detected. Web browsers cannot access desktop Discord IPC directly.',
  };
}

export async function sendTrackToBridge(track: Track | null, isPlaying: boolean): Promise<void> {
  if (!track) return;
  try {
    await fetch(`${LOCAL_BRIDGE_URL}/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        details: track.title,
        state: `${track.artist} — ${track.album || 'Single'}`,
        isPlaying,
        startTimestamp: Date.now(),
        largeImageKey: 'wave_logo',
        largeImageText: 'Wave Music',
      }),
    });
  } catch {
    // Silently ignore if bridge is offline
  }
}
