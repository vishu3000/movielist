import { useRouter } from "next/router";
import Image from "next/image";
import {
  IMAGE_CONFIG,
  getTMDBImageUrl,
  getImageProps,
} from "../../config/imageConfig";

const MoreLikeThis = ({ movies }) => {
  const router = useRouter();

  const handleMoreLikeThisClick = (movieId) => {
    router.push(`/moviedetails/${movieId}`);
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <h2 className="text-white text-4xl font-bold mb-12 text-center">
        More Like This
      </h2>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((similarMovie) => {
          const imageProps = getImageProps("POSTER", "SMALL", false);
          const posterUrl = getTMDBImageUrl(
            similarMovie.poster?.replace(
              "https://image.tmdb.org/t/p/w300",
              ""
            ) || "",
            IMAGE_CONFIG.SIZES.POSTER.SMALL
          );

          return (
            <div
              key={similarMovie.id}
              onClick={() => handleMoreLikeThisClick(similarMovie.id)}
              className="group cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              {/* Movie Poster */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg aspect-[2/3]">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={similarMovie.title}
                    {...imageProps}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli2Gx7p8gesZqEP/Z"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 text-white mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-white text-sm font-semibold">
                      View Details
                    </span>
                  </div>
                </div>
              </div>

              {/* Movie Title */}
              <div className="mt-3 px-1">
                <h3
                  className="text-white text-sm font-medium leading-tight group-hover:text-red-400 transition-colors duration-300"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={similarMovie.title}
                >
                  {similarMovie.title}
                </h3>
                {similarMovie.duration && similarMovie.duration !== "N/A" && (
                  <p className="text-gray-400 text-xs mt-1">
                    {similarMovie.duration}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoreLikeThis;
