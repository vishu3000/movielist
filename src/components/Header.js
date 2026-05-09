import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

export default function Header() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#141414] shadow-lg"
          : "bg-gradient-to-b from-black/80 via-black/20 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/veflix.png"
              alt="Veflix"
              className="h-20 mr-8"
              width={100}
              height={100}
            />
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex space-x-5 text-sm font-medium">
            <Link
              href="/moviehub"
              className="text-gray-200 hover:text-white transition-colors duration-200"
            >
              Movies
            </Link>
            <Link
              href="/tvserieshub"
              className="text-gray-200 hover:text-white transition-colors duration-200"
            >
              TV Shows
            </Link>
            {session && (
              <Link
                href="/profile"
                className="text-gray-200 hover:text-white transition-colors duration-200"
              >
                My List
              </Link>
            )}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4">
          <SearchBar />

          {status === "loading" ? (
            <div className="w-6 h-6 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin" />
          ) : session ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm hidden md:block truncate max-w-[120px]">
                {session.user.name}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
