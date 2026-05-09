import { useState, useEffect, useCallback } from "react";
import tmdbApi from "../../services/tmdbApi";
import { Header, MovieGridLayout } from "@/components";
import Head from "next/head";

const TABS = [
  {
    id: "upcoming",
    label: "Upcoming",
    description: "Coming soon to theaters near you",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "top_rated",
    label: "Top Rated",
    description: "Critically acclaimed and audience favorites",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
  {
    id: "popular",
    label: "Popular",
    description: "What everyone's watching right now",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
    ),
  },
  {
    id: "now_playing",
    label: "Now Playing",
    description: "In theaters this week",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function MovieHub() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const activeTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];

  useEffect(() => {
    setCurrentPage(1);
    setMovies([]);
    setHasMore(true);
    fetchMovies(activeTab, 1);
  }, [activeTab]);

  const fetchMovies = async (category, page = 1, append = false) => {
    try {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      if (!process.env.NEXT_PUBLIC_MOVIE_API_KEY) {
        throw new Error("TMDB API key is missing. Please add NEXT_PUBLIC_MOVIE_API_KEY to your .env.local file");
      }

      const data = await tmdbApi.getMoviesByCategory(category, page);

      if (data && data.length > 0) {
        if (append) setMovies((prev) => [...prev, ...data]);
        else setMovies(data);
        setHasMore(data.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchMovies(activeTab, nextPage, true);
    }
  }, [currentPage, isLoadingMore, hasMore, activeTab]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Head>
        <title>Movie Hub — {activeTabConfig.label} Movies | Veflix</title>
        <meta name="description" content={`${activeTabConfig.description} — Explore movies on Veflix.`} />
        <meta name="keywords" content="movies, upcoming movies, top rated movies, popular movies, now playing, Veflix" />
        <meta property="og:title" content={`Movie Hub — ${activeTabConfig.label} | Veflix`} />
        <meta property="og:description" content={activeTabConfig.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Movies — ${activeTabConfig.label} | Veflix`} />
        <meta name="twitter:description" content={activeTabConfig.description} />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <Header />

        {/* Page header */}
        <div className="pt-20 pb-2 px-4 md:px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-6 h-6 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Movies</h1>
                </div>
                <p className="text-gray-400 text-sm">{activeTabConfig.description}</p>
              </div>
              {movies.length > 0 && !isLoading && (
                <span className="text-gray-500 text-sm shrink-0">{movies.length}+ titles</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab strip — sticky below header */}
        <div className="sticky top-16 z-40 bg-black/90 backdrop-blur-md border-b border-white/5 px-4 md:px-8">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-200 shrink-0 ${
                      isActive
                        ? "bg-red-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-gray-500"}>{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-8 py-6">
          <div className="max-w-screen-2xl mx-auto">
            <MovieGridLayout
              movies={movies}
              isLoading={isLoading}
              error={error}
              isLoadingMore={isLoadingMore}
              platform="movie"
            />
          </div>
        </div>
      </div>
    </>
  );
}
