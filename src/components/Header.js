import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
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
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
