import { useState, useEffect, useCallback } from "react";
import tmdbApi from "../../services/tmdbApi";
import { Header, MovieGridLayout } from "@/components";

export default function TVSeriesHub() {
  const [activeTab, setActiveTab] = useState("popular");
  const [tvShows, setTvShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { id: "airing_today", label: "Airing Today" },
    { id: "top_rated", label: "Top Rated" },
    { id: "popular", label: "Popular" },
    { id: "on_the_air", label: "On The Air" },
  ];

  // Reset pagination when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setTvShows([]);
    setHasMore(true);
    fetchTVShows(activeTab, 1);
  }, [activeTab]);

  const fetchTVShows = async (category, page = 1, append = false) => {
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

      const data = await tmdbApi.getTVShowsByCategory(category, page, "tv");

      if (data && data.length > 0) {
        if (append) {
          setTvShows((prev) => [...prev, ...data]);
        } else {
          setTvShows(data);
        }
        setHasMore(data.length === 20); // TMDB typically returns 20 shows per page
      } else {
        setHasMore(false);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (err) {
      console.error("Error fetching TV shows:", err);
      setError(err.message);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more TV shows when user scrolls to bottom
  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchTVShows(activeTab, nextPage, true);
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
            movies={tvShows}
            isLoading={isLoading}
            error={error}
            isLoadingMore={isLoadingMore}
            platform="tv"
          />
        </div>
      </div>
    </div>
  );
}
