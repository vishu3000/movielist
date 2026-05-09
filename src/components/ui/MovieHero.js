import Image from "next/image";
import { Genre } from "../index";
import { useEffect, useState } from "react";

const MovieHero = ({ movie, onTrailerClick }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/watchlist");
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const exists = items.some(
          (i) => i.tmdbId === String(movie.id) && i.mediaType === "movie"
        );
        if (!cancelled) setAdded(exists);
      } catch (_) {}
    };
    if (movie?.id) check();
    return () => { cancelled = true; };
  }, [movie?.id]);

  const handleAddToList = async () => {
    if (adding || added) return;
    setAdding(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: movie.id,
          mediaType: "movie",
          title: movie.title,
          poster: movie.poster,
          backdrop: movie.backdrop,
        }),
      });
      if (res.status === 401) { window.location.href = "/auth/login"; return; }
      if (!res.ok) throw new Error("Failed");
      setAdded(true);
    } catch {
      alert("Failed to add to list. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const score = movie.rating_score;
  const scoreColor =
    score >= 7.5 ? "text-green-400" : score >= 6 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="relative w-full">
      {/* Backdrop */}
      <div className="relative w-full h-[85vh] min-h-[560px] max-h-[900px] overflow-hidden">
        {movie.backdrop ? (
          <img
            src={movie.backdrop}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}

        {/* Gradient overlays - cinematic */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-10 pb-16 md:pb-20 flex gap-10 items-end">
            {/* Poster — hidden on mobile */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-52 xl:w-60 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {movie.poster ? (
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    width={240}
                    height={360}
                    className="w-full h-auto object-cover"
                    priority
                  />
                ) : (
                  <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              {/* Title */}
              <h1 className="text-white font-bold leading-tight mb-3 text-4xl md:text-5xl xl:text-6xl drop-shadow-lg">
                {movie.title}
              </h1>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {movie.year && (
                  <span className="text-gray-300 text-sm font-medium">{movie.year}</span>
                )}
                {movie.rating && (
                  <span className="border border-gray-500 text-gray-300 text-xs px-2 py-0.5 rounded font-medium tracking-wide">
                    {movie.rating}
                  </span>
                )}
                {movie.duration && (
                  <span className="text-gray-300 text-sm">{movie.duration}</span>
                )}
                {score > 0 && (
                  <span className={`flex items-center gap-1 text-sm font-semibold ${scoreColor}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {score.toFixed(1)}
                  </span>
                )}
                {movie.quality && (
                  <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded font-bold tracking-widest">
                    {movie.quality}
                  </span>
                )}
              </div>

              {/* Description */}
              {movie.description && (
                <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl mb-5 line-clamp-3">
                  {movie.description}
                </p>
              )}

              {/* Genres */}
              <div className="mb-6">
                <Genre genres={movie.genres} />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                {movie.trailer && (
                  <button
                    onClick={onTrailerClick}
                    className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black font-bold px-6 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play Trailer
                  </button>
                )}
                <button
                  onClick={handleAddToList}
                  disabled={adding || added}
                  className={`flex items-center gap-2 font-bold px-6 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer border ${
                    added
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-transparent border-white/50 text-white hover:bg-white/10 hover:border-white"
                  } disabled:opacity-60`}
                >
                  {added ? (
                    <>
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      In My List
                    </>
                  ) : adding ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      My List
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;
