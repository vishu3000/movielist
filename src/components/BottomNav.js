import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const { data: session } = useSession();
  const { pathname } = useRouter();

  const isActive = (href) => pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#141414] border-t border-gray-800">
      <div className="flex items-center justify-around h-16">
        {/* Movies */}
        <Link
          href="/moviehub"
          className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors duration-200 ${
            isActive("/moviehub") ? "text-white" : "text-gray-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"
            />
          </svg>
          <span className="text-[10px] font-medium">Movies</span>
          {isActive("/moviehub") && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />
          )}
        </Link>

        {/* TV Shows */}
        <Link
          href="/tvserieshub"
          className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors duration-200 ${
            isActive("/tvserieshub") ? "text-white" : "text-gray-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[10px] font-medium">TV Shows</span>
          {isActive("/tvserieshub") && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />
          )}
        </Link>

        {/* My List — only when logged in */}
        {session && (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors duration-200 ${
              isActive("/profile") ? "text-white" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-[10px] font-medium">My List</span>
            {isActive("/profile") && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />
            )}
          </Link>
        )}
      </div>
    </nav>
  );
}
