"use client";

import { QueryClient } from "@tanstack/react-query";

function statusCode(error: unknown) {
  return typeof error === "object" && error !== null && "statusCode" in error
    ? Number(error.statusCode)
    : undefined;
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (statusCode(error) === 401) return false;
          return failureCount < 1;
        }
      }
    }
  });
}
