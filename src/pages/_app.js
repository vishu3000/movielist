// /Users/vishu/movielist/src/pages/_app.js
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { UserAgentProvider } from "@/context/UserAgentContext";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <UserAgentProvider initial={pageProps?.userAgent ?? null}>
        <Component {...pageProps} />
      </UserAgentProvider>
    </SessionProvider>
  );
}