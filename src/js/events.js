import { state } from "./state.js";
import { el } from "./dom.js";
import { t, applyI18n, toggleTheme } from "./i18n.js";
import { savePreferences } from "./storage.js";
import { renderResults, clearStatus, showStatus, copyResults, exportResults, clearResults, clearHistory } from "./ui.js";
import { renderHistory as renderHistoryFn } from "./history.js";
import { renderElimPanel, resetElim, handleDraw, copyElimRanking } from "./draw.js";
import { setMode, onElimToggle } from "./mode.js";
import { syncCoinUI, renderCoinLog, flipCoin, clearCoin } from "./modes/coin.js";
import { syncLetterUI, renderLetterLog, drawLetter, clearLetters } from "./modes/letters.js";
import { buildWheel, spinWheel, clearWheel, copyWheelElimRanking } from "./modes/wheel.js";
import { drawTeams, resetTeams } from "./modes/teams.js";
import { generateOrder, resetOrder, copyOrder } from "./modes/order.js";
import { toggleTimer, resetTimer } from "./modes/timer.js";
import { SAMPLE_DATA } from "./constants.js";

export function bindEvents() {
  document.querySelectorAll(".mode-tab").forEach((tab) =>
    tab.addEventListener("click", () => setMode(tab.dataset.mode)),
  );
  document.querySelectorAll("[data-lang]").forEach((btn) =>
    btn.addEventListener("click", () => handleLangChange(btn.dataset.lang)),
  );

  el.themeToggleBtn.addEventListener("click", toggleTheme);
  el.raffleForm.addEventListener("submit", handleDraw);
  el.elimMode.addEventListener("change", onElimToggle);

  document.getElementById("copyResultsBtn").addEventListener("click", copyResults);
  document.getElementById("exportResultsBtn").addEventListener("click", exportResults);
  document.getElementById("clearResultsBtn").addEventListener("click", clearResults);
  document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);
  document.getElementById("resetFormBtn").addEventListener("click", handleResetForm);
  document.getElementById("loadSampleBtn").addEventListener("click", handleLoadSample);
  document.getElementById("copyElimBtn").addEventListener("click", copyElimRanking);
  document.getElementById("resetElimBtn").addEventListener("click", resetElim);

  document.getElementById("teamsDrawBtn").addEventListener("click", drawTeams);
  document.getElementById("teamsResetBtn").addEventListener("click", resetTeams);

  document.getElementById("coinBtn").addEventListener("click", flipCoin);
  document.getElementById("coinClearBtn").addEventListener("click", clearCoin);

  document.getElementById("letterBtn").addEventListener("click", drawLetter);
  document.getElementById("lettersClearBtn").addEventListener("click", clearLetters);

  document.getElementById("wheelBuildBtn").addEventListener("click", buildWheel);
  document.getElementById("wheelSpinBtn").addEventListener("click", spinWheel);
  document.getElementById("wheelClearBtn").addEventListener("click", clearWheel);
  document.getElementById("wheelElimCopyBtn").addEventListener("click", copyWheelElimRanking);

  document.getElementById("orderDrawBtn").addEventListener("click", generateOrder);
  document.getElementById("orderResetBtn").addEventListener("click", resetOrder);
  document.getElementById("copyOrderBtn").addEventListener("click", copyOrder);

  document.getElementById("timerStartBtn").addEventListener("click", toggleTimer);
  document.getElementById("timerResetBtn").addEventListener("click", resetTimer);
}

function handleLangChange(lang) {
  state.prefs.language = lang;
  savePreferences(state.prefs);
  applyI18n();
  syncCoinUI();
  renderCoinLog();
  syncLetterUI();
  renderLetterLog();
  renderResults();
  renderHistoryFn();
  renderElimPanel();
  clearStatus();
}

function handleResetForm() {
  el.entriesInput.value = "";
  el.minNumber.value = 1;
  el.maxNumber.value = 100;
  el.numberStep.value = 1;
  el.winnerCount.value = 1;
  el.allowRepeats.checked = false;
  el.animateDraw.checked = true;
  el.elimMode.checked = false;
  resetElim();
  setMode("names");
  showStatus(t("formReset"));
}

function handleLoadSample() {
  if (state.mode === "numbers") {
    el.minNumber.value = 10;
    el.maxNumber.value = 80;
    el.numberStep.value = 5;
  } else {
    el.entriesInput.value = (
      state.mode === "names" ? SAMPLE_DATA.names : SAMPLE_DATA.items
    ).join("\n");
  }
  el.winnerCount.value = 1;
  el.allowRepeats.checked = false;
  el.animateDraw.checked = true;
  showStatus(t("sampleLoaded"));
}
