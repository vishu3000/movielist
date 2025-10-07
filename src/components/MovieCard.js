import Image from "next/image";
import {
  IMAGE_CONFIG,
  getTMDBImageUrl,
  getImageProps,
} from "../../config/imageConfig";
import { toFiveScale } from "../lib/utils";

export default function MovieCard({
  movie, // New prop structure
  title,
  image,
  isTop10 = false,
  isRecentlyAdded = false,
  isNewSeason = false,
  progress = null,
  badge = null,
  forList = false,
  rating = null,
  onRemove = null,
}) {
  // Handle both old and new prop structures
  const movieTitle = movie?.title || title;
  const movieImage = movie?.poster || image;
  const movieYear = movie?.year;
  const movieRating = movie?.rating || rating;
  const mediaType = movie?.mediaType;

  const imageSize = forList ? "SMALL" : "MEDIUM";
  const imageType = forList ? "POSTER" : "CARD";

  const imageProps = getImageProps(imageType, imageSize, false);
  const cardImageUrl = movieImage
    ? getTMDBImageUrl(
        movieImage.replace("https://image.tmdb.org/t/p/w500", ""),
        IMAGE_CONFIG.SIZES[imageType][imageSize]
      )
    : null;

  const rating5 = toFiveScale(movieRating);
  const starCount = Math.round(rating5);

  return (
    <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-105">
      {/* Movie Thumbnail */}
      <div
        className="relative bg-gray-800 rounded overflow-hidden"
        style={{
          width: `${IMAGE_CONFIG.SIZES[imageType][imageSize].width}px`,
          height: `${IMAGE_CONFIG.SIZES[imageType][imageSize].height}px`,
        }}
      >
        {/* Background Image */}
        {cardImageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={cardImageUrl}
              alt={movieTitle}
              {...imageProps}
              className="object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli2Gx7p8gesZqEP/Z"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center px-2">
              {movieTitle}
            </span>
          </div>
        )}{" "}
        {/* Hover Title Overlay */}
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <div className="text-center px-2">
            <h3 className="text-white text-sm md:text-base font-semibold leading-tight mb-1">
              {movieTitle}
            </h3>
            {movieYear && <p className="text-gray-300 text-xs">{movieYear}</p>}
            {movieRating && (
              <div
                className="flex items-center justify-center gap-0.5 text-xs"
                aria-label={`Rating: ${movieRating}`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < starCount ? "text-yellow-400" : "text-gray-500"
                    }
                  >
                    ★
                  </span>
                ))}
                <span className="ml-1 text-yellow-200">
                  {rating5.toFixed(1)}
                </span>
              </div>
            )}
            {mediaType && (
              <p className="text-blue-400 text-xs capitalize">{mediaType}</p>
            )}
          </div>
        </div>
        {/* Remove (Cross) Button for Watchlist */}
        {forList && typeof onRemove === "function" && (
          <div className="absolute top-2 right-2 z-40">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(e);
              }}
              aria-label="Remove from watchlist"
              className="bg-black/70 hover:bg-black/90 text-white w-7 h-7 rounded-full flex items-center justify-center"
            >
              <span className="text-sm leading-none">×</span>
            </button>
          </div>
        )}
        {/* Veflix Logo */}
        <div className="absolute top-2 left-2 z-20">
          <div className="text-red-600 text-2xl font-bold">V</div>
        </div>
        {/* Recently Added Indicator */}
        {isRecentlyAdded && (
          <div className="absolute top-8 right-2 bg-green-600 text-white text-xs px-1 rounded z-20">
            NEW
          </div>
        )}
      </div>
    </div>
  );
}
