import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import SearchBar from "./SearchBar";

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414]">
      <div className="flex items-center justify-between px-4 md:px-8">
        {/* Veflix Logo */}
        <div className="flex items-center">
          <Image
            src="/veflix.png"
            alt="Veflix"
            className="h-20 mr-8"
            width={100}
            height={100}
          />

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6 text-sm font-bold">
            <Link
              href="/"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/moviehub"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/tvserieshub"
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              TV Shows
            </Link>
            {session && (
              <Link
                href="/profile"
                className="text-gray-300 hover:text-gray-400 transition-colors"
              >
                My List
              </Link>
            )}
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          <SearchBar />

          {status === "loading" ? (
            <div className="w-8 h-8 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
          ) : session ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm hidden md:block">
                Welcome, {session.user.name}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
