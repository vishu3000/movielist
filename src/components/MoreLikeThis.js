import { useRouter } from "next/router";
import Image from "next/image";
import { useRef } from "react";
import { IMAGE_CONFIG, getTMDBImageUrl, getImageProps } from "../../config/imageConfig";

const MoreLikeThis = ({ movies }) => {
  const router = useRouter();
  const scrollRef = useRef(null);

  if (!movies || movies.length === 0) return null;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  return (
    <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white text-xl font-semibold tracking-tight">More Like This</h2>
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
        {movies.map((similarMovie) => {
          const posterUrl = getTMDBImageUrl(
            similarMovie.poster?.replace("https://image.tmdb.org/t/p/w300", "") || "",
            IMAGE_CONFIG.SIZES.POSTER.SMALL
          );
          const rating = similarMovie.vote_average
            ? similarMovie.vote_average.toFixed(1)
            : null;

          return (
            <div
              key={similarMovie.id}
              onClick={() => router.push(`/moviedetails/${similarMovie.id}`)}
              className="flex-shrink-0 w-36 md:w-40 group cursor-pointer"
            >
              <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-[2/3]">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={similarMovie.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    sizes="160px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-3">
                    <span className="text-gray-400 text-xs text-center leading-tight">{similarMovie.title}</span>
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

                {rating && (
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {rating}
                  </div>
                )}
              </div>

              <div className="mt-2 px-0.5">
                <p
                  className="text-gray-300 text-xs font-medium leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200"
                  title={similarMovie.title}
                >
                  {similarMovie.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoreLikeThis;
