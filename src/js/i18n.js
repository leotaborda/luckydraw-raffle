import { translations } from "./translations.js";
import { state } from "./state.js";
import { el } from "./dom.js";
import { savePreferences } from "./storage.js";

export function t(key, params = {}) {
  const dict = translations[state.prefs.language] ?? translations["pt-BR"];
  const tpl = dict[key] ?? translations["pt-BR"][key] ?? key;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    tpl,
  );
}

export function applyTheme() {
  const dark = state.prefs.theme === "dark";
  document.documentElement.dataset.theme = state.prefs.theme;
  el.themeToggleBtn.setAttribute("aria-pressed", String(dark));
  el.themeToggleBtn.setAttribute("aria-label", dark ? t("themeAriaLight") : t("themeAriaDark"));
  el.themeToggleBtn.querySelector(".theme-icon").className =
    `theme-icon bi ${dark ? "bi-moon-stars-fill" : "bi-brightness-high-fill"}`;
  el.themeToggleBtn.querySelector(".theme-toggle-label").textContent = dark
    ? t("themeDark")
    : t("themeLight");
}

export function applyLanguage() {
  document.documentElement.lang = state.prefs.language;
  document.title = t("pageTitle");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("pageDescription"));
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    const active = btn.dataset.lang === state.prefs.language;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

export function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.innerHTML = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  if (state.mode !== "numbers") {
    el.entriesInput.placeholder = t(
      state.mode === "names" ? "namesPlaceholder" : "itemsPlaceholder",
    );
  }
  el.rollingDisplay.textContent =
    state.results.length === 0
      ? t("rollingReady")
      : `${t("finalSelection")}: ${state.results.join(" · ")}`;
  applyTheme();
  applyLanguage();
}

export function toggleTheme() {
  state.prefs.theme = state.prefs.theme === "dark" ? "light" : "dark";
  savePreferences(state.prefs);
  applyTheme();
}
