import { useState, useEffect, useCallback } from "react";
import tmdbApi from "../../services/tmdbApi";
import { Header, MovieGridLayout } from "@/components";

export default function MovieHub() {
  const [activeTab, setActiveTab] = useState("popular");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "top_rated", label: "Top Rated" },
    { id: "popular", label: "Popular" },
    { id: "now_playing", label: "Now Playing" },
  ];

  // Reset pagination when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setMovies([]);
    setHasMore(true);
    fetchMovies(activeTab, 1);
  }, [activeTab]);

  const fetchMovies = async (category, page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      if (!process.env.NEXT_PUBLIC_MOVIE_API_KEY) {
        throw new Error(
          "TMDB API key is missing. Please add NEXT_PUBLIC_MOVIE_API_KEY to your .env.local file"
        );
      }

      const data = await tmdbApi.getMoviesByCategory(category, page);

      if (data && data.length > 0) {
        if (append) {
          setMovies((prev) => [...prev, ...data]);
        } else {
          setMovies(data);
        }
        setHasMore(data.length === 20); // TMDB typically returns 20 movies per page
      } else {
        setHasMore(false);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError(err.message);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more movies when user scrolls to bottom
  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchMovies(activeTab, nextPage, true);
    }
  }, [currentPage, isLoadingMore, hasMore, activeTab]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 500 // Load when 500px from bottom
    ) {
      loadMore();
    }
  }, [loadMore]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-sm md:text-base font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-red-600 text-white border-b-2 border-red-600"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div>
          <MovieGridLayout
            movies={movies}
            isLoading={isLoading}
            error={error}
            isLoadingMore={isLoadingMore}
          />
        </div>
      </div>
    </div>
  );
}
