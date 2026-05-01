"use client";

import { useEffect, useState } from "react";

type UseFhirResult<T> = {
  data: T | null;
  error: { status: number; detail: string } | null;
  isLoading: boolean;
};

// Module-level cache: deduplicates in-flight requests and caches results
const cache = new Map<
  string,
  { promise: Promise<{ ok: boolean; status: number; body: string }> }
>();

function fetchWithDedup(resource: string) {
  const existing = cache.get(resource);
  if (existing) return existing.promise;

  const promise = fetch(`/api/fhir/${resource}`)
    .then(async (res) => ({
      ok: res.ok,
      status: res.status,
      body: await res.text(),
    }))
    .catch(() => ({
      ok: false,
      status: 0,
      body: "Network error",
    }));

  cache.set(resource, { promise });

  // Clear from cache after resolution so future navigations refetch
  promise.then(() => {
    setTimeout(() => cache.delete(resource), 0);
  });

  return promise;
}

export function useFhir<T>(resource: string): UseFhirResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<{ status: number; detail: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await fetchWithDedup(resource);

      if (cancelled) return;

      if (!result.ok) {
        setError({ status: result.status, detail: result.body });
      } else {
        setData(JSON.parse(result.body) as T);
      }

      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [resource]);

  return { data, error, isLoading };
}
