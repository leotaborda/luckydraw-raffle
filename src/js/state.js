import { loadPreferences, loadHistory } from "./storage.js";

export const state = {
  mode: "names",
  results: [],
  history: loadHistory(),
  historyTab: "names",
  prefs: loadPreferences(),
  drawCount: 0,
  animFrame: null,
};

export const elimState = {
  active: false,
  pool: [],
  ranking: [],
  round: 1,
  original: [],
};

export const coinState = { heads: 0, tails: 0, flipping: false, log: [] };
export const letterState = { current: "", log: [], spinning: false };
export const wheelState = { items: [], angle: 0, spinning: false, animId: null, elimLog: [] };
export const timerState = { running: false, duration: 0, remaining: 0, intervalId: null };
