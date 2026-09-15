import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Compass, Music2, Filter, Loader2, Sparkles } from 'lucide-react';
import { Track } from '../types/music';
import SongCard from '../components/cards/SongCard';
import SongRow from '../components/cards/SongRow';
import { searchTracks, getTracksByGenre, fallbackTracks } from '../services/jamendoService';
import { getSimilarArtists, getTrackTags } from '../services/lastfmService';

interface ExplorePageProps {
  onAddToPlaylist?: (track: Track) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ onAddToPlaylist }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'genres'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const exploreGenres = [
    'Lo-Fi', 'Electronic', 'Synthwave', 'Ambient', 'Chillout', 'Acoustic',
    'Rock', 'Pop', 'Indie', 'Jazz', 'Classical', 'World'
  ];

  // Search logic with debouncing
  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      if (selectedTag) {
        setLoading(true);
        getTracksByGenre(selectedTag.toLowerCase(), 20).then(tracks => {
          setResults(tracks);
          setLoading(false);
        });
      } else {
        setResults(fallbackTracks);
      }
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const tracks = await searchTracks(query, 20);
        setResults(tracks);
      } catch (err) {
        console.warn('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedTag]);

  const handleTagClick = (genre: string) => {
    if (selectedTag === genre) {
      setSelectedTag(null);
      setSearchTerm('');
    } else {
      setSelectedTag(genre);
      setSearchTerm('');
      setSearchParams({ q: genre });
    }
  };

  return (
    <div className="space-y-8 pb-28 pt-2">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Explore & Search
          <Compass className="w-6 h-6 text-wave-400" />
        </h1>

        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
              if (selectedTag) setSelectedTag(null);
            }}
            placeholder="Search songs, artists, moods, genres..."
            className="w-full bg-surface-card border border-surface-border rounded-2xl pl-12 pr-4 py-3.5 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-wave-500 focus:ring-2 focus:ring-wave-500/20 shadow-lg"
          />
        </div>
      </div>

      {/* Genre Pills */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Popular Genres & Moods
        </span>
        <div className="flex flex-wrap gap-2">
          {exploreGenres.map((genre) => {
            const isSelected = selectedTag === genre || searchTerm.toLowerCase() === genre.toLowerCase();
            return (
              <button
                key={genre}
                onClick={() => handleTagClick(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-wave-500 text-white shadow-md shadow-wave-500/25'
                    : 'bg-surface-card hover:bg-surface-hover text-zinc-300 border border-surface-border'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Results */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {searchTerm ? `Results for "${searchTerm}"` : selectedTag ? `${selectedTag} Selection` : 'Discoverable Music'}
          </h2>
          {results.length > 0 && (
            <span className="text-xs text-zinc-400 font-mono">
              {results.length} tracks found
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-wave-400" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-surface-card/40 rounded-3xl border border-surface-border p-8">
            <Music2 className="w-12 h-12 text-zinc-600" />
            <h3 className="text-lg font-bold text-zinc-200">No streamable tracks found</h3>
            <p className="text-sm text-zinc-400 max-w-sm">
              We couldn't find a matching stream on Jamendo for "{searchTerm}". Try searching by another genre or artist name.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((track) => (
              <SongCard
                key={track.id}
                track={track}
                tracks={results}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;
