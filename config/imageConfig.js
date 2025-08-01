// Standard image configurations for the movie app
export const IMAGE_CONFIG = {
  // TMDB API base URL for images
  TMDB_BASE_URL: "https://image.tmdb.org/t/p",

  // Standard aspect ratios
  ASPECT_RATIOS: {
    POSTER: 2 / 3, // Movie posters (400x600, 500x750, etc.)
    BACKDROP: 16 / 9, // Landscape images (1920x1080, etc.)
    CARD: 16 / 10, // Movie cards (300x200, etc.)
  },

  // Standard image sizes with specific dimensions
  SIZES: {
    // Poster sizes (2:3 aspect ratio)
    POSTER: {
      SMALL: { width: 300, height: 450, tmdbSize: "w342" },
      MEDIUM: { width: 400, height: 600, tmdbSize: "w500" },
      LARGE: { width: 500, height: 750, tmdbSize: "w780" },
      EXTRA_LARGE: { width: 600, height: 900, tmdbSize: "w780" },
    },

    // Backdrop sizes (16:9 aspect ratio)
    BACKDROP: {
      SMALL: { width: 640, height: 360, tmdbSize: "w780" },
      MEDIUM: { width: 1280, height: 720, tmdbSize: "w1280" },
      LARGE: { width: 1920, height: 1080, tmdbSize: "w1280" },
      EXTRA_LARGE: { width: 2560, height: 1440, tmdbSize: "original" },
    },

    // Card sizes (3:2 aspect ratio for movie cards)
    CARD: {
      SMALL: { width: 192, height: 128, tmdbSize: "w300" }, // Mobile: w-48 h-32
      MEDIUM: { width: 288, height: 162, tmdbSize: "w780" }, // Desktop: w-72 h-48
      LARGE: { width: 384, height: 256, tmdbSize: "w780" },
    },

    // Carousel specific sizes
    CAROUSEL: {
      SLIDE: { width: 480, height: 720, tmdbSize: "w500" }, // 2:3 aspect ratio for carousel slides
      THUMBNAIL: { width: 120, height: 180, tmdbSize: "w185" }, // Small thumbnails
    },

    // Profile sizes for cast members
    PROFILE: {
      SMALL: { width: 60, height: 90, tmdbSize: "w185" },
      MEDIUM: { width: 80, height: 120, tmdbSize: "w300" },
      LARGE: { width: 100, height: 150, tmdbSize: "w500" },
    },

    // Logo sizes for streaming providers
    LOGO: {
      SMALL: { width: 32, height: 32, tmdbSize: "w92" },
      MEDIUM: { width: 48, height: 48, tmdbSize: "w154" },
      LARGE: { width: 64, height: 64, tmdbSize: "w185" },
    },
  },

  // Quality settings
  QUALITY: {
    LOW: 75,
    MEDIUM: 85,
    HIGH: 95,
  },

  // Responsive breakpoints for Next.js Image sizes
  RESPONSIVE_SIZES: {
    POSTER: "(max-width: 768px) 300px, (max-width: 1024px) 400px, 500px",
    BACKDROP: "(max-width: 768px) 640px, (max-width: 1024px) 1280px, 1920px",
    CARD: "(max-width: 768px) 192px, (max-width: 1024px) 288px, 384px",
    CAROUSEL: "(max-width: 768px) 300px, (max-width: 1024px) 400px, 480px",
    PROFILE: "(max-width: 768px) 60px, (max-width: 1024px) 80px, 100px",
    LOGO: "(max-width: 768px) 32px, (max-width: 1024px) 48px, 64px",
  },
};

// Helper function to get TMDB image URL
export function getTMDBImageUrl(path, sizeConfig) {
  if (!path) return null;
  return `${IMAGE_CONFIG.TMDB_BASE_URL}/${sizeConfig.tmdbSize}${path}`;
}

// Helper function to get responsive sizes string
export function getResponsiveSizes(type) {
  return (
    IMAGE_CONFIG.RESPONSIVE_SIZES[type] || IMAGE_CONFIG.RESPONSIVE_SIZES.POSTER
  );
}

// Helper function to calculate dimensions based on aspect ratio
export function calculateDimensions(width, aspectRatio) {
  return {
    width,
    height: Math.round(width / aspectRatio),
  };
}

// Standard image props for Next.js Image component
export function getImageProps(type, size = "MEDIUM", priority = false) {
  const config = IMAGE_CONFIG.SIZES[type]?.[size];
  if (!config) {
    console.warn(`Invalid image config: type=${type}, size=${size}`);
    return IMAGE_CONFIG.SIZES.POSTER.MEDIUM;
  }

  return {
    width: config.width,
    height: config.height,
    sizes: getResponsiveSizes(type),
    priority,
    quality: IMAGE_CONFIG.QUALITY.HIGH,
  };
}
