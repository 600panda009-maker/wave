# Wave — Non-Commercial Music Streaming Web Application

Wave is a production-quality, responsive, non-commercial music streaming web application inspired by the usability, density, navigation patterns, and player interaction philosophy of YouTube Music, built with an independent visual identity.

Wave features dynamic artwork-driven WebGL backgrounds using raymarched sine waves, legitimate audio streaming via Jamendo, discovery & recommendation signals via Last.fm, synchronized lyrics with millisecond timestamp seeking, infinite autoplay with same-language emotional affinity, custom playlists, and local-first storage with optional Auth0 and Supabase cloud synchronization.

---

## Key Features

- **Brand Identity & Logo:**
  - Distinctive Wave circular soundwave/vinyl brand mark.
  - No commercial elements, no subscriptions, no ads, and no paywalls.
- **Dynamic Background:**
  - Powered by OGL WebGL raymarched sine waves (`GradientWaves`).
  - Automatically extracts dominant horizon, wave, and crest colors from the currently playing song's cover art with smooth transitions and contrast adjustments for accessibility.
  - Automatically respects `prefers-reduced-motion` and pauses when the tab is hidden.
- **Audio Playback Engine:**
  - Backed by native `HTMLAudioElement` with full seek, buffering percentage, sleep timer countdown, repeat modes (`off`, `all`, `one`), shuffle, volume normalization, and Media Session API.
  - Global keyboard shortcuts: `Space` (play/pause), `ArrowLeft`/`ArrowRight` (seek 5s), `ArrowUp`/`ArrowDown` (volume), `M` (mute), `F` (toggle full-screen).
- **Full-Screen Immersive Player:**
  - Viewport takeover featuring large centered album artwork, glowing dynamic backdrop, synchronized scrolling lyrics panel, queue view, and thumb-friendly controls.
- **Infinite Autoplay & Emotional Radio:**
  - Automatically queues candidate tracks when approaching queue completion.
  - **Emotional & Language Affinity:** For emotional/romantic tracks, strongly prioritizes candidate tracks sharing the exact same language (Hindi, English, Tamil, Spanish, etc.).
- **Synchronized Lyrics:**
  - Multi-provider fallback chain (LRCLIB, Paxsenix, SimpMusic).
  - Highlights active line, auto-scrolls, and supports click-to-seek directly to timestamp.
- **Top 50 Charts:**
  - Wave Global Top 50 (aggregated community plays from Supabase with anti-gaming play duration threshold).
  - My Top 50 (personal chart calculated from listening history).
  - Filterable by All Time, Last 30 Days, and Last 7 Days.
- **Playlists & Spotify Import:**
  - Create, edit, and delete Wave playlists.
  - Spotify PKCE OAuth integration to import playlists and map them to streamable Jamendo tracks (Wave never streams proprietary Spotify audio).
- **Discord Integration:**
  - Account linking via OAuth.
  - Companion desktop bridge architecture for real Discord Rich Presence ("Listening to Wave — Song Name") without faking browser support.
- **Local-First & Cloud Sync:**
  - Works 100% out of the box without requiring login.
  - Seamlessly merges guest history, likes, and playlists to Supabase when logging in with Auth0.

---

## Tech Stack

- **Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS
- **Graphics/WebGL:** OGL (Minimal WebGL library)
- **Icons:** Lucide React
- **Database & Auth:** Supabase (`@supabase/supabase-js`), Auth0 (`@auth0/auth0-react`)
- **Testing:** Vitest

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
# Jamendo Client ID (Audio streaming)
VITE_JAMENDO_CLIENT_ID=

# Last.fm API Key (Metadata, tags, artist similarity)
VITE_LASTFM_API_KEY=

# Auth0 SPA Configuration
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=

# Supabase Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# Optional Integrations
VITE_SPOTIFY_CLIENT_ID=
VITE_DISCORD_CLIENT_ID=
```

---

## Getting Started

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Tests
```bash
npm run test
```

### Production Build
```bash
npm run build
```

---

## Database Schema & Migrations

PostgreSQL tables and Row Level Security (RLS) policies are defined in:
`supabase/migrations/20260915000000_initial_wave_schema.sql`

Tables created:
- `profiles`
- `listening_history`
- `liked_tracks`
- `playlists`
- `playlist_tracks`
- `taste_profiles`
- `spotify_connections`
- `discord_connections`
- `track_play_stats` (Global Top 50 aggregation)

---

## Attribution & Legal

Wave is a personal, non-commercial open project. Music is streamed through Jamendo under respective Creative Commons licenses. Metadata is supplied by Last.fm and lyrics by LRCLIB. All third-party trademarks and logos belong to their respective owners.
