import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "../../components";
import { getTMDBImageUrl, IMAGE_CONFIG } from "../../../config/imageConfig";
import { useRouter } from "next/router";
import tmdbApi from "../../services/tmdbApi"; // adjust path if needed
import { KnownFor } from "../../components";

export default function PersonPage() {
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
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
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
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 1:
        return "Female";
      case 2:
        return "Male";
      default:
        return "Not specified";
    }
  };

  return (
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
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {personData.name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-300">
                  <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {personData.known_for_department}
                  </span>
                  {personData.popularity && (
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{personData.popularity.toFixed(1)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-300">Birthday:</span>
                    <span className="text-white">
                      {formatDate(personData.birthday)}
                    </span>
                    {getAge(personData.birthday) && (
                      <span className="text-gray-400">
                        ({getAge(personData.birthday)} years old)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-300">Place of Birth:</span>
                    <span className="text-white">
                      {personData.place_of_birth || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-300">Gender:</span>
                    <span className="text-white">
                      {getGenderText(personData.gender)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {personData.homepage && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                        />
                      </svg>
                      <span className="text-gray-300">Website:</span>
                      <a
                        href={personData.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Official Site
                      </a>
                    </div>
                  )}

                  {personData.imdb_id && (
                    <a
                      href={`https://www.imdb.com/name/${personData.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      View on IMDb
                    </a>
                  )}
                </div>
              </div>

              {/* Also Known As */}
              {personData.also_known_as &&
                personData.also_known_as.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Also Known As
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {personData.also_known_as.map((name, index) => (
                        <span
                          key={index}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Biography */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Biography
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {personData.biography || "No biography available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Known For Section */}
      <KnownFor knownWorks={personData.known_works} personId={id} />
    </div>
  );
}
