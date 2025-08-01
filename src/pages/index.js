import { movieApiConfig } from "../../config/apiConfig";
import { Header, MovieGrid } from "../components";

export default function Home() {
  const { movieRows, tvRows } = movieApiConfig;

  // Combine movie and TV rows with type indicators
  const allRows = [
    ...movieRows.map((row) => ({ ...row, type: "movie" })),
    ...tvRows.map((row) => ({ ...row, type: "tv" })),
  ];

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <MovieGrid rows={allRows} />
    </div>    
  );
}
