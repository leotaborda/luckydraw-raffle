import { BANNER_KEY, COOKIE_KEY } from "./constants.js";

function cookieStatus() {
  return localStorage.getItem(COOKIE_KEY);
}

function updateHistoryLock() {
  const locked = document.getElementById("historyLocked");
  const content = document.getElementById("historyContent");
  if (!locked || !content) return;
  const accepted = cookieStatus() === "accepted";
  locked.classList.toggle("hidden", accepted);
  content.classList.toggle("hidden", !accepted);
}

function showCookieToast() {
  const toast = document.getElementById("cookieToast");
  if (!toast) return;
  toast.classList.remove("hiding", "hidden");
}

function dismissCookieToast(accepted) {
  const toast = document.getElementById("cookieToast");
  if (!toast) return;
  localStorage.setItem(COOKIE_KEY, accepted ? "accepted" : "declined");
  toast.classList.add("hiding");
  toast.addEventListener("animationend", () => toast.classList.add("hidden"), { once: true });

  const fab = document.getElementById("cookieReopenFab");
  if (fab) fab.classList.toggle("hidden", accepted);

  updateHistoryLock();

  if (accepted) initStarToast();
}

function initStarToast() {
  if (localStorage.getItem(BANNER_KEY) === "1") return;
  const toast = document.getElementById("starToast");
  if (!toast) return;
  setTimeout(() => {
    toast.classList.remove("hidden");
  }, 8000);
  document.getElementById("starToastClose")?.addEventListener("click", () => {
    toast.classList.add("hiding");
    toast.addEventListener("animationend", () => toast.classList.add("hidden"), { once: true });
    localStorage.setItem(BANNER_KEY, "1");
  });
}

export function initBanner() {
}

export function initCookieToast() {
  const status = cookieStatus();

  updateHistoryLock();

  if (!status) {
    showCookieToast();
  } else {
    const toast = document.getElementById("cookieToast");
    if (toast) toast.classList.add("hidden");
    const fab = document.getElementById("cookieReopenFab");
    if (fab) fab.classList.toggle("hidden", status === "accepted");
    if (status === "accepted") initStarToast();
  }

  document.getElementById("cookieAcceptBtn")?.addEventListener("click", () => dismissCookieToast(true));
  document.getElementById("cookieDeclineBtn")?.addEventListener("click", () => dismissCookieToast(false));

  const reopenFab = document.getElementById("cookieReopenFab");
  reopenFab?.addEventListener("click", showCookieToast);

  document.getElementById("reopenCookieBtn")?.addEventListener("click", showCookieToast);
}
