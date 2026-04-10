import { letterState } from "../state.js";
import { t } from "../i18n.js";
import { escHtml } from "../helpers.js";
import { LETTERS } from "../constants.js";
import { showStatus } from "../ui.js";

const ITEM_FACTOR = 0.64;

function reelMeasure(display) {
  const containerH = display.clientHeight || 200;
  const itemH = Math.round(containerH * ITEM_FACTOR);
  const offsetY = Math.round((containerH - itemH) / 2);
  return { itemH, offsetY };
}

function buildSingleReel(reel, display, letter) {
  const { itemH, offsetY } = reelMeasure(display);
  reel.style.transition = "none";
  reel.innerHTML = "";
  const item = document.createElement("span");
  item.className = "letter-reel-item";
  item.style.height = `${itemH}px`;
  item.textContent = letter || "?";
  reel.appendChild(item);
  reel.style.transform = `translateY(${offsetY}px)`;
}

export function syncLetterUI() {
  const display = document.getElementById("letterDisplay");
  const reel = document.getElementById("letterReel");
  if (reel && display && !letterState.spinning) {
    buildSingleReel(reel, display, letterState.current || "?");
  }
  document.getElementById("letterResultText").textContent = letterState.current
    ? t("lettersResult", { letter: letterState.current })
    : t("lettersReady");
  document.getElementById("lettersCount").textContent = String(letterState.log.length);
  document.getElementById("lettersLastValue").textContent = letterState.current || "—";
}

export function drawLetter() {
  const display = document.getElementById("letterDisplay");
  const reel = document.getElementById("letterReel");
  const btn = document.getElementById("letterBtn");
  if (letterState.spinning || !reel || !display) return;

  letterState.spinning = true;
  btn.disabled = true;

  const chosen = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const extraCount = 20;
  const { itemH, offsetY } = reelMeasure(display);

  reel.innerHTML = "";
  reel.style.transition = "none";

  const pool = [chosen];
  for (let i = 0; i < extraCount; i++) {
    pool.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  }
  pool.forEach((letter) => {
    const item = document.createElement("span");
    item.className = "letter-reel-item";
    item.style.height = `${itemH}px`;
    item.textContent = letter;
    reel.appendChild(item);
  });

  reel.style.transform = `translateY(${offsetY - extraCount * itemH}px)`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reel.style.transition = "transform 2.6s cubic-bezier(0.06, 0.85, 0.18, 1)";
      reel.style.transform = `translateY(${offsetY}px)`;
    });
  });

  reel.addEventListener("transitionend", () => {
    buildSingleReel(reel, display, chosen);

    letterState.spinning = false;
    btn.disabled = false;
    letterState.current = chosen;

    const timeStr = new Date().toLocaleTimeString(
      document.documentElement.lang,
      { hour: "2-digit", minute: "2-digit", second: "2-digit" },
    );
    letterState.log.unshift({ letter: chosen, timeStr });
    if (letterState.log.length > 20) letterState.log.pop();

    document.getElementById("letterResultText").textContent = t("lettersResult", { letter: chosen });
    document.getElementById("lettersCount").textContent = String(letterState.log.length);
    document.getElementById("lettersLastValue").textContent = chosen;
    renderLetterLog();
  }, { once: true });
}

export function renderLetterLog() {
  const logEl = document.getElementById("lettersHistory");
  if (!letterState.log.length) {
    logEl.innerHTML = `<p class="empty-hint">${t("lettersEmptyHistory")}</p>`;
    return;
  }
  logEl.innerHTML = letterState.log
    .map(
      (item) => `
      <div class="coin-log-item">
        <span class="coin-log-icon">🔤</span>
        <span class="coin-log-label">${escHtml(item.letter)}</span>
        <span class="coin-log-time">${escHtml(item.timeStr)}</span>
      </div>`,
    )
    .join("");
}

export function clearLetters() {
  const display = document.getElementById("letterDisplay");
  const reel = document.getElementById("letterReel");
  if (reel && display) buildSingleReel(reel, display, "?");
  Object.assign(letterState, { current: "", log: [] });
  syncLetterUI();
  renderLetterLog();
  showStatus(t("lettersCleared"));
}
