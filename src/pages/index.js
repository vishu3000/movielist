import { movieApiConfig } from "../../config/apiConfig";
import { Header, MovieGrid } from "../components";
import HomepageHero from "../components/ui/HomepageHero";
import ContinueWatchingCarousel from "../components/ui/ContinueWatchingCarousel";
import Head from "next/head";

export async function getServerSideProps() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_MOVIE_API_KEY}&language=en-US`
    );
    const data = await res.json();
    return { props: { heroMovies: data.results?.slice(0, 5) ?? [] } };
  } catch {
    return { props: { heroMovies: [] } };
  }
}

export default function Home({ heroMovies }) {
  const { movieRows, tvRows } = movieApiConfig;

  const allRows = [
    ...movieRows.map((row) => ({ ...row, type: "movie" })),
    ...tvRows.map((row) => ({ ...row, type: "tv" })),
  ];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Veflix",
    description:
      "Discover and stream the latest movies and TV shows on Veflix. Browse popular, trending, and top-rated content with detailed information, cast details, and streaming availability.",
    url: "https://veflix.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://veflix.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Veflix",
    description: "Streaming platform for movies and TV shows",
    url: "https://veflix.com",
    logo: "https://veflix.com/veflix.png",
    sameAs: ["https://twitter.com/veflix", "https://facebook.com/veflix"],
  };

  return (
    <>
      <Head>
        <title>Veflix - Stream Movies & TV Shows</title>
        <meta
          name="description"
          content="Discover and stream the latest movies and TV shows on Veflix. Browse popular, trending, and top-rated content with detailed information, cast details, and streaming availability."
        />
        <meta
          name="keywords"
          content="movies, TV shows, streaming, entertainment, Veflix, watch online"
        />
        <meta property="og:title" content="Veflix - Stream Movies & TV Shows" />
        <meta
          property="og:description"
          content="Discover and stream the latest movies and TV shows on Veflix. Browse popular, trending, and top-rated content."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Veflix - Stream Movies & TV Shows" />
        <meta
          name="twitter:description"
          content="Discover and stream the latest movies and TV shows on Veflix."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-[#141414]">
        {/* Header floats over hero */}
        <Header />

        {/* Full-viewport hero with trending feature */}
        <HomepageHero movies={heroMovies} />

        {/* Continue Watching — only shown to logged-in users with incomplete trailers */}
        <ContinueWatchingCarousel />

        {/* Content rows */}
        <MovieGrid rows={allRows} />
      </div>
    </>
  );
}
