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
  Seasons,
} from "../../../components";

const TVDetails = () => {
  const router = useRouter();
  const { msid } = router.query;
  const [tvShow, setTVShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  useEffect(() => {
    const fetchTVShow = async () => {
      if (!msid) return;

      setLoading(true);
      setError(null);

      try {
        const tvShowData = await TMDBApi.getTVShowById(msid);

        if (tvShowData) {
          setTVShow(tvShowData);
        } else {
          setError("TV Show not found");
        }
      } catch (err) {
        console.error("Error fetching TV show:", err);
        setError("Failed to load TV show data");
      } finally {
        setLoading(false);
      }
    };

    fetchTVShow();
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
          <div className="text-white text-xl">Loading TV show details...</div>
        </div>
      </>
    );
  }

  if (error || !tvShow) {
    return (
      <>
        <Head>
          <title>TV Show Not Found | Veflix</title>
          <meta
            name="description"
            content="The requested TV show could not be found."
          />
        </Head>
        <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center">
          <div className="text-white text-xl mb-4">
            {error || "TV Show not found"}
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

  // Generate JSON-LD schema for the TV series
  const generateTVSeriesSchema = (tvShow) => {
    if (!tvShow) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      name: tvShow.name,
      description: tvShow.overview,
      image: tvShow.poster_path
        ? `https://image.tmdb.org/t/p/original${tvShow.poster_path}`
        : null,
      datePublished: tvShow.first_air_date,
      dateModified: tvShow.last_air_date,
      numberOfSeasons: tvShow.number_of_seasons,
      numberOfEpisodes: tvShow.number_of_episodes,
      genre: tvShow.genres?.map((genre) => genre.name) || [],
      aggregateRating: tvShow.vote_average
        ? {
            "@type": "AggregateRating",
            ratingValue: tvShow.vote_average,
            ratingCount: tvShow.vote_count,
            bestRating: 10,
            worstRating: 0,
          }
        : null,
      actor:
        tvShow.cast?.slice(0, 10).map((person) => ({
          "@type": "Person",
          name: person.name,
          url: `/person/${person.id}`,
        })) || [],
      creator:
        tvShow.created_by?.map((person) => ({
          "@type": "Person",
          name: person.name,
        })) || [],
      productionCompany:
        tvShow.production_companies?.map((company) => ({
          "@type": "Organization",
          name: company.name,
        })) || [],
      countryOfOrigin:
        tvShow.production_countries?.map((country) => country.name) || [],
      language: tvShow.spoken_languages?.map((lang) => lang.name) || [],
      contentRating: tvShow.adult ? "R" : "PG",
      url: `/tvdetails/${tvShow.id}`,
      inLanguage: "en",
    };

    return schema;
  };

  return (
    <>
      <Head>
        <title>
          {tvShow.name} ({tvShow.first_air_date?.split("-")[0]}) | Veflix
        </title>
        <meta
          name="description"
          content={`${tvShow.overview || `Watch ${tvShow.name} online.`} ${
            tvShow.number_of_seasons
              ? `${tvShow.number_of_seasons} season${
                  tvShow.number_of_seasons > 1 ? "s" : ""
                }.`
              : ""
          } ${tvShow.vote_average ? `Rating: ${tvShow.vote_average}/10.` : ""}`}
        />
        <meta
          name="keywords"
          content={`${tvShow.name}, TV show, series, ${
            tvShow.genres?.map((g) => g.name).join(", ") || ""
          }, streaming, Veflix`}
        />
        <meta
          property="og:title"
          content={`${tvShow.name} (${
            tvShow.first_air_date?.split("-")[0]
          }) | Veflix`}
        />
        <meta
          property="og:description"
          content={tvShow.overview || `Watch ${tvShow.name} online.`}
        />
        <meta property="og:type" content="video.tv_show" />
        {tvShow.poster_path && (
          <meta
            property="og:image"
            content={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
          />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${tvShow.name} (${
            tvShow.first_air_date?.split("-")[0]
          }) | Veflix`}
        />
        <meta
          name="twitter:description"
          content={tvShow.overview || `Watch ${tvShow.name} online.`}
        />
        {/* JSON-LD TVSeries Schema */}
        {tvShow && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateTVSeriesSchema(tvShow)),
            }}
          />
        )}
      </Head>
      <div className="min-h-screen bg-black">
        <Header />

        <MovieHero movie={tvShow} onTrailerClick={openTrailerModal} />

        {/* Cast Section */}
        {tvShow.cast && tvShow.cast.length > 0 && (
          <div className="px-8 py-16 max-w-7xl mx-auto">
            <Cast cast={tvShow.cast} horizontal={true} />
          </div>
        )}

        {/* Seasons Section */}
        {tvShow.seasons && tvShow.seasons.length > 0 && (
          <Seasons tvShow={tvShow} msid={msid} />
        )}

        {/* TV Show Details Table Section */}
        <MovieDetailsTable tvShow={tvShow} />

        {/* Streaming Providers Section */}
        {tvShow.streamingProviders && tvShow.streamingProviders.available && (
          <div className="px-8 py-4 max-w-7xl mx-auto">
            <StreamingProviders
              streamingProviders={tvShow.streamingProviders}
            />
          </div>
        )}

        {/* More Like This Grid Section */}
        <MoreLikeThis movies={tvShow.moreLikeThis} />

        {/* Trailer Modal */}
        <TrailerModal
          isOpen={isTrailerModalOpen}
          onClose={closeTrailerModal}
          trailerUrl={tvShow?.trailer}
          movieTitle={tvShow?.title}
        />
      </div>
    </>
  );
};

// TV Show Details Table Component
const TVShowDetailsTable = ({ tvShow }) => {
  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-white text-xl font-semibold mb-6">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">Cast</h4>
            <p className="text-white text-sm">
              {tvShow.cast
                ?.slice(0, 3)
                .map((actor) => actor.name)
                .join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">Genres</h4>
            <p className="text-white text-sm">
              {tvShow.genres?.join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">Status</h4>
            <p className="text-white text-sm">{tvShow.status || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              Number of Seasons
            </h4>
            <p className="text-white text-sm">
              {tvShow.number_of_seasons || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              Number of Episodes
            </h4>
            <p className="text-white text-sm">
              {tvShow.number_of_episodes || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              First Air Date
            </h4>
            <p className="text-white text-sm">
              {tvShow.first_air_date
                ? new Date(tvShow.first_air_date).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              Last Air Date
            </h4>
            <p className="text-white text-sm">
              {tvShow.last_air_date
                ? new Date(tvShow.last_air_date).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              Episode Runtime
            </h4>
            <p className="text-white text-sm">{tvShow.duration || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              Production Companies
            </h4>
            <p className="text-white text-sm">
              {tvShow.production_companies
                ?.slice(0, 3)
                .map((company) => company.name)
                .join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">Networks</h4>
            <p className="text-white text-sm">
              {tvShow.networks
                ?.slice(0, 3)
                .map((network) => network.name)
                .join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">
              Original Language
            </h4>
            <p className="text-white text-sm">
              {tvShow.original_language?.toUpperCase() || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVDetails;
