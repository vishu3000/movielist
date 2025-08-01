import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TMDBApi from "../../../services/tmdbApi";
import {
  Header,
  Cast,
  Genre,
  TrailerModal,
  StreamingProviders,
  MoreLikeThis,
  MovieHero,
  MovieDetailsTable,
} from "../../../components";

const MovieDetails = () => {
  const router = useRouter();
  const { msid } = router.query;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!msid) return;

      setLoading(true);
      setError(null);

      try {
        // msid should be the TMDb movie ID
        const movieData = await TMDBApi.getMovieById(msid);

        if (movieData) {
          setMovie(movieData);
        } else {
          setError("Movie not found");
        }
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError("Failed to load movie data");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [msid]);

  const openTrailerModal = () => {
    setIsTrailerModalOpen(true);
  };

  const closeTrailerModal = () => {
    setIsTrailerModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white text-xl">Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center">
        <div className="text-white text-xl mb-4">
          {error || "Movie not found"}
        </div>
        <button
          onClick={() => router.push("/")}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <MovieHero movie={movie} onTrailerClick={openTrailerModal} />

      {/* Cast Section */}
      {movie.cast && movie.cast.length > 0 && (
        <div className="px-8 py-16 max-w-7xl mx-auto">
          <Cast cast={movie.cast} horizontal={true} />
        </div>
      )}

      {/* Movie Details Table Section */}
      <MovieDetailsTable movie={movie} />

      {/* Streaming Providers Section */}
      {movie.streamingProviders && movie.streamingProviders.available && (
        <div className="px-8 py-4 max-w-7xl mx-auto">
          <StreamingProviders streamingProviders={movie.streamingProviders} />
        </div>
      )}

      {/* More Like This Grid Section */}
      <MoreLikeThis movies={movie.moreLikeThis} />

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={closeTrailerModal}
        trailerUrl={movie?.trailer}
        movieTitle={movie?.title}
      />
    </div>
  );
};

export default MovieDetails;
