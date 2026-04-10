export const STORAGE_KEY = "luckydraw-history-v1";
export const PREFERENCES_KEY = "luckydraw-preferences-v1";
export const BANNER_KEY = "luckydraw-star-banner-dismissed";
export const COOKIE_KEY = "luckydraw-cookies-v1";
export const HISTORY_LIMIT = 12;
export const MEDALS = ["🥇", "🥈", "🥉"];
export const HISTORY_MODES = ["names", "numbers", "items", "teams", "order", "coin", "letters", "wheel"];

export const SAMPLE_DATA = {
  names: ["Avery Stone", "Mila Carter", "Noah Bennett", "Iris Cole", "Theo Mercer", "Lena Park"],
  items: ["Fone Premium", "Vale-presente", "Ingresso VIP", "Kit Café", "Notebook", "Luminária"],
};

export const TEAM_COLORS = [
  { bg: "#f59e0b", light: "rgba(245,158,11,0.10)" },
  { bg: "#60a5fa", light: "rgba(96,165,250,0.10)" },
  { bg: "#34d399", light: "rgba(52,211,153,0.10)" },
  { bg: "#f87171", light: "rgba(248,113,113,0.10)" },
  { bg: "#c084fc", light: "rgba(192,132,252,0.10)" },
  { bg: "#fb923c", light: "rgba(251,146,60,0.10)" },
  { bg: "#38bdf8", light: "rgba(56,189,248,0.10)" },
  { bg: "#a78bfa", light: "rgba(167,139,250,0.10)" },
];

export const WHEEL_COLORS = [
  "#b45309", "#2563eb", "#059669", "#dc2626", "#7c3aed",
  "#db2777", "#0891b2", "#ea580c", "#047857", "#4f46e5",
  "#be185d", "#0284c7",
];

export const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(65 + i));
