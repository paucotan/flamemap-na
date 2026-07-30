import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { WindPoint } from '../types/fire';
import { getWindAtCoordinates } from '../services/weatherApi';

interface WindParticleCanvasProps {
  windPoints: WindPoint[];
  enabled: boolean;
  map?: maplibregl.Map | null;
}

interface GeoParticle {
  lat: number;
  lng: number;
  history: Array<{ lng: number; lat: number }>;
  alpha: number;
  maxLife: number;
  life: number;
  speedMultiplier: number;
}

export const WindParticleCanvas: React.FC<WindParticleCanvasProps> = ({ windPoints, enabled, map }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current || !map) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isMoving = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMoveStart = () => {
      isMoving = true;
    };
    const onMoveEnd = () => {
      isMoving = false;
      respawnAllParticles();
    };

    map.on('movestart', onMoveStart);
    map.on('moveend', onMoveEnd);

    // Dynamic Spatial Wind Vector Field using Inverse Distance Weighting (IDW) from Live Weather Grid
    const getGeoWindVector = (lat: number, lng: number): { angle: number; speedKmh: number } => {
      if (windPoints && windPoints.length > 0) {
        let totalWeight = 0;
        let sumSin = 0;
        let sumCos = 0;
        let sumSpeed = 0;

        for (let i = 0; i < windPoints.length; i++) {
          const wp = windPoints[i];
          const dLat = wp.latitude - lat;
          const dLng = wp.longitude - lng;
          const distSq = dLat * dLat + dLng * dLng;

          // Convert Meteorological "FROM" direction (e.g. 180° South wind) into physical "TOWARDS" downwind particle flow
          const flowDegrees = (wp.directionDegrees - 180 + 360) % 360;
          const weight = 1.0 / (distSq + 0.0001);
          const rad = (flowDegrees * Math.PI) / 180;

          sumSin += Math.sin(rad) * weight;
          sumCos += Math.cos(rad) * weight;
          sumSpeed += wp.speedKmh * weight;
          totalWeight += weight;
        }

        if (totalWeight > 0) {
          const avgSin = sumSin / totalWeight;
          const avgCos = sumCos / totalWeight;
          const avgSpeed = sumSpeed / totalWeight;
          const interpolatedAngle = Math.atan2(avgSin, avgCos);

          return {
            angle: interpolatedAngle,
            speedKmh: Math.max(8, avgSpeed),
          };
        }
      }

      // Fallback spatial weather interpolation if windPoints is loading/empty
      const fallback = getWindAtCoordinates(lat, lng);
      const fallbackFlowDegrees = (fallback.directionDegrees - 180 + 360) % 360;
      return {
        angle: (fallbackFlowDegrees * Math.PI) / 180,
        speedKmh: fallback.speedKmh,
      };
    };

    const getBounds = () => {
      const b = map.getBounds();
      return {
        west: b.getWest(),
        east: b.getEast(),
        south: b.getSouth(),
        north: b.getNorth(),
      };
    };

    const numParticles = Math.min(1000, Math.max(450, Math.floor((window.innerWidth * window.innerHeight) / 1600)));
    const maxTrailLength = 16;
    let particles: GeoParticle[] = [];

    const createParticleInBounds = (): GeoParticle => {
      const { west, east, south, north } = getBounds();
      const lng = west + Math.random() * (east - west);
      const lat = south + Math.random() * (north - south);
      return {
        lng,
        lat,
        history: [{ lng, lat }],
        alpha: 0.28 + Math.random() * 0.52,
        maxLife: 180 + Math.random() * 140, // Smooth 3.0s to 5.3s lifespan
        life: Math.floor(Math.random() * 80),
        speedMultiplier: 0.80 + Math.random() * 0.40,
      };
    };

    const respawnAllParticles = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(createParticleInBounds());
      }
    };

    respawnAllParticles();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bounds = getBounds();

      particles.forEach((p, idx) => {
        if (!isMoving) {
          p.life++;
          if (
            p.life >= p.maxLife ||
            p.lng < bounds.west ||
            p.lng > bounds.east ||
            p.lat < bounds.south ||
            p.lat > bounds.north
          ) {
            particles[idx] = createParticleInBounds();
            return;
          }

          // Sample wind vector at particle's current lat/lng
          const { angle, speedKmh } = getGeoWindVector(p.lat, p.lng);

          // Dynamically calibrate speed & trail scale based on real-time speedKmh (6 km/h vs 40 km/h)
          const speedFactor = Math.max(0.00035, (speedKmh / 20) * 0.00125);
          const stepDegree = speedFactor * p.speedMultiplier;

          p.lng += Math.cos(angle) * stepDegree;
          p.lat += Math.sin(angle) * stepDegree * 0.75; // Mercator aspect ratio adjustment

          p.history.push({ lng: p.lng, lat: p.lat });
          if (p.history.length > maxTrailLength) {
            p.history.shift();
          }
        }

        if (p.history.length < 2) return;

        // Map trajectory points to current screen pixels
        const screenPoints = p.history.map(pt => map.project([pt.lng, pt.lat]));
        const head = screenPoints[screenPoints.length - 1];

        if (
          head.x < -30 ||
          head.x > canvas.width + 30 ||
          head.y < -30 ||
          head.y > canvas.height + 30
        ) {
          return;
        }

        // Life fade envelope (smooth fade-in and fade-out over ~4s lifespan)
        let fadeAlpha = p.alpha;
        if (p.life < 28) fadeAlpha *= p.life / 28;
        if (p.life > p.maxLife - 38) fadeAlpha *= (p.maxLife - p.life) / 38;

        // Apple Maps Style: Multi-segment tapered comet streamline trail
        ctx.beginPath();
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
        for (let i = 1; i < screenPoints.length; i++) {
          ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }

        ctx.strokeStyle = `rgba(240, 246, 255, ${fadeAlpha * 0.76})`;
        ctx.lineWidth = 1.15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Draw bright glowing comet head tip
        ctx.beginPath();
        ctx.arc(head.x, head.y, 1.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${fadeAlpha * 0.95})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      map.off('movestart', onMoveStart);
      map.off('moveend', onMoveEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, map, windPoints]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 opacity-90"
    />
  );
};
