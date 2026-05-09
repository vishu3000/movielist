import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

function PlayIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

export default function ContinueWatchingCarousel() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!session?.user) { setLoading(false); return; }
    fetch("/api/trailerHistory?status=incomplete")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  if (!session?.user || (!loading && items.length === 0)) return null;

  return (
    <section className="px-4 md:px-8 py-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-amber-500 inline-block" />
          <h2 className="text-lg font-bold text-white tracking-tight">Continue Watching</h2>
        </div>
        <Link
          href="/profile"
          className="ml-auto text-xs text-gray-500 hover:text-amber-400 transition-colors duration-200 cursor-pointer"
        >
          See all
        </Link>
      </div>

      {/* Carousel track */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-white hover:bg-black hover:border-amber-500/50 transition-all duration-200 cursor-pointer shadow-xl"
          >
            <ChevronLeft />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-white hover:bg-black hover:border-amber-500/50 transition-all duration-200 cursor-pointer shadow-xl"
          >
            <ChevronRight />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-none w-32 sm:w-36 aspect-[2/3] rounded-xl bg-white/5 animate-pulse"
                  style={{ scrollSnapAlign: "start" }}
                />
              ))
            : items.map((item) => {
                const href =
                  item.mediaType === "tv"
                    ? `/tvdetails/${item.tmdbId}`
                    : `/moviedetails/${item.tmdbId}`;
                const posterSrc = item.poster ? `${POSTER_BASE}${item.poster}` : null;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="flex-none w-32 sm:w-36 group cursor-pointer"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/5 transition-all duration-300 group-hover:ring-amber-500/60 group-hover:scale-[1.03] group-hover:shadow-[0_0_24px_rgba(245,158,11,0.18)]">
                      {/* Poster */}
                      {posterSrc ? (
                        <Image
                          src={posterSrc}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 128px, 144px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
                          </svg>
                        </div>
                      )}

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      {/* Continue badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-sm">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7L8 5z" />
                        </svg>
                        <span className="text-[8px] text-white font-bold leading-none tracking-wider uppercase">
                          Continue
                        </span>
                      </div>

                      {/* Play button — shows on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                          <PlayIcon />
                        </div>
                      </div>

                      {/* Title at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
