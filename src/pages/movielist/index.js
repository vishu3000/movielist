import { useState, useEffect, useCallback } from "react";
import tmdbApi from "../../services/tmdbApi";
import { Header, MovieGridLayout } from "@/components";
import { useRouter } from "next/router";
import Head from "next/head";

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const { query } = router;
  const category = query.category;
  const platform = query.platform;

  // Initialize page from URL query parameter
  useEffect(() => {
    const pageFromUrl = parseInt(query.page) || 1;
    setCurrentPage(pageFromUrl);
    setMovies([]); // Reset movies when category changes
    setHasMore(true);
  }, [category, query.page]);

  const fetchMovies = useCallback(
    async (page = 1, append = false) => {
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

        const data = await tmdbApi.getMoviesByCategory(
          category,
          page,
          platform
        );

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
    },
    [category, platform]
  );

  // Fetch movies for current page
  useEffect(() => {
    if (currentPage === 1) {
      fetchMovies();
    }
  }, [currentPage, fetchMovies]);

  // Load more movies when user scrolls to bottom
  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchMovies(nextPage, true);
    }
  }, [currentPage, isLoadingMore, hasMore, fetchMovies]);

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

  // Generate dynamic title and description based on category
  const getPageMeta = () => {
    const categoryLabels = {
      popular: "Popular Movies",
      top_rated: "Top Rated Movies",
      upcoming: "Upcoming Movies",
      now_playing: "Now Playing Movies",
    };

    const title = categoryLabels[category] || "Movies";
    const description = `Browse ${title.toLowerCase()} on Veflix. Discover the latest releases, top-rated films, and popular movies with detailed information and streaming availability.`;

    return { title, description };
  };

  const { title, description } = getPageMeta();

  // Generate JSON-LD schema for movie list
  const generateMovieListSchema = (movies, category, platform) => {
    const categoryLabels = {
      popular: "Popular Movies",
      top_rated: "Top Rated Movies",
      upcoming: "Upcoming Movies",
      now_playing: "Now Playing Movies",
    };

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: categoryLabels[category] || "Movies",
      description: `Browse ${
        categoryLabels[category]?.toLowerCase() || "movies"
      } on Veflix`,
      url: `/movielist?category=${category}&platform=${platform}`,
      numberOfItems: movies.length,
      itemListElement: movies.slice(0, 20).map((movie, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": platform === "tv" ? "TVSeries" : "Movie",
          name: movie.title || movie.name,
          description: movie.overview,
          image: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
          datePublished: movie.release_date || movie.first_air_date,
          aggregateRating: movie.vote_average
            ? {
                "@type": "AggregateRating",
                ratingValue: movie.vote_average,
                bestRating: 10,
                worstRating: 0,
              }
            : null,
          url:
            platform === "tv"
              ? `/tvdetails/${movie.id}`
              : `/moviedetails/${movie.id}`,
        },
      })),
    };

    return schema;
  };

  return (
    <>
      <Head>
        <title>{title} | Veflix</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content={`${title.toLowerCase()}, movies, streaming, entertainment, Veflix`}
        />
        <meta property="og:title" content={`${title} | Veflix`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Veflix`} />
        <meta name="twitter:description" content={description} />
        {/* JSON-LD ItemList Schema */}
        {movies.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                generateMovieListSchema(movies, category, platform)
              ),
            }}
          />
        )}
      </Head>
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16">
          <MovieGridLayout
            movies={movies}
            isLoading={isLoading}
            error={error}
            isLoadingMore={isLoadingMore}
            platform={platform}
          />
        </div>
      </div>
    </>
  );
}
