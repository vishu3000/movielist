import { useState, useCallback } from "react";
import tmdbApi from "../services/tmdbApi";

export function useSearch() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, type = "multi") => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let searchResults = [];

      if (type === "multi") {
        searchResults = await tmdbApi.multiSearch(query);
        // Filter out people and only show movies and TV shows
        searchResults = searchResults.filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );
      } else if (type === "movie") {
        searchResults = await tmdbApi.searchMovies(query);
        searchResults = searchResults.map((item) => ({
          ...item,
          media_type: "movie",
        }));
      } else if (type === "tv") {
        searchResults = await tmdbApi.searchTVShows(query);
        searchResults = searchResults.map((item) => ({
          ...item,
          media_type: "tv",
        }));
      }

      setResults(searchResults);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}
