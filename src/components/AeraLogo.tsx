import React from "react";

// 📦 Explicitly import the image assets dynamically
// (Adjust the relative paths "../assets/..." based on where you save them)
import aaeraDarkLogo from "../assets/aaera.png";
import aaeraLightLogo from "../assets/aaeralight.png";

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

  // Vite will handle the exact structural path mapping on Vercel automatically
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
          // Absolute fallback safety: if rendering completely fails on Vercel,
          // hide the broken square and show an elegant text monogram letter alternative instead
          e.currentTarget.style.display = 'none';
          const sibling = e.currentTarget.nextElementSibling as HTMLElement;
          if (sibling) sibling.style.display = 'block';
        }}
      />
      <span 
        className="hidden font-bold text-sm tracking-wider" 
        style={{ color: preset === "dark" ? "#f8fafc" : "#171717" }}
      >
        A
      </span>
    </div>
  );
}
