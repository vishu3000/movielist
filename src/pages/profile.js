import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Header from "../components/Header";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

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

          <div className="bg-black/75 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
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
                <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                  <p className="text-gray-400">Your watchlist is empty</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start adding movies and TV shows to your personal collection
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Recently Watched
                </h2>
                <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No recently watched content</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your viewing history will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
