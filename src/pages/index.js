import { movieApiConfig } from "../../config/apiConfig";
import { Header, MovieGrid } from "../components";
import { userAgentFromCookies } from "@/lib/userAgentSSR";
import Head from "next/head";

export default function Home({ userAgent }) {
  const { movieRows, tvRows } = movieApiConfig;

  // Combine movie and TV rows with type indicators
  const allRows = [
    ...movieRows.map((row) => ({ ...row, type: "movie" })),
    ...tvRows.map((row) => ({ ...row, type: "tv" })),
  ];

  const isMobile = userAgent.device === "mobile";
  // JSON-LD Schema for the home page
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
        <meta
          name="twitter:title"
          content="Veflix - Stream Movies & TV Shows"
        />
        <meta
          name="twitter:description"
          content="Discover and stream the latest movies and TV shows on Veflix."
        />
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </Head>
      <div className="min-h-screen bg-[#141414]">
        <Header isMobile={isMobile} />
        <MovieGrid rows={allRows} isMobile={isMobile} />
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const userAgent = userAgentFromCookies(ctx.req);
  return { props: { userAgent } };
}
