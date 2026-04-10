import { state } from "./state.js";
import { el } from "./dom.js";
import { t } from "./i18n.js";
import { HISTORY_MODES } from "./constants.js";
import { renderHistory } from "./history.js";
import { stopAnimation } from "./animation.js";
import { clearStoredHistory } from "./storage.js";

export function renderResults() {
  if (!state.results.length) {
    el.resultsContainer.className = "results-container empty-state";
    el.resultsContainer.innerHTML = `<p>${t("emptyResults")}</p>`;
    el.rollingDisplay.textContent = t("rollingReady");
    return;
  }
  el.resultsContainer.className = "results-container";
  el.resultsContainer.innerHTML = "";
  state.results.forEach((value, i) => {
    const frag = el.resultCardTpl.content.cloneNode(true);
    const card = frag.querySelector(".result-card");
    card.style.setProperty("--card-index", i);
    frag.querySelector(".result-rank").textContent = t("resultWinnerLabel", { index: i + 1 });
    frag.querySelector(".result-value").textContent = value;
    el.resultsContainer.appendChild(frag);
  });
}

export async function copyResults() {
  if (!state.results.length) {
    showStatus(t("noResultsToCopy"), true);
    return;
  }
  try {
    await navigator.clipboard.writeText(state.results.join("\n"));
    showStatus(t("copySuccess"));
  } catch {
    showStatus(t("copyError"), true);
  }
}

export function exportResults() {
  if (!state.results.length) {
    showStatus(t("noResultsToExport"), true);
    return;
  }
  const content = state.results.map((v, i) => `${i + 1}. ${v}`).join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  Object.assign(document.createElement("a"), {
    href: url,
    download: `sorteio-${new Date().toISOString().slice(0, 10)}.txt`,
  }).click();
  URL.revokeObjectURL(url);
}

export function clearResults() {
  state.results = [];
  stopAnimation();
  el.rollingDisplay.textContent = t("rollingReady");
  renderResults();
  if (!state.elimActive) showStatus(t("resultsCleared"));
}

export function clearHistory() {
  HISTORY_MODES.forEach((m) => { state.history[m] = []; });
  clearStoredHistory();
  renderHistory();
  showStatus(t("historyCleared"));
}

export function showStatus(msg, isError = false) {
  el.statusMessage.textContent = msg;
  el.statusMessage.classList.toggle("error", isError);
  el.statusMessage.classList.toggle("success", !isError && !!msg);
}

export function clearStatus() {
  showStatus("");
}

export function updateDrawBadge() {
  const badge = el.drawCountBadge;
  if (!badge) return;
  badge.textContent = state.drawCount;
  if (state.drawCount > 0) {
    badge.classList.remove("bump");
    badge.getBoundingClientRect();
    badge.classList.add("bump");
  }
}

export function initRipple() {
  document.querySelectorAll(".primary-button").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const ripple = Object.assign(document.createElement("span"), { className: "btn-ripple" });
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });
}

export function initReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((node) => obs.observe(node));
}
