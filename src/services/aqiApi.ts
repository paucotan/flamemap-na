import { Language } from '../utils/i18n';

export interface AqiStation {
  id: string;
  city: string;
  provinceOrState: string;
  country: 'CA' | 'US';
  latitude: number;
  longitude: number;
  aqi: number;
  pm25: number; // ug/m3
  categoryEn: string;
  categoryFr: string;
  color: string;
}

// Expanded North American regional monitoring stations for smooth spatial AQI heatmap interpolation
export const AQI_STATIONS_BASE: Omit<AqiStation, 'aqi' | 'pm25' | 'categoryEn' | 'categoryFr' | 'color'>[] = [
  // BC & Pacific Northwest
  { id: 'aqi-van', city: 'Vancouver', provinceOrState: 'BC', country: 'CA', latitude: 49.2827, longitude: -123.1207 },
  { id: 'aqi-vic', city: 'Victoria', provinceOrState: 'BC', country: 'CA', latitude: 48.4284, longitude: -123.3656 },
  { id: 'aqi-kel', city: 'Kelowna', provinceOrState: 'BC', country: 'CA', latitude: 49.8880, longitude: -119.4960 },
  { id: 'aqi-kam', city: 'Kamloops', provinceOrState: 'BC', country: 'CA', latitude: 50.6745, longitude: -120.3273 },
  { id: 'aqi-pg', city: 'Prince George', provinceOrState: 'BC', country: 'CA', latitude: 53.9171, longitude: -122.7497 },
  { id: 'aqi-sea', city: 'Seattle', provinceOrState: 'WA', country: 'US', latitude: 47.6062, longitude: -122.3321 },
  { id: 'aqi-por', city: 'Portland', provinceOrState: 'OR', country: 'US', latitude: 45.5152, longitude: -122.6784 },
  { id: 'aqi-spo', city: 'Spokane', provinceOrState: 'WA', country: 'US', latitude: 47.6588, longitude: -117.4260 },

  // Alberta & Prairies
  { id: 'aqi-jas', city: 'Jasper', provinceOrState: 'AB', country: 'CA', latitude: 52.8730, longitude: -118.0820 },
  { id: 'aqi-cal', city: 'Calgary', provinceOrState: 'AB', country: 'CA', latitude: 51.0447, longitude: -114.0719 },
  { id: 'aqi-edm', city: 'Edmonton', provinceOrState: 'AB', country: 'CA', latitude: 53.5461, longitude: -113.4938 },
  { id: 'aqi-reg', city: 'Regina', provinceOrState: 'SK', country: 'CA', latitude: 50.4452, longitude: -104.6189 },
  { id: 'aqi-win', city: 'Winnipeg', provinceOrState: 'MB', country: 'CA', latitude: 49.8951, longitude: -97.1384 },

  // California & Western US
  { id: 'aqi-sfo', city: 'San Francisco', provinceOrState: 'CA', country: 'US', latitude: 37.7749, longitude: -122.4194 },
  { id: 'aqi-sac', city: 'Sacramento', provinceOrState: 'CA', country: 'US', latitude: 38.5816, longitude: -121.4944 },
  { id: 'aqi-lax', city: 'Los Angeles', provinceOrState: 'CA', country: 'US', latitude: 34.0522, longitude: -118.2437 },
  { id: 'aqi-boi', city: 'Boise', provinceOrState: 'ID', country: 'US', latitude: 43.6150, longitude: -116.2023 },
  { id: 'aqi-den', city: 'Denver', provinceOrState: 'CO', country: 'US', latitude: 39.7392, longitude: -104.9903 },

  // Eastern Canada & US
  { id: 'aqi-tor', city: 'Toronto', provinceOrState: 'ON', country: 'CA', latitude: 43.6532, longitude: -79.3832 },
  { id: 'aqi-mtl', city: 'Montreal', provinceOrState: 'QC', country: 'CA', latitude: 45.5017, longitude: -73.5673 },
  { id: 'aqi-nyc', city: 'New York', provinceOrState: 'NY', country: 'US', latitude: 40.7128, longitude: -74.0060 },
];

export function getAqiCategory(usAqi: number): { categoryEn: string; categoryFr: string; color: string } {
  if (usAqi <= 50) {
    return { categoryEn: 'Good', categoryFr: 'Bon', color: '#22c55e' };
  } else if (usAqi <= 100) {
    return { categoryEn: 'Moderate', categoryFr: 'Modéré', color: '#eab308' };
  } else if (usAqi <= 150) {
    return { categoryEn: 'Unhealthy for Sensitive Groups', categoryFr: 'Malsain pour groupes sensibles', color: '#f97316' };
  } else if (usAqi <= 200) {
    return { categoryEn: 'Unhealthy', categoryFr: 'Malsain', color: '#ef4444' };
  } else if (usAqi <= 300) {
    return { categoryEn: 'Very Unhealthy', categoryFr: 'Très malsain', color: '#a855f7' };
  } else {
    return { categoryEn: 'Hazardous', categoryFr: 'Dangereux', color: '#881337' };
  }
}

export function pm25ToUsAqi(pm25: number): number {
  if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
  if (pm25 <= 35.4) return Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1));
  if (pm25 <= 55.4) return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
  if (pm25 <= 150.4) return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5));
  if (pm25 <= 250.4) return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5));
  return Math.round(301 + ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5));
}

export async function fetchLiveAqiStations(): Promise<AqiStation[]> {
  try {
    const lats = AQI_STATIONS_BASE.map(s => s.latitude).join(',');
    const lngs = AQI_STATIONS_BASE.map(s => s.longitude).join(',');
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}&current=us_aqi,pm2_5`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Air quality API HTTP error');

    const data = await res.json();
    const dataArray = Array.isArray(data) ? data : [data];

    return AQI_STATIONS_BASE.map((base, idx) => {
      const current = dataArray[idx]?.current || {};
      const pm25 = Math.round((current.pm2_5 || 8) * 10) / 10;
      const rawAqi = current.us_aqi ? Math.round(current.us_aqi) : pm25ToUsAqi(pm25);
      const aqi = Math.max(12, rawAqi);
      const cat = getAqiCategory(aqi);

      return {
        ...base,
        aqi,
        pm25,
        ...cat,
      };
    });
  } catch (err) {
    console.warn('Air Quality API fetch failed, using fallback data:', err);
    return AQI_STATIONS_BASE.map(base => {
      const aqi = Math.floor(Math.random() * 40 + 25);
      const cat = getAqiCategory(aqi);
      return {
        ...base,
        aqi,
        pm25: 8.5,
        ...cat,
      };
    });
  }
}
