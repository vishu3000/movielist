import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import tmdbApi from "../services/tmdbApi";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState("multi"); // 'multi', 'movie', 'tv'
  const [validation, setValidation] = useState("");
  const searchRef = useRef(null);
  const router = useRouter();

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function with debouncing
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      let searchResults = [];

      if (searchType === "multi") {
        // Search both movies and TV shows
        const [movieResults, tvResults] = await Promise.all([
          tmdbApi.searchMovies(query),
          tmdbApi.searchTVShows(query),
        ]);

        // Combine and sort by popularity
        searchResults = [
          ...movieResults.map((item) => ({ ...item, media_type: "movie" })),
          ...tvResults.map((item) => ({ ...item, media_type: "tv" })),
        ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      } else if (searchType === "movie") {
        searchResults = await tmdbApi.searchMovies(query);
      } else if (searchType === "tv") {
        searchResults = await tmdbApi.searchTVShows(query);
      }

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchType, performSearch]);

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery("");

    if (result.media_type === "tv") {
      router.push(`/tvdetails/${result.id}`);
    } else {
      router.push(`/moviedetails/${result.id}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setValidation("Please enter at least 2 characters");
      setIsOpen(true);
      return;
    }
    setValidation("");
    router.push(`/search?q=${encodeURIComponent(trimmed)}&type=${searchType}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-gray-400 transition-colors"
        aria-label="Search"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#141414] border border-gray-700 rounded-lg shadow-xl z-50">
          <form onSubmit={handleSearchSubmit} className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (validation) setValidation("");
                }}
                placeholder="Search movies, TV shows..."
                className={`flex-1 bg-gray-800 text-white px-3 py-2 rounded-md border ${
                  validation
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-600 focus:border-red-500"
                } focus:outline-none`}
                autoFocus
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Search
              </button>
            </div>

            {validation && (
              <div
                className="mt-1 text-red-400 text-sm"
                role="alert"
                aria-live="polite"
              >
                {validation}
              </div>
            )}

            {/* Search Type Tabs */}
            <div className="flex space-x-1 mb-3">
              {[
                { key: "multi", label: "All" },
                { key: "movie", label: "Movies" },
                { key: "tv", label: "TV Shows" },
              ].map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setSearchType(type.key)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    searchType === type.key
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </form>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="border-t border-gray-700">
                {results.map((result) => (
                  <div
                    key={`${result.media_type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-12 h-18">
                      {result.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                          alt={result.title || result.name}
                          width={48}
                          height={72}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {result.title || result.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>
                          {result.media_type === "tv" ? "TV Show" : "Movie"}
                        </span>
                        {result.release_date && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(result.release_date).getFullYear()}
                            </span>
                          </>
                        )}
                        {result.vote_average && (
                          <>
                            <span>•</span>
                            <span>⭐ {result.vote_average.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-400">
                No results found for &quot;{query}&quot;
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
