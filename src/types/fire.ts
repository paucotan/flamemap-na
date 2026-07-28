export type UnitSystem = 'imperial' | 'metric';

export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number; // Kelvin
  frp: number; // Fire Radiative Power in MW
  confidence: number; // 0-100%
  timestamp: string; // ISO date-time string
  ageHours: number; // Hours before present
  satellite: 'VIIRS' | 'MODIS' | 'NOAA-20';
}

export interface FireIncident {
  id: string;
  name: string;
  country: 'CA' | 'US';
  provinceOrState: string;
  latitude: number;
  longitude: number;
  acresBurned: number;
  hectaresBurned: number;
  containmentPercentage: number;
  status: 'Active' | 'Under Control' | 'Being Monitored' | 'Out of Control';
  cause?: string;
  agency: string;
  updatedAt: string;
  officialBulletinUrl?: string; // Official government agency incident updates link
  perimeterGeoJson?: any;
}

export interface EvacuationAlert {
  id: string;
  titleEn: string;
  titleFr: string;
  type: 'Order' | 'Warning' | 'Alert' | 'Watch';
  region: string;
  country: 'CA' | 'US';
  affectedPopulationApprox: number;
  issuedAt: string;
  summaryEn: string;
  summaryFr: string;
  officialUrl: string; // Official government emergency authority link
  authorityName: string; // e.g. Emergency Info BC, Alberta Emergency Alert, CAL FIRE
  coordinates: [number, number]; // [lng, lat]
  geometry?: any;
}

export interface WindPoint {
  latitude: number;
  longitude: number;
  speedKmh: number;
  speedMph: number;
  directionDegrees: number; // 0-360 degrees
  gustKmh: number;
}

export interface ViewportWind {
  speedKmh: number;
  speedMph: number;
  gustKmh: number;
  gustMph: number;
  directionDegrees: number;
}

export interface RegionSummary {
  regionName: string;
  country: 'CA' | 'US';
  activeFireCount: number;
  totalHectares: number;
  totalAcres: number;
}
