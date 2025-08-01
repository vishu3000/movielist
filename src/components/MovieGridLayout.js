import Link from "next/link";
import MovieCard from "./MovieCard";

export default function MovieGridLayout({
  movies,
  isLoading,
  error,
  isLoadingMore,
  platform,
}) {
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">No movies found</h2>
        <p className="text-gray-400">Please try again later</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <div key={`${movie.id}-${movie.title}`} className="group">
            <Link href={`/${platform}details/${movie.id}`}>
              <MovieCard
                title={movie.title || movie.original_title}
                image={movie.poster_path || movie.backdrop_path}
                forList={true}
                isRecentlyAdded={
                  movie.release_date &&
                  (new Date() - new Date(movie.release_date)) /
                    (1000 * 60 * 60 * 24) <
                    1
                }
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8 mt-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading more movies...</p>
          </div>
        </div>
      )}
    </div>
  );
}
