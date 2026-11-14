import { useCallback, useEffect, useState } from 'react';

// Loads data now, then again every `ms` milliseconds, so the screen stays live.
// Returns { data, error, reload }.
export function usePolling(load, ms) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    load()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((e) => setError(e.message));
  }, [load]);

  useEffect(() => {
    reload();
    if (!ms) return undefined;
    const timer = setInterval(reload, ms);
    return () => clearInterval(timer);
  }, [reload, ms]);

  return { data, error, reload };
}
