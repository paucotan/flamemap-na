import { WindPoint, ViewportWind } from '../types/fire';

export async function fetchLiveWindAtCoordinates(lat: number, lng: number): Promise<ViewportWind> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Open-Meteo API response error');

    const data = await res.json();
    const speedKmh = Math.round(data.current?.wind_speed_10m || 20);
    const gustKmh = Math.round(data.current?.wind_gusts_10m || speedKmh * 1.4);
    const directionDegrees = Math.round(data.current?.wind_direction_10m || 225);

    return {
      speedKmh,
      speedMph: Math.round(speedKmh * 0.621371),
      gustKmh,
      gustMph: Math.round(gustKmh * 0.621371),
      directionDegrees,
    };
  } catch (err) {
    console.warn('Falling back to spatial wind model:', err);
    return getWindAtCoordinates(lat, lng);
  }
}

export function getWindAtCoordinates(lat: number, lng: number): ViewportWind {
  // Spatial fallback wind model
  const normX = Math.min(1, Math.max(0, (lng + 135) / 60));
  const normY = Math.min(1, Math.max(0, (65 - lat) / 25));

  let dirDegrees = 225;
  let speedKmh = 22;

  if (normX < 0.35 && normY < 0.5) {
    dirDegrees = 215 + Math.sin(normX * 10) * 20;
    speedKmh = 28 + Math.cos(normY * 8) * 12;
  } else if (normX < 0.35 && normY >= 0.5) {
    dirDegrees = 315 + Math.sin(normY * 6) * 15;
    speedKmh = 22 + Math.sin(normX * 5) * 8;
  } else if (normX >= 0.35 && normX < 0.7 && normY >= 0.3) {
    dirDegrees = 195 + Math.cos(normX * 8) * 25;
    speedKmh = 32 + Math.sin(normY * 10) * 14;
  } else if (normX >= 0.5 && normY < 0.5) {
    dirDegrees = 300 + Math.sin(normX * normY * 12) * 30;
    speedKmh = 25 + Math.cos(normX * 6) * 10;
  } else {
    dirDegrees = 250 + Math.sin(normX * 8) * 20;
    speedKmh = 30 + Math.sin(normY * 7) * 15;
  }

  const normalizedSpeed = Math.round(speedKmh);
  const gustKmh = Math.round(normalizedSpeed * 1.45);

  return {
    speedKmh: normalizedSpeed,
    speedMph: Math.round(normalizedSpeed * 0.621371),
    gustKmh,
    gustMph: Math.round(gustKmh * 0.621371),
    directionDegrees: Math.round((dirDegrees + 360) % 360),
  };
}

export async function fetchWindGrid(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): Promise<WindPoint[]> {
  const points: WindPoint[] = [];

  const latSteps = 6;
  const lngSteps = 8;

  const latGap = (maxLat - minLat) / latSteps;
  const lngGap = (maxLng - minLng) / lngSteps;

  for (let i = 0; i <= latSteps; i++) {
    for (let j = 0; j <= lngSteps; j++) {
      const lat = minLat + i * latGap;
      const lng = minLng + j * lngGap;

      const w = getWindAtCoordinates(lat, lng);

      points.push({
        latitude: lat,
        longitude: lng,
        speedKmh: w.speedKmh,
        speedMph: w.speedMph,
        directionDegrees: w.directionDegrees,
        gustKmh: w.gustKmh,
      });
    }
  }

  return points;
}
export interface SmokeGridPoint {
  latitude: number;
  longitude: number;
  pm25: number;
}

const COPERNICUS_CACHE_KEY = 'flamemap_copernicus_cache';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 Minutes

interface CachedCopernicusData {
  timestamp: number;
  grid: SmokeGridPoint[];
}

export async function fetchCopernicusSmokeGrid(
  fireLocations?: Array<{ latitude: number; longitude: number; priority?: number }>
): Promise<SmokeGridPoint[]> {
  try {
    // 1. Check LocalStorage Cache (valid for 30 minutes)
    const cachedStr = localStorage.getItem(COPERNICUS_CACHE_KEY);
    if (cachedStr) {
      try {
        const cached: CachedCopernicusData = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < CACHE_DURATION_MS && cached.grid.length > 0) {
          return cached.grid;
        }
      } catch {
        localStorage.removeItem(COPERNICUS_CACHE_KEY);
      }
    }

    const fallbackLocations = [
      { latitude: 50.85, longitude: -121.38 }, // Shetland Creek / BC
      { latitude: 49.86, longitude: -121.44 }, // Fraser Canyon / BC
      { latitude: 40.08, longitude: -121.65 }, // Park Fire / CA
      { latitude: 44.42, longitude: -117.45 }, // Durkee Fire / OR
      { latitude: 44.65, longitude: -63.57 },  // NS
    ];

    let baseLocs = fireLocations && fireLocations.length > 0 ? fireLocations : fallbackLocations;

    // Filter down to unique 0.25-degree grid centers so we cover major fires without duplicate queries
    const uniqueLocationsMap = new Map<string, { latitude: number; longitude: number }>();
    baseLocs.forEach(loc => {
      const key = `${(Math.round(loc.latitude * 4) / 4).toFixed(2)},${(Math.round(loc.longitude * 4) / 4).toFixed(2)}`;
      if (!uniqueLocationsMap.has(key)) {
        uniqueLocationsMap.set(key, loc);
      }
    });

    // Take top 40 major fire clusters
    const topTargets = Array.from(uniqueLocationsMap.values()).slice(0, 40);

    // Generate surrounding plume points for each major fire
    const sampleTargets: Array<{ latitude: number; longitude: number }> = [];
    const offsets = [
      { dLat: 0, dLng: 0 },
      { dLat: 0.25, dLng: 0.25 },
      { dLat: -0.25, dLng: 0.25 },
    ];

    topTargets.forEach(loc => {
      offsets.forEach(off => {
        sampleTargets.push({
          latitude: Math.round((loc.latitude + off.dLat) * 100) / 100,
          longitude: Math.round((loc.longitude + off.dLng) * 100) / 100,
        });
      });
    });

    // 2. Open-Meteo Multi-Coordinate Batching (Queries all coordinates in 1 single HTTP GET request!)
    const latsStr = sampleTargets.map(t => t.latitude.toFixed(2)).join(',');
    const lngsStr = sampleTargets.map(t => t.longitude.toFixed(2)).join(',');

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latsStr}&longitude=${lngsStr}&current=pm2_5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Open-Meteo Air Quality batch error');

    const dataArray = await res.json();
    const grid: SmokeGridPoint[] = [];

    // Response can be array of results when querying multi-coordinates
    const results = Array.isArray(dataArray) ? dataArray : [dataArray];

    results.forEach((item: any, idx: number) => {
      const pm25 = item.current?.pm2_5 || 0;
      const target = sampleTargets[idx] || sampleTargets[0];

      if (pm25 >= 1.0) {
        grid.push({
          latitude: target.latitude,
          longitude: target.longitude,
          pm25: Math.min(1.0, Math.max(0.12, pm25 / 45))
        });
      }
    });

    // 3. Save result to cache (30 minutes)
    if (grid.length > 0) {
      const cachePayload: CachedCopernicusData = {
        timestamp: Date.now(),
        grid
      };
      localStorage.setItem(COPERNICUS_CACHE_KEY, JSON.stringify(cachePayload));
    }

    return grid;
  } catch (err) {
    console.warn('Failed to fetch Copernicus smoke grid:', err);
    return [];
  }
}
