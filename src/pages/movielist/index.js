import { useState, useEffect, useCallback } from "react";
import tmdbApi from "../../services/tmdbApi";
import { Header, MovieGridLayout } from "@/components";
import { useRouter } from "next/router";
import Head from "next/head";

const CATEGORY_CONFIG = {
  popular: {
    label: "Popular",
    description: "What everyone's watching right now",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
    ),
  },
  top_rated: {
    label: "Top Rated",
    description: "Critically acclaimed and audience favorites",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
  upcoming: {
    label: "Upcoming",
    description: "Coming soon to theaters near you",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
  },
  now_playing: {
    label: "Now Playing",
    description: "In theaters this week",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    ),
  },
};

const PLATFORM_LABELS = { movie: "Movies", tv: "TV Shows" };

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const { query } = router;
  const category = query.category || "popular";
  const platform = query.platform || "movie";

  const activeConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.popular;

  useEffect(() => {
    const pageFromUrl = parseInt(query.page) || 1;
    setCurrentPage(pageFromUrl);
    setMovies([]);
    setHasMore(true);
  }, [category, query.page]);

  const fetchMovies = useCallback(
    async (page = 1, append = false) => {
      try {
        if (page === 1) setIsLoading(true);
        else setIsLoadingMore(true);
        setError(null);

        if (!process.env.NEXT_PUBLIC_MOVIE_API_KEY) {
          throw new Error("TMDB API key is missing.");
        }

        const data = await tmdbApi.getMoviesByCategory(category, page, platform);

        if (data && data.length > 0) {
          if (append) setMovies((prev) => [...prev, ...data]);
          else setMovies(data);
          setHasMore(data.length === 20);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [category, platform]
  );

  useEffect(() => {
    if (currentPage === 1) fetchMovies();
  }, [currentPage, fetchMovies]);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchMovies(nextPage, true);
    }
  }, [currentPage, isLoadingMore, hasMore, fetchMovies]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleCategoryChange = (cat) => {
    router.push({ pathname: router.pathname, query: { ...query, category: cat, page: 1 } }, undefined, { shallow: true });
  };

  const platformLabel = PLATFORM_LABELS[platform] || "Movies";
  const pageTitle = `${activeConfig.label} ${platformLabel}`;
  const description = `${activeConfig.description} — Browse ${pageTitle.toLowerCase()} on Veflix.`;

  const generateMovieListSchema = () => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle,
    description,
    url: `/movielist?category=${category}&platform=${platform}`,
    numberOfItems: movies.length,
    itemListElement: movies.slice(0, 20).map((movie, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": platform === "tv" ? "TVSeries" : "Movie",
        name: movie.title || movie.name,
        description: movie.overview,
        image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        datePublished: movie.release_date || movie.first_air_date,
        aggregateRating: movie.vote_average
          ? { "@type": "AggregateRating", ratingValue: movie.vote_average, bestRating: 10, worstRating: 0 }
          : null,
        url: platform === "tv" ? `/tvdetails/${movie.id}` : `/moviedetails/${movie.id}`,
      },
    })),
  });

  return (
    <>
      <Head>
        <title>{pageTitle} | Veflix</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={`${pageTitle.toLowerCase()}, movies, streaming, entertainment, Veflix`} />
        <meta property="og:title" content={`${pageTitle} | Veflix`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {movies.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateMovieListSchema()) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-black text-white">
        <Header />

        {/* Page header */}
        <div className="pt-20 pb-0 px-6 md:px-10">
          <div className="max-w-screen-2xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-gray-600 text-xs mb-4">
              <button
                onClick={() => router.push("/")}
                className="hover:text-gray-400 transition-colors cursor-pointer"
              >
                Home
              </button>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-500">{platformLabel}</span>
            </div>

            {/* Title row */}
            <div className="flex items-end justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-red-500">{activeConfig.icon}</span>
                <div>
                  <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                    {pageTitle}
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">{activeConfig.description}</p>
                </div>
              </div>
              {movies.length > 0 && !isLoading && (
                <span className="text-gray-600 text-sm shrink-0 pb-0.5">{movies.length}+ titles</span>
              )}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="sticky top-16 z-40 bg-black/95 backdrop-blur-md border-b border-white/[0.06] px-6 md:px-10">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const isActive = category === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-200 shrink-0 ${
                      isActive
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                        : "text-gray-400 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-gray-500"}>
                      {config.icon}
                    </span>
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="px-6 md:px-10 py-8 pb-28">
          <div className="max-w-screen-2xl mx-auto">
            <MovieGridLayout
              movies={movies}
              isLoading={isLoading}
              error={error}
              isLoadingMore={isLoadingMore}
              platform={platform}
            />
          </div>
        </div>
      </div>
    </>
  );
}
