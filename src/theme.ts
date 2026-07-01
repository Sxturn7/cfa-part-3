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
}

export const THEME_PRESETS: Record<Exclude<AppTheme["preset"], "custom">, AppTheme> = {
  light: {
    preset: "light",
    accent: "#2563EB",
    accentHover: "#1D4ED8",
    accentLight: "rgba(37, 99, 235, 0.15)",
    bg: "#FAFAF7",
    card: "#FFFFFF",
    border: "#E5E7EB",
    beige: "#F4F4F1",
    beigeDark: "#E5E5E0",
    textMain: "#6B7280",
    textDark: "#171717",
    headerBg: "rgba(250, 250, 247, 0.85)",
    inputBg: "#FFFFFF",
  },
  dark: {
    preset: "dark",
    accent: "#3B82F6",
    accentHover: "#2563EB",
    accentLight: "rgba(59, 130, 246, 0.15)",
    bg: "#0E1117",
    card: "#161B22",
    border: "#2D3748",
    beige: "#1F2937",
    beigeDark: "#374151",
    textMain: "#9CA3AF",
    textDark: "#F8FAFC",
    headerBg: "rgba(14, 17, 23, 0.85)",
    inputBg: "#161B22",
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
}
