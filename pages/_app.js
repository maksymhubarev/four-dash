import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Login from "./login";
import { Auth } from "@/firebase";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      {!Auth ? <Login /> : <Component {...pageProps} />}
    </SessionProvider>
  );
}
