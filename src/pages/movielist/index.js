import { useState, useEffect, useCallback } from "react";
import tmdbApi from "../../services/tmdbApi";
import { Header, MovieGridLayout } from "@/components";
import { useRouter } from "next/router";

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { query } = useRouter();
  const category = query.category;
  const platform = query.platform;

  // Initialize page from URL query parameter
  useEffect(() => {
    const pageFromUrl = parseInt(query.page) || 1;
    setCurrentPage(pageFromUrl);
    setMovies([]); // Reset movies when category changes
    setHasMore(true);
  }, [category, query.page]);

  // Fetch movies for current page
  useEffect(() => {
    if (currentPage === 1) {
      fetchMovies();
    }
  }, [currentPage, category]);

  const fetchMovies = async (page = 1, append = false) => {
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

      const data = await tmdbApi.getMoviesByCategory(category, page, platform);

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
      await fetchMovies(nextPage, true);
    }
  }, [currentPage, isLoadingMore, hasMore, category]);

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

  return (
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
  );
}
