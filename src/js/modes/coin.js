import { coinState } from "../state.js";

import { t } from "../i18n.js";
import { escHtml } from "../helpers.js";
import { showStatus } from "../ui.js";

export function syncCoinUI() {
  document.getElementById("coinHeadsCount").textContent = coinState.heads;
  document.getElementById("coinTailsCount").textContent = coinState.tails;
  const resultEl = document.getElementById("coinResultText");
  if (coinState.flipping) {
    resultEl.textContent = "...";
    resultEl.className = "coin-result-text";
    return;
  }
  if (!coinState.log.length) {
    resultEl.textContent = t("coinReady");
    resultEl.className = "coin-result-text";
    return;
  }
  const isHeads = coinState.log[0].isHeads;
  resultEl.textContent = isHeads ? t("coinResultHeads") : t("coinResultTails");
  resultEl.className = `coin-result-text ${isHeads ? "heads" : "tails"}`;
}

export function flipCoin() {
  if (coinState.flipping) return;
  coinState.flipping = true;
  const coinEl = document.getElementById("coinEl");
  const btn = document.getElementById("coinBtn");
  btn.disabled = true;
  syncCoinUI();

  const isHeads = Math.random() < 0.5;
  const totalDeg =
    Math.ceil((1440 + Math.random() * 360) / 360) * 360 + (isHeads ? 0 : 180);
  const duration = 1500 + Math.random() * 400;

  coinEl.style.setProperty("--coin-spins", `${totalDeg}deg`);
  coinEl.style.setProperty("--coin-duration", `${duration}ms`);
  coinEl.classList.remove("flipping");
  coinEl.getBoundingClientRect();
  coinEl.classList.add("flipping");

  setTimeout(() => {
    coinState.flipping = false;
    btn.disabled = false;
    isHeads ? coinState.heads++ : coinState.tails++;
    const timeStr = new Date().toLocaleTimeString(
      document.documentElement.lang,
      { hour: "2-digit", minute: "2-digit", second: "2-digit" },
    );
    coinState.log.unshift({ isHeads, timeStr });
    if (coinState.log.length > 20) coinState.log.pop();
    syncCoinUI();
    renderCoinLog();
  }, duration + 80);
}

export function renderCoinLog() {
  const logEl = document.getElementById("coinHistory");
  if (!coinState.log.length) {
    logEl.innerHTML = `<p class="empty-hint">${t("coinEmptyHistory")}</p>`;
    return;
  }
  logEl.innerHTML = coinState.log
    .map(
      (item) => `
      <div class="coin-log-item">
        <span class="coin-log-icon">${item.isHeads ? "👑" : "⭐"}</span>
        <span class="coin-log-label">${escHtml(item.isHeads ? t("coinResultHeads") : t("coinResultTails"))}</span>
        <span class="coin-log-time">${escHtml(item.timeStr)}</span>
      </div>`,
    )
    .join("");
}

export function clearCoin() {
  if (coinState.flipping) return;
  Object.assign(coinState, { heads: 0, tails: 0, log: [] });
  document.getElementById("coinEl").classList.remove("flipping");
  syncCoinUI();
  renderCoinLog();
  showStatus(t("coinCleared"));
}
