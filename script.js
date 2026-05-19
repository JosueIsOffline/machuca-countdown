// ── CONFIG ──────────────────────────────────────────────
// República Dominicana = UTC-4 (sin horario de verano)
const TARGET_DATE = new Date("2026-06-02T17:30:00-04:00");
const START_DATE = new Date("2026-05-17T00:00:00-04:00");
// ────────────────────────────────────────────────────────

const phrases = [
  "Lo gantel con lo gantel?",
  "Girls and boys",
  "Cinnamon hoy?",
  "Yo soy un pariguayo?",
  "Machuca shuffle",
  "Proveeale",
  "Permitame un minuto para conversar de la biblia con usted",
  "El Anciano",
  "Te gustaria acompañame al salon del reino",
  "Lo pillas?",
  "En bacaneria"
];

const els = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  phrase: document.getElementById("phrase"),
  bar: document.getElementById("progress-bar"),
  glow: document.getElementById("progress-glow"),
  pct: document.getElementById("progress-pct"),
};

let currentIndex = 0;
let typeTimer = null;
let phraseTimer = null;
let isTyping = false;

function pad(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function animateNumber(el, newVal) {
  if (el.textContent === newVal) return;
  gsap.to(el, {
    duration: 0.13,
    y: -16,
    opacity: 0,
    ease: "power2.in",
    onComplete() {
      el.textContent = newVal;
      gsap.fromTo(
        el,
        { y: 16, opacity: 0 },
        { duration: 0.17, y: 0, opacity: 1, ease: "power2.out" },
      );
    },
  });
}

function typeWriter(text, onDone) {
  clearTimeout(typeTimer);
  const el = els.phrase;
  el.textContent = "";
  let i = 0;
  isTyping = true;

  function next() {
    if (i < text.length) {
      el.textContent += text[i++];
      const delay =
        text[i - 1] === "." || text[i - 1] === ","
          ? 180
          : 28 + Math.random() * 22;
      typeTimer = setTimeout(next, delay);
    } else {
      isTyping = false;
      if (onDone) onDone();
    }
  }
  next();
}

function showPhrase(index, immediate = false) {
  clearTimeout(typeTimer);
  const el = els.phrase;
  const total = phrases.length;

  if (immediate) {
    el.textContent = "";
    typeWriter(phrases[index]);
    return;
  }

  gsap.to([el, document.querySelector(".cursor")], {
    duration: 0.3,
    opacity: 0,
    y: -8,
    ease: "power2.in",
    onComplete() {
      gsap.set([el, document.querySelector(".cursor")], { y: 8 });
      gsap.to([el, document.querySelector(".cursor")], {
        duration: 0.25,
        opacity: 1,
        y: 0,
        ease: "power2.out",
      });
      typeWriter(phrases[index]);
    },
  });
}

function nextPhrase() {
  currentIndex = (currentIndex + 1) % phrases.length;
  showPhrase(currentIndex);
}

function updateProgress() {
  const total = TARGET_DATE - START_DATE;
  const elapsed = Date.now() - START_DATE;
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  const str = pct.toFixed(1) + "%";
  els.bar.style.width = str;
  els.glow.style.left = str;
  els.pct.textContent = str;
}

function tick() {
  const diff = TARGET_DATE - Date.now();

  if (diff <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach((k) =>
      animateNumber(els[k], "00"),
    );
    clearTimeout(typeTimer);
    clearInterval(phraseTimer);
    els.phrase.textContent = "";
    typeWriter(
      "¡LIBERTAD ALCANZADA. El contador ha llegado a cero. Que les vaya... bien.",
    );
    els.bar.style.width = "100%";
    els.glow.style.left = "100%";
    els.pct.textContent = "100.0%";
    return;
  }

  animateNumber(els.days, pad(Math.floor(diff / 86400000)));
  animateNumber(els.hours, pad(Math.floor((diff % 86400000) / 3600000)));
  animateNumber(els.minutes, pad(Math.floor((diff % 3600000) / 60000)));
  animateNumber(els.seconds, pad(Math.floor((diff % 60000) / 1000)));
  updateProgress();
}

function init() {
  const tl = gsap.timeline();
  tl.fromTo(
    "header",
    { opacity: 0, y: -24 },
    { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
  )
    .fromTo(
      ".number-box",
      { opacity: 0, scale: 0.88 },
      {
        opacity: 1,
        scale: 1,
        stagger: 0.09,
        duration: 0.45,
        ease: "back.out(1.5)",
      },
      "-=0.2",
    )
    .fromTo(
      ".phrase-section",
      { opacity: 0, x: -18 },
      { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" },
      "-=0.1",
    )
    .fromTo(
      ".progress-section",
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      "-=0.1",
    );

  tl.call(() => showPhrase(0, true));

  tick();
  setInterval(tick, 1000);

  phraseTimer = setInterval(nextPhrase, 7000);
}

document.addEventListener("DOMContentLoaded", init);
