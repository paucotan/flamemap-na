import React, { useEffect, useRef } from 'react';
import { WindPoint } from '../types/fire';

interface WindParticleCanvasProps {
  windPoints: WindPoint[];
  enabled: boolean;
}

interface StreamlineParticle {
  x: number;
  y: number;
  history: Array<{ x: number; y: number }>;
  alpha: number;
  maxLife: number;
  life: number;
  speedMultiplier: number;
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

    // Continuous Spatial Wind Vector Field
    const getLocalWindVector = (x: number, y: number): { angle: number; speed: number; speedKmh: number } => {
      const normX = x / canvas.width;  // 0 (West Coast / BC) to 1 (East Coast)
      const normY = y / canvas.height; // 0 (North / Yukon) to 1 (South / US)

      let dirDegrees = 225; // Default SSW flow
      let speedKmh = 22;

      // 1. Pacific Northwest / BC Coast / Yukon: South-Westerly maritime flow
      if (normX < 0.35 && normY < 0.5) {
        dirDegrees = 215 + Math.sin(normX * 10) * 25;
        speedKmh = 28 + Math.cos(normY * 8) * 14;
      }
      // 2. California / Southwest US: North-Westerly coastal marine winds
      else if (normX < 0.35 && normY >= 0.5) {
        dirDegrees = 315 + Math.sin(normY * 6) * 18;
        speedKmh = 22 + Math.sin(normX * 5) * 10;
      }
      // 3. Canadian Prairies / Alberta / Midwest: Southerly prairie jet stream
      else if (normX >= 0.35 && normX < 0.7 && normY >= 0.3) {
        dirDegrees = 195 + Math.cos(normX * 8) * 30;
        speedKmh = 34 + Math.sin(normY * 10) * 16;
      }
      // 4. Northern Shield / Quebec / NWT: North-Westerly polar arctic flow
      else if (normX >= 0.5 && normY < 0.5) {
        dirDegrees = 300 + Math.sin(normX * normY * 12) * 35;
        speedKmh = 26 + Math.cos(normX * 6) * 12;
      }
      // 5. Eastern Seaboard / Atlantic: Westerly Atlantic flow
      else {
        dirDegrees = 250 + Math.sin(normX * 8) * 22;
        speedKmh = 30 + Math.sin(normY * 7) * 15;
      }

      const angle = (dirDegrees * Math.PI) / 180;
      const speed = 0.4 + (speedKmh / 100) * 1.8;

      return { angle, speed, speedKmh };
    };

    // Apple Maps style: Dense network of ~1,100 fine, whispy particles
    const numParticles = Math.min(1200, Math.floor((window.innerWidth * window.innerHeight) / 1400));
    const maxTrailLength = 12; // Tail segments for smooth vector curvature
    const particles: StreamlineParticle[] = [];

    const createParticle = (): StreamlineParticle => {
      const px = Math.random() * canvas.width;
      const py = Math.random() * canvas.height;
      return {
        x: px,
        y: py,
        history: [{ x: px, y: py }],
        alpha: 0.12 + Math.random() * 0.48,
        maxLife: 50 + Math.random() * 80,
        life: 0,
        speedMultiplier: 0.8 + Math.random() * 0.4,
      };
    };

    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle());
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.life++;
        if (p.life >= p.maxLife || p.x < -40 || p.x > canvas.width + 40 || p.y < -40 || p.y > canvas.height + 40) {
          particles[idx] = createParticle();
          return;
        }

        // Sample vector field at current position
        const { angle, speed } = getLocalWindVector(p.x, p.y);
        const step = speed * p.speedMultiplier;

        p.x += Math.cos(angle) * step;
        p.y += Math.sin(angle) * step;

        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > maxTrailLength) {
          p.history.shift();
        }

        if (p.history.length < 2) return;

        // Life fade envelope
        let fadeAlpha = p.alpha;
        if (p.life < 12) fadeAlpha *= p.life / 12;
        if (p.life > p.maxLife - 20) fadeAlpha *= (p.maxLife - p.life) / 20;

        // Render paper-thin curved multi-segment streamline trail (Apple Maps style)
        ctx.beginPath();
        ctx.moveTo(p.history[0].x, p.history[0].y);

        for (let i = 1; i < p.history.length; i++) {
          const pt = p.history[i];
          ctx.lineTo(pt.x, pt.y);
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${fadeAlpha})`;
        ctx.lineWidth = 0.75;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      });

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
      className="absolute inset-0 pointer-events-none z-10 opacity-85"
    />
  );
};
