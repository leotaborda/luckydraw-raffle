import { state, elimState } from "./state.js";
import { el } from "./dom.js";
import { t } from "./i18n.js";
import { HISTORY_MODES } from "./constants.js";
import { renderHistory } from "./history.js";
import { clearStatus } from "./ui.js";
import { stopTimer } from "./modes/timer.js";

export function setMode(mode) {
  state.mode = mode;
  updateModeUI();
  clearStatus();
  if (mode !== "timer") stopTimer();

  const classicModes = new Set(["names", "numbers", "items"]);
  document.getElementById("classicModes").classList.toggle("hidden", !classicModes.has(mode));
  document.getElementById("teamsMode").classList.toggle("hidden", mode !== "teams");
  document.getElementById("coinMode").classList.toggle("hidden", mode !== "coin");
  document.getElementById("lettersMode").classList.toggle("hidden", mode !== "letters");
  document.getElementById("wheelMode").classList.toggle("hidden", mode !== "wheel");
  document.getElementById("orderMode").classList.toggle("hidden", mode !== "order");
  document.getElementById("timerMode").classList.toggle("hidden", mode !== "timer");
  document.getElementById("loadSampleBtn").style.visibility =
    classicModes.has(mode) ? "visible" : "hidden";

  if (HISTORY_MODES.includes(mode) && (state.history[mode]?.length ?? 0) > 0) {
    state.historyTab = mode;
    renderHistory();
  }

  const showElim = mode === "names" || mode === "items";
  el.elimToggleWrap.classList.toggle("hidden", !showElim);
  if (!showElim && el.elimMode.checked) {
    el.elimMode.checked = false;
    resetElimUI();
  }
  updateDrawBtnLabel();
}

function resetElimUI() {
  el.allowRepeats.parentElement.style.opacity = "";
  el.allowRepeats.parentElement.style.pointerEvents = "";
}

export function updateModeUI() {
  const isNumbers = state.mode === "numbers";
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    const active = tab.dataset.mode === state.mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  el.textEntriesGroup.classList.toggle("hidden", isNumbers);
  el.numberEntriesGroup.classList.toggle("hidden", !isNumbers);
  if (!isNumbers) {
    el.entriesInput.placeholder = t(
      state.mode === "names" ? "namesPlaceholder" : "itemsPlaceholder",
    );
  }
}

export function onElimToggle() {
  if (el.elimMode.checked) {
    el.allowRepeats.checked = false;
    el.allowRepeats.parentElement.style.opacity = "0.4";
    el.allowRepeats.parentElement.style.pointerEvents = "none";
  } else {
    resetElimUI();
    import("./draw.js").then(({ resetElim }) => resetElim());
  }
  updateDrawBtnLabel();
}

export function updateDrawBtnLabel() {
  if (el.elimMode?.checked && elimState.active) {
    el.drawBtnLabel.textContent = t("drawBtnElim");
  } else {
    el.drawBtnLabel.textContent = t("drawBtn");
  }
}
