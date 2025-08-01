import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_CONFIG, getTMDBImageUrl } from "../../config/imageConfig";

const KnownFor = ({ knownWorks, personId }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!knownWorks || knownWorks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Known For</h2>
        <p className="text-gray-400">No known works found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div
        className="relative flex cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/person/featuring?id=${personId}`}>
          <h2 className="text-white text-xl font-semibold mb-4">Known For</h2>
        </Link>

        {/* Explore All Link */}
        <Link
          href={`/person/featuring?id=${personId}`}
          className={`text-md font-semibold text-blue-400 hover:text-blue-300  transition-all duration-300 ease-in-out transform ${
            isHovered ? "translate-x-4 opacity-100" : "translate-x-0 opacity-0"
          }`}
        >
          Explore all &gt;
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {knownWorks.slice(0, 20).map((work, index) => (
          <Link
            href={`/${
              work.media_type === "movie" ? "moviedetails" : "tvdetails"
            }/${work.id}`}
            key={`${work.id}-${index}`}
          >
            <div className="bg-[#222] rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
              <div className="relative w-full h-64">
                {work.poster_path ? (
                  <Image
                    src={getTMDBImageUrl(
                      work.poster_path,
                      IMAGE_CONFIG.SIZES.POSTER.MEDIUM
                    )}
                    alt={`${work.title} poster`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 200px, 288px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
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
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white truncate">
                  {work.title}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {work.character}
                </p>
                <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-red-600 text-white">
                  {work.media_type === "movie" ? "Movie" : "TV"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default KnownFor;
