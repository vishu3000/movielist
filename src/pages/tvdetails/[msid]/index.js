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

  const handleTrailerClick = () => {
    setIsTrailerModalOpen(true);
    fetch("/api/trailerHistory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: String(tvShow.id),
        mediaType: "tv",
        title: tvShow.title,
        poster: tvShow.poster ?? null,
      }),
    }).catch(() => {});
  };

  useEffect(() => {
    const fetchTVShow = async () => {
      if (!msid) return;
      setLoading(true);
      setError(null);
      try {
        const tvShowData = await TMDBApi.getTVShowById(msid);
        if (tvShowData) setTVShow(tvShowData);
        else setError("TV Show not found");
      } catch (err) {
        console.error("Error fetching TV show:", err);
        setError("Failed to load TV show data");
      } finally {
        setLoading(false);
      }
    };
    fetchTVShow();
  }, [msid]);

  if (loading) {
    return (
      <>
        <Head><title>Loading... | Veflix</title></Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Loading TV show details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !tvShow) {
    return (
      <>
        <Head>
          <title>TV Show Not Found | Veflix</title>
          <meta name="description" content="The requested TV show could not be found." />
        </Head>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
          <p className="text-white text-lg">{error || "TV Show not found"}</p>
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

  const generateTVSeriesSchema = (tvShow) => {
    if (!tvShow) return null;
    return {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      name: tvShow.name,
      description: tvShow.overview,
      image: tvShow.poster_path ? `https://image.tmdb.org/t/p/original${tvShow.poster_path}` : null,
      datePublished: tvShow.first_air_date,
      dateModified: tvShow.last_air_date,
      numberOfSeasons: tvShow.number_of_seasons,
      numberOfEpisodes: tvShow.number_of_episodes,
      genre: tvShow.genres?.map((genre) => genre.name) || [],
      aggregateRating: tvShow.vote_average
        ? { "@type": "AggregateRating", ratingValue: tvShow.vote_average, ratingCount: tvShow.vote_count, bestRating: 10, worstRating: 0 }
        : null,
      actor: tvShow.cast?.slice(0, 10).map((p) => ({ "@type": "Person", name: p.name, url: `/person/${p.id}` })) || [],
      creator: tvShow.created_by?.map((p) => ({ "@type": "Person", name: p.name })) || [],
      productionCompany: tvShow.production_companies?.map((c) => ({ "@type": "Organization", name: c.name })) || [],
      countryOfOrigin: tvShow.production_countries?.map((c) => c.name) || [],
      language: tvShow.spoken_languages?.map((l) => l.name) || [],
      contentRating: tvShow.adult ? "R" : "PG",
      url: `/tvdetails/${tvShow.id}`,
      inLanguage: "en",
    };
  };

  return (
    <>
      <Head>
        <title>{tvShow.name} ({tvShow.first_air_date?.split("-")[0]}) | Veflix</title>
        <meta name="description" content={`${tvShow.overview || `Watch ${tvShow.name} online.`} ${tvShow.number_of_seasons ? `${tvShow.number_of_seasons} season${tvShow.number_of_seasons > 1 ? "s" : ""}.` : ""} ${tvShow.vote_average ? `Rating: ${tvShow.vote_average}/10.` : ""}`} />
        <meta name="keywords" content={`${tvShow.name}, TV show, series, ${tvShow.genres?.map((g) => g.name).join(", ") || ""}, streaming, Veflix`} />
        <meta property="og:title" content={`${tvShow.name} (${tvShow.first_air_date?.split("-")[0]}) | Veflix`} />
        <meta property="og:description" content={tvShow.overview || `Watch ${tvShow.name} online.`} />
        <meta property="og:type" content="video.tv_show" />
        {tvShow.poster_path && <meta property="og:image" content={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${tvShow.name} (${tvShow.first_air_date?.split("-")[0]}) | Veflix`} />
        <meta name="twitter:description" content={tvShow.overview || `Watch ${tvShow.name} online.`} />
        {tvShow && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateTVSeriesSchema(tvShow)) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-black">
        <Header />

        <MovieHero movie={tvShow} onTrailerClick={handleTrailerClick} />

        <div className="border-t border-white/[0.04]" />

        {/* Cast */}
        {tvShow.cast?.length > 0 && (
          <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
            <Cast cast={tvShow.cast} />
          </div>
        )}

        {tvShow.cast?.length > 0 && <div className="border-t border-white/[0.04]" />}

        {/* Seasons / Episodes */}
        {tvShow.seasons?.length > 0 && (
          <>
            <Seasons tvShow={tvShow} msid={msid} />
            <div className="border-t border-white/[0.04]" />
          </>
        )}

        {/* Details */}
        <MovieDetailsTable tvShow={tvShow} />

        {/* Streaming Providers */}
        {tvShow.streamingProviders?.available && (
          <>
            <div className="border-t border-white/[0.04]" />
            <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
              <h2 className="text-white text-xl font-semibold tracking-tight mb-6">Where to Watch</h2>
              <StreamingProviders streamingProviders={tvShow.streamingProviders} />
            </div>
          </>
        )}

        {/* More Like This */}
        {tvShow.moreLikeThis?.length > 0 && (
          <>
            <div className="border-t border-white/[0.04]" />
            <MoreLikeThis movies={tvShow.moreLikeThis} />
          </>
        )}

        <div className="pb-24" />

        <TrailerModal
          isOpen={isTrailerModalOpen}
          onClose={() => setIsTrailerModalOpen(false)}
          trailerUrl={tvShow?.trailer}
          movieTitle={tvShow?.title}
        />
      </div>
    </>
  );
};

export default TVDetails;
