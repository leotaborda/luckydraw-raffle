import { state, elimState } from "./state.js";
import { el } from "./dom.js";
import { t } from "./i18n.js";
import { MEDALS } from "./constants.js";
import { animateRolling, launchConfetti, stopAnimation } from "./animation.js";
import { runCountdown } from "./countdown.js";
import { readSettings, buildPool, pickWinners } from "./settings.js";
import { saveHistoryEntry } from "./history.js";
import { renderResults, showStatus, updateDrawBadge, clearStatus } from "./ui.js";
import { shuffle } from "./helpers.js";
import { updateDrawBtnLabel } from "./mode.js";

export async function handleDraw(e) {
  e.preventDefault();
  clearStatus();

  if (el.elimMode.checked && (state.mode === "names" || state.mode === "items")) {
    if (el.countdownDraw?.checked) await runCountdown();
    await handleElimDraw();
    return;
  }

  stopAnimation();
  try {
    const settings = readSettings();
    const pool = buildPool(settings);
    const results = pickWinners(pool, settings.winnerCount, settings.allowRepeats);

    if (el.countdownDraw?.checked) await runCountdown();

    el.drawBtn.disabled = true;
    el.drawBtnLabel.textContent = t("drawingBtn");

    if (settings.animateDraw) await animateRolling(pool, results);
    else el.rollingDisplay.textContent = `${t("finalSelection")}: ${results.join(" · ")}`;

    state.results = results;
    renderResults();
    saveHistoryEntry(settings, results);
    showStatus(
      t("statusComplete", {
        count: results.length,
        winnerWord: results.length > 1 ? t("winnerPlural") : t("winnerSingular"),
      }),
    );
    state.drawCount++;
    updateDrawBadge();
    launchConfetti();
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    el.drawBtn.disabled = false;
    el.drawBtnLabel.textContent = t("drawBtn");
  }
}

export async function handleElimDraw() {
  if (!elimState.active) {
    const entries = el.entriesInput.value
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (entries.length < 2) {
      showStatus(t("errorEntries"), true);
      return;
    }
    elimState.original = [...entries];
    elimState.pool = shuffle([...entries]);
    elimState.ranking = [];
    elimState.round = 1;
    elimState.active = true;
    el.classicElimPanel.classList.remove("hidden");
  }

  if (!elimState.pool.length) return;

  const winnerCount = Math.min(
    Math.max(1, Number.parseInt(el.winnerCount.value, 10) || 1),
    elimState.pool.length,
  );

  stopAnimation();
  el.drawBtn.disabled = true;
  el.drawBtnLabel.textContent = t("drawingBtn");

  const drawn = [];
  const poolCopy = [...elimState.pool];
  for (let i = 0; i < winnerCount; i++) {
    const idx = Math.floor(Math.random() * poolCopy.length);
    drawn.push(poolCopy.splice(idx, 1)[0]);
  }
  elimState.pool = poolCopy;

  if (el.animateDraw.checked) {
    await animateRolling([...elimState.original], drawn);
  } else {
    el.rollingDisplay.textContent = `${t("finalSelection")}: ${drawn.join(" · ")}`;
  }

  drawn.forEach((name) => elimState.ranking.push(name));
  state.results = drawn;
  renderResults();
  renderElimPanel();

  if (elimState.pool.length === 0) {
    showStatus(t("elimChampionStatus", { name: elimState.ranking.at(-1) }));
    launchConfetti();
    el.drawBtn.disabled = true;
    el.drawBtnLabel.textContent = t("drawBtn");
    return;
  }

  elimState.round++;
  showStatus(t("elimRemainingFmt", { count: elimState.pool.length, round: elimState.round }));
  launchConfetti();
  el.drawBtn.disabled = false;
  updateDrawBtnLabel();
}

export function renderElimPanel() {
  if (!elimState.active || !elimState.ranking.length) {
    el.classicElimPanel.classList.add("hidden");
    return;
  }
  el.classicElimPanel.classList.remove("hidden");

  const reversed = [...elimState.ranking].reverse();
  el.elimRemainingInfo.textContent =
    elimState.pool.length > 0
      ? t("elimRemainingFmt", { count: elimState.pool.length, round: elimState.round })
      : "";

  el.elimRankingList.innerHTML = "";
  reversed.forEach((name, i) => {
    const position = i + 1;
    const isChampion = position === 1 && elimState.pool.length === 0;

    const li = document.createElement("li");
    li.className = `elim-ranking-item${isChampion ? " champion" : ""}`;
    li.style.animationDelay = `${i * 40}ms`;

    const badge = document.createElement("span");
    let cls = "";
    if (position === 1) cls = "gold";
    else if (position === 2) cls = "silver";
    else if (position === 3) cls = "bronze";
    badge.className = cls ? `elim-rank-badge ${cls}` : "elim-rank-badge";
    badge.textContent = position <= 3 ? MEDALS[position - 1] : String(position);

    const nameEl = document.createElement("span");
    nameEl.className = `elim-rank-name${isChampion ? " champion-name" : ""}`;
    nameEl.textContent = name;

    li.append(badge, nameEl);
    el.elimRankingList.appendChild(li);
  });
}

export function resetElim() {
  Object.assign(elimState, { active: false, pool: [], ranking: [], round: 1, original: [] });
  el.classicElimPanel.classList.add("hidden");
  el.allowRepeats.parentElement.style.opacity = "";
  el.allowRepeats.parentElement.style.pointerEvents = "";
  el.drawBtn.disabled = false;
  updateDrawBtnLabel();
  clearStatus();
}

export async function copyElimRanking() {
  const items = Array.from(el.elimRankingList.querySelectorAll(".elim-ranking-item"));
  if (!items.length) return;
  const text = items
    .map((li, i) => `${i + 1}. ${li.querySelector(".elim-rank-name")?.textContent ?? ""}`)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    showStatus(t("copySuccess"));
  } catch {}
}
