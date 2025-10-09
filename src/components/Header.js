import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import SearchBar from "./SearchBar";

export default function Header({ isMobile }) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414]">
      <div className="flex items-center justify-between px-4 md:px-8">
        {/* Veflix Logo */}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-6 text-sm font-bold">
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
          <SearchBar isMobile={isMobile} />

          {/* Desktop Auth Section */}
          <div className="hidden md:block">
            {status === "loading" ? (
              <div className="w-8 h-8 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">
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

          {/* Mobile Hamburger Menu */}
          {isMobile && (
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {/* Mobile Menu Dropdown */}
              {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-[#141414] border-t border-gray-800 shadow-lg">
                  <div className="px-4 py-4 space-y-4">
                    {/* Mobile Navigation Links */}
                    <nav className="space-y-3">
                      <Link
                        href="/moviehub"
                        className="block text-gray-300 hover:text-white transition-colors py-2"
                        onClick={closeMenu}
                      >
                        Movies
                      </Link>
                      <Link
                        href="/tvserieshub"
                        className="block text-gray-300 hover:text-white transition-colors py-2"
                        onClick={closeMenu}
                      >
                        TV Shows
                      </Link>
                      {session && (
                        <Link
                          href="/profile"
                          className="block text-gray-300 hover:text-white transition-colors py-2"
                          onClick={closeMenu}
                        >
                          My List
                        </Link>
                      )}
                    </nav>

                    {/* Mobile Auth Section */}
                    <div className="border-t border-gray-800 pt-4">
                      {status === "loading" ? (
                        <div className="flex justify-center">
                          <div className="w-6 h-6 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
                        </div>
                      ) : session ? (
                        <div className="space-y-3">
                          <div className="text-gray-300 text-sm text-center">
                            Welcome, {session.user.name}
                          </div>
                          <button
                            onClick={() => {
                              handleSignOut();
                              closeMenu();
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <Link
                          href="/auth/login"
                          className="block w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                          onClick={closeMenu}
                        >
                          Sign In
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
