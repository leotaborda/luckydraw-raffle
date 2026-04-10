import { wheelState } from "../state.js";
import { t } from "../i18n.js";
import { setStatus } from "../helpers.js";
import { WHEEL_COLORS, MEDALS } from "../constants.js";
import { launchConfetti } from "../animation.js";

export function buildWheel() {
  const statusEl = document.getElementById("wheelStatus");
  const items = document
    .getElementById("wheelInput")
    .value.split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length < 2) {
    setStatus(statusEl, t("wheelErrorMin"), true);
    return;
  }

  const canvas = document.getElementById("wheelCanvas");
  const size = Math.min(420, Math.round(window.innerWidth * 0.8), 420);
  canvas.width = size;
  canvas.height = size;

  Object.assign(wheelState, { items, angle: 0, elimLog: [] });
  document.getElementById("wheelElimPanel").classList.add("hidden");
  setStatus(statusEl, t("wheelBuilt"), false);
  document.getElementById("wheelSpinBtn").disabled = false;
  const resultEl = document.getElementById("wheelResultText");
  resultEl.textContent = t("wheelReady");
  resultEl.className = "wheel-result-text";
  drawWheelCanvas(0);
}

export function drawWheelCanvas(rotation) {
  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const { items } = wheelState;
  const cx = canvas.width / 2, cy = canvas.height / 2, rad = cx - 8;
  const seg = (Math.PI * 2) / items.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  items.forEach((item, i) => {
    const start = rotation + i * seg, end = start + seg;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rad, start, end);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + seg / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    const fs = Math.max(10, Math.min(15, 250 / items.length));
    ctx.font = `700 ${fs}px "Plus Jakarta Sans", system-ui`;
    ctx.fillText(item.length > 18 ? item.slice(0, 16) + "…" : item, rad - 10, fs / 3);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle = document.documentElement.dataset.theme === "light" ? "#f5f4f0" : "#09090f";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = "var(--ac)";
  ctx.fill();
}

export function spinWheel() {
  if (wheelState.spinning || wheelState.items.length < 2) return;
  wheelState.spinning = true;
  const spinBtn = document.getElementById("wheelSpinBtn");
  const resultEl = document.getElementById("wheelResultText");
  spinBtn.disabled = true;
  resultEl.textContent = t("wheelSpinning");
  resultEl.className = "wheel-result-text";

  const { items } = wheelState;
  const seg = (Math.PI * 2) / items.length;
  const winnerIdx = Math.floor(Math.random() * items.length);
  const extraSpins = (5 + Math.floor(Math.random() * 4)) * Math.PI * 2;
  const midAngle = winnerIdx * seg + seg / 2;
  const totalDelta = extraSpins + (extraSpins - midAngle - (wheelState.angle % (Math.PI * 2)));
  const duration = 3800 + Math.random() * 900;
  const startAngle = wheelState.angle;
  const startTime = performance.now();

  const animate = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    drawWheelCanvas(startAngle + totalDelta * ease);

    if (progress < 1) {
      wheelState.animId = requestAnimationFrame(animate);
      return;
    }

    wheelState.angle = startAngle + totalDelta;
    wheelState.spinning = false;
    resultEl.textContent = t("wheelResult", { name: items[winnerIdx] });
    resultEl.className = "wheel-result-text winner";
    launchConfetti();

    if (document.getElementById("wheelElimMode").checked) {
      wheelState.elimLog.push(items[winnerIdx]);
      wheelState.items = items.filter((_, idx) => idx !== winnerIdx);
      updateWheelElimPanel();

      if (wheelState.items.length >= 2) {
        setTimeout(() => {
          wheelState.angle = 0;
          drawWheelCanvas(0);
          spinBtn.disabled = false;
        }, 1200);
      } else if (wheelState.items.length === 1) {
        wheelState.elimLog.push(wheelState.items[0]);
        wheelState.items = [];
        updateWheelElimPanel();
        resultEl.textContent = t("wheelChampion", { name: wheelState.elimLog[0] });
        resultEl.className = "wheel-result-text champion";
        setTimeout(() => {
          document.getElementById("wheelCanvas").getContext("2d").clearRect(0, 0, 420, 420);
          launchConfetti();
        }, 800);
      }
    } else {
      spinBtn.disabled = false;
    }
  };
  wheelState.animId = requestAnimationFrame(animate);
}

export function clearWheel() {
  Object.assign(wheelState, { items: [], angle: 0, elimLog: [] });
  document.getElementById("wheelCanvas").getContext("2d").clearRect(0, 0, 420, 420);
  document.getElementById("wheelSpinBtn").disabled = true;
  const resultEl = document.getElementById("wheelResultText");
  resultEl.textContent = t("wheelReady");
  resultEl.className = "wheel-result-text";
  document.getElementById("wheelStatus").textContent = "";
  document.getElementById("wheelElimPanel").classList.add("hidden");
  document.getElementById("wheelInput").value = "";
}

export function updateWheelElimPanel() {
  const panel = document.getElementById("wheelElimPanel");
  const list = document.getElementById("wheelElimList");
  if (!wheelState.elimLog.length) {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  list.innerHTML = "";
  const done = !wheelState.items.length;

  wheelState.elimLog.forEach((name, i) => {
    const li = document.createElement("li");
    li.className = `elim-item${i === 0 && done ? " elim-champion" : ""}`;
    li.style.animationDelay = `${i * 45}ms`;

    const badge = document.createElement("span");
    const cls = i < 3 ? ["gold", "silver", "bronze"][i] : "";
    badge.className = `elim-badge${cls ? " elim-badge--" + cls : ""}`;
    badge.textContent = i < 3 ? MEDALS[i] : String(i + 1);

    const nameEl = document.createElement("span");
    nameEl.className = "elim-name";
    nameEl.textContent = name;

    li.append(badge, nameEl);
    list.appendChild(li);
  });
}

export async function copyWheelElimRanking() {
  const items = Array.from(
    document.getElementById("wheelElimList").querySelectorAll(".elim-item"),
  );
  if (!items.length) return;
  const text = items
    .map((li, i) => `${i + 1}. ${li.querySelector(".elim-name")?.textContent ?? ""}`)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
}
