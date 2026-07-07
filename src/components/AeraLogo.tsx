import React from "react";

interface AeraLogoProps {
  className?: string;
  size?: number;
  color?: string;
  showText?: boolean;
  preset?: "light" | "dark" | "custom";
}

export default function AeraLogo({
  className = "",
  size = 40,
  color = "currentColor",
  showText = false,
  preset = "light"
}: AeraLogoProps) {
  // Triple check that these file names and extensions match your public/audio/ folder exactly!
  const logoSrc = preset === "light" ? "/audio/AAERALight.png" : "/audio/AERA.png";

  return (
    <div 
      className={`inline-flex items-center justify-center overflow-hidden rounded-xl border border-[var(--theme-border)]/15 shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoSrc}
        alt="AERA Logo"
        className="w-full h-full object-cover select-none"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback UI placeholder if Vercel still blocks the path
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
