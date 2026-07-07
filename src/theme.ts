export interface AppTheme {
  preset: "light" | "dark" | "custom";
  accent: string;
  accentHover: string;
  accentLight: string;
  bg: string;
  card: string;
  border: string;
  beige: string;
  beigeDark: string;
  textMain: string;
  textDark: string;
  headerBg: string;
  inputBg: string;
  shadow?: string;
  shadowHover?: string;
  radius?: string;
}

export const THEME_PRESETS: Record<Exclude<AppTheme["preset"], "custom">, AppTheme> = {
  light: {
    preset: "light",
    accent: "#2563EB",
    accentHover: "#1D4ED8",
    accentLight: "rgba(37, 99, 235, 0.12)",
    bg: "#FAFAF7",
    card: "#FFFFFF",
    border: "#E5E7EB",
    beige: "#F4F4F1",
    beigeDark: "#E5E5E0",
    textMain: "#6B7280",
    textDark: "#171717",
    headerBg: "rgba(250, 250, 247, 0.85)",
    inputBg: "#FFFFFF",
    shadow: "0 12px 30px -10px rgba(0, 0, 0, 0.04), 0 4px 12px -5px rgba(0, 0, 0, 0.02)",
    shadowHover: "0 20px 40px -12px rgba(0, 0, 0, 0.08), 0 8px 20px -6px rgba(0, 0, 0, 0.03)",
    radius: "24px",
  },
  dark: {
    preset: "dark",
    accent: "#3B82F6",
    accentHover: "#2563EB",
    accentLight: "rgba(59, 130, 246, 0.12)",
    // 🌌 True Midnight Obsidian Palette
    bg: "#030712",         // Pitch black canvas (stops the washed-out gray look)
    card: "#0b0f19",       // Deep velvet navy-slate for structural containers
    border: "#1f293d",     // Razor-thin sleek borders
    beige: "#111827",      // Dark row background variations
    beigeDark: "#1f2937",  // Active state selections
    textMain: "#9ea7b6",   // Highly legible slate-silver body text
    textDark: "#f8fafc",   // Crisp, piercing white for primary titles
    headerBg: "rgba(3, 7, 18, 0.80)", // Translucent blurred glass top navigation header
    inputBg: "#060b13",    // Sunken, extra-dark inputs
    shadow: "0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 50px -15px rgba(59, 130, 246, 0.04)",
    shadowHover: "0 30px 60px -15px rgba(0, 0, 0, 0.85), 0 0 50px -5px rgba(59, 130, 246, 0.12)",
    radius: "24px",
  }
};

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  root.style.setProperty("--theme-bg", theme.bg);
  root.style.setProperty("--theme-card", theme.card);
  root.style.setProperty("--theme-border", theme.border);
  root.style.setProperty("--theme-beige", theme.beige);
  root.style.setProperty("--theme-beige-dark", theme.beigeDark);
  root.style.setProperty("--theme-text-main", theme.textMain);
  root.style.setProperty("--theme-text-dark", theme.textDark);
  root.style.setProperty("--theme-accent", theme.accent);
  root.style.setProperty("--theme-accent-hover", theme.accentHover);
  root.style.setProperty("--theme-accent-light", theme.accentLight);
  root.style.setProperty("--theme-header-bg", theme.headerBg);
  root.style.setProperty("--theme-input-bg", theme.inputBg);
  
  // Set default dynamic shadow and corner radius
  const defaultShadow = theme.preset === "light" 
    ? "0 12px 30px -10px rgba(0, 0, 0, 0.04)" 
    : "0 20px 40px -15px rgba(0, 0, 0, 0.6)";
  const defaultShadowHover = theme.preset === "light" 
    ? "0 20px 40px -12px rgba(0, 0, 0, 0.08)" 
    : "0 30px 60px -15px rgba(0, 0, 0, 0.85)";
    
  root.style.setProperty("--theme-shadow", theme.shadow || defaultShadow);
  root.style.setProperty("--theme-shadow-hover", theme.shadowHover || defaultShadowHover);
  root.style.setProperty("--theme-radius", theme.radius || "24px");
}
