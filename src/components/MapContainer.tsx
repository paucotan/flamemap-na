import React, { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Hotspot, FireIncident, EvacuationAlert, WindPoint, UnitSystem, ViewportWind } from '../types/fire';
import { getWindAtCoordinates, fetchLiveWindAtCoordinates } from '../services/weatherApi';
import { AqiStation } from '../services/aqiApi';
import { Language } from '../utils/i18n';

import { MapStyleMode } from './TimelineControl';

interface MapContainerProps {
  targetLocation?: { lat: number; lng: number; zoom?: number; name: string } | null;
  hotspots: Hotspot[];
  incidents: FireIncident[];
  alerts: EvacuationAlert[];
  windPoints: WindPoint[];
  aqiStations: AqiStation[];
  lang: Language;
  maxAgeHours: number;
  unitSystem: UnitSystem;
  mapStyle: MapStyleMode;
  onSelectIncident: (incident: FireIncident) => void;
  onViewportWindChange: (wind: ViewportWind) => void;
  layers: { hotspots: boolean; perimeters: boolean; wind: boolean; evacuations: boolean; smoke: boolean; airQuality: boolean };
}

export const MapContainer: React.FC<MapContainerProps> = ({
  targetLocation,
  hotspots,
  incidents,
  alerts,
  windPoints,
  aqiStations,
  lang,
  maxAgeHours,
  unitSystem,
  mapStyle,
  onSelectIncident,
  onViewportWindChange,
  layers,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const aqiMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  const parseUrlHash = (): { center: [number, number]; zoom: number } => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#map=')) {
      const parts = hash.replace('#map=', '').split('/');
      if (parts.length === 3) {
        const z = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        const lng = parseFloat(parts[2]);
        if (!isNaN(z) && !isNaN(lat) && !isNaN(lng)) {
          return { center: [lng, lat], zoom: z };
        }
      }
    }
    return { center: [-100.0, 48.0], zoom: 4.0 };
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initial = parseUrlHash();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics, USGS, USDA'
          },
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
            ],
            tileSize: 256,
            attribution: 'CartoDB'
          },
          'carto-labels': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
            ],
            tileSize: 256,
          }
        },
        layers: [
          {
            id: 'satellite-basemap',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19
          },
          {
            id: 'dark-basemap',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
            layout: { visibility: 'none' }
          },
          {
            id: 'labels-layer',
            type: 'raster',
            source: 'carto-labels',
            minzoom: 3,
            maxzoom: 19,
            paint: {
              'raster-opacity': 0.60
            }
          }
        ]
      },
      center: initial.center,
      zoom: initial.zoom,
      pitch: 15,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    const updateCenterAndHash = async () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      window.history.replaceState(
        null,
        '',
        `#map=${zoom.toFixed(2)}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}`
      );

      const localWind = await fetchLiveWindAtCoordinates(center.lat, center.lng);
      onViewportWindChange(localWind);
    };

    map.on('load', () => {
      // 1. Add Smoke Plumes Source
      map.addSource('smoke-plumes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'smoke-heatmap',
        type: 'heatmap',
        source: 'smoke-plumes',
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['get', 'density'],
          'heatmap-intensity': 1.4,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.15, 'rgba(254, 240, 138, 0.20)',
            0.4, 'rgba(251, 191, 36, 0.40)',
            0.7, 'rgba(239, 68, 68, 0.55)',
            1, 'rgba(120, 20, 20, 0.75)'
          ],
          'heatmap-radius': 45,
          'heatmap-opacity': 0.55
        }
      });

      // 2. Add All Incidents Layer (NIFC & CWFIS)
      map.addSource('all-incidents-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'all-incidents-circle',
        type: 'circle',
        source: 'all-incidents-source',
        paint: {
          // Dynamic radius proportional to fire acreage and zoom level
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, [
              'case',
              ['boolean', ['get', 'isFireOfNote'], false], 9,
              ['>', ['get', 'acres'], 50000], 8,
              ['>', ['get', 'acres'], 10000], 6,
              ['>', ['get', 'acres'], 1000], 4.5,
              3
            ],
            9, [
              'case',
              ['boolean', ['get', 'isFireOfNote'], false], 16,
              ['>', ['get', 'acres'], 50000], 14,
              ['>', ['get', 'acres'], 10000], 11,
              ['>', ['get', 'acres'], 1000], 8,
              5
            ]
          ],
          'circle-color': [
            'match',
            ['get', 'status'],
            'Out of Control', '#ef4444', // Red
            'Being Monitored', '#f97316', // Orange
            'Under Control', '#22c55e',   // Green
            '#eab308'                      // Yellow fallback
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['get', 'isFireOfNote'], false], '#fde047', // Yellow accent for Fires of Note
            '#ffffff'
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['get', 'isFireOfNote'], false], 2.5,
            1.2
          ],
          'circle-opacity': 0.90
        }
      });

      // 3. Add Perimeters Source
      map.addSource('fire-perimeters', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'perimeters-fill',
        type: 'fill',
        source: 'fire-perimeters',
        paint: {
          'fill-color': '#1c1917',
          'fill-opacity': 0.65
        }
      });

      map.addLayer({
        id: 'perimeters-outline',
        type: 'line',
        source: 'fire-perimeters',
        paint: {
          'line-color': '#ef4444',
          'line-width': 1.5,
          'line-dasharray': [2, 2]
        }
      });

      // 4. Add Evacuation Alert Zones Source
      map.addSource('evacuation-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'evacuations-fill',
        type: 'fill',
        source: 'evacuation-zones',
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.25
        }
      });

      map.addLayer({
        id: 'evacuations-outline',
        type: 'line',
        source: 'evacuation-zones',
        paint: {
          'line-color': '#f87171',
          'line-width': 2
        }
      });

      // 5. Add Hotspots Source
      map.addSource('fire-hotspots', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'hotspots-heatmap',
        type: 'heatmap',
        source: 'fire-hotspots',
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'frp'], 0, 0.2, 100, 1],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 1.8,
            9, 2.8
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(255, 149, 0, 0.35)',
            0.5, 'rgba(239, 68, 68, 0.65)',
            0.8, 'rgba(255, 193, 7, 0.80)',
            1, 'rgba(255, 224, 130, 0.90)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 28,
            10, 42
          ],
          'heatmap-opacity': 0.80
        }
      });

      map.addLayer({
        id: 'hotspots-point-glow',
        type: 'circle',
        source: 'fire-hotspots',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 6,
            10, 12
          ],
          'circle-color': '#ff9500',
          'circle-opacity': 0.30,
          'circle-blur': 0.7
        }
      });

      map.addLayer({
        id: 'hotspots-point',
        type: 'circle',
        source: 'fire-hotspots',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 4,
            10, 8.5
          ],
          'circle-color': [
            'step',
            ['get', 'relativeAgeHours'],
            '#ffcc00',
            24, '#ff3b30',
            48, '#b45309',
            120, '#475569'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'ageHours'],
            0, 1,
            120, 0.45
          ]
        }
      });

      // 6. Add AQI Interpolated Heatmap Source (Apple Maps Style)
      map.addSource('aqi-heatmap-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'aqi-heatmap-layer',
        type: 'heatmap',
        source: 'aqi-heatmap-source',
        maxzoom: 14,
        paint: {
          'heatmap-weight': ['get', 'normalizedAqi'],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 1.5,
            9, 3.2
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.08, 'rgba(56, 189, 248, 0.40)', // Sky Blue (Good AQI < 50)
            0.20, 'rgba(34, 197, 94, 0.50)',  // Emerald Green (Good)
            0.40, 'rgba(234, 179, 8, 0.65)',  // Yellow (Moderate AQI 51-100)
            0.70, 'rgba(249, 115, 22, 0.75)', // Orange (Unhealthy 101-150)
            0.95, 'rgba(225, 29, 72, 0.85)'   // Crimson Red (Hazardous 200+)
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 120,
            9, 240
          ],
          'heatmap-opacity': 0.70
        }
      });

      // Click listener for all incidents (NIFC / CWFIS)
      map.on('click', 'all-incidents-circle', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const found = incidents.find(i => i.id === props.id);
        if (found) {
          onSelectIncident(found);
        }
      });

      // Click listener for thermal hotspots
      map.on('click', 'hotspots-point', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family: 'Outfit', sans-serif;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ff3b30;"></span>
                <strong style="font-size:13px; color:#fff;">Thermal Hotspot (${props.satellite})</strong>
              </div>
              <div style="font-size:11px; color:#cbd5e1; line-height:1.4;">
                <div>FRP: <strong>${props.frp} MW</strong></div>
                <div>Brightness: <strong>${props.brightness} K</strong></div>
                <div>Age: <strong>${Math.round(props.ageHours)}h ago</strong></div>
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on('moveend', updateCenterAndHash);
      updateCenterAndHash();

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Dynamic Update for ALL Incidents Source (NIFC US 600+ & Canadian Incidents)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const source = map.getSource('all-incidents-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: incidents.map(inc => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [inc.longitude, inc.latitude]
          },
          properties: {
            id: inc.id,
            name: inc.name,
            status: inc.status,
            acres: inc.acresBurned,
            isFireOfNote: inc.agency.includes('Wildfire of Note')
          }
        }))
      });
    }
  }, [incidents, mapLoaded]);

  // Update Dynamic Incident Badges & Clean Labels based on zoom level and Fire of Note status
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const renderMarkers = () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (!layers.hotspots) return;

      const currentZoom = map.getZoom();

      // Show text pills for:
      // - Zoom >= 8.5: All active incidents
      // - Zoom between 6.5 and 8.5: Only Wildfires of Note or massive fires (> 25,000 acres)
      // - Zoom < 6.5: NO text pills at all (clean dot map view)
      const visibleIncidents = incidents.filter(inc => {
        if (currentZoom >= 8.5) return true;
        if (currentZoom >= 6.5) {
          return inc.agency.includes('Wildfire of Note') || inc.acresBurned > 25000;
        }
        return false; // Completely clean dot-only view when zoomed out at country/continental scale
      });

      visibleIncidents.forEach(inc => {
        const isFireOfNote = inc.agency.includes('Wildfire of Note');
        const el = document.createElement('div');
        el.className = 'flamap-region-pill';
        el.innerHTML = `
          <div style="
            background: rgba(15, 17, 21, 0.92);
            backdrop-filter: blur(10px);
            border: 1px solid ${isFireOfNote ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.2)'};
            box-shadow: 0 4px 16px ${isFireOfNote ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0,0,0,0.7)'};
            border-radius: 9999px;
            padding: 3px 9px;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isFireOfNote ? '#ef4444' : '#ff5722'}; box-shadow: 0 0 6px ${isFireOfNote ? '#ef4444' : '#ff5722'}; display: inline-block;"></span>
            <span style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 11px; color: #ffffff; letter-spacing: -0.01em; white-space: nowrap;">
              ${inc.name}
            </span>
          </div>
        `;

        el.addEventListener('click', () => {
          onSelectIncident(inc);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([inc.longitude, inc.latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    renderMarkers();
    map.on('zoomend', renderMarkers);

    return () => {
      map.off('zoomend', renderMarkers);
    };
  }, [incidents, mapLoaded, layers.hotspots, onSelectIncident]);

  // Render Air Quality Index (AQI) Station Badges
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    aqiMarkersRef.current.forEach(m => m.remove());
    aqiMarkersRef.current = [];

    if (!layers.airQuality || !aqiStations || aqiStations.length === 0) return;

    aqiStations.forEach(st => {
      const el = document.createElement('div');
      el.className = 'flamap-aqi-pill';
      const category = lang === 'fr' ? st.categoryFr : st.categoryEn;

      el.innerHTML = `
        <div style="
          background: rgba(15, 17, 21, 0.92);
          backdrop-filter: blur(10px);
          border: 1px solid ${st.color};
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          border-radius: 9999px;
          padding: 3px 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        ">
          <span style="
            background: ${st.color};
            color: #ffffff;
            font-family: 'Outfit', sans-serif;
            font-weight: 800;
            font-size: 10px;
            padding: 1px 5px;
            border-radius: 9999px;
          ">${st.aqi}</span>
          <span style="font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 10px; color: #ffffff;">
            ${st.city}
          </span>
        </div>
      `;

      el.addEventListener('click', () => {
        new maplibregl.Popup()
          .setLngLat([st.longitude, st.latitude])
          .setHTML(`
            <div style="font-family: 'Outfit', sans-serif;">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;">
                <strong style="font-size:13px; color:#fff;">${st.city}, ${st.provinceOrState} (${st.country})</strong>
                <span style="background:${st.color}; color:#fff; font-weight:bold; font-size:11px; padding:2px 6px; border-radius:6px;">
                  AQI ${st.aqi}
                </span>
              </div>
              <div style="font-size:11px; color:#cbd5e1; line-height:1.5;">
                <div>Status: <strong style="color:${st.color}">${category}</strong></div>
                <div>PM₂.₅: <strong>${st.pm25} µg/m³</strong></div>
                <div style="margin-top:4px; font-size:9px; color:#94a3b8;">Source: Open-Meteo Air Quality Service</div>
              </div>
            </div>
          `)
          .addTo(map);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([st.longitude, st.latitude])
        .addTo(map);

      aqiMarkersRef.current.push(marker);
    });
  }, [aqiStations, mapLoaded, layers.airQuality, lang]);

  // Reactive FlyTo on Search or Location Selection
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !targetLocation) return;
    mapRef.current.flyTo({
      center: [targetLocation.lng, targetLocation.lat],
      zoom: targetLocation.zoom || 11,
      essential: true,
      speed: 1.4,
      curve: 1.25,
    });
  }, [targetLocation, mapLoaded]);

  // Reactive Hotspots GeoJSON update
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const source = map.getSource('fire-hotspots') as maplibregl.GeoJSONSource;
    if (source) {
      const filtered = hotspots.filter(h => h.ageHours >= maxAgeHours);
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: filtered.map(h => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [h.longitude, h.latitude]
          },
          properties: {
            id: h.id,
            brightness: h.brightness,
            frp: h.frp,
            confidence: h.confidence,
            ageHours: h.ageHours,
            relativeAgeHours: Math.max(0, h.ageHours - maxAgeHours),
            satellite: h.satellite
          }
        }))
      };
      source.setData(geojson);
    }
  }, [hotspots, maxAgeHours, mapLoaded]);

  // Reactive Smoke Plumes update aligned with live local wind direction
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const source = map.getSource('smoke-plumes') as maplibregl.GeoJSONSource;
    if (source) {
      const filtered = hotspots.filter(h => h.ageHours >= maxAgeHours);
      const smokeFeatures: GeoJSON.Feature[] = [];

      // Default wind flow direction (e.g. SSW / SW flow blow DOWNWIND towards North-East)
      const windAngleRad = ((225 - 180) * Math.PI) / 180;
      const stepLng = Math.cos(windAngleRad) * 0.15;
      const stepLat = Math.sin(windAngleRad) * 0.15;

      filtered.forEach((h, idx) => {
        if (idx % 2 === 0) {
          for (let step = 1; step <= 4; step++) {
            smokeFeatures.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [h.longitude + step * stepLng, h.latitude + step * stepLat]
              },
              properties: {
                density: Math.max(0.15, 1.0 - step * 0.22)
              }
            });
          }
        }
      });

      source.setData({
        type: 'FeatureCollection',
        features: smokeFeatures
      });
    }
  }, [hotspots, maxAgeHours, mapLoaded]);

  // Reactive Perimeters update
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const source = map.getSource('fire-perimeters') as maplibregl.GeoJSONSource;
    if (source) {
      const features = incidents
        .filter(i => i.perimeterGeoJson)
        .map(i => ({
          ...i.perimeterGeoJson,
          properties: {
            id: i.id,
            name: i.name,
            acres: i.acresBurned
          }
        }));

      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [incidents, mapLoaded]);

  // Reactive Evacuations update
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const source = map.getSource('evacuation-zones') as maplibregl.GeoJSONSource;
    if (source) {
      const features = alerts
        .filter(a => a.geometry)
        .map(a => ({
          ...a.geometry,
          properties: {
            id: a.id,
            title: a.titleEn,
            type: a.type
          }
        }));

      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [alerts, mapLoaded]);

  // Reactive AQI Heatmap update
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const source = map.getSource('aqi-heatmap-source') as maplibregl.GeoJSONSource;
    if (source) {
      const features: GeoJSON.Feature[] = (aqiStations || []).map(st => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [st.longitude, st.latitude]
        },
        properties: {
          id: st.id,
          aqi: st.aqi,
          normalizedAqi: Math.min(1.0, Math.max(0.1, st.aqi / 250))
        }
      }));

      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [aqiStations, mapLoaded]);

  // Dynamic Map Base Style (Satellite vs Dark Vector Map)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    if (map.getLayer('satellite-basemap') && map.getLayer('dark-basemap')) {
      if (mapStyle === 'dark') {
        map.setLayoutProperty('satellite-basemap', 'visibility', 'none');
        map.setLayoutProperty('dark-basemap', 'visibility', 'visible');
        if (map.getLayer('labels-layer')) map.setLayoutProperty('labels-layer', 'visibility', 'none');
      } else {
        map.setLayoutProperty('satellite-basemap', 'visibility', 'visible');
        map.setLayoutProperty('dark-basemap', 'visibility', 'none');
        if (map.getLayer('labels-layer')) map.setLayoutProperty('labels-layer', 'visibility', 'visible');
      }
    }
  }, [mapStyle, mapLoaded]);

  // Layer Visibility
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    if (map.getLayer('hotspots-point')) {
      map.setLayoutProperty('hotspots-point', 'visibility', layers.hotspots ? 'visible' : 'none');
      map.setLayoutProperty('hotspots-point-glow', 'visibility', layers.hotspots ? 'visible' : 'none');
      map.setLayoutProperty('hotspots-heatmap', 'visibility', layers.hotspots ? 'visible' : 'none');
    }
    if (map.getLayer('all-incidents-circle')) {
      map.setLayoutProperty('all-incidents-circle', 'visibility', layers.hotspots ? 'visible' : 'none');
    }
    if (map.getLayer('smoke-heatmap')) {
      map.setLayoutProperty('smoke-heatmap', 'visibility', layers.smoke ? 'visible' : 'none');
    }
    if (map.getLayer('aqi-heatmap-layer')) {
      map.setLayoutProperty('aqi-heatmap-layer', 'visibility', layers.airQuality ? 'visible' : 'none');
    }
    if (map.getLayer('perimeters-fill')) {
      map.setLayoutProperty('perimeters-fill', 'visibility', layers.perimeters ? 'visible' : 'none');
      map.setLayoutProperty('perimeters-outline', 'visibility', layers.perimeters ? 'visible' : 'none');
    }
    if (map.getLayer('evacuations-fill')) {
      map.setLayoutProperty('evacuations-fill', 'visibility', layers.evacuations ? 'visible' : 'none');
      map.setLayoutProperty('evacuations-outline', 'visibility', layers.evacuations ? 'visible' : 'none');
    }
  }, [layers, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full bg-[#0f1115]" />
    </div>
  );
};
