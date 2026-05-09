import Link from "next/link";
import Image from "next/image";
import { getTMDBImageUrl, IMAGE_CONFIG } from "../../config/imageConfig";

function SkeletonCard() {
  return (
    <div className="relative animate-pulse">
      <div className="bg-[#1a1a2e] rounded-lg overflow-hidden aspect-[2/3]" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <div className="h-3 bg-[#1a1a2e] rounded w-3/4" />
        <div className="h-2.5 bg-[#1a1a2e] rounded w-1/2" />
      </div>
    </div>
  );
}

function OTTMovieCard({ movie, platform }) {
  const title = movie.title || movie.original_title || movie.name;
  const posterPath = movie.poster_path;
  const releaseYear = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const isNew =
    movie.release_date &&
    (new Date() - new Date(movie.release_date)) / (1000 * 60 * 60 * 24) < 30;

  const imageUrl = posterPath
    ? getTMDBImageUrl(posterPath, IMAGE_CONFIG.SIZES.POSTER.SMALL)
    : null;

  return (
    <Link href={`/${platform}details/${movie.id}`} className="group block cursor-pointer">
      <div className="relative overflow-hidden rounded-lg bg-[#1a1a2e] aspect-[2/3]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
            <span className="text-gray-500 text-xs text-center px-3">{title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              {releaseYear && <span className="text-gray-300 text-xs">{releaseYear}</span>}
              {rating && (
                <span className="flex items-center gap-0.5 text-yellow-400 text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              New
            </span>
          )}
        </div>

        {/* Rating badge always visible */}
        {rating && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating}
          </div>
        )}
      </div>

      {/* Title below card */}
      <div className="mt-2 px-0.5">
        <p className="text-gray-200 text-xs font-medium line-clamp-1 group-hover:text-white transition-colors duration-200">
          {title}
        </p>
        {releaseYear && (
          <p className="text-gray-500 text-xs mt-0.5">{releaseYear}</p>
        )}
      </div>
    </Link>
  );
}

export default function MovieGridLayout({
  movies,
  isLoading,
  error,
  isLoadingMore,
  platform,
  title,
  count,
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-gray-400 text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">Nothing here yet</h3>
        <p className="text-gray-500 text-sm">Check back later for new titles</p>
      </div>
    );
  }

  return (
    <div>
      {(title || count) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h2 className="text-white text-lg font-semibold">{title}</h2>}
          {count && <span className="text-gray-500 text-sm">{count} titles</span>}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {movies.map((movie) => (
          <OTTMovieCard key={`${movie.id}-${movie.title || movie.name}`} movie={movie} platform={platform} />
        ))}
      </div>

      {isLoadingMore && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={`more-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
}
