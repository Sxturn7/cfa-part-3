import React, { useEffect, useRef } from "react";

export interface PixelBlastProps {
  variant?: "square" | "circle";
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  speed?: number;
  transparent?: boolean;
  edgeFade?: number;
}

export default function PixelBlast({
  variant = "square",
  pixelSize = 3,
  color = "#B497CF",
  patternScale = 2,
  patternDensity = 1,
  enableRipples = true,
  rippleSpeed = 0.3,
  rippleThickness = 0.1,
  rippleIntensityScale = 1,
  speed = 0.5,
  transparent = true,
  edgeFade = 0.5,
}: PixelBlastProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<{ x: number; y: number; age: number; maxAge: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Responsive Canvas Resizing via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = Math.floor(entryWidth);
        height = Math.floor(entryHeight);
        canvas.width = width;
        canvas.height = height;
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Interactive ripple trigger on click
    const handleCanvasClick = (e: MouseEvent) => {
      if (!enableRipples) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      rippleRef.current.push({
        x,
        y,
        age: 0,
        maxAge: 200, // duration of the ripple
      });

      // Cap ripples list to prevent memory bloat
      if (rippleRef.current.length > 8) {
        rippleRef.current.shift();
      }
    };

    // Also trigger subtle ripple on hover occasionally
    let lastHoverTime = 0;
    const handleCanvasMouseMove = (e: MouseEvent) => {
      if (!enableRipples) return;
      const now = Date.now();
      if (now - lastHoverTime < 150) return; // limit hover ripples frequency
      lastHoverTime = now;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      rippleRef.current.push({
        x,
        y,
        age: 0,
        maxAge: 80, // shorter duration for hover micro-ripples
      });

      if (rippleRef.current.length > 15) {
        rippleRef.current.shift();
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);

    // Particle/Pixel grid array generator
    let time = 0;

    const render = () => {
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (!transparent) {
        ctx.fillStyle = "#030712"; // Deep space background
        ctx.fillRect(0, 0, width, height);
      }

      time += speed * 0.05;

      // Update current ripples
      rippleRef.current.forEach((rip) => {
        rip.age += rippleSpeed * 5;
      });
      // Filter out completed ripples
      rippleRef.current = rippleRef.current.filter((rip) => rip.age < rip.maxAge);

      // Define grid step size
      const step = pixelSize * (4 + Math.max(0, 2 - patternDensity));
      
      // Hex to RGB parser for customized styling with dynamic alpha
      let r = 180, g = 151, b = 207; // Default #B497CF
      if (color.startsWith("#")) {
        const hex = color.replace("#", "");
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
      }

      // Draw pixelated pattern field
      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          
          // Calculate noise/sinusoidal value for standard flow movement
          const valX = (x / width) * Math.PI * 2 * patternScale;
          const valY = (y / height) * Math.PI * 2 * patternScale;
          const noise = Math.sin(valX + time) * Math.cos(valY - time) * 0.5 + 0.5;

          // Compute distance to any active ripples
          let rippleFactor = 0;
          rippleRef.current.forEach((rip) => {
            const dx = x - rip.x;
            const dy = y - rip.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // ripple expansion radius grows with age
            const currentRadius = rip.age * 3.5;
            const thickness = rip.maxAge * rippleThickness * 1.5;

            if (dist > currentRadius - thickness && dist < currentRadius + thickness) {
              const edgeDist = Math.abs(dist - currentRadius);
              const intensity = (1 - edgeDist / thickness) * (1 - rip.age / rip.maxAge);
              rippleFactor += intensity * rippleIntensityScale;
            }
          });

          // Overall brightness of this pixel
          const alphaBase = noise * 0.12 + 0.03;
          let finalAlpha = alphaBase + rippleFactor * 0.5;

          // Apply edge fade to make it blend into dark edges beautifully
          if (edgeFade > 0) {
            const padX = width * edgeFade * 0.4;
            const padY = height * edgeFade * 0.4;
            let fade = 1;

            if (x < padX) fade *= x / padX;
            else if (x > width - padX) fade *= (width - x) / padX;

            if (y < padY) fade *= y / padY;
            else if (y > height - padY) fade *= (height - y) / padY;

            finalAlpha *= fade;
          }

          if (finalAlpha <= 0.005) continue;

          // Draw the pixel
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(0.95, finalAlpha)})`;
          
          const size = pixelSize + (rippleFactor > 0 ? rippleFactor * 2 : 0);

          if (variant === "circle") {
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
    };
  }, [
    variant,
    pixelSize,
    color,
    patternScale,
    patternDensity,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    speed,
    transparent,
    edgeFade,
  ]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair opacity-80"
      />
    </div>
  );
}
