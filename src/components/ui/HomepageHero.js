import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

export default function HomepageHero() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}&language=en-US`
        );
        const data = await res.json();
        setMovies(data.results?.slice(0, 5) || []);
      } catch {
        // silently fail — hero just won't render
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const next = useCallback(() => {
    setImageLoaded(false);
    setCurrent((c) => (c + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length === 0) return;
    const timer = setInterval(next, 9000);
    return () => clearInterval(timer);
  }, [movies.length, next]);

  if (loading) {
    return (
      <div className="relative h-[90vh] min-h-[560px] bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 animate-pulse" />
        <div className="absolute bottom-32 left-8 md:left-16 space-y-4">
          <div className="h-12 w-80 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-72 bg-gray-700 rounded animate-pulse" />
          <div className="flex gap-3 mt-6">
            <div className="h-12 w-32 bg-gray-700 rounded animate-pulse" />
            <div className="h-12 w-32 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  const movie = movies[current];
  const matchScore = movie.vote_average ? Math.round(movie.vote_average * 10) : null;
  const year = movie.release_date?.slice(0, 4);
  const genres = movie.genre_ids?.slice(0, 3).map((id) => GENRE_MAP[id]).filter(Boolean) || [];
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <div className="relative h-[90vh] min-h-[560px] overflow-hidden bg-black">
      {/* Backdrop */}
      {backdropUrl && (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover object-center"
            priority
            onLoad={() => setImageLoaded(true)}
            sizes="100vw"
          />
        </div>
      )}

      {/* Gradient overlays — left-heavy like Netflix */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full pb-28 px-8 md:px-16">
        <div className="max-w-xl">
          {/* Match Score */}
          {matchScore && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-green-400 font-bold text-lg">{matchScore}% Match</span>
              {year && <span className="text-gray-300 text-sm">{year}</span>}
              <span className="border border-gray-500 text-gray-300 text-xs px-1.5 py-0.5">HD</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight mb-4 drop-shadow-lg">
            {movie.title}
          </h1>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {genres.map((g, i) => (
                <span key={g} className="flex items-center gap-2 text-gray-300 text-sm">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-500 inline-block" />}
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-7 line-clamp-3">
            {movie.overview}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href={`/moviedetails/${movie.id}`}
              className="flex items-center gap-2 bg-white text-black font-semibold px-7 py-3 rounded-md hover:bg-white/85 transition-colors duration-200 cursor-pointer text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </Link>
            <Link
              href={`/moviedetails/${movie.id}`}
              className="flex items-center gap-2 bg-gray-500/60 hover:bg-gray-500/80 text-white font-semibold px-7 py-3 rounded-md transition-colors duration-200 cursor-pointer text-base backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Age rating badge — right side */}
      <div className="absolute bottom-28 right-0 z-10">
        <div className="border-l-2 border-gray-400 pl-3 pr-8 py-1.5">
          <span className="text-gray-300 text-sm font-medium">
            {movie.adult ? "18+" : "All Ages"}
          </span>
        </div>
      </div>

      {/* Dots indicator */}
      {movies.length > 1 && (
        <div className="absolute bottom-10 left-8 md:left-16 z-10 flex items-center gap-2">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => { setImageLoaded(false); setCurrent(i); }}
              className={`h-0.5 transition-all duration-300 cursor-pointer ${
                i === current ? "w-8 bg-white" : "w-4 bg-gray-500 hover:bg-gray-300"
              }`}
              aria-label={`Feature ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
