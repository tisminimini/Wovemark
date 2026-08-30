/**
 * Wovemark Design Tokens & Dial Engine
 */

export interface ThemeConfig {
  theme?: "system" | "light" | "dark" | string;
  variance?: number; // 1 - 10
  motion?: number;   // 0 - 10
  density?: number;  // 1 - 10
  accent?: string;
}

export const ACCENT_COLORS: Record<string, { main: string; hover: string; light: string; text: string }> = {
  blue: { main: "#2563eb", hover: "#1d4ed8", light: "#eff6ff", text: "#ffffff" },
  indigo: { main: "#4f46e5", hover: "#4338ca", light: "#eef2ff", text: "#ffffff" },
  purple: { main: "#7c3aed", hover: "#6d28d9", light: "#f5f3ff", text: "#ffffff" },
  violet: { main: "#8b5cf6", hover: "#7c3aed", light: "#f5f3ff", text: "#ffffff" },
  rose: { main: "#e11d48", hover: "#be123c", light: "#fff1f2", text: "#ffffff" },
  red: { main: "#dc2626", hover: "#b91c1c", light: "#fef2f2", text: "#ffffff" },
  amber: { main: "#d97706", hover: "#b45309", light: "#fffbeb", text: "#ffffff" },
  emerald: { main: "#059669", hover: "#047857", light: "#ecfdf5", text: "#ffffff" },
  cyan: { main: "#0891b2", hover: "#0e7490", light: "#ecfeff", text: "#ffffff" },
  neutral: { main: "#27272a", hover: "#18181b", light: "#f4f4f5", text: "#ffffff" },
};

export function applyThemeDials(container: HTMLElement, config: ThemeConfig) {
  const root = container;
  const variance = Math.min(10, Math.max(1, config.variance ?? 5));
  const motion = Math.min(10, Math.max(0, config.motion ?? 5));
  const density = Math.min(10, Math.max(1, config.density ?? 5));
  const accentName = (config.accent || "blue").toLowerCase();
  const accent = ACCENT_COLORS[accentName] || ACCENT_COLORS.blue;

  // Set CSS dial properties
  root.style.setProperty("--wm-dial-variance", String(variance));
  root.style.setProperty("--wm-dial-motion", String(motion));
  root.style.setProperty("--wm-dial-density", String(density));

  // Density calculations
  // High density (7-10) -> tighter gaps, smaller padding
  // Low density (1-3) -> spacious padding, larger typography
  const spaceBase = 1 - (density - 5) * 0.08; // 0.6x to 1.32x
  root.style.setProperty("--wm-density-factor", spaceBase.toFixed(2));
  root.style.setProperty("--wm-pad-base", `${Math.round(16 * spaceBase)}px`);
  root.style.setProperty("--wm-pad-sm", `${Math.round(8 * spaceBase)}px`);
  root.style.setProperty("--wm-pad-lg", `${Math.round(24 * spaceBase)}px`);
  root.style.setProperty("--wm-pad-xl", `${Math.round(36 * spaceBase)}px`);
  root.style.setProperty("--wm-gap-base", `${Math.round(16 * spaceBase)}px`);

  // Motion calculations
  // Motion 0 = disabled (0s)
  // Motion 5 = 250ms
  // Motion 10 = 500ms
  const motionDuration = motion === 0 ? "0ms" : `${Math.round(50 + motion * 40)}ms`;
  root.style.setProperty("--wm-motion-duration", motionDuration);
  root.style.setProperty("--wm-motion-scale", motion === 0 ? "0" : (motion / 5).toFixed(2));

  // Accent tokens
  root.style.setProperty("--wm-color-accent", accent.main);
  root.style.setProperty("--wm-color-accent-hover", accent.hover);
  root.style.setProperty("--wm-color-accent-light", accent.light);
  root.style.setProperty("--wm-color-accent-text", accent.text);

  // Theme mode
  const theme = config.theme || "system";
  root.setAttribute("data-wm-theme", theme);
}
