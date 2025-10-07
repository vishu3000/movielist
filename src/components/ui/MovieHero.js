import Image from "next/image";
import { Genre } from "../index";
import { useEffect, useState } from "react";

const MovieHero = ({ movie, onTrailerClick }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

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
      } catch (_) {
        // ignore
      }
    };
    if (movie?.id) check();
    return () => {
      cancelled = true;
    };
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

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to add to list");
      setAdded(true);
    } catch (e) {
      alert("Failed to add to list. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-[700px] bg-gradient-to-t from-black via-black/60 to-transparent">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: movie.backdrop
                ? `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url('${movie.backdrop}')`
                : `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url('https://images.unsplash.com/photo-1489599077428-c3a6370a4837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16 px-8 max-w-7xl mx-auto">
        <div className="flex items-start gap-8">
          {/* Movie Poster */}
          <div className="flex-shrink-0">
            <div className="w-80 h-auto bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              {movie.poster ? (
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  width={320}
                  height={480}
                  className="w-full h-auto object-cover"
                  priority
                />
              ) : (
                <div className="aspect-[2/3] bg-gray-700 flex items-center justify-center text-gray-400">
                  <svg
                    className="w-20 h-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Action Buttons - Moved below poster */}
            <div className="flex gap-4 mt-4">
              {/* Trailer Button */}
              {movie.trailer && (
                <button
                  onClick={onTrailerClick}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-lg text-xl flex items-center gap-3 transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
                  </svg>
                  Trailer
                </button>
              )}
              <button
                onClick={handleAddToList}
                disabled={adding || added}
                className={`${
                  added ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"
                } text-white font-bold py-4 px-12 rounded-lg text-xl flex items-center gap-3 transition-colors disabled:opacity-70`}
              >
                {added ? "Added" : adding ? "Adding..." : "Add to List"}
              </button>
            </div>
          </div>

          {/* Movie Info */}
          <div className="flex-1 pt-8">
            {/* Title */}
            <h1 className="text-white text-6xl font-bold mb-6 leading-tight">
              {movie.title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-4 mb-6 text-white">
              <span className="text-lg">{movie.year}</span>
              <span className="border border-gray-400 px-2 py-1 text-sm">
                {movie.rating}
              </span>
              <span className="text-lg">{movie.duration}</span>
              <span className="border border-gray-400 px-2 py-1 text-sm font-bold">
                {movie.quality}
              </span>
              {movie.rating_score > 0 && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg">
                    {movie.rating_score.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-white text-xl leading-relaxed max-w-4xl">
                {movie.description}
              </p>
            </div>

            {/* Genres */}
            <Genre genres={movie.genres} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;
