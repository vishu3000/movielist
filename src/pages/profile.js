import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Link from "next/link";
import MovieCard from "../components/MovieCard";

function Avatar({ name, size = "lg" }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  const sizeClass =
    size === "lg"
      ? "w-24 h-24 text-3xl"
      : "w-10 h-10 text-base";
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center font-bold text-white select-none ring-4 ring-rose-600/30`}
    >
      {initials}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="flex flex-col items-center px-6 py-3 rounded-xl bg-white/5 border border-white/10 min-w-[90px]">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-gray-400 mt-0.5 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function SignOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}

function EmptyWatchlist() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
        <BookmarkIcon />
      </div>
      <h3 className="text-lg font-semibold text-white">Your list is empty</h3>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        Add movies and TV shows to your watchlist and they&apos;ll appear here.
      </p>
      <Link
        href="/"
        className="mt-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer"
      >
        Browse Content
      </Link>
    </div>
  );
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [watchlist, setWatchlist] = useState([]);
  const [wlLoading, setWlLoading] = useState(true);
  const [wlError, setWlError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const loadWatchlist = async () => {
      if (status !== "authenticated") return;
      try {
        setWlLoading(true);
        const res = await fetch("/api/watchlist");
        if (!res.ok) throw new Error("Failed to load watchlist");
        const data = await res.json();
        setWatchlist(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        setWlError(e);
      } finally {
        setWlLoading(false);
      }
    };
    loadWatchlist();
  }, [status]);

  const handleRemove = async (item) => {
    const prev = watchlist;
    setWatchlist((w) => w.filter((i) => i.id !== item.id));
    try {
      const params = new URLSearchParams({
        tmdbId: String(item.tmdbId),
        mediaType: item.mediaType,
      });
      const res = await fetch(`/api/watchlist?${params.toString()}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove");
    } catch {
      setWatchlist(prev);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const movieCount = watchlist.filter((i) => i.mediaType === "movie").length;
  const tvCount = watchlist.filter((i) => i.mediaType === "tv").length;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a0a 100%)" }}
    >
      <Header />

      {/* ── Profile Hero ── */}
      <div className="relative pt-24 pb-10 px-4 md:px-8 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #e11d48 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <Avatar name={session.user.name} size="lg" />

            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">
                Member
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {session.user.name}
              </h1>
              <p className="text-gray-400 text-sm mt-1">{session.user.email}</p>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-sm transition-all duration-200 cursor-pointer"
            >
              <SignOutIcon />
              Sign out
            </button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-8">
            <StatPill label="Watchlist" value={watchlist.length} />
            <StatPill label="Movies" value={movieCount} />
            <StatPill label="TV Shows" value={tvCount} />
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/5 mx-4 md:mx-8" />

      {/* ── My List Section ── */}
      <div className="px-4 md:px-8 py-10 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <BookmarkIcon />
          <h2 className="text-xl font-bold text-white">My List</h2>
          {!wlLoading && !wlError && watchlist.length > 0 && (
            <span className="ml-auto text-sm text-gray-500">
              {watchlist.length} title{watchlist.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {wlLoading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {wlError && !wlLoading && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <p className="text-rose-400 font-semibold">Failed to load your list</p>
            <p className="text-gray-500 text-sm">Please try refreshing the page.</p>
          </div>
        )}

        {!wlLoading && !wlError && watchlist.length === 0 && <EmptyWatchlist />}

        {!wlLoading && !wlError && watchlist.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {watchlist.map((item) => {
              const href =
                item.mediaType === "tv"
                  ? `/tvdetails/${item.tmdbId}`
                  : `/moviedetails/${item.tmdbId}`;
              const movie = {
                title: item.title,
                poster: item.poster || item.backdrop || null,
                mediaType: item.mediaType,
              };
              return (
                <Link key={item.id} href={href}>
                  <MovieCard
                    movie={movie}
                    forList
                    onRemove={() => handleRemove(item)}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
