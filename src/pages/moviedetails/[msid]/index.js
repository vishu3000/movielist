import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
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
      <>
        <Head>
          <title>Loading... | Veflix</title>
        </Head>
        <div className="min-h-screen bg-[#141414] flex items-center justify-center">
          <div className="text-white text-xl">Loading movie details...</div>
        </div>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Head>
          <title>Movie Not Found | Veflix</title>
          <meta
            name="description"
            content="The requested movie could not be found."
          />
        </Head>
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
      </>
    );
  }

  // Generate JSON-LD schema for the movie
  const generateMovieSchema = (movie) => {
    if (!movie) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: movie.title,
      description: movie.overview,
      image: movie.poster_path
        ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
        : null,
      datePublished: movie.release_date,
      duration: movie.runtime ? `PT${movie.runtime}M` : null,
      genre: movie.genres?.map((genre) => genre.name) || [],
      aggregateRating: movie.vote_average
        ? {
            "@type": "AggregateRating",
            ratingValue: movie.vote_average,
            ratingCount: movie.vote_count,
            bestRating: 10,
            worstRating: 0,
          }
        : null,
      director:
        movie.crew
          ?.filter((person) => person.job === "Director")
          .map((person) => ({
            "@type": "Person",
            name: person.name,
          })) || [],
      actor:
        movie.cast?.slice(0, 10).map((person) => ({
          "@type": "Person",
          name: person.name,
          url: `/person/${person.id}`,
        })) || [],
      productionCompany:
        movie.production_companies?.map((company) => ({
          "@type": "Organization",
          name: company.name,
        })) || [],
      countryOfOrigin:
        movie.production_countries?.map((country) => country.name) || [],
      language: movie.spoken_languages?.map((lang) => lang.name) || [],
      contentRating: movie.adult ? "R" : "PG",
      url: `/moviedetails/${movie.id}`,
    };

    return schema;
  };

  return (
    <>
      <Head>
        <title>
          {movie.title} ({movie.release_date?.split("-")[0]}) | Veflix
        </title>
        <meta
          name="description"
          content={`${movie.overview || `Watch ${movie.title} online.`} ${
            movie.runtime ? `Runtime: ${movie.runtime} minutes.` : ""
          } ${movie.vote_average ? `Rating: ${movie.vote_average}/10.` : ""}`}
        />
        <meta
          name="keywords"
          content={`${movie.title}, movie, ${
            movie.genres?.map((g) => g.name).join(", ") || ""
          }, streaming, Veflix`}
        />
        <meta
          property="og:title"
          content={`${movie.title} (${
            movie.release_date?.split("-")[0]
          }) | Veflix`}
        />
        <meta
          property="og:description"
          content={movie.overview || `Watch ${movie.title} online.`}
        />
        <meta property="og:type" content="video.movie" />
        {movie.poster_path && (
          <meta
            property="og:image"
            content={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${movie.title} (${
            movie.release_date?.split("-")[0]
          }) | Veflix`}
        />
        <meta
          name="twitter:description"
          content={movie.overview || `Watch ${movie.title} online.`}
        />
        {/* JSON-LD Movie Schema */}
        {movie && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateMovieSchema(movie)),
            }}
          />
        )}
      </Head>
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
    </>
  );
};

export default MovieDetails;
