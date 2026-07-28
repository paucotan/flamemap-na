import { Hotspot } from '../types/fire';

export interface DataUpdateLog {
  timestamp: string; // e.g. "28/07 17:46"
  satellite: string; // e.g. "MODIS", "VIIRS/NOAA-20", "VIIRS/NOAA-21", "VIIRS/S-NPP", "Copernicus EFFIS"
  count: number;
  type: 'hotspot' | 'perimeter';
}

function generateMockHotspots(): { hotspots: Hotspot[]; logs: DataUpdateLog[] } {
  const hotspots: Hotspot[] = [];
  const now = new Date('2026-07-28T17:46:00Z');

  // Extended Wildfire complexes across BC, AB, US
  const zones = [
    // British Columbia
    { name: 'Clinton / Shetland Creek, BC', lat: 51.090, lng: -121.580, spread: 0.35, count: 210 },
    { name: 'Boston Bar / Fraser Canyon, BC', lat: 49.860, lng: -121.440, spread: 0.30, count: 170 },
    { name: 'Lytton Creek, BC', lat: 50.230, lng: -121.570, spread: 0.25, count: 120 },
    { name: 'Sheslay / Stikine, BC', lat: 58.120, lng: -131.650, spread: 0.55, count: 260 },
    { name: 'Fort Nelson, BC', lat: 58.810, lng: -122.690, spread: 0.45, count: 220 },
    
    // Alberta & North
    { name: 'Jasper Complex, AB', lat: 52.873, lng: -118.082, spread: 0.45, count: 230 },
    { name: 'Fort McMurray, AB', lat: 56.726, lng: -111.380, spread: 0.40, count: 140 },
    { name: 'Hay River / NWT', lat: 60.820, lng: -115.750, spread: 0.65, count: 310 },

    // USA
    { name: 'Park Fire, CA', lat: 40.085, lng: -121.652, spread: 0.50, count: 280 },
    { name: 'Durkee Fire, OR', lat: 44.421, lng: -117.452, spread: 0.60, count: 290 },
    { name: 'Idaho Wilderness, ID', lat: 45.120, lng: -114.890, spread: 0.50, count: 190 },
  ];

  let idCounter = 1;

  zones.forEach((zone) => {
    for (let i = 0; i < zone.count; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const randStdNormal2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

      const lat = zone.lat + (randStdNormal * zone.spread * 0.25);
      const lng = zone.lng + (randStdNormal2 * zone.spread * 0.25);

      const rawAge = Math.pow(Math.random(), 1.8) * 120;
      const ageHours = Math.round(rawAge * 10) / 10;
      const hotspotTime = new Date(now.getTime() - ageHours * 3600 * 1000);

      const brightness = Math.round(310 + Math.random() * 95);
      const frp = Math.round((Math.random() * 85 + 5) * 10) / 10;
      const confidence = Math.min(100, Math.round(60 + Math.random() * 40));
      const sat = Math.random() > 0.3 ? 'VIIRS' : 'MODIS';

      hotspots.push({
        id: `firms-${idCounter++}`,
        latitude: Math.round(lat * 100000) / 100000,
        longitude: Math.round(lng * 100000) / 100000,
        brightness,
        frp,
        confidence,
        timestamp: hotspotTime.toISOString(),
        ageHours,
        satellite: sat,
      });
    }
  });

  // Generate satellite pass logs matching Flamap.fr tooltip format
  const logs: DataUpdateLog[] = [
    { timestamp: '28/07 17:46', satellite: 'MODIS', count: 142, type: 'hotspot' },
    { timestamp: '28/07 16:18', satellite: 'VIIRS / NOAA-20', count: 289, type: 'hotspot' },
    { timestamp: '28/07 16:10', satellite: 'MODIS', count: 98, type: 'hotspot' },
    { timestamp: '28/07 15:57', satellite: 'VIIRS / S-NPP', count: 412, type: 'hotspot' },
    { timestamp: '28/07 15:25', satellite: 'VIIRS / NOAA-21', count: 174, type: 'hotspot' },
    { timestamp: '28/07 14:38', satellite: 'VIIRS / NOAA-20', count: 320, type: 'hotspot' },
    { timestamp: '28/07 14:17', satellite: 'CWFIS / NIFC Perimeters', count: 14, type: 'perimeter' },
    { timestamp: '28/07 12:05', satellite: 'VIIRS / S-NPP', count: 521, type: 'hotspot' },
  ];

  return {
    hotspots: hotspots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    logs
  };
}

export async function fetchHotspots(mapKey?: string): Promise<{ hotspots: Hotspot[]; logs: DataUpdateLog[] }> {
  return generateMockHotspots();
}
