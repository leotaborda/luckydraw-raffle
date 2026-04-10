import { PREFERENCES_KEY, STORAGE_KEY, HISTORY_MODES } from "./constants.js";

export function loadPreferences() {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}");
    return {
      theme: raw.theme === "light" ? "light" : "dark",
      language: raw.language === "en-US" ? "en-US" : "pt-BR",
    };
  } catch {
    return { theme: "dark", language: "pt-BR" };
  }
}

export function savePreferences(prefs) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}

export function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (Array.isArray(raw)) {
      const migrated = {};
      HISTORY_MODES.forEach((m) => { migrated[m] = []; });
      raw.forEach((e) => { if (migrated[e.mode]) migrated[e.mode].unshift(e); });
      return migrated;
    }
    const result = {};
    HISTORY_MODES.forEach((m) => { result[m] = Array.isArray(raw[m]) ? raw[m] : []; });
    return result;
  } catch {
    const empty = {};
    HISTORY_MODES.forEach((m) => { empty[m] = []; });
    return empty;
  }
}

export function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearStoredHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
