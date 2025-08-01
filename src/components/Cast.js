import Image from "next/image";
import Link from "next/link";

const Cast = ({ cast }) => {
  if (!cast || cast.length === 0) {
    return null;
  }

  // Grid layout with reduced gaps and fully circular images
  return (
    <div className="relative z-20">
      <h3 className="text-white text-2xl font-semibold mb-6">Cast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cast.map((actor, index) => (
          <Link href={`/person?id=${actor.id}`} key={actor.id || index}>
            <div className="flex flex-col items-center text-center group">
              {/* Fully circular profile image */}
              <div className="relative mb-2">
                {actor.profileImage ? (
                  <Image
                    src={actor.profileImage}
                    alt={actor.name}
                    width={140}
                    height={140}
                    className="w-[140px] h-[140px] rounded-full object-cover border-2 border-gray-700 group-hover:border-gray-500 transition-colors duration-200"
                    sizes="140px"
                  />
                ) : (
                  <div className="w-[90px] h-[90px] bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 group-hover:border-gray-500 transition-colors duration-200">
                    <span className="text-gray-300 text-lg font-semibold">
                      {actor.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>

              {/* Actor name */}
              <h4 className="text-white font-semibold text-sm mb-1 max-w-full leading-tight">
                {actor.name}
              </h4>

              {/* Character name */}
              {actor.character && (
                <p className="text-gray-400 text-xs leading-tight max-w-full">
                  as {actor.character}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Cast;
