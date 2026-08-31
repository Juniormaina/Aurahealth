import { useState, useCallback } from 'react';

export type HealthSource = 'apple_health' | 'google_fit' | 'fitbit' | 'garmin';

export interface FetchedHealthMetrics {
  stepCount: number;
  sleepDurationHours: number;
  waterLiters: number;
  activeMinutes: number;
  heartRateBpm: number;
  providerName: string;
  fetchedAt: string;
  simulated: true;
}

/** Until HealthKit / Health Connect are wired, every fetch is a local sample. */
export const WEARABLES_ARE_SIMULATED = true;

const MOCK_SOURCE_DATA: Record<HealthSource, () => FetchedHealthMetrics> = {
  apple_health: () => ({
    stepCount: 8420 + Math.floor(Math.random() * 800),
    sleepDurationHours: 7.8,
    waterLiters: 2.25,
    activeMinutes: 45,
    heartRateBpm: 68,
    providerName: 'Apple Health (simulated)',
    fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    simulated: true,
  }),
  google_fit: () => ({
    stepCount: 9150 + Math.floor(Math.random() * 600),
    sleepDurationHours: 8.0,
    waterLiters: 2.5,
    activeMinutes: 50,
    heartRateBpm: 72,
    providerName: 'Google Fit (simulated)',
    fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    simulated: true,
  }),
  fitbit: () => ({
    stepCount: 7890 + Math.floor(Math.random() * 500),
    sleepDurationHours: 7.2,
    waterLiters: 2,
    activeMinutes: 35,
    heartRateBpm: 70,
    providerName: 'Fitbit (simulated)',
    fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    simulated: true,
  }),
  garmin: () => ({
    stepCount: 10420 + Math.floor(Math.random() * 1000),
    sleepDurationHours: 8.2,
    waterLiters: 3,
    activeMinutes: 65,
    heartRateBpm: 64,
    providerName: 'Garmin (simulated)',
    fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    simulated: true,
  }),
};

/**
 * Returns a local sample that looks like Apple Health / Google Fit.
 * Not a real HealthKit, Health Connect, or vendor API call.
 */
export async function fetchExternalHealthData(
  source: HealthSource = 'apple_health'
): Promise<FetchedHealthMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const generator = MOCK_SOURCE_DATA[source] || MOCK_SOURCE_DATA.apple_health;
  return generator();
}

/**
 * React hook for components to integrate with external health data sources.
 */
export function useHealthData(defaultSource: HealthSource = 'apple_health') {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [data, setData] = useState<FetchedHealthMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncHealthData = useCallback(
    async (source: HealthSource = defaultSource) => {
      setIsFetching(true);
      setError(null);
      try {
        const metrics = await fetchExternalHealthData(source);
        setData(metrics);
        setIsFetching(false);
        return metrics;
      } catch {
        setError('Failed to fetch external health data.');
        setIsFetching(false);
        return null;
      }
    },
    [defaultSource]
  );

  return {
    isFetching,
    data,
    error,
    syncHealthData,
  };
}
