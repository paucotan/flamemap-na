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

