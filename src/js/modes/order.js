import { t } from "../i18n.js";
import { setStatus, shuffle } from "../helpers.js";
import { MEDALS } from "../constants.js";
import { launchConfetti } from "../animation.js";
import { runCountdown } from "../countdown.js";

export async function generateOrder() {
  const statusEl = document.getElementById("orderStatus");
  const resultEl = document.getElementById("orderResult");
  const items = document
    .getElementById("orderInput")
    .value.split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length < 2) {
    setStatus(statusEl, t("orderErrorMin"), true);
    return;
  }

  const useCountdown = document.getElementById("orderCountdown")?.checked;
  if (useCountdown) await runCountdown();

  const shuffled = shuffle(items);
  resultEl.innerHTML = "";
  document.getElementById("orderEmpty")?.classList.add("hidden");

  shuffled.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "order-item";
    li.style.animationDelay = `${i * 42}ms`;
    const badge = document.createElement("span");
    const cls = i < 3 ? ["gold", "silver", "bronze"][i] : "";
    badge.className = `order-badge${cls ? " order-badge--" + cls : ""}`;
    badge.textContent = i < 3 ? MEDALS[i] : String(i + 1);
    const nameEl = document.createElement("span");
    nameEl.className = "order-name";
    nameEl.textContent = item;
    li.append(badge, nameEl);
    resultEl.appendChild(li);
  });

  setStatus(statusEl, t("orderSuccess", { count: shuffled.length }), false);
  launchConfetti();
}

export function resetOrder() {
  document.getElementById("orderInput").value = "";
  document.getElementById("orderResult").innerHTML = "";
  document.getElementById("orderStatus").textContent = "";
  document.getElementById("orderEmpty")?.classList.remove("hidden");
}

export async function copyOrder() {
  const items = Array.from(
    document.getElementById("orderResult").querySelectorAll(".order-item"),
  );
  if (!items.length) return;
  const text = items
    .map((li, i) => `${i + 1}. ${li.querySelector(".order-name")?.textContent ?? ""}`)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    setStatus(document.getElementById("orderStatus"), t("copySuccess"), false);
  } catch {}
}
