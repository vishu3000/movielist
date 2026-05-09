import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const Cast = ({ cast }) => {
  const scrollRef = useRef(null);

  if (!cast || cast.length === 0) return null;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-xl font-semibold tracking-tight">Cast</h3>
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
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cast.map((actor, index) => (
          <Link
            href={`/person?id=${actor.id}`}
            key={actor.id || index}
            className="flex-shrink-0 group cursor-pointer"
          >
            <div className="flex flex-col items-center text-center w-24">
              <div className="relative mb-2.5">
                {actor.profileImage ? (
                  <Image
                    src={actor.profileImage}
                    alt={actor.name}
                    width={88}
                    height={88}
                    className="w-22 h-22 rounded-full object-cover ring-2 ring-transparent group-hover:ring-red-500 transition-all duration-200"
                    style={{ width: 88, height: 88 }}
                    sizes="88px"
                  />
                ) : (
                  <div className="w-[88px] h-[88px] bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-red-500 transition-all duration-200">
                    <span className="text-white text-2xl font-bold">
                      {actor.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-white text-xs font-semibold leading-tight line-clamp-2 group-hover:text-red-400 transition-colors duration-200">
                {actor.name}
              </p>
              {actor.character && (
                <p className="text-gray-500 text-[10px] leading-tight mt-0.5 line-clamp-1">
                  {actor.character}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Cast;
