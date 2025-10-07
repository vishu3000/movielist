import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Link from "next/link";
import MovieCard from "../components/MovieCard";

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
        if (!res.ok) {
          throw new Error("Failed to load watchlist");
        }
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
    // optimistic update
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
      if (!res.ok) {
        throw new Error("Failed to remove");
      }
    } catch (e) {
      // revert on error
      setWatchlist(prev);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <div className="pt-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

          <div className="bg-black/75 backdrop-blur-sm rounded-lg p-8 border border-gray-800 min-w-[max-content]">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <p className="text-white">{session.user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <p className="text-white">{session.user.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  My Watchlist
                </h2>

                {wlLoading && (
                  <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Loading your watchlist...</p>
                  </div>
                )}

                {wlError && !wlLoading && (
                  <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                    <p className="text-red-400">Failed to load watchlist.</p>
                  </div>
                )}

                {!wlLoading && !wlError && watchlist.length === 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Your watchlist is empty</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Start adding movies and TV shows to your personal
                      collection
                    </p>
                  </div>
                )}

                {!wlLoading && !wlError && watchlist.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
