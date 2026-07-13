import React, { useRef, useState } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
  glowRadius?: number;
  key?: React.Key;
}

export default function SpotlightCard({
  children,
  className = "",
  borderRadius = "24px",
  glowRadius = 140,
  ...props
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  // Extract padding, background, and borders from className to put them on the inner container
  const classList = className.split(" ");
  const isBgTransparent = className.includes("bg-transparent");
  
  // Sizing, grid, translation, flex, transition, shadow classes stay on the outer wrapper
  const outerClasses = classList.filter(c => 
    !c.startsWith("p-") && 
    !c.startsWith("bg-") && 
    (isBgTransparent ? true : !c.startsWith("border"))
  ).join(" ");
  
  // Padding, background, and specific internal borders go to the inner container
  const innerClasses = classList.filter(c => 
    c.startsWith("p-") || 
    c.startsWith("bg-") || 
    (!isBgTransparent && c.startsWith("border"))
  ).join(" ");

  const finalInnerClasses = innerClasses || "bg-[var(--theme-card)] p-6";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-[1.5px] overflow-hidden transition-all duration-300 ${outerClasses}`}
      style={{
        borderRadius: borderRadius,
        backgroundColor: isBgTransparent ? "transparent" : "rgba(var(--theme-border), 0.12)",
      }}
      {...props}
    >
      {/* Dynamic theme-glowing border layer (No inner box glow!) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${glowRadius}px circle at ${coords.x}px ${coords.y}px, var(--theme-accent) 0%, transparent 100%)`,
          borderRadius: borderRadius,
          zIndex: 0,
          ...(isBgTransparent ? {
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            padding: "1.5px", // matches the p-[1.5px] border width!
          } : {})
        }}
      />
      
      {/* Inner card background container (shields children from inner glow!) */}
      <div 
        className={`relative h-full w-full z-10 flex flex-col ${finalInnerClasses}`}
        style={{
          borderRadius: `calc(${borderRadius} - 1.5px)`,
          border: "none", // Avoid inner double-borders
        }}
      >
        {children}
      </div>
    </div>
  );
}
