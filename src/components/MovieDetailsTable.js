import React from "react";

const MovieDetailsTable = ({ movie, tvShow }) => {
  // Determine if we're dealing with a movie or TV show
  const isTVShow = !!tvShow;
  const data = isTVShow ? tvShow : movie;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format rating
  const formatRating = (rating) => {
    if (!rating) return "N/A";
    return `${rating}/10`;
  };

  // Helper function to format languages
  const formatLanguages = (languages) => {
    if (!languages || languages.length === 0) return "N/A";
    return languages.join(", ");
  };

  // Helper function to format production companies
  const formatProductionCompanies = (companies) => {
    if (!companies || companies.length === 0) return "N/A";
    return companies
      .slice(0, 3)
      .map((company) => company.name)
      .join(", ");
  };

  // Helper function to format networks
  const formatNetworks = (networks) => {
    if (!networks || networks.length === 0) return "N/A";
    return networks
      .slice(0, 3)
      .map((network) => network.name)
      .join(", ");
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Define details based on content type
  const getDetails = () => {
    if (isTVShow) {
      return [
        {
          label: "Status",
          value: data.status || "N/A",
          icon: "📺",
        },
        {
          label: "Number of Seasons",
          value: data.number_of_seasons || "N/A",
          icon: "📚",
        },
        {
          label: "Number of Episodes",
          value: data.number_of_episodes || "N/A",
          icon: "🎬",
        },
        {
          label: "Episode Runtime",
          value: data.duration || "N/A",
          icon: "⏱️",
        },
        {
          label: "First Air Date",
          value: formatDate(data.first_air_date),
          icon: "📅",
        },
        {
          label: "Last Air Date",
          value: formatDate(data.last_air_date),
          icon: "📅",
        },
        {
          label: "Networks",
          value: formatNetworks(data.networks),
          icon: "📡",
        },
        {
          label: "Production Companies",
          value: formatProductionCompanies(data.production_companies),
          icon: "🏢",
        },
        {
          label: "Languages",
          value: formatLanguages(
            data.spoken_languages?.map((lang) => lang.english_name) ||
              data.original_language
          ),
          icon: "🗣️",
        },
        {
          label: "Rating",
          value: formatRating(data.vote_average || data.rating_score),
          icon: "⭐",
        },
        {
          label: "Type",
          value: data.type || "N/A",
          icon: "🎭",
        },
        {
          label: "In Production",
          value: data.in_production ? "Yes" : "No",
          icon: "🏗️",
        },
      ];
    } else {
      return [
        {
          label: "Duration",
          value: data.duration || "N/A",
          icon: "⏱️",
        },
        {
          label: "Revenue",
          value: formatCurrency(data.revenue),
          icon: "💰",
        },
        {
          label: "Budget",
          value: formatCurrency(data.budget),
          icon: "💵",
        },
        {
          label: "Production Companies",
          value: formatProductionCompanies(data.production_companies),
          icon: "🎬",
        },
        {
          label: "Languages",
          value: formatLanguages(
            data.spoken_languages?.map((lang) => lang.english_name) ||
              data.original_language
          ),
          icon: "🗣️",
        },
        {
          label: "Rating",
          value: formatRating(data.vote_average || data.rating_score),
          icon: "⭐",
        },
        {
          label: "Adult Content",
          value: data.adult ? "Yes" : "No",
          icon: "🔞",
        },
      ];
    }
  };

  const details = getDetails();

  return (
    <div className="px-8 py-16 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {isTVShow ? "TV Show Details" : "Movie Details"}
        </h2>
        <p className="text-gray-400">
          Comprehensive information about this {isTVShow ? "TV show" : "movie"}
        </p>
      </div>

      <div className="bg-black rounded-lg overflow-hidden border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {details.map((detail, index) => (
            <div
              key={index}
              className={`p-6 border-b border-gray-800 ${
                index % 3 === 2 ? "border-r-0" : "border-r border-gray-800"
              } ${
                index >= details.length - (details.length % 3)
                  ? "border-b-0"
                  : ""
              }`}
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{detail.icon}</span>
                <h3 className="text-lg font-semibold text-white">
                  {detail.label}
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsTable;
