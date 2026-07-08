import React from "react";
// 📦 Import images directly so Vite bundles and routes them perfectly on Vercel
import aaeraDarkLogo from "/audio/AERA.png"; // Adjust relative path to where your audio folder actually is
import aaeraLightLogo from "/audio/aaeralight.png";

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

  // Vite resolves these imports to the correct URL string automatically
  const logoSrc = preset === "light" ? aaeraLightLogo : aaeraDarkLogo;

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
          // If rendering fails, hide image and display fallback text monogram
          e.currentTarget.style.display = 'none';
          const sibling = e.currentTarget.nextElementSibling as HTMLElement;
          if (sibling) {
            sibling.style.display = 'flex'; // Use flex to center the letter "A"
          }
        }}
      />
      <span 
        className="hidden font-bold text-sm tracking-wider w-full h-full items-center justify-center" 
        style={{ color: preset === "dark" ? "#f8fafc" : "#171717" }}
      >
        A
      </span>
    </div>
  );
}
