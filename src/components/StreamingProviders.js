import React, { useState } from "react";
import Image from "next/image";
import tmdbApi from "../services/tmdbApi";

const StreamingProviders = ({ streamingProviders, region = "IN" }) => {
  const [selectedRegion, setSelectedRegion] = useState(region);

  // Get available regions
  const availableRegions =
    tmdbApi.getAvailableStreamingRegions(streamingProviders);

  // Get providers for selected region
  const regionProviders = tmdbApi.getStreamingProvidersForRegion(
    streamingProviders,
    selectedRegion
  );

  if (!regionProviders.available) {
    return (
      <div className="streaming-providers">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Where to Watch
        </h3>
        <div className="text-gray-500">
          Streaming information not available for this movie.
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {streamingProviders?.attribution || "Powered by JustWatch"}
        </div>
      </div>
    );
  }

  const regionNames = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    JP: "Japan",
    IN: "India",
    BR: "Brazil",
    MX: "Mexico",
    // Add more regions as needed
  };

  // Only proceed if the selected region is in our supported regions
  if (!regionNames[selectedRegion]) {
    return (
      <div className="streaming-providers">
        <h3 className="text-2xl font-semibold text-white mb-4">
          Where to Watch
        </h3>
        <div className="text-gray-500">
          Region &quot;{selectedRegion}&quot; is not supported for streaming
          information.
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {streamingProviders?.attribution || "Powered by JustWatch"}
        </div>
      </div>
    );
  }

  // Get the maximum number of providers across all columns
  const maxProviders = Math.max(
    regionProviders.streaming.length,
    regionProviders.buy.length,
    regionProviders.rent.length
  );

  const ProviderCell = ({ provider }) => {
    if (!provider) {
      return <div className="h-16"></div>; // Empty cell with consistent height
    }

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
        {provider.logo && (
          <Image
            src={provider.logo}
            alt={provider.name}
            width={40}
            height={40}
            className="rounded flex-shrink-0"
          />
        )}
        <span className="text-white text-sm font-medium">{provider.name}</span>
      </div>
    );
  };

  return (
    <div className="streaming-providers">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">Where to Watch</h3>

        {availableRegions.length > 1 && (
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {availableRegions
              .filter((regionCode) => regionNames[regionCode])
              .map((regionCode) => (
                <option key={regionCode} value={regionCode}>
                  {regionNames[regionCode]}
                </option>
              ))}
          </select>
        )}
      </div>

      {maxProviders > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-lg font-semibold text-green-400 pb-4 pr-4 w-1/3 border-r border-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12L2 5h16l-8 7z" />
                    </svg>
                    Stream
                  </div>
                </th>
                <th className="text-left text-lg font-semibold text-purple-400 pb-4 px-4 w-1/3 border-r border-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 2v8H4V6h12z" />
                    </svg>
                    Purchase
                  </div>
                </th>
                <th className="text-left text-lg font-semibold text-blue-400 pb-4 pl-4 w-1/3">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    Rent
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="align-top pr-4 pb-3 border-r border-gray-600">
                  {regionProviders.streaming.length > 0 ? (
                    <div className="space-y-3">
                      {regionProviders.streaming.map((provider) => (
                        <ProviderCell key={provider.id} provider={provider} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Not available for this region
                    </div>
                  )}
                </td>
                <td className="align-top px-4 pb-3 border-r border-gray-600">
                  {regionProviders.buy.length > 0 ? (
                    <div className="space-y-3">
                      {regionProviders.buy.map((provider) => (
                        <ProviderCell key={provider.id} provider={provider} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Not available for this region
                    </div>
                  )}
                </td>
                <td className="align-top pl-4 pb-3">
                  {regionProviders.rent.length > 0 ? (
                    <div className="space-y-3">
                      {regionProviders.rent.map((provider) => (
                        <ProviderCell key={provider.id} provider={provider} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Not available for this region
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          Not available for this region
        </div>
      )}

      {/* JustWatch Link */}
      {regionProviders.link && (
        <div className="pt-6">
          <a
            href={regionProviders.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View more details on JustWatch
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}

      {/* Attribution */}
      <div className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-700">
        {regionProviders.attribution}
      </div>
    </div>
  );
};

export default StreamingProviders;
