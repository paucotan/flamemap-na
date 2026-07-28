import React, { useEffect, useRef } from 'react';
import { WindPoint } from '../types/fire';

interface WindParticleCanvasProps {
  windPoints: WindPoint[];
  enabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  length: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export const WindParticleCanvas: React.FC<WindParticleCanvasProps> = ({ windPoints, enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spatial Wind Field Interpolator function
    // Computes local wind direction (radians) and local speed (px/frame) based on canvas (x, y) region
    const getLocalWindVector = (x: number, y: number): { angle: number; speed: number; speedKmh: number } => {
      const normX = x / canvas.width;  // 0 (West Coast / BC / CA) to 1 (East Coast / NL)
      const normY = y / canvas.height; // 0 (North / Yukon / NWT) to 1 (South / California / US)

      let dirDegrees = 225; // Default SSW flow
      let speedKmh = 20;

      // 1. Pacific Northwest / BC Coast / Yukon (Top-Left): South-Westerly maritime flow
      if (normX < 0.35 && normY < 0.5) {
        dirDegrees = 215 + Math.sin(normX * 10) * 20;
        speedKmh = 28 + Math.cos(normY * 8) * 12;
      }
      // 2. California / Southwest US (Bottom-Left): North-Westerly coastal marine winds
      else if (normX < 0.35 && normY >= 0.5) {
        dirDegrees = 315 + Math.sin(normY * 6) * 15;
        speedKmh = 22 + Math.sin(normX * 5) * 8;
      }
      // 3. Canadian Prairies / Alberta / Midwest (Center): Southerly prairie jet stream
      else if (normX >= 0.35 && normX < 0.7 && normY >= 0.3) {
        dirDegrees = 195 + Math.cos(normX * 8) * 25;
        speedKmh = 32 + Math.sin(normY * 10) * 14;
      }
      // 4. Northern Shield / Quebec / NWT (Top-Right): North-Westerly polar arctic flow
      else if (normX >= 0.5 && normY < 0.5) {
        dirDegrees = 300 + Math.sin(normX * normY * 12) * 30;
        speedKmh = 25 + Math.cos(normX * 6) * 10;
      }
      // 5. Eastern Seaboard / Maritimes / NL (Bottom-Right): Westerly Atlantic flow
      else {
        dirDegrees = 250 + Math.sin(normX * 8) * 20;
        speedKmh = 30 + Math.sin(normY * 7) * 15;
      }

      // Convert degrees to canvas radians
      const angle = (dirDegrees * Math.PI) / 180;

      // Scale px speed proportionally to actual local wind speed (km/h)
      // 20 km/h -> ~0.65 px/frame; 45 km/h -> ~1.4 px/frame (calm, elegant, non-chaotic)
      const speed = 0.3 + (speedKmh / 100) * 2.1;

      return { angle, speed, speedKmh };
    };

    const numParticles = Math.min(260, Math.floor((window.innerWidth * window.innerHeight) / 5500));
    const particles: Particle[] = [];

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: 10 + Math.random() * 14,
      alpha: 0.15 + Math.random() * 0.45,
      maxLife: 70 + Math.random() * 90,
      life: 0,
    });

    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle());
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render spatial curved particle streamlines
      particles.forEach((p, idx) => {
        p.life++;
        if (p.life >= p.maxLife || p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
          particles[idx] = createParticle();
          return;
        }

        // Sample spatial wind vector at current particle position
        const { angle, speed } = getLocalWindVector(p.x, p.y);

        const dx = Math.cos(angle) * p.length;
        const dy = Math.sin(angle) * p.length;

        p.x += Math.cos(angle) * speed;
        p.y += Math.sin(angle) * speed;

        let fadeAlpha = p.alpha;
        if (p.life < 15) fadeAlpha *= p.life / 15;
        if (p.life > p.maxLife - 25) fadeAlpha *= (p.maxLife - p.life) / 25;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dx, p.y + dy);
        ctx.strokeStyle = `rgba(255, 255, 255, ${fadeAlpha})`;
        ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      // Render localized cyan grid vector arrows matching regional wind directions
      const rows = 5;
      const cols = 7;
      const xGap = canvas.width / (cols + 1);
      const yGap = canvas.height / (rows + 1);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';

      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const gx = c * xGap;
          const gy = r * yGap;

          const { angle } = getLocalWindVector(gx, gy);

          ctx.save();
          ctx.translate(gx, gy);
          ctx.rotate(angle);

          // Arrow head pointing along local spatial vector
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, 6);
          ctx.lineTo(2, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled, windPoints]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 opacity-75"
    />
  );
};
