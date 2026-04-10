import { timerState } from "../state.js";
import { t } from "../i18n.js";
import { setStatus } from "../helpers.js";
import { launchConfetti } from "../animation.js";

export function toggleTimer() {
  timerState.running ? stopTimer() : startTimer();
}

export function startTimer() {
  const minVal = Math.max(1, Number.parseInt(document.getElementById("timerMin")?.value, 10) || 1);
  const maxVal = Math.max(
    minVal,
    Number.parseInt(document.getElementById("timerMax")?.value, 10) || 60,
  );
  const statusEl = document.getElementById("timerStatus");

  if (minVal > maxVal) {
    setStatus(statusEl, t("timerErrorRange"), true);
    return;
  }

  const seconds = minVal + Math.floor(Math.random() * (maxVal - minVal + 1));
  Object.assign(timerState, { duration: seconds, remaining: seconds, running: true });

  const face = document.getElementById("timerFace");
  const display = document.getElementById("timerDisplay");
  const boom = document.getElementById("timerBoom");
  const label = document.getElementById("timerStartLabel");
  const modeTag = document.getElementById("timerModeTag");
  const hidden = document.getElementById("timerHiddenMode")?.checked ?? true;

  boom.classList.add("hidden");
  display.dataset.state = "running";
  label.textContent = t("timerStopBtn");
  delete label.dataset.i18n;
  modeTag.textContent = hidden ? t("timerModeTagSurprise") : t("timerModeTagNormal");
  setStatus(statusEl, t("timerRunning"), false);
  updateTimerFace(face, timerState.remaining, hidden, timerState.duration);

  timerState.intervalId = setInterval(() => {
    timerState.remaining--;
    if (timerState.remaining <= 0) {
      clearInterval(timerState.intervalId);
      timerState.running = false;
      face.textContent = hidden ? "??:??" : "00:00";
      delete face.dataset.phase;
      display.dataset.state = "done";
      boom.classList.remove("hidden");
      label.dataset.i18n = "timerStartBtn";
      label.textContent = t("timerStartBtn");
      setStatus(statusEl, t("timerDone", { seconds: timerState.duration }), false);
      launchConfetti();
      return;
    }
    updateTimerFace(face, timerState.remaining, hidden, timerState.duration);
  }, 1000);
}

export function stopTimer() {
  if (!timerState.running) return;
  clearInterval(timerState.intervalId);
  timerState.running = false;
  const display = document.getElementById("timerDisplay");
  const label = document.getElementById("timerStartLabel");
  const statusEl = document.getElementById("timerStatus");
  if (display) delete display.dataset.state;
  if (label) {
    label.dataset.i18n = "timerStartBtn";
    label.textContent = t("timerStartBtn");
  }
  if (statusEl) {
    statusEl.textContent = "";
    statusEl.className = "status-message";
  }
}

export function resetTimer() {
  stopTimer();
  Object.assign(timerState, { duration: 0, remaining: 0 });
  const face = document.getElementById("timerFace");
  const display = document.getElementById("timerDisplay");
  const boom = document.getElementById("timerBoom");
  if (face) { face.textContent = "--:--"; delete face.dataset.phase; }
  if (display) delete display.dataset.state;
  if (boom) boom.classList.add("hidden");
}

function updateTimerFace(face, remaining, hidden, total) {
  if (hidden) {
    face.textContent = "??:??";
    face.dataset.phase = "hidden";
    return;
  }
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  face.textContent = `${mm}:${ss}`;
  const pct = remaining / total;
  let phase;
  if (pct > 0.5) phase = "safe";
  else if (pct > 0.25) phase = "warn";
  else phase = "danger";
  face.dataset.phase = phase;
}
