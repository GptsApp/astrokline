'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  glow: number;
}

interface ParticleCanvasProps {
  particleCount?: number;
  colors?: string[];
  className?: string;
  baseSpeed?: number;
}

export function ParticleCanvas({
  particleCount = 60,
  colors = ['#FFF', '#F5EBBA', '#D4AF37'],
  className = '',
  baseSpeed = 0.2
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
         canvas.width = parent.clientWidth;
         canvas.height = parent.clientHeight;
      }
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * baseSpeed,
          vy: (Math.random() - 0.5) * baseSpeed,
          alpha: Math.random() * 0.5 + 0.1,
          glow: Math.random() * 5 + 2
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // move
        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.closePath();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const render = () => {
      drawParticles();
      animationFrameId = window.requestAnimationFrame(render);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, colors, baseSpeed]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none ${className}`} 
    />
  );
}
