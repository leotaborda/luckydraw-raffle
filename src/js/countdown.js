import { el } from "./dom.js";

export function runCountdown() {
  return new Promise((resolve) => {
    const overlay = el.countdownOverlay;
    const numEl = el.countdownNumber;
    const ringFill = el.countdownRingFill;
    const circumference = 283;

    overlay.classList.add("active");

    const steps = [
      { label: "3", isGo: false },
      { label: "2", isGo: false },
      { label: "1", isGo: false },
      { label: "GO!", isGo: true },
    ];

    let i = 0;

    function tick() {
      if (i >= steps.length) {
        overlay.classList.remove("active");
        resolve();
        return;
      }

      const { label, isGo } = steps[i];
      numEl.className = isGo ? "countdown-number go" : "countdown-number pop";
      numEl.textContent = label;

      if (isGo) {
        ringFill.style.transition = "none";
        ringFill.style.strokeDashoffset = String(circumference);
      } else {
        ringFill.style.transition = "none";
        ringFill.style.strokeDashoffset = "0";
        ringFill.getBoundingClientRect();
        ringFill.style.transition = "stroke-dashoffset 950ms linear";
        ringFill.style.strokeDashoffset = String(circumference);
      }

      i++;
      setTimeout(tick, isGo ? 600 : 1000);
    }

    tick();
  });
}
