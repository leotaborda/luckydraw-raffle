import { state } from "./state.js";
import { el } from "./dom.js";
import { t } from "./i18n.js";

export function readSettings() {
  const winnerCount = Number(el.winnerCount.value);
  if (!Number.isInteger(winnerCount) || winnerCount < 1) throw new Error(t("errorWinnerCount"));
  return {
    mode: state.mode,
    winnerCount,
    allowRepeats: el.allowRepeats.checked,
    animateDraw: el.animateDraw.checked,
    source: state.mode === "numbers" ? readNumberSettings() : readTextEntries(),
  };
}

export function readTextEntries() {
  const items = el.entriesInput.value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!items.length) throw new Error(t("errorEntries"));
  return items;
}

export function readNumberSettings() {
  const min = Number(el.minNumber.value),
    max = Number(el.maxNumber.value),
    step = Number(el.numberStep.value);
  if (![min, max, step].every(Number.isFinite)) throw new Error(t("errorNumberValues"));
  if (step <= 0) throw new Error(t("errorStep"));
  if (max < min) throw new Error(t("errorMaxMin"));
  return { min, max, step };
}

export function buildPool(settings) {
  const pool =
    settings.mode === "numbers"
      ? buildNumberPool(settings.source.min, settings.source.max, settings.source.step)
      : settings.source;
  if (!pool.length) throw new Error(t("errorEmptyPool"));
  if (!settings.allowRepeats && settings.winnerCount > pool.length)
    throw new Error(t("errorWinnersExceed"));
  return pool;
}

export function buildNumberPool(min, max, step) {
  const pool = [];
  for (let v = min; v <= max; v += step) pool.push(String(v));
  return pool;
}

export function pickWinners(pool, count, allowRepeats) {
  const picks = [],
    available = [...pool];
  for (let i = 0; i < count; i++) {
    const src = allowRepeats ? pool : available;
    const idx = Math.floor(Math.random() * src.length);
    picks.push(src[idx]);
    if (!allowRepeats) available.splice(idx, 1);
  }
  return picks;
}
