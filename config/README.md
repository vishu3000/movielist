# Image Configuration System

This document explains the standardized image configuration system used throughout the movie application.

## Overview

The image configuration system provides consistent image sizes, resolutions, and quality settings across all components. It integrates with The Movie Database (TMDb) API to ensure optimal image delivery.

## Configuration File

Located at `config/imageConfig.js`, this file defines:

- **Standard aspect ratios** (2:3 for posters, 16:9 for backdrops, 3:2 for cards)
- **Specific image dimensions** for different use cases
- **TMDb API image size mappings**
- **Responsive breakpoints** for Next.js Image optimization
- **Quality settings** for different scenarios

## Image Types and Sizes

### Posters (2:3 aspect ratio)

- **SMALL**: 300x450px (uses TMDb w342)
- **MEDIUM**: 400x600px (uses TMDb w500)
- **LARGE**: 500x750px (uses TMDb w780)
- **EXTRA_LARGE**: 600x900px (uses TMDb w780)

### Backdrops (16:9 aspect ratio)

- **SMALL**: 640x360px (uses TMDb w780)
- **MEDIUM**: 1280x720px (uses TMDb w1280)
- **LARGE**: 1920x1080px (uses TMDb w1280)
- **EXTRA_LARGE**: 2560x1440px (uses TMDb original)

### Cards (3:2 aspect ratio)

- **SMALL**: 192x128px (uses TMDb w300) - Mobile
- **MEDIUM**: 288x192px (uses TMDb w500) - Desktop
- **LARGE**: 384x256px (uses TMDb w500)

### Carousel

- **SLIDE**: 480x720px (uses TMDb w500) - Main carousel slides
- **THUMBNAIL**: 120x180px (uses TMDb w185) - Small thumbnails

## Usage Examples

### Basic Usage with Helper Functions

```javascript
import {
  IMAGE_CONFIG,
  getTMDBImageUrl,
  getImageProps,
} from "../config/imageConfig";

// Get a standardized image URL
const posterUrl = getTMDBImageUrl(posterPath, IMAGE_CONFIG.SIZES.POSTER.MEDIUM);

// Get standardized Next.js Image props
const imageProps = getImageProps("POSTER", "MEDIUM", true); // priority = true
```

### In React Components

```javascript
import Image from "next/image";
import {
  getImageProps,
  getTMDBImageUrl,
  IMAGE_CONFIG,
} from "../config/imageConfig";

function MoviePoster({ posterPath, title, priority = false }) {
  const imageProps = getImageProps("POSTER", "MEDIUM", priority);
  const posterUrl = getTMDBImageUrl(
    posterPath,
    IMAGE_CONFIG.SIZES.POSTER.MEDIUM
  );

  return (
    <Image
      src={posterUrl}
      alt={title}
      {...imageProps}
      className="object-cover"
    />
  );
}
```

### Using TMDb API Service

```javascript
import TMDBApi from "../services/tmdbApi";

// Get standardized image URLs
const posterUrl = TMDBApi.getPosterUrl(posterPath, "LARGE");
const backdropUrl = TMDBApi.getBackdropUrl(backdropPath, "MEDIUM");
const cardUrl = TMDBApi.getCardImageUrl(backdropPath, "SMALL");
```

## Best Practices

1. **Always use the configuration constants** instead of hardcoding dimensions
2. **Choose appropriate sizes** based on the component's display context
3. **Use priority loading** only for above-the-fold images
4. **Include placeholder/blur data URLs** for better UX
5. **Set appropriate loading strategies** (eager for visible, lazy for others)

## Responsive Behavior

The system includes predefined responsive breakpoints:

- **Mobile (≤768px)**: Uses smaller image sizes
- **Tablet (768px-1024px)**: Uses medium image sizes
- **Desktop (≥1024px)**: Uses larger image sizes

## Image Quality

Three quality levels are available:

- **LOW**: 75% quality
- **MEDIUM**: 85% quality
- **HIGH**: 95% quality (default)

## Component Integration

Components using this system:

- `MovieCarousel` - Uses CAROUSEL.SLIDE configuration
- `MovieCard` - Uses CARD.MEDIUM configuration
- `TMDbApi` - Provides helper methods for all image types

## Adding New Image Types

To add a new image type:

1. Add the type to `IMAGE_CONFIG.SIZES`
2. Define appropriate dimensions and TMDb size mapping
3. Add responsive breakpoints to `IMAGE_CONFIG.RESPONSIVE_SIZES`
4. Add helper methods to `TMDbApi` if needed

Example:

```javascript
// In imageConfig.js
HERO: {
  SMALL: { width: 800, height: 450, tmdbSize: "w1280" },
  LARGE: { width: 1600, height: 900, tmdbSize: "original" },
}
```
