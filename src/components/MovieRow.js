import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const TYPE_CONFIG = {
  movie: { label: "FILM", color: "bg-red-600", accent: "#ef4444" },
  tv: { label: "SERIES", color: "bg-violet-600", accent: "#7c3aed" },
};

function StarRating({ score }) {
  if (!score) return null;
  const pct = Math.round(score * 10);
  const color = pct >= 70 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={`text-xs font-bold ${color}`}>{pct}%</span>
  );
}

export default function MovieRow({ title, url, type = "movie" }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const rowRef = useRef(null);
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.movie;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_MOVIE_API_KEY) {
          setIsLoading(false);
          return;
        }
        const res = await fetch(
          `${url}?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}&language=en-US&page=1`
        );
        const data = await res.json();
        setItems(data.results?.slice(0, 20) || []);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [url]);

  const updateScrollState = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (dir) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: dir === "right" ? rowRef.current.clientWidth * 0.75 : -rowRef.current.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  const trim = (t) => t.trim().replace(/\s+/g, "_").toLowerCase();
  const getTitle = (item) => (type === "tv" ? item.name : item.title);
  const getLink = (item) => (type === "tv" ? `/tvdetails/${item.id}` : `/moviedetails/${item.id}`);
  const getImage = (item) =>
    item.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
      : item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : null;

  if (isLoading) {
    return (
      <div className="mb-12 px-4 md:px-12">
        {/* Skeleton header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gray-700 rounded-full" />
          <div className="h-5 w-40 bg-gray-800 rounded animate-pulse" />
          <div className="h-5 w-14 bg-gray-800 rounded-full animate-pulse" />
        </div>
        {/* Skeleton cards */}
        <div className="flex gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 md:w-60 rounded-xl overflow-hidden">
              <div className="h-28 md:h-36 bg-gray-800 animate-pulse" />
              <div className="bg-gray-900 px-2 py-2 space-y-1.5">
                <div className="h-3 w-3/4 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-12 group/row">
      {/* Row header */}
      <div className="flex items-center justify-between px-4 md:px-12 mb-4">
        <div className="flex items-center gap-3">
          {/* Accent bar */}
          <div
            className="w-1 h-6 rounded-full flex-shrink-0"
            style={{ background: cfg.accent }}
          />
          <Link
            href={`/movielist?category=${trim(title)}&platform=${type}`}
            className="group/title flex items-center gap-2"
          >
            <h2 className="text-white text-lg md:text-xl font-bold tracking-wide">{title}</h2>
            <span
              className="text-xs font-semibold opacity-0 group-hover/title:opacity-100 transition-all duration-200 flex items-center gap-0.5"
              style={{ color: cfg.accent }}
            >
              See All
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
          {/* Type badge */}
          <span className={`${cfg.color} text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest`}>
            {cfg.label}
          </span>
        </div>

        {/* Scroll arrows in header */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="relative">
        {/* Left fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#141414] to-transparent z-10 pointer-events-none" />
        )}
        {/* Right fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#141414] to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={rowRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-scroll scrollbar-hide px-4 md:px-12 pb-2"
        >
          {items.map((item, idx) => {
            const imgSrc = getImage(item);
            const itemTitle = getTitle(item);
            const score = item.vote_average || null;
            const year = (item.release_date || item.first_air_date || "").slice(0, 4);

            return (
              <Link
                key={item.id}
                href={getLink(item)}
                className="flex-shrink-0 group/card cursor-pointer"
              >
                <div className="w-44 md:w-56 lg:w-64 rounded-xl overflow-hidden bg-[#1c1c1e] ring-1 ring-white/5 transition-all duration-300 group-hover/card:ring-2 group-hover/card:shadow-2xl"
                  style={{ "--accent": cfg.accent }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-24 md:h-32 lg:h-36 overflow-hidden">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={itemTitle}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                        loading="lazy"
                        sizes="(max-width: 768px) 176px, (max-width: 1024px) 224px, 256px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-2">
                        <span className="text-gray-500 text-xs text-center">{itemTitle}</span>
                      </div>
                    )}

                    {/* Rank number for first 10 */}
                    {idx < 10 && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-white text-xs font-black bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    )}

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/card:bg-black/50 transition-all duration-300">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center scale-0 group-hover/card:scale-100 transition-transform duration-300 shadow-lg"
                        style={{ background: cfg.accent }}
                      >
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info strip — always visible */}
                  <div className="px-3 py-2.5 bg-[#1c1c1e] group-hover/card:bg-[#252528] transition-colors duration-200">
                    <p className="text-white text-xs font-semibold truncate leading-snug mb-1">
                      {itemTitle}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {year && <span className="text-gray-500 text-[10px]">{year}</span>}
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                          style={{ background: cfg.accent + "22", color: cfg.accent }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <StarRating score={score} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
