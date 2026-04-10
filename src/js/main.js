import { bindEvents } from "./events.js";
import { applyTheme, applyLanguage, applyI18n } from "./i18n.js";
import { renderHistory } from "./history.js";
import { renderResults, updateDrawBadge, initRipple, initReveal } from "./ui.js";
import { updateModeUI } from "./mode.js";
import { initBackground } from "./animation.js";
import { initBanner, initCookieToast } from "./banner.js";
import { syncCoinUI, renderCoinLog } from "./modes/coin.js";
import { syncLetterUI, renderLetterLog } from "./modes/letters.js";

function init() {
  bindEvents();
  applyTheme();
  applyLanguage();
  renderHistory();
  renderResults();
  updateModeUI();
  applyI18n();
  syncCoinUI();
  renderCoinLog();
  syncLetterUI();
  renderLetterLog();
  initReveal();
  initRipple();
  initBackground();
  updateDrawBadge();
  initBanner();
  initCookieToast();
}

init();
