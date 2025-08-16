import { IMAGE_CONFIG, getTMDBImageUrl } from "../../config/imageConfig";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// You'll need to add your TMDb API key here or in environment variables
const API_KEY = process.env.NEXT_PUBLIC_MOVIE_API_KEY;

class TMDBApi {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
  }

  // Helper method to get headers with authentication
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    } else if (API_KEY) {
      // Fallback to API key if no access token
      return { api_key: API_KEY };
    }

    return headers;
  }

  // Fetch movie details by ID
  async getMovieById(movieId) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,similar,watch/providers`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMovieData(data);
    } catch (error) {
      console.error("Error fetching movie:", error);
      return null;
    }
  }

  // Transform TMDb data to our app's format
  transformMovieData(tmdbData) {
    const {
      id,
      title,
      overview,
      release_date,
      runtime,
      vote_average,
      poster_path,
      backdrop_path,
      genres,
      credits,
      videos,
      similar,
      "watch/providers": watchProviders,
    } = tmdbData;

    // Get main cast (first 5 actors) with profile images
    const cast =
      credits?.cast?.slice(0, 5).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profileImage: actor.profile_path
          ? getTMDBImageUrl(
              actor.profile_path,
              IMAGE_CONFIG.SIZES.PROFILE.MEDIUM
            )
          : null,
      })) || [];

    // Get trailer
    const trailer = videos?.results?.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    // Get similar movies with standardized image sizes
    const moreLikeThis =
      similar?.results?.slice(0, 12).map((movie) => ({
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path
          ? getTMDBImageUrl(movie.poster_path, IMAGE_CONFIG.SIZES.POSTER.SMALL)
          : null,
        duration: "N/A", // TMDb doesn't provide runtime in similar movies endpoint
      })) || [];

    // Process watch providers data
    const streamingProviders = this.transformWatchProviders(watchProviders);

    return {
      id: id.toString(),
      title,
      year: release_date ? new Date(release_date).getFullYear() : "N/A",
      rating: "PG-13", // TMDb doesn't provide content rating in basic call
      duration: runtime
        ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
        : "N/A",
      quality: vote_average >= 7 ? "4K" : "HD",
      description: overview || "No description available.",
      cast,
      genres: genres?.map((genre) => genre.name) || [],
      poster: poster_path
        ? getTMDBImageUrl(poster_path, IMAGE_CONFIG.SIZES.POSTER.MEDIUM)
        : null,
      backdrop: backdrop_path
        ? getTMDBImageUrl(backdrop_path, IMAGE_CONFIG.SIZES.BACKDROP.LARGE)
        : null,
      trailer: trailer
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : null,
      isNewRelease: release_date
        ? (new Date() - new Date(release_date)) / (1000 * 60 * 60 * 24) < 30
        : false,
      rating_score: vote_average || 0,
      revenue: tmdbData.revenue || 0,
      budget: tmdbData.budget || 0,
      production_companies: tmdbData.production_companies || [],
      spoken_languages: tmdbData.spoken_languages || [],
      original_language: tmdbData.original_language || "N/A",
      adult: tmdbData.adult || false,
      moreLikeThis,
      streamingProviders,
    };
  }

  // Transform watch providers data
  transformWatchProviders(watchProvidersData) {
    if (!watchProvidersData || !watchProvidersData.results) {
      return {
        available: false,
        regions: {},
        attribution: "Powered by JustWatch",
      };
    }

    const regions = {};
    const results = watchProvidersData.results;

    // Process each region
    Object.keys(results).forEach((regionCode) => {
      const regionData = results[regionCode];
      const providers = {
        streaming: [],
        rent: [],
        buy: [],
      };

      // Process streaming providers
      if (regionData.flatrate) {
        providers.streaming = regionData.flatrate.map((provider) => ({
          id: provider.provider_id,
          name: provider.provider_name,
          logo: provider.logo_path
            ? getTMDBImageUrl(
                provider.logo_path,
                IMAGE_CONFIG.SIZES.LOGO?.MEDIUM || "w154"
              )
            : null,
          displayPriority: provider.display_priority || 999,
        }));
      }

      // Process rental providers
      if (regionData.rent) {
        providers.rent = regionData.rent.map((provider) => ({
          id: provider.provider_id,
          name: provider.provider_name,
          logo: provider.logo_path
            ? getTMDBImageUrl(
                provider.logo_path,
                IMAGE_CONFIG.SIZES.LOGO?.MEDIUM || "w154"
              )
            : null,
          displayPriority: provider.display_priority || 999,
        }));
      }

      // Process purchase providers
      if (regionData.buy) {
        providers.buy = regionData.buy.map((provider) => ({
          id: provider.provider_id,
          name: provider.provider_name,
          logo: provider.logo_path
            ? getTMDBImageUrl(
                provider.logo_path,
                IMAGE_CONFIG.SIZES.LOGO?.MEDIUM || "w154"
              )
            : null,
          displayPriority: provider.display_priority || 999,
        }));
      }

      // Sort providers by display priority
      providers.streaming.sort((a, b) => a.displayPriority - b.displayPriority);
      providers.rent.sort((a, b) => a.displayPriority - b.displayPriority);
      providers.buy.sort((a, b) => a.displayPriority - b.displayPriority);

      regions[regionCode] = {
        link: regionData.link || null,
        providers,
      };
    });

    return {
      available: Object.keys(regions).length > 0,
      regions,
      attribution: "Powered by JustWatch",
    };
  }

  // Search movies by title
  async searchMovies(query) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error searching movies:", error);
      return [];
    }
  }

  // Search TV shows by title
  async searchTVShows(query) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error searching TV shows:", error);
      return [];
    }
  }

  // Multi-search (movies, TV shows, and people)
  async multiSearch(query) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error performing multi-search:", error);
      return [];
    }
  }

  // Get popular movies
  async getPopularMovies() {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      return [];
    }
  }

  // Helper method to get full image URL with standardized sizes
  getImageUrl(path, type = "POSTER", size = "MEDIUM") {
    if (!path) return null;
    const sizeConfig = IMAGE_CONFIG.SIZES[type]?.[size];
    if (!sizeConfig) {
      console.warn(`Invalid image config: type=${type}, size=${size}`);
      return getTMDBImageUrl(path, IMAGE_CONFIG.SIZES.POSTER.MEDIUM);
    }
    return getTMDBImageUrl(path, sizeConfig);
  }

  // Get standardized poster URL
  getPosterUrl(path, size = "MEDIUM") {
    return this.getImageUrl(path, "POSTER", size);
  }

  // Get standardized backdrop URL
  getBackdropUrl(path, size = "LARGE") {
    return this.getImageUrl(path, "BACKDROP", size);
  }

  // Get standardized card image URL
  getCardImageUrl(path, size = "MEDIUM") {
    return this.getImageUrl(path, "CARD", size);
  }

  // Get streaming providers for a specific region
  getStreamingProvidersForRegion(streamingProviders, regionCode = "US") {
    if (
      !streamingProviders ||
      !streamingProviders.available ||
      !streamingProviders.regions[regionCode]
    ) {
      return {
        available: false,
        streaming: [],
        rent: [],
        buy: [],
        link: null,
        attribution: streamingProviders?.attribution || "Powered by JustWatch",
      };
    }

    const regionData = streamingProviders.regions[regionCode];
    return {
      available: true,
      streaming: regionData.providers.streaming || [],
      rent: regionData.providers.rent || [],
      buy: regionData.providers.buy || [],
      link: regionData.link,
      attribution: streamingProviders.attribution,
    };
  }

  // Get all available regions for streaming providers
  getAvailableStreamingRegions(streamingProviders) {
    if (!streamingProviders || !streamingProviders.available) {
      return [];
    }
    return Object.keys(streamingProviders.regions);
  }

  // Get movies by category
  async getMoviesByCategory(category, page = 1, platform = "movie") {
    let apiUrl;

    // Switch case for different movie list types
    switch (category) {
      case "upcoming":
        apiUrl = `${TMDB_BASE_URL}/${platform}/upcoming?api_key=${API_KEY}`;
        break;
      case "top_rated":
        apiUrl = `${TMDB_BASE_URL}/${platform}/top_rated?api_key=${API_KEY}`;
        break;
      case "popular":
        apiUrl = `${TMDB_BASE_URL}/${platform}/popular?api_key=${API_KEY}`;
        break;
      case "now_playing":
        apiUrl = `${TMDB_BASE_URL}/${platform}/now_playing?api_key=${API_KEY}`;
        break;

      case "on_the_air":
        apiUrl = `${TMDB_BASE_URL}/${platform}/on_the_air?api_key=${API_KEY}`;
        break;

      case "airing_today":
        apiUrl = `${TMDB_BASE_URL}/${platform}/airing_today?api_key=${API_KEY}`;
        break;
      default:
        // Default to popular movies if category is not recognized
        apiUrl = `${TMDB_BASE_URL}/${platform}/popular?api_key=${API_KEY}`;
        break;
    }
    try {
      const response = await fetch(
        `${apiUrl}&page=${page}&sort_by=popularity.desc`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error(`Error fetching movies for category ${category}:`, error);
      return [];
    }
  }

  // Get TV shows by category
  async getTVShowsByCategory(category, page = 1, platform = "tv") {
    return this.getMoviesByCategory(category, page, platform);
  }

  // Fetch person details by ID
  async getPersonById(personId) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/person/${personId}?api_key=${API_KEY}&append_to_response=combined_credits,external_ids`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformPersonData(data);
    } catch (error) {
      console.error("Error fetching person:", error);
      return null;
    }
  }

  // Transform TMDb person data to our app's format
  transformPersonData(tmdbData) {
    const {
      id,
      name,
      biography,
      birthday,
      deathday,
      gender,
      homepage,
      imdb_id,
      known_for_department,
      place_of_birth,
      popularity,
      profile_path,
      also_known_as,
      combined_credits,
      external_ids,
    } = tmdbData;

    // Get known works from combined credits (movies + TV shows)
    const knownWorks =
      combined_credits?.cast
        ?.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        ?.map((work) => ({
          id: work.id,
          title: work.title || work.name,
          character: work.character,
          poster_path: work.poster_path,
          media_type: work.media_type,
          release_date: work.release_date || work.first_air_date,
          vote_average: work.vote_average,
        })) || [];

    return {
      id: id.toString(),
      name,
      biography,
      birthday,
      deathday,
      gender,
      homepage,
      imdb_id,
      known_for_department,
      place_of_birth,
      popularity,
      profile_path,
      also_known_as,
      known_works: knownWorks,
      external_ids,
    };
  }

  // Fetch TV show details by ID
  async getTVShowById(tvId) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits,videos,similar,watch/providers,seasons`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformTVShowData(data);
    } catch (error) {
      console.error("Error fetching TV show:", error);
      return null;
    }
  }

  // Fetch season details by TV show ID and season number
  async getSeasonDetails(tvId, seasonNumber) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&append_to_response=videos`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformSeasonData(data);
    } catch (error) {
      console.error("Error fetching season:", error);
      return null;
    }
  }

  // Transform TMDb TV show data to our app's format
  transformTVShowData(tmdbData) {
    const {
      id,
      name,
      overview,
      first_air_date,
      last_air_date,
      episode_run_time,
      vote_average,
      poster_path,
      backdrop_path,
      genres,
      credits,
      videos,
      similar,
      "watch/providers": watchProviders,
      seasons,
      number_of_seasons,
      number_of_episodes,
      status,
      type,
      in_production,
      networks,
      production_companies,
      spoken_languages,
      original_language,
      adult,
    } = tmdbData;

    // Get main cast (first 5 actors) with profile images
    const cast =
      credits?.cast?.slice(0, 5).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profileImage: actor.profile_path
          ? getTMDBImageUrl(
              actor.profile_path,
              IMAGE_CONFIG.SIZES.PROFILE.MEDIUM
            )
          : null,
      })) || [];

    // Get trailer
    const trailer = videos?.results?.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    // Get similar TV shows with standardized image sizes
    const moreLikeThis =
      similar?.results?.slice(0, 12).map((show) => ({
        id: show.id,
        title: show.name,
        poster: show.poster_path
          ? getTMDBImageUrl(show.poster_path, IMAGE_CONFIG.SIZES.POSTER.SMALL)
          : null,
        duration: "N/A",
      })) || [];

    // Process watch providers data
    const streamingProviders = this.transformWatchProviders(watchProviders);

    // Transform seasons data
    const transformedSeasons =
      seasons?.map((season) => ({
        id: season.id,
        name: season.name,
        season_number: season.season_number,
        episode_count: season.episode_count,
        air_date: season.air_date,
        overview: season.overview,
        poster: season.poster_path
          ? getTMDBImageUrl(
              season.poster_path,
              IMAGE_CONFIG.SIZES.POSTER.MEDIUM
            )
          : null,
        still_path: season.still_path
          ? getTMDBImageUrl(season.still_path, IMAGE_CONFIG.SIZES.STILL.MEDIUM)
          : null,
      })) || [];

    return {
      id: id.toString(),
      title: name,
      year: first_air_date ? new Date(first_air_date).getFullYear() : "N/A",
      rating: "TV-14", // TMDb doesn't provide content rating in basic call
      duration: episode_run_time?.[0] ? `${episode_run_time[0]}m` : "N/A",
      quality: vote_average >= 7 ? "4K" : "HD",
      description: overview || "No description available.",
      cast,
      genres: genres?.map((genre) => genre.name) || [],
      poster: poster_path
        ? getTMDBImageUrl(poster_path, IMAGE_CONFIG.SIZES.POSTER.MEDIUM)
        : null,
      backdrop: backdrop_path
        ? getTMDBImageUrl(backdrop_path, IMAGE_CONFIG.SIZES.BACKDROP.LARGE)
        : null,
      trailer: trailer
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : null,
      isNewRelease: first_air_date
        ? (new Date() - new Date(first_air_date)) / (1000 * 60 * 60 * 24) < 30
        : false,
      rating_score: vote_average || 0,
      status,
      type,
      in_production,
      networks: networks || [],
      production_companies: production_companies || [],
      spoken_languages: spoken_languages || [],
      original_language: original_language || "N/A",
      adult: adult || false,
      number_of_seasons,
      number_of_episodes,
      first_air_date,
      last_air_date,
      seasons: transformedSeasons,
      moreLikeThis,
      streamingProviders,
    };
  }

  // Transform season data to our app's format
  transformSeasonData(tmdbData) {
    const {
      id,
      name,
      season_number,
      overview,
      air_date,
      poster_path,
      episodes,
      videos,
    } = tmdbData;

    // Transform episodes
    const transformedEpisodes =
      episodes?.map((episode) => ({
        id: episode.id,
        name: episode.name,
        episode_number: episode.episode_number,
        overview: episode.overview,
        still_path: episode.still_path
          ? getTMDBImageUrl(
              episode.still_path,
              IMAGE_CONFIG.SIZES.POSTER.MEDIUM
            )
          : null,
        air_date: episode.air_date,
        runtime: episode.runtime,
        vote_average: episode.vote_average,
        guest_stars: episode.guest_stars || [],
        crew: episode.crew || [],
      })) || [];

    return {
      id: id.toString(),
      name,
      season_number,
      overview,
      air_date,
      poster: poster_path
        ? getTMDBImageUrl(poster_path, IMAGE_CONFIG.SIZES.POSTER.MEDIUM)
        : null,
      episodes: transformedEpisodes,
      trailer: videos?.results?.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      ),
    };
  }

  // Add method to get user's watchlist
  async getUserWatchlist(accountId, page = 1) {
    if (!this.accessToken) {
      throw new Error("Authentication required for user-specific data");
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/account/${accountId}/watchlist/movies?page=${page}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching user watchlist:", error);
      return [];
    }
  }

  // Add method to get user's favorite movies
  async getUserFavorites(accountId, page = 1) {
    if (!this.accessToken) {
      throw new Error("Authentication required for user-specific data");
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/account/${accountId}/favorite/movies?page=${page}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      return [];
    }
  }

  // Add method to add/remove movie from favorites
  async toggleFavorite(accountId, mediaType, mediaId, favorite) {
    if (!this.accessToken) {
      throw new Error("Authentication required for user-specific data");
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/account/${accountId}/favorite`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            media_type: mediaType,
            media_id: mediaId,
            favorite: favorite,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  }
}

const tmdbApi = new TMDBApi();

export default tmdbApi;
