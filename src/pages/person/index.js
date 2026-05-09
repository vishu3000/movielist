import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Header } from "../../components";
import { getTMDBImageUrl, IMAGE_CONFIG } from "../../../config/imageConfig";
import { useRouter } from "next/router";
import tmdbApi from "../../services/tmdbApi";
import { KnownFor } from "../../components";

export default function PersonPage() {
  const router = useRouter();
  const { id } = router.query;
  const [personData, setPersonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bioExpanded, setBioExpanded] = useState(false);

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
        <Head><title>Loading... | Veflix</title></Head>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getGenderText = (gender) => {
    if (gender === 1) return "Female";
    if (gender === 2) return "Male";
    return null;
  };

  const generatePersonSchema = (p) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    description: p.biography,
    image: p.profile_path ? `https://image.tmdb.org/t/p/original${p.profile_path}` : null,
    birthDate: p.birthday,
    birthPlace: p.place_of_birth ? { "@type": "Place", name: p.place_of_birth } : null,
    gender: getGenderText(p.gender),
    jobTitle: p.known_for_department,
    url: `/person/${p.id}`,
    sameAs: p.imdb_id ? `https://www.imdb.com/name/${p.imdb_id}` : null,
    homepage: p.homepage,
    alternateName: p.also_known_as || [],
  });

  const age = getAge(personData.birthday);
  const gender = getGenderText(personData.gender);

  const stats = [
    personData.known_for_department && { label: "Known For", value: personData.known_for_department },
    personData.birthday && { label: "Born", value: `${formatDate(personData.birthday)}${age ? ` (age ${age})` : ""}` },
    personData.place_of_birth && { label: "Birthplace", value: personData.place_of_birth },
    gender && { label: "Gender", value: gender },
    personData.popularity && { label: "Popularity", value: personData.popularity.toFixed(1) },
  ].filter(Boolean);

  const BIO_LIMIT = 400;
  const biography = personData.biography || "";
  const bioTruncated = biography.length > BIO_LIMIT && !bioExpanded;

  return (
    <>
      <Head>
        <title>{personData.name} - Biography & Filmography | Veflix</title>
        <meta name="description" content={`Learn about ${personData.name}, ${personData.known_for_department}. ${biography.substring(0, 150)}...`} />
        <meta name="keywords" content={`${personData.name}, actor, actress, director, producer, filmography, biography, Veflix`} />
        <meta property="og:title" content={`${personData.name} - Biography & Filmography | Veflix`} />
        <meta property="og:description" content={`Learn about ${personData.name}, ${personData.known_for_department}.`} />
        <meta property="og:type" content="profile" />
        {personData.profile_path && (
          <meta property="og:image" content={`https://image.tmdb.org/t/p/w500${personData.profile_path}`} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generatePersonSchema(personData)) }}
        />
      </Head>

      <div className="min-h-screen bg-black">
        <Header />

        {/* Hero */}
        <div className="relative">
          {/* Background blur from portrait */}
          {personData.profile_path && (
            <div className="absolute inset-0 h-[420px] overflow-hidden">
              <img
                src={getTMDBImageUrl(personData.profile_path, IMAGE_CONFIG.SIZES.PROFILE.LARGE)}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-top scale-110 blur-2xl opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-10">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Portrait */}
              <div className="flex-shrink-0">
                <div className="relative w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  {personData.profile_path ? (
                    <Image
                      src={getTMDBImageUrl(personData.profile_path, IMAGE_CONFIG.SIZES.PROFILE.LARGE)}
                      alt={personData.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 176px, 208px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
                  {personData.name}
                </h1>

                {/* Role badge */}
                {personData.known_for_department && (
                  <span className="inline-block bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide">
                    {personData.known_for_department}
                  </span>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-gray-600 text-[10px] uppercase tracking-widest font-medium mb-0.5">{stat.label}</p>
                      <p className="text-gray-200 text-sm leading-snug">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {personData.imdb_id && (
                    <a
                      href={`https://www.imdb.com/name/${personData.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                      </svg>
                      IMDb
                    </a>
                  )}
                  {personData.homepage && (
                    <a
                      href={personData.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Official Site
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biography */}
        {biography && (
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 md:p-8">
              <h2 className="text-white text-lg font-semibold mb-4 tracking-tight">Biography</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {bioTruncated ? biography.slice(0, BIO_LIMIT) + "…" : biography}
              </p>
              {biography.length > BIO_LIMIT && (
                <button
                  onClick={() => setBioExpanded((v) => !v)}
                  className="mt-3 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {bioExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Also Known As */}
        {personData.also_known_as?.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
            <h3 className="text-gray-500 text-xs uppercase tracking-widest font-medium mb-3">Also Known As</h3>
            <div className="flex flex-wrap gap-2">
              {personData.also_known_as.slice(0, 8).map((name, index) => (
                <span key={index} className="bg-white/5 text-gray-400 text-xs px-3 py-1.5 rounded-full border border-white/5">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Known For */}
        <div className="pt-6 pb-24">
          <KnownFor knownWorks={personData.known_works} personId={id} />
        </div>
      </div>
    </>
  );
}
