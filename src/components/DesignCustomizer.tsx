import React from "react";
import { X, Sun, Moon, Check, Palette } from "lucide-react";
import { AppTheme, THEME_PRESETS } from "../theme";

interface DesignCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

// Quick-select premium accent colors
const PRESET_ACCENTS = [
  { name: "Royal Blue", value: "#2563EB" },
  { name: "Bright Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#0D9488" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Rose", value: "#F43F5E" },
];

function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "37, 99, 235";
}

export default function DesignCustomizer({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}: DesignCustomizerProps) {
  if (!isOpen) return null;

  const handleSelectPreset = (presetKey: "light" | "dark") => {
    const selected = THEME_PRESETS[presetKey];
    onThemeChange(selected);
  };

  const handleAccentColorChange = (hexColor: string) => {
    // Determine whether to base on light or dark mode properties
    const isLightBase = currentTheme.bg === "#FAFAF7" || currentTheme.bg === "#FAFBFC" || currentTheme.bg === "#FFFFFF" || currentTheme.preset === "light";
    const baseTheme = isLightBase ? THEME_PRESETS.light : THEME_PRESETS.dark;

    const customTheme: AppTheme = {
      ...baseTheme,
      preset: "custom",
      accent: hexColor,
      accentHover: hexColor,
      accentLight: `rgba(${hexToRgb(hexColor)}, 0.15)`,
    };
    onThemeChange(customTheme);
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-all cursor-pointer"
        onClick={onClose}
        id="theme-overlay"
      />

      {/* Modern, Simple Slide-out Sidebar */}
      <div 
        className="fixed right-0 top-0 h-screen w-full max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col font-sans"
        id="theme-modal"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <Palette size={16} className="text-blue-500" />
              <span>Theme Customization</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Adjust visual themes & accent colors</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            id="close-theme-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          {/* Base Presets */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Base Mode</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectPreset("light")}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-18 cursor-pointer ${
                  currentTheme.preset === "light"
                    ? "border-blue-500 bg-blue-950/20 text-slate-100"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                }`}
                id="theme-btn-light"
              >
                <Sun size={18} className={currentTheme.preset === "light" ? "text-blue-400" : "text-slate-400"} />
                <span className="text-xs font-semibold">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("dark")}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-18 cursor-pointer ${
                  currentTheme.preset === "dark"
                    ? "border-blue-500 bg-blue-950/20 text-slate-100"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                }`}
                id="theme-btn-dark"
              >
                <Moon size={18} className={currentTheme.preset === "dark" ? "text-blue-400" : "text-slate-400"} />
                <span className="text-xs font-semibold">Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Accent Color Customizer */}
          <div className="space-y-3 pt-2 border-t border-slate-800/60">
            <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Accent Color</h4>
            
            {/* Swatches */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_ACCENTS.map((accent) => {
                const isSelected = currentTheme.accent.toLowerCase() === accent.value.toLowerCase();
                return (
                  <button
                    key={accent.value}
                    type="button"
                    onClick={() => handleAccentColorChange(accent.value)}
                    className="h-10 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center relative hover:border-slate-700 transition cursor-pointer group"
                    title={accent.name}
                  >
                    <span 
                      className="w-5 h-5 rounded-full inline-block shadow-inner"
                      style={{ backgroundColor: accent.value }}
                    />
                    {isSelected && (
                      <span className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <Check size={14} className="text-white font-bold" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="pt-2">
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">Or use a custom hex color picker:</label>
              <div className="flex gap-2 items-center">
                <div className="relative h-10 w-10 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
                  <input
                    type="color"
                    value={currentTheme.accent}
                    onChange={(e) => handleAccentColorChange(e.target.value)}
                    className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0 scale-150"
                  />
                  <span 
                    className="w-6 h-6 rounded-full inline-block border border-slate-700"
                    style={{ backgroundColor: currentTheme.accent }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentTheme.accent.toUpperCase()}
                    onChange={(e) => {
                      if (e.target.value.startsWith("#") && e.target.value.length <= 7) {
                        handleAccentColorChange(e.target.value);
                      } else if (!e.target.value.startsWith("#") && e.target.value.length <= 6) {
                        handleAccentColorChange("#" + e.target.value);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2.5 px-4 rounded-lg font-medium transition cursor-pointer text-center"
            id="apply-theme-btn"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </>
  );
}
