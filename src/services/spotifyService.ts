import { Track, Playlist } from '../types/music';
import { searchTracks } from './jamendoService';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/settings` : '';

export const isSpotifyConfigured = Boolean(SPOTIFY_CLIENT_ID && !SPOTIFY_CLIENT_ID.includes('YOUR_'));

// Spotify PKCE OAuth helper
export async function initiateSpotifyAuth(): Promise<void> {
  if (!isSpotifyConfigured) {
    alert('Please configure VITE_SPOTIFY_CLIENT_ID in your environment to connect Spotify.');
    return;
  }

  // Generate code verifier and challenge
  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_code_verifier', verifier);

  const scope = 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';
  const args = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${args.toString()}`;
}

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function matchSpotifyTrackToJamendo(title: string, artist: string): Promise<Track | null> {
  try {
    const candidates = await searchTracks(`${title} ${artist}`, 5);
    if (candidates.length > 0) {
      // Find candidate matching either title or artist
      const titleLower = title.toLowerCase();
      const match = candidates.find(c =>
        c.title.toLowerCase().includes(titleLower) ||
        titleLower.includes(c.title.toLowerCase())
      );
      return match || candidates[0];
    }
  } catch (err) {
    console.warn('Matching Spotify track to Jamendo failed:', err);
  }
  return null;
}
