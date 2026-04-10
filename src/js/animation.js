import { state } from "./state.js";
import { el } from "./dom.js";
import { t } from "./i18n.js";

export function animateRolling(pool, finalResults) {
  return new Promise((resolve) => {
    const duration = 1400,
      start = performance.now();
    el.rollingDisplay.classList.add("animating");

    const tick = (ts) => {
      const elapsed = ts - start;
      const preview = Array.from(
        { length: Math.min(3, finalResults.length || 1) },
        () => pool[Math.floor(Math.random() * pool.length)],
      );
      el.rollingDisplay.textContent = `${t("rollingDraw")}: ${preview.join(" · ")}`;

      if (elapsed < duration) {
        state.animFrame = requestAnimationFrame(tick);
      } else {
        el.rollingDisplay.classList.remove("animating");
        el.rollingDisplay.textContent = `${t("finalSelection")}: ${finalResults.join(" · ")}`;
        stopAnimation();
        resolve();
      }
    };
    state.animFrame = requestAnimationFrame(tick);
  });
}

export function stopAnimation() {
  if (state.animFrame) {
    cancelAnimationFrame(state.animFrame);
    state.animFrame = null;
  }
}

export function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const COLORS = ["#f59e0b", "#fbbf24", "#fde68a", "#ffffff", "#d97706", "#34d399", "#60a5fa"];
  let animId;
  const pieces = Array.from({ length: 75 }, () => ({
    x: Math.random() * canvas.width,
    y: -8 - Math.random() * 50,
    w: 5 + Math.random() * 6,
    h: 8 + Math.random() * 7,
    r: Math.random() * Math.PI * 2,
    dr: (Math.random() - 0.5) * 0.18,
    dx: (Math.random() - 0.5) * 2,
    dy: 1.8 + Math.random() * 2.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 1,
  }));

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach((p) => {
      if (p.y > canvas.height + 20) return;
      alive = true;
      p.x += p.dx;
      p.y += p.dy;
      p.r += p.dr;
      if (p.y > canvas.height * 0.6) p.opacity = Math.max(0, p.opacity - 0.013);
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    if (alive) {
      animId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  cancelAnimationFrame(animId);
  tick();
}

export function initBackground() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const COUNT = 40;
  const shapes = [];
  let mx = -9999, my = -9999;

  const DOT_MAP = {
    1: [[0, 0]],
    2: [[-0.38, -0.38], [0.38, 0.38]],
    3: [[-0.38, -0.38], [0, 0], [0.38, 0.38]],
    4: [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]],
    5: [[-0.38, -0.38], [0.38, -0.38], [0, 0], [-0.38, 0.38], [0.38, 0.38]],
    6: [[-0.38, -0.4], [0.38, -0.4], [-0.38, 0], [0.38, 0], [-0.38, 0.4], [0.38, 0.4]],
  };

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }

  function makeShape() {
    const vx = (Math.random() - 0.5) * 0.25,
      vy = (Math.random() - 0.5) * 0.25;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 16 + Math.random() * 34,
      face: Math.ceil(Math.random() * 6),
      angle: Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 0.005,
      vx, vy, bvx: vx, bvy: vy,
      accent: Math.random() < 0.22,
      opacity: 0.05 + Math.random() * 0.06,
    };
  }

  function drawShape(s) {
    const { x, y, size, face, angle, opacity, accent } = s;
    const h = size / 2, r = size * 0.17;
    const isLight = document.documentElement.dataset.theme === "light";
    let color;
    if (accent) {
      color = isLight ? "rgba(180,83,9,0.7)" : "rgba(245,158,11,0.7)";
    } else {
      color = isLight ? "rgba(10,10,24,0.6)" : "rgba(255,255,255,0.65)";
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(-h + r, -h);
    ctx.lineTo(h - r, -h);
    ctx.arcTo(h, -h, h, -h + r, r);
    ctx.lineTo(h, h - r);
    ctx.arcTo(h, h, h - r, h, r);
    ctx.lineTo(-h + r, h);
    ctx.arcTo(-h, h, -h, h - r, r);
    ctx.lineTo(-h, -h + r);
    ctx.arcTo(-h, -h, -h + r, -h, r);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = color;
    (DOT_MAP[face] || DOT_MAP[1]).forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px * size * 0.52, py * size * 0.52, size * 0.062, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach((s) => {
      const dx = s.x - mx, dy = s.y - my;
      const d2 = dx * dx + dy * dy, rep = 130;
      if (d2 < rep * rep && d2 > 1) {
        const d = Math.sqrt(d2), f = ((rep - d) / rep) * 0.32;
        s.vx += (dx / d) * f;
        s.vy += (dy / d) * f;
      }
      s.vx += (s.bvx - s.vx) * 0.04;
      s.vy += (s.bvy - s.vy) * 0.04;
      const spd = Math.hypot(s.vx, s.vy);
      if (spd > 2.8) { s.vx = (s.vx / spd) * 2.8; s.vy = (s.vy / spd) * 2.8; }
      s.x += s.vx;
      s.y += s.vy;
      s.angle += s.rotSpd;
      const p = s.size;
      if (s.x < -p) s.x = canvas.width + p;
      else if (s.x > canvas.width + p) s.x = -p;
      if (s.y < -p) s.y = canvas.height + p;
      else if (s.y > canvas.height + p) s.y = -p;
      drawShape(s);
    });
    requestAnimationFrame(tick);
  }

  resize();
  addEventListener("resize", resize);
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  for (let i = 0; i < COUNT; i++) shapes.push(makeShape());
  tick();
}
