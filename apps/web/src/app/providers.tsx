"use client";

import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { hydrate } from "@/store/auth-slice";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const done = useRef(false);
  if (!done.current) {
    // Rehydrate synchronously on first render so guards see auth immediately.
    store.dispatch(hydrate());
    done.current = true;
  }
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    store.dispatch(hydrate());
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator>{children}</AuthHydrator>
      </QueryClientProvider>
    </Provider>
  );
}
