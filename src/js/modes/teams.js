import { state } from "../state.js";
import { t } from "../i18n.js";
import { escHtml, setStatus, shuffle } from "../helpers.js";
import { TEAM_COLORS } from "../constants.js";
import { launchConfetti } from "../animation.js";
import { runCountdown } from "../countdown.js";

export async function drawTeams() {
  const statusEl = document.getElementById("teamsStatus");
  const resultEl = document.getElementById("teamsResult");
  const teamsCount = Math.max(2, Number.parseInt(document.getElementById("teamsCount").value, 10) || 2);
  const participants = document
    .getElementById("teamsInput")
    .value.split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (participants.length < 2) {
    setStatus(statusEl, t("teamsErrorMin"), true);
    return;
  }
  if (teamsCount >= participants.length) {
    setStatus(statusEl, t("teamsErrorCount"), true);
    return;
  }

  const useCountdown = document.getElementById("teamsCountdown")?.checked;
  if (useCountdown) await runCountdown();

  setStatus(statusEl, t("teamsStatusOk"), false);
  const teams = Array.from({ length: teamsCount }, () => []);
  shuffle(participants).forEach((p, i) => teams[i % teamsCount].push(p));

  resultEl.innerHTML = teams
    .map((members, i) => {
      const c = TEAM_COLORS[i % TEAM_COLORS.length];
      const suffix = members.length > 1 ? "s" : "";
      const label =
        state.prefs.language === "pt-BR"
          ? `${members.length} pessoa${suffix}`
          : `${members.length} member${suffix}`;
      return `<div class="team-card" style="--team-index:${i}">
        <div class="team-header" style="background:${c.light}">
          <span class="team-dot" style="background:${c.bg}"></span>
          <span class="team-name">${escHtml(t("teamsTeamName", { n: i + 1 }))}</span>
          <span class="team-count">${label}</span>
        </div>
        <div class="team-members">
          ${members.map((m) => `<span class="team-member-chip" style="border-color:${c.bg}33">${escHtml(m)}</span>`).join("")}
        </div>
      </div>`;
    })
    .join("");
  launchConfetti();
}

export function resetTeams() {
  document.getElementById("teamsInput").value = "";
  document.getElementById("teamsCount").value = "2";
  document.getElementById("teamsResult").innerHTML = "";
  document.getElementById("teamsStatus").textContent = "";
}
