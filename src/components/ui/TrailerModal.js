import { useEffect, useRef } from "react";

let ytApiReady = false;
let ytApiLoading = false;
const ytReadyCallbacks = [];

function loadYouTubeApi(cb) {
  if (ytApiReady) { cb(); return; }
  ytReadyCallbacks.push(cb);
  if (ytApiLoading) return;
  ytApiLoading = true;
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    ytReadyCallbacks.forEach((fn) => fn());
    ytReadyCallbacks.length = 0;
  };
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] ?? null;
}

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle, onCompleted }) => {
  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);

  // Block body scroll when open
  useEffect(() => {
    const handleEsc = (e) => { if (e.keyCode === 27) onClose(); };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Create/destroy YT player when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
      return;
    }

    const videoId = extractVideoId(trailerUrl);
    if (!videoId || !playerContainerRef.current) return;

    loadYouTubeApi(() => {
      if (!playerContainerRef.current) return;
      // Clear previous content
      playerContainerRef.current.innerHTML = "";
      const div = document.createElement("div");
      playerContainerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event) => {
            // YT.PlayerState.ENDED === 0
            if (event.data === 0 && onCompleted) {
              onCompleted();
            }
          },
        },
      });
    });

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [isOpen, trailerUrl, onCompleted]);

  if (!isOpen) return null;

  const videoId = extractVideoId(trailerUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#141414] bg-opacity-80" onClick={onClose} />

      <div className="relative w-full max-w-6xl mx-4 bg-[#141414] rounded-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 bg-gray-900">
          <h2 className="text-white text-xl font-semibold">
            {movieTitle} - Trailer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {videoId ? (
            <div
              ref={playerContainerRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
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
