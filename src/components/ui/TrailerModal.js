import { useEffect } from "react";

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  // Convert YouTube watch URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // Extract video ID from YouTube URL
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    if (videoId && videoId[1]) {
      return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
    return null;
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#141414]  bg-opacity-80"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl mx-4 bg-[#141414] rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900">
          <h2 className="text-white text-xl font-semibold">
            {movieTitle} - Trailer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close modal"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Video Container */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movieTitle} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
                </svg>
                <p className="text-lg">Trailer not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
