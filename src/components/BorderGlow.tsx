import React, { useRef, useState, useEffect } from "react";

interface BorderGlowProps {
  children: React.ReactNode;
  edgeSensitivity?: number;
  glowColor?: string; // fallback rgb string e.g. "40 80 80"
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  className?: string;
}

export default function BorderGlow({
  children,
  edgeSensitivity = 30,
  glowColor = "180 151 207",
  backgroundColor = "var(--theme-card)",
  borderRadius = 24,
  glowRadius = 120,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["var(--theme-accent)", "transparent"],
  className = "",
}: BorderGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let animFrameId: number;
    const tick = () => {
      setAngle((prev) => (prev + 0.8) % 360);
      animFrameId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animFrameId);
  }, [animated]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  // Build the gradient colors list for the animated or static border
  const gradientColors = colors.join(", ");

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-[1.5px] overflow-hidden transition-all duration-300 ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        backgroundColor: "rgba(var(--theme-border), 0.15)",
      }}
    >
      {/* Glow highlight backing */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered || animated ? glowIntensity : 0,
          background: animated
            ? `conic-gradient(from ${angle}deg, ${gradientColors})`
            : `radial-gradient(${glowRadius}px circle at ${coords.x}px ${coords.y}px, ${colors[0] || `rgb(${glowColor})` } 0%, ${colors[1] || "transparent"} 50%, transparent 100%)`,
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* Actual inner container card background */}
      <div
        className="relative h-full w-full"
        style={{
          backgroundColor: backgroundColor,
          borderRadius: `${borderRadius - 1.5}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
