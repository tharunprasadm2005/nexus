import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);

  const setFilter = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      if (value === null || value === '') {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return { filters, setFilter, clearFilters };
}
