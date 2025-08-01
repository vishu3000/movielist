"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";
import Image from "next/image";
import {
  IMAGE_CONFIG,
  getTMDBImageUrl,
  getImageProps,
} from "../../../config/imageConfig";

const MovieSlide = ({ movie, index, current, handleSlideClick }) => {
  const slideRef = useRef(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const { id, title, poster } = movie;

  // Get standardized image properties for carousel slides
  const imageProps = getImageProps("CAROUSEL", "SLIDE", false);
  const posterUrl = getTMDBImageUrl(poster, IMAGE_CONFIG.SIZES.CAROUSEL.SLIDE);

  // Determine if this slide is one of the two currently visible slides
  const isVisible = index === current || index === current + 1;
  // Determine if this is the left slide (current) or right slide (current + 1)
  const isLeftSlide = index === current;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d] flex-shrink-0">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-500 ease-in-out mx-4 z-10 cursor-pointer"
        style={{
          width: `${IMAGE_CONFIG.SIZES.CAROUSEL.SLIDE.width}px`,
          height: `${IMAGE_CONFIG.SIZES.CAROUSEL.SLIDE.height}px`,
          maxWidth: "min(400px, 45vw)",
          maxHeight: "min(600px, 75vh)",
        }}
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-lg overflow-hidden transition-all duration-500 ease-out shadow-2xl"
          style={{
            transform: isVisible
              ? "scale(1) rotateX(0deg)"
              : "scale(0.85) rotateX(8deg)",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "bottom",
            opacity: isVisible ? 1 : 0.6,
          }}
        >
          <div
            className="w-full h-full transition-all duration-300 ease-out"
            style={{
              transform: isVisible
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
            }}
          >
            {/* Movie Poster */}
            {posterUrl ? (
              <Image
                className="w-full h-full object-cover transition-all duration-600 ease-in-out"
                style={{
                  opacity: isVisible ? 1 : 0.7,
                  filter: isVisible ? "none" : "grayscale(20%)",
                }}
                alt={title}
                src={posterUrl}
                {...imageProps}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli2Gx7p8gesZqEP/Z"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
            )}

            {/* Subtle overlay for better visual hierarchy */}
            {isVisible && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-all duration-1000" />
            )}
          </div>
        </div>

        {/* Movie Title - Show only for visible slides */}
        {isVisible && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg text-center truncate">
              {title}
            </h3>
          </div>
        )}
      </li>
    </div>
  );
};

const CarouselControl = ({ type, title, handleClick }) => {
  return (
    <button
      className={`w-12 h-12 flex items-center mx-3 justify-center bg-black/50 backdrop-blur-sm border border-white/20 rounded-full focus:border-red-500 focus:outline-none hover:-translate-y-0.5 hover:bg-black/70 active:translate-y-0.5 transition-all duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-white w-6 h-6" />
    </button>
  );
};

export function MovieCarousel({ movies, onMovieClick }) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    const previous = current - 2; // Move by 2 slides
    setCurrent(previous < 0 ? Math.max(0, movies.length - 2) : previous);
  };

  const handleNextClick = () => {
    const next = current + 2; // Move by 2 slides
    setCurrent(next >= movies.length ? 0 : next);
  };

  const handleSlideClick = (index) => {
    // If clicking a non-visible slide, make it the left slide of the pair
    if (index < current || index > current + 1) {
      setCurrent(index);
    } else {
      // If clicking a visible slide, trigger the movie click handler
      onMovieClick(movies[index].id);
    }
  };

  const id = useId();

  if (!movies || movies.length === 0) {
    return null;
  }

  // Calculate container dimensions for two slides
  const slideWidth = IMAGE_CONFIG.SIZES.CAROUSEL.SLIDE.width;
  const slideHeight = IMAGE_CONFIG.SIZES.CAROUSEL.SLIDE.height;
  const containerWidth = slideWidth * 2 + 64; // Two slides plus margins

  // Calculate the visible slides (ensure we don't go beyond array bounds)
  const visibleSlides = movies.slice(current, current + 2);
  const totalPairs = Math.ceil(movies.length / 2);

  return (
    <div className="relative w-full max-w-7xl mx-auto py-8">
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          width: `min(${containerWidth}px, 95vw)`,
          height: `min(${slideHeight + 60}px, 85vh)`, // Extra height for title
        }}
        aria-labelledby={`carousel-heading-${id}`}
      >
        <ul
          className="flex h-full transition-transform duration-1000 ease-in-out items-center justify-center"
          style={{
            transform: `translateX(-${(current / 2) * 100}%)`,
            width: `${totalPairs * 100}%`,
          }}
        >
          {Array.from({ length: totalPairs }, (_, pairIndex) => (
            <div
              key={pairIndex}
              className="flex justify-center items-center gap-4"
              style={{ width: `${100 / totalPairs}%` }}
            >
              {movies
                .slice(pairIndex * 2, pairIndex * 2 + 2)
                .map((movie, indexInPair) => {
                  const actualIndex = pairIndex * 2 + indexInPair;
                  return (
                    <MovieSlide
                      key={movie.id}
                      movie={movie}
                      index={actualIndex}
                      current={current}
                      handleSlideClick={handleSlideClick}
                    />
                  );
                })}
            </div>
          ))}
        </ul>

        {/* Navigation Controls */}
        {movies.length > 2 && (
          <div className="absolute flex justify-center w-full -bottom-2">
            <CarouselControl
              type="previous"
              title="Go to previous pair"
              handleClick={handlePreviousClick}
            />

            <CarouselControl
              type="next"
              title="Go to next pair"
              handleClick={handleNextClick}
            />
          </div>
        )}

        {/* Dots Indicator - Show dots for pairs */}
        {movies.length > 2 && (
          <div className="absolute flex justify-center w-full -bottom-12">
            <div className="flex space-x-2">
              {Array.from({ length: totalPairs }, (_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    Math.floor(current / 2) === index
                      ? "bg-red-600 scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                  onClick={() => setCurrent(index * 2)}
                  aria-label={`Go to pair ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
