import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_CONFIG, getTMDBImageUrl } from "../../config/imageConfig";

const KnownFor = ({ knownWorks, personId }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  if (!knownWorks || knownWorks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Known For</h2>
        <p className="text-gray-500 text-sm">No known works found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pb-12">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-xl font-semibold tracking-tight">Known For</h2>
          <Link
            href={`/person/featuring?id=${personId}`}
            className="text-gray-500 hover:text-red-400 text-sm transition-colors flex items-center gap-1 cursor-pointer"
          >
            See all
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {knownWorks.slice(0, 20).map((work, index) => (
          <Link
            href={`/${work.media_type === "movie" ? "moviedetails" : "tvdetails"}/${work.id}`}
            key={`${work.id}-${index}`}
            className="flex-shrink-0 w-36 md:w-40 group cursor-pointer"
          >
            <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-[2/3]">
              {work.poster_path ? (
                <Image
                  src={getTMDBImageUrl(work.poster_path, IMAGE_CONFIG.SIZES.POSTER.MEDIUM)}
                  alt={work.title || work.name || ""}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="160px"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center p-3">
                  <span className="text-gray-500 text-xs text-center leading-tight">{work.title || work.name}</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Media type badge */}
              <div className="absolute bottom-2 left-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                  work.media_type === "movie" ? "bg-blue-600/90 text-white" : "bg-red-600/90 text-white"
                }`}>
                  {work.media_type === "movie" ? "Movie" : "TV"}
                </span>
              </div>
            </div>

            <div className="mt-2 px-0.5">
              <p className="text-gray-300 text-xs font-medium line-clamp-1 group-hover:text-white transition-colors duration-200">
                {work.title || work.name}
              </p>
              {work.character && (
                <p className="text-gray-600 text-[10px] mt-0.5 line-clamp-1">{work.character}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default KnownFor;
