import { useState, useEffect, useCallback } from 'react';

export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  initialFallback: T
) {
  const [data, setData] = useState<T>(() => {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : initialFallback;
  });
  
  const [loading, setLoading] = useState(() => {
    const cached = localStorage.getItem(key);
    return !cached; // only show loader if no cache exists
  });
  
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      localStorage.setItem(key, JSON.stringify(result));
    } catch (err) {
      console.warn(`[useCachedData] Fetch failed for ${key}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn]);

  useEffect(() => {
    refetch(true); // silent fetch in background on mount
  }, [refetch]);

  return { data, loading, error, setData, refetch };
}
