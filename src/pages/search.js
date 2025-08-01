import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import tmdbApi from "../services/tmdbApi";
import MovieCard from "../components/MovieCard";
import Header from "../components/Header";

export default function SearchResults() {
  const router = useRouter();
  const { q: query, type: searchType = "multi" } = router.query;
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentType, setCurrentType] = useState(searchType);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, currentType]);

  const performSearch = async () => {
    if (!query) return;

    setIsLoading(true);
    try {
      let searchResults = [];

      if (currentType === "multi") {
        searchResults = await tmdbApi.multiSearch(query);
        // Filter out people and only show movies and TV shows
        searchResults = searchResults.filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        );
      } else if (currentType === "movie") {
        searchResults = await tmdbApi.searchMovies(query);
        searchResults = searchResults.map((item) => ({
          ...item,
          media_type: "movie",
        }));
      } else if (currentType === "tv") {
        searchResults = await tmdbApi.searchTVShows(query);
        searchResults = searchResults.map((item) => ({
          ...item,
          media_type: "tv",
        }));
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setCurrentType(type);
    router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  };

  const handleResultClick = (result) => {
    if (result.media_type === "tv") {
      router.push(`/tvdetails/${result.id}`);
    } else {
      router.push(`/moviedetails/${result.id}`);
    }
  };

  if (!query) {
    return (
      <>
        <Head>
          <title>Search - Veflix</title>
        </Head>
        <Header />
        <div className="pt-24 px-4 md:px-8">
          <div className="text-center text-gray-400">
            <h1 className="text-2xl font-bold mb-4">Search</h1>
            <p>Enter a search query to find movies and TV shows.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          Search Results for &quot;{query}&quot; - Veflix
        </title>
      </Head>
      <Header />

      <div className="pt-24 px-4 md:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Search Results for &quot;{query}&quot;
          </h1>

          {/* Search Type Tabs */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: "multi", label: "All" },
              { key: "movie", label: "Movies" },
              { key: "tv", label: "TV Shows" },
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => handleTypeChange(type.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentType === type.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-gray-400">Searching...</span>
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-gray-400 mb-6">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((result) => (
                <div
                  key={`${result.media_type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="cursor-pointer"
                >
                  <MovieCard
                    movie={{
                      id: result.id,
                      title: result.title || result.name,
                      poster: result.poster_path
                        ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
                        : null,
                      year: result.release_date
                        ? new Date(result.release_date).getFullYear()
                        : result.first_air_date
                        ? new Date(result.first_air_date).getFullYear()
                        : "N/A",
                      rating: result.vote_average
                        ? result.vote_average.toFixed(1)
                        : "N/A",
                      mediaType: result.media_type,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p>
                Try adjusting your search terms or browse our categories
                instead.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push("/moviehub")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse Movies
              </button>
              <button
                onClick={() => router.push("/tvserieshub")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse TV Shows
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
