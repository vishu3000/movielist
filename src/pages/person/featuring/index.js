import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Header } from "../../../components";
import { getTMDBImageUrl, IMAGE_CONFIG } from "../../../../config/imageConfig";
import { useRouter } from "next/router";
import tmdbApi from "../../../services/tmdbApi";

export default function PersonFeaturingPage() {
  const router = useRouter();
  const { id } = router.query;

  const [personData, setPersonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    tmdbApi.getPersonById(id).then((data) => {
      setPersonData(data);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading || !personData) {
    return (
      <>
        <Head>
          <title>Loading... | Veflix</title>
        </Head>
        <div className="min-h-screen bg-[#141414] flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).getFullYear();
  };

  const getMediaTypeLabel = (mediaType) => {
    return mediaType === "movie" ? "Movie" : "TV Show";
  };

  const getWorkLink = (work) => {
    if (work.media_type === "movie") {
      return `/moviedetails/${work.id}`;
    } else {
      return `/tv/${work.id}`; // You might need to create this route
    }
  };

  return (
    <>
      <Head>
        <title>{personData.name} - Filmography & Works | Veflix</title>
        <meta
          name="description"
          content={`Explore ${
            personData.name
          }'s complete filmography featuring ${
            personData.known_works?.length || 0
          } movies and TV shows. Discover their best works and career highlights.`}
        />
        <meta
          name="keywords"
          content={`${personData.name}, filmography, movies, TV shows, works, career, acting, directing, Veflix`}
        />
        <meta
          property="og:title"
          content={`${personData.name} - Filmography & Works | Veflix`}
        />
        <meta
          property="og:description"
          content={`Explore ${
            personData.name
          }'s complete filmography featuring ${
            personData.known_works?.length || 0
          } movies and TV shows.`}
        />
        <meta property="og:type" content="profile" />
        {personData.profile_path && (
          <meta
            property="og:image"
            content={`https://image.tmdb.org/t/p/w500${personData.profile_path}`}
          />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${personData.name} - Filmography & Works | Veflix`}
        />
        <meta
          name="twitter:description"
          content={`Explore ${personData.name}'s complete filmography.`}
        />
      </Head>
      <div className="min-h-screen bg-[#141414]">
        <Header />

        {/* Hero Section */}
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-80 h-96 lg:w-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                  {personData.profile_path ? (
                    <Image
                      src={getTMDBImageUrl(
                        personData.profile_path,
                        IMAGE_CONFIG.SIZES.PROFILE.LARGE
                      )}
                      alt={personData.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 320px, 384px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Person Info */}
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {personData.name}
                </h1>

                <div className="text-gray-300 mb-6">
                  <p className="text-lg mb-2">
                    <span className="font-semibold">Known for:</span>{" "}
                    {personData.known_for_department}
                  </p>
                  {personData.biography && (
                    <p className="text-sm leading-relaxed max-w-2xl">
                      {personData.biography.length > 300
                        ? `${personData.biography.substring(0, 300)}...`
                        : personData.biography}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {personData.known_works?.length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Total Works</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {personData.known_works?.filter(
                        (w) => w.media_type === "movie"
                      ).length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">Movies</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {personData.known_works?.filter(
                        (w) => w.media_type === "tv"
                      ).length || 0}
                    </div>
                    <div className="text-gray-400 text-sm">TV Shows</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(personData.popularity || 0)}
                    </div>
                    <div className="text-gray-400 text-sm">Popularity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Works Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {!personData.known_works ||
              personData.known_works.length === 0 ? (
                <div className="col-span-full text-gray-400 text-center py-12">
                  No works found.
                </div>
              ) : (
                personData.known_works.map((work) => (
                  <Link
                    key={work.id}
                    href={getWorkLink(work)}
                    className="group block bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200"
                  >
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: "150%" }}
                    >
                      {work.poster_path ? (
                        <Image
                          src={getTMDBImageUrl(
                            work.poster_path,
                            IMAGE_CONFIG.SIZES.POSTER.MEDIUM
                          )}
                          alt={work.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 150px, 200px"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400 text-xs text-center px-2">
                            {work.title}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-white text-base font-semibold truncate">
                        {work.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {getMediaTypeLabel(work.media_type)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(work.release_date)}
                        </span>
                      </div>
                      {work.character && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          as {work.character}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
