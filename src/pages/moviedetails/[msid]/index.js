import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import TMDBApi from "../../../services/tmdbApi";
import {
  Header,
  Cast,
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

  const handleTrailerClick = () => {
    setIsTrailerModalOpen(true);
    fetch("/api/trailerHistory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: String(movie.id),
        mediaType: "movie",
        title: movie.title,
        poster: movie.poster ?? null,
      }),
    }).catch(() => {});
  };

  useEffect(() => {
    const fetchMovie = async () => {
      if (!msid) return;
      setLoading(true);
      setError(null);
      try {
        const movieData = await TMDBApi.getMovieById(msid);
        if (movieData) setMovie(movieData);
        else setError("Movie not found");
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError("Failed to load movie data");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [msid]);

  if (loading) {
    return (
      <>
        <Head><title>Loading... | Veflix</title></Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Loading movie details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Head>
          <title>Movie Not Found | Veflix</title>
          <meta name="description" content="The requested movie could not be found." />
        </Head>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
          <p className="text-white text-lg">{error || "Movie not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </>
    );
  }

  const generateMovieSchema = (movie) => {
    if (!movie) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: movie.title,
      description: movie.overview,
      image: movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : null,
      datePublished: movie.release_date,
      duration: movie.runtime ? `PT${movie.runtime}M` : null,
      genre: movie.genres?.map((genre) => genre.name) || [],
      aggregateRating: movie.vote_average
        ? { "@type": "AggregateRating", ratingValue: movie.vote_average, ratingCount: movie.vote_count, bestRating: 10, worstRating: 0 }
        : null,
      director: movie.crew?.filter((p) => p.job === "Director").map((p) => ({ "@type": "Person", name: p.name })) || [],
      actor: movie.cast?.slice(0, 10).map((p) => ({ "@type": "Person", name: p.name, url: `/person/${p.id}` })) || [],
      productionCompany: movie.production_companies?.map((c) => ({ "@type": "Organization", name: c.name })) || [],
      countryOfOrigin: movie.production_countries?.map((c) => c.name) || [],
      language: movie.spoken_languages?.map((l) => l.name) || [],
      contentRating: movie.adult ? "R" : "PG",
      url: `/moviedetails/${movie.id}`,
    };
  };

  return (
    <>
      <Head>
        <title>{movie.title} ({movie.release_date?.split("-")[0]}) | Veflix</title>
        <meta name="description" content={`${movie.overview || `Watch ${movie.title} online.`} ${movie.runtime ? `Runtime: ${movie.runtime} minutes.` : ""} ${movie.vote_average ? `Rating: ${movie.vote_average}/10.` : ""}`} />
        <meta name="keywords" content={`${movie.title}, movie, ${movie.genres?.map((g) => g.name).join(", ") || ""}, streaming, Veflix`} />
        <meta property="og:title" content={`${movie.title} (${movie.release_date?.split("-")[0]}) | Veflix`} />
        <meta property="og:description" content={movie.overview || `Watch ${movie.title} online.`} />
        <meta property="og:type" content="video.movie" />
        {movie.poster_path && <meta property="og:image" content={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${movie.title} (${movie.release_date?.split("-")[0]}) | Veflix`} />
        <meta name="twitter:description" content={movie.overview || `Watch ${movie.title} online.`} />
        {movie && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateMovieSchema(movie)) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-black">
        <Header />

        <MovieHero movie={movie} onTrailerClick={handleTrailerClick} />

        <div className="border-t border-white/[0.04]" />

        {/* Cast */}
        {movie.cast?.length > 0 && (
          <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
            <Cast cast={movie.cast} />
          </div>
        )}

        {movie.cast?.length > 0 && <div className="border-t border-white/[0.04]" />}

        {/* Details */}
        <MovieDetailsTable movie={movie} />

        {/* Streaming Providers */}
        {movie.streamingProviders?.available && (
          <>
            <div className="border-t border-white/[0.04]" />
            <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
              <h2 className="text-white text-xl font-semibold tracking-tight mb-6">Where to Watch</h2>
              <StreamingProviders streamingProviders={movie.streamingProviders} />
            </div>
          </>
        )}

        {/* More Like This */}
        {movie.moreLikeThis?.length > 0 && (
          <>
            <div className="border-t border-white/[0.04]" />
            <MoreLikeThis movies={movie.moreLikeThis} />
          </>
        )}

        <div className="pb-24" />

        <TrailerModal
          isOpen={isTrailerModalOpen}
          onClose={() => setIsTrailerModalOpen(false)}
          trailerUrl={movie?.trailer}
          movieTitle={movie?.title}
        />
      </div>
    </>
  );
};

export default MovieDetails;
