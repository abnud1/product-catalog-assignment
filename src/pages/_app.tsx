import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import type { AppProps } from "next/app";
import { useRef } from "react";
axios.defaults.baseURL = process.env["NEXT_PUBLIC_API_URL"];
interface PageProps {
  dehydratedState?: unknown;
}
export default function App({ Component, pageProps }: AppProps) {
  const queryClientReference = useRef(new QueryClient());
  return (
    <QueryClientProvider client={queryClientReference.current}>
      <HydrationBoundary state={(pageProps as PageProps).dehydratedState}>
        <Component {...pageProps} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
