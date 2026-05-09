import React from "react";

const MovieDetailsTable = ({ movie, tvShow }) => {
  const isTVShow = !!tvShow;
  const data = isTVShow ? tvShow : movie;

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatList = (arr, key, max = 3) => {
    if (!arr || arr.length === 0) return "N/A";
    return arr.slice(0, max).map((i) => (key ? i[key] : i)).join(", ");
  };

  const rows = isTVShow
    ? [
        { label: "Status", value: data.status || "N/A" },
        { label: "Seasons", value: data.number_of_seasons || "N/A" },
        { label: "Episodes", value: data.number_of_episodes || "N/A" },
        { label: "Episode Runtime", value: data.duration || "N/A" },
        { label: "First Aired", value: formatDate(data.first_air_date) },
        { label: "Last Aired", value: formatDate(data.last_air_date) },
        { label: "Networks", value: formatList(data.networks, "name") },
        { label: "Production", value: formatList(data.production_companies, "name") },
        { label: "Languages", value: formatList(data.spoken_languages, "english_name") || data.original_language?.toUpperCase() || "N/A" },
        { label: "Score", value: data.vote_average ? `${data.vote_average.toFixed(1)} / 10` : "N/A" },
        { label: "Type", value: data.type || "N/A" },
        { label: "In Production", value: data.in_production ? "Yes" : "No" },
      ]
    : [
        { label: "Runtime", value: data.duration || "N/A" },
        { label: "Release Date", value: formatDate(data.release_date) },
        { label: "Budget", value: formatCurrency(data.budget) },
        { label: "Revenue", value: formatCurrency(data.revenue) },
        { label: "Production", value: formatList(data.production_companies, "name") },
        { label: "Languages", value: formatList(data.spoken_languages, "english_name") || data.original_language?.toUpperCase() || "N/A" },
        { label: "Score", value: data.vote_average ? `${data.vote_average.toFixed(1)} / 10` : "N/A" },
        { label: "Votes", value: data.vote_count ? data.vote_count.toLocaleString() : "N/A" },
      ];

  const filteredRows = rows.filter((r) => r.value !== "N/A");

  return (
    <div className="px-6 md:px-10 py-10 max-w-7xl mx-auto">
      <h2 className="text-white text-xl font-semibold tracking-tight mb-6">
        {isTVShow ? "Series Details" : "Film Details"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
        {filteredRows.map((row, i) => (
          <div key={i} className="bg-[#0a0a0a] px-5 py-4">
            <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">
              {row.label}
            </p>
            <p className="text-white text-sm font-medium leading-snug">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieDetailsTable;
