import { state } from "./state.js";
import { el } from "./dom.js";
import { t } from "./i18n.js";
import { escHtml } from "./helpers.js";
import { HISTORY_MODES, HISTORY_LIMIT } from "./constants.js";
import { saveHistory } from "./storage.js";

const HISTORY_TAB_META = {
  names: { icon: "bi-people-fill", i18nLabel: "historyModeNames" },
  numbers: { icon: "bi-hash", i18nLabel: "historyModeNumbers" },
  items: { icon: "bi-list-check", i18nLabel: "historyModeItems" },
  teams: { icon: "bi-diagram-3-fill", i18nLabel: "modeTeams" },
  order: { icon: "bi-list-ol", i18nLabel: "modeOrder" },
  coin: { icon: "bi-circle-half", i18nLabel: "modeCoin" },
  letters: { icon: "bi-type", i18nLabel: "modeLetters" },
  wheel: { icon: "bi-arrow-repeat", i18nLabel: "modeWheel" },
};

export function saveHistoryEntry(settings, results) {
  const pool = buildPoolForHistory(settings);
  const entry = {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mode: settings.mode,
    timestamp: new Date().toISOString(),
    settings: {
      winnerCount: settings.winnerCount,
      allowRepeats: settings.allowRepeats,
      source:
        settings.mode === "numbers"
          ? { kind: "numbers", ...settings.source }
          : { kind: "entries", count: pool.length },
    },
    results,
  };
  const bucket = state.history[settings.mode] ?? [];
  state.history[settings.mode] = [entry, ...bucket].slice(0, HISTORY_LIMIT);
  saveHistory(state.history);
  renderHistory();
}

function buildPoolForHistory(settings) {
  if (settings.mode === "numbers") {
    const { min, max, step } = settings.source;
    const pool = [];
    for (let v = min; v <= max; v += step) pool.push(String(v));
    return pool;
  }
  return settings.source;
}

export function renderHistoryTabs() {
  const tabsEl = document.getElementById("historyTabs");
  if (!tabsEl) return;
  const modesWithEntries = HISTORY_MODES.filter((m) => (state.history[m]?.length ?? 0) > 0);
  if (modesWithEntries.length === 0) {
    tabsEl.innerHTML = "";
    return;
  }
  tabsEl.innerHTML = modesWithEntries
    .map((m) => {
      const meta = HISTORY_TAB_META[m];
      const count = state.history[m].length;
      const active = m === state.historyTab ? " active" : "";
      return `<button class="history-tab${active}" data-history-mode="${m}" role="tab" aria-selected="${m === state.historyTab}">
        <i class="bi ${meta.icon}"></i>
        ${escHtml(t(meta.i18nLabel))}
        <span class="history-tab-count">${count}</span>
      </button>`;
    })
    .join("");
  if (!modesWithEntries.includes(state.historyTab)) {
    state.historyTab = modesWithEntries[0];
  }
  tabsEl.querySelectorAll(".history-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.historyTab = btn.dataset.historyMode;
      renderHistory();
    });
  });
}

export function renderHistory() {
  renderHistoryTabs();
  const entries = state.history[state.historyTab] ?? [];
  const fmt = new Intl.DateTimeFormat(state.prefs.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const modeLabels = {
    names: t("historyModeNames"),
    numbers: t("historyModeNumbers"),
    items: t("historyModeItems"),
    teams: t("modeTeams"),
    order: t("modeOrder"),
    coin: t("modeCoin"),
    letters: t("modeLetters"),
    wheel: t("modeWheel"),
  };

  if (!entries.length) {
    el.historyContainer.className = "history-container empty-state";
    el.historyContainer.innerHTML = `<p>${t("emptyHistory")}</p>`;
    return;
  }
  el.historyContainer.className = "history-container";
  el.historyContainer.innerHTML = entries
    .map(
      (entry, idx) => `
      <article class="history-card" style="--card-index:${idx}">
        <div class="history-header">
          <div>
            <strong>${escHtml(modeLabels[entry.mode] ?? entry.mode)}</strong>
            <div class="history-meta">${fmt.format(new Date(entry.timestamp))}</div>
          </div>
          <div class="history-settings">${escHtml(historySourceSummary(entry))}</div>
        </div>
        <div class="history-settings">${t("historyWinnerLabel", {
          count: entry.settings.winnerCount,
          winnerWord: entry.settings.winnerCount > 1 ? t("winnerPlural") : t("winnerSingular"),
        })} · ${entry.settings.allowRepeats ? t("historyRepeatsAllowed") : t("historyUniqueOnly")}</div>
        <div class="history-winners">${entry.results.map(escHtml).join(" · ")}</div>
      </article>`,
    )
    .join("");
}

function historySourceSummary(entry) {
  const src = entry.settings.source;
  if (src?.kind === "numbers") return t("historySourceNumbers", src);
  if (src?.kind === "entries") return t("historyEntriesCount", { count: src.count });
  return entry.settings.sourceSummary ?? "";
}
