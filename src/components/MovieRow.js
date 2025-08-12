import { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import Link from "next/link";

export default function MovieRow({ title, url, type = "movie" }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevClickCount, setPrevClickCount] = useState(0);
  const [nextClickCount, setNextClickCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const itemsPerSlide = 6; // Number of items to show per slide

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("API Key:", process.env.NEXT_PUBLIC_MOVIE_API_KEY);
        console.log("URL:", url);

        if (!process.env.NEXT_PUBLIC_MOVIE_API_KEY) {
          setError(
            new Error(
              "TMDB API key is missing. Please add NEXT_PUBLIC_MOVIE_API_KEY to your .env.local file"
            )
          );
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${url}?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}&language=en-US&page=1`
        );
        let data = await response.json();

        // Shuffle the results array before slicing
        const shuffledResults = data.results.sort(() => Math.random() - 0.5);
        data.results = shuffledResults.slice(0, 12);

        setItems(data.results);
        setIsLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [url]);

  const modifiedPoster = (posterPath) => {
    if (!posterPath) return null;
    return posterPath;
  };

  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setNextClickCount((prev) => prev + 1);
    setPrevClickCount((prev) => prev - 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setPrevClickCount((prev) => prev + 1);
    setNextClickCount((prev) => prev - 1);
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const trim = (title) => {
    return title.trim().replace(/\s+/g, "_").toLowerCase();
  };

  // Get the correct title and link based on content type
  const getItemTitle = (item) => {
    return type === "tv" ? item.name : item.title;
  };

  const getItemLink = (item) => {
    return type === "tv" ? `/tvdetails/${item.id}` : `/moviedetails/${item.id}`;
  };

  if (isLoading)
    return <div className="text-white px-4 md:px-8">Loading...</div>;

  if (error)
    return (
      <div className="text-red-500 px-4 md:px-8">Error: {error.message}</div>
    );

  return (
    <div className="mb-8">
      <div
        className="relative flex px-4 md:px-8 cursor-pointer justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/movielist?category=${trim(title)}&platform=${type}`}>
          <h2 className="text-white text-xl font-semibold mb-4">{title}</h2>
        </Link>

        {/* Explore All Link */}
        <Link
          href={`/movielist?category=${trim(title)}&platform=${type}`}
          className={`left-0 text-sm font-semibold text-blue-400 transition-all duration-300 ease-in-out transform hover:text-blue-300`}
        >
          Explore More
        </Link>
      </div>
      <div className="relative px-4 md:px-8">
        {/* Navigation Buttons */}
        {totalSlides > 1 && (
          <>
            {nextClickCount > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-0.5  transform  z-10 bg-black/50 hover:bg-black/70 text-white h-32 md:h-40 w-8 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer"
                aria-label="Previous items"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {nextClickCount < totalSlides - 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-0.5 transform  z-10 bg-black/50 hover:bg-black/70 text-white h-32 md:h-40 w-8 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer"
                aria-label="Next items"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 pb-4">
                  {items
                    .slice(
                      slideIndex * itemsPerSlide,
                      (slideIndex + 1) * itemsPerSlide
                    )
                    .map((item, index) => (
                      <div key={slideIndex * itemsPerSlide + index}>
                        <Link href={getItemLink(item)}>
                          <MovieCard
                            msid={item.id}
                            title={getItemTitle(item)}
                            image={modifiedPoster(item.backdrop_path)}
                            rating={item.vote_average}
                          />
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
