import { useState, useEffect, useRef } from "react";
import TMDBApi from "../services/tmdbApi";

const Seasons = ({ tvShow, msid }) => {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleEpisodes, setVisibleEpisodes] = useState(10);
  const dropdownRef = useRef(null);

  // Set the first season as default selected when tvShow changes
  useEffect(() => {
    if (tvShow?.seasons && tvShow.seasons.length > 0) {
      setSelectedSeason(tvShow.seasons[0]);
    }
  }, [tvShow]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch season details when selectedSeason changes
  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!selectedSeason || !msid) return;

      try {
        const seasonData = await TMDBApi.getSeasonDetails(
          msid,
          selectedSeason.season_number
        );
        setSeasonDetails(seasonData);
        setVisibleEpisodes(10); // Reset to show first 10 episodes when season changes
      } catch (err) {
        console.error("Error fetching season details:", err);
      }
    };

    fetchSeasonDetails();
  }, [selectedSeason, msid]);

  const handleSeasonSelect = (season) => {
    setSelectedSeason(season);
    setSeasonDetails(null); // Reset season details while loading
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const loadMoreEpisodes = () => {
    setVisibleEpisodes((prev) => prev + 10);
  };

  if (!tvShow?.seasons || tvShow.seasons.length === 0) {
    return null;
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Episodes</h1>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <span className="bg-gray-900 px-2 py-1 rounded text-xs">
                {tvShow.content_ratings?.results?.[0]?.rating || "TV-MA"}
              </span>
              <span>
                {selectedSeason?.name}:{" "}
                {tvShow.content_ratings?.results?.[0]?.descriptors?.join(
                  ", "
                ) || "Violence, language, adult content"}
              </span>
            </div>
          </div>

          {/* Season Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors"
            >
              {selectedSeason?.name || "Season 1"}
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-gray-800 rounded-lg shadow-lg z-10 min-w-[120px]">
                {tvShow.seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => handleSeasonSelect(season)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors rounded-lg ${
                      selectedSeason?.id === season.id
                        ? "text-white bg-gray-700"
                        : "text-gray-300"
                    }`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Episodes List */}
        {seasonDetails && seasonDetails.episodes && (
          <div className="space-y-1">
            {seasonDetails.episodes
              .slice(0, visibleEpisodes)
              .map((episode, index) => (
                <div
                  key={episode.id}
                  className="bg-[#141414] hover:bg-gray-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4 py-4 px-6">
                    {/* Episode Number */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="text-white text-2xl font-bold">
                        {episode.episode_number}
                      </span>
                    </div>

                    {/* Episode Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={
                          episode.still_path
                            ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                            : "/placeholder.png"
                        }
                        alt={episode.name}
                        className="w-32 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    </div>

                    {/* Episode Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {episode.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {episode.overview || "No description available."}
                      </p>
                    </div>

                    {/* Episode Duration */}
                    <div className="flex-shrink-0">
                      <span className="text-white text-sm">
                        {episode.runtime ? `${episode.runtime}m` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

            {/* Load More Button */}
            {visibleEpisodes < seasonDetails.episodes.length && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={loadMoreEpisodes}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Load More Episodes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {selectedSeason && !seasonDetails && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">Loading episodes...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seasons;
