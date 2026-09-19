import { useEffect, useState } from "react";
import type { CountyCollection, StateCollection } from "./types";

export interface GeoData {
  states: StateCollection;
  counties: CountyCollection;
}

export function useGeoData() {
  const [data, setData] = useState<GeoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/us-states.json`).then((r) => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/us-counties.json`).then((r) => r.json()),
    ])
      .then(([states, counties]) => {
        if (!cancelled) setData({ states, counties });
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}
