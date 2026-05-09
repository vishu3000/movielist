import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import BottomNav from "@/components/BottomNav";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <BottomNav />
    </SessionProvider>
  );
}
