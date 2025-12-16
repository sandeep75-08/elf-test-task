import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BreweryApp } from "./components/BreweryApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch")
        ) {
          return failureCount < 2;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BreweryApp />
    </QueryClientProvider>
  );
}

export default App;
