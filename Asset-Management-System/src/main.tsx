import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on specific errors that indicate permanent failures
        if (
          error?.message?.includes("400") ||
          error?.message?.includes("WebChannelConnection") ||
          error?.message?.includes("permission-denied") ||
          error?.message?.includes("unauthenticated")
        ) {
          return false;
        }
        // Limit retries to prevent infinite loops
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10s delay
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Add network mode to handle offline scenarios
      networkMode: "online",
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on connection errors
        if (
          error?.message?.includes("400") ||
          error?.message?.includes("WebChannelConnection") ||
          error?.message?.includes("permission-denied") ||
          error?.message?.includes("unauthenticated")
        ) {
          return false;
        }
        return failureCount < 1;
      },
      // Add network mode for mutations
      networkMode: "online",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
