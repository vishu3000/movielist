import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import TMDBApi from "../services/tmdbApi";

const Seasons = ({ tvShow, msid }) => {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleEpisodes, setVisibleEpisodes] = useState(10);
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (tvShow?.seasons?.length > 0) {
      setSelectedSeason(tvShow.seasons[0]);
    }
  }, [tvShow]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedSeason || !msid) return;
    setSeasonDetails(null);
    setVisibleEpisodes(10);
    setExpandedEpisode(null);
    TMDBApi.getSeasonDetails(msid, selectedSeason.season_number)
      .then(setSeasonDetails)
      .catch(console.error);
  }, [selectedSeason, msid]);

  if (!tvShow?.seasons?.length) return null;

  const contentRating = tvShow.content_ratings?.results?.[0]?.rating || "TV-MA";

  return (
    <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold tracking-tight mb-1">Episodes</h2>
          <div className="flex items-center gap-2">
            <span className="border border-gray-600 text-gray-400 text-[10px] px-2 py-0.5 rounded font-medium tracking-wide">
              {contentRating}
            </span>
            {selectedSeason && (
              <span className="text-gray-500 text-xs">{selectedSeason.name}</span>
            )}
          </div>
        </div>

        {/* Season Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {selectedSeason?.name || "Season 1"}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden py-1">
              {tvShow.seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => { setSelectedSeason(season); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    selectedSeason?.id === season.id
                      ? "text-white bg-red-600/20 font-semibold"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Episodes */}
      {seasonDetails?.episodes ? (
        <div className="space-y-1">
          {seasonDetails.episodes.slice(0, visibleEpisodes).map((episode) => {
            const isExpanded = expandedEpisode === episode.id;
            return (
              <div
                key={episode.id}
                className="group rounded-xl overflow-hidden hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                onClick={() => setExpandedEpisode(isExpanded ? null : episode.id)}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Episode number */}
                  <div className="flex-shrink-0 w-8 pt-1 text-right">
                    <span className="text-gray-500 text-base font-medium">
                      {episode.episode_number}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-900"
                    style={{ width: 128, height: 72 }}>
                    {episode.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    {/* Play hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-white text-sm font-semibold leading-snug line-clamp-1 group-hover:text-red-400 transition-colors duration-200">
                        {episode.name}
                      </h4>
                      <span className="flex-shrink-0 text-gray-500 text-xs pt-0.5">
                        {episode.runtime ? `${episode.runtime}m` : ""}
                      </span>
                    </div>
                    <p className={`text-gray-400 text-xs leading-relaxed mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
                      {episode.overview || "No description available."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {visibleEpisodes < seasonDetails.episodes.length && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); setVisibleEpisodes((v) => v + 10); }}
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show more episodes
              </button>
            </div>
          )}
        </div>
      ) : selectedSeason ? (
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl animate-pulse">
              <div className="w-8 h-4 bg-white/10 rounded mt-1" />
              <div className="w-32 h-18 bg-white/10 rounded-lg" style={{ height: 72 }} />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-white/10 rounded w-2/3" />
                <div className="h-2.5 bg-white/5 rounded w-full" />
                <div className="h-2.5 bg-white/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Seasons;
