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
  "En bacaneria",
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

  // Primera expulsión después de que cargue la animación de entrada
  setTimeout(ejectCrewmate, 3500);

  // 3 ciclos independientes — cada imagen en su propio ritmo
  stickerLoop("depende.jpg", 16000);
  stickerLoop("uwu.jpg", 18000);
}

// ── EJECCIÓN ─────────────────────────────────────────────
const CREW_IMGS = ["pngwing.com.png", "pngwing2.png", "pngwing3.png"];
let lastImg = null;

function ejectCrewmate() {
  // Evitar repetir el mismo personaje dos veces seguidas
  let src;
  do {
    src = CREW_IMGS[Math.floor(Math.random() * CREW_IMGS.length)];
  } while (src === lastImg && CREW_IMGS.length > 1);
  lastImg = src;

  const el = document.createElement("img");
  el.src = src;
  el.className = "ejected";
  el.alt = "";
  document.querySelector(".crewmates").appendChild(el);

  const goRight = Math.random() > 0.5;
  const yVh = 8 + Math.random() * 72;
  const yDrift = (Math.random() - 0.5) * window.innerHeight * 0.28;
  const dur = 4.5 + Math.random() * 3;
  const spins = (goRight ? 1 : -1) * (3 + Math.random() * 2) * 360;
  const startX = goRight ? -160 : window.innerWidth + 160;
  const endX = goRight ? window.innerWidth + 160 : -160;

  gsap.set(el, {
    top: `${yVh}vh`,
    left: 0,
    x: startX,
    y: 0,
    scale: 1.8,
    opacity: 1,
    rotation: Math.random() * 180,
  });

  gsap.to(el, {
    x: endX,
    y: yDrift,
    rotation: `+=${spins}`,
    scale: 0.5,
    duration: dur,
    ease: "none",
    onComplete() {
      el.remove();
      setTimeout(ejectCrewmate, 12000 + Math.random() * 10000);
    },
  });
}

// ── STICKERS ─────────────────────────────────────────────
function launchSticker(src) {
  const el = document.createElement("img");
  el.src = src;
  el.className = "sticker";
  el.alt = "";
  document.querySelector(".crewmates").appendChild(el);

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const edge = Math.floor(Math.random() * 4);
  let startX, startY, endX, endY;

  if (edge === 0) {
    startX = Math.random() * vw;
    startY = -110;
    endX = Math.random() * vw;
    endY = vh + 110;
  } else if (edge === 1) {
    startX = vw + 110;
    startY = Math.random() * vh;
    endX = -110;
    endY = Math.random() * vh;
  } else if (edge === 2) {
    startX = Math.random() * vw;
    startY = vh + 110;
    endX = Math.random() * vw;
    endY = -110;
  } else {
    startX = -110;
    startY = Math.random() * vh;
    endX = vw + 110;
    endY = Math.random() * vh;
  }

  const mid1X =
    startX + (endX - startX) * 0.32 + (Math.random() - 0.5) * vw * 0.35;
  const mid1Y =
    startY + (endY - startY) * 0.32 + (Math.random() - 0.5) * vh * 0.35;
  const mid2X =
    startX + (endX - startX) * 0.66 + (Math.random() - 0.5) * vw * 0.35;
  const mid2Y =
    startY + (endY - startY) * 0.66 + (Math.random() - 0.5) * vh * 0.35;

  const dur = 14 + Math.random() * 8;
  const tilt = (Math.random() - 0.5) * 30;
  const endTilt = tilt + (Math.random() - 0.5) * 50;

  gsap.set(el, {
    left: 0,
    top: 0,
    x: startX,
    y: startY,
    rotation: tilt,
    scale: 0.85 + Math.random() * 0.35,
    opacity: 1,
  });

  gsap.to(el, {
    keyframes: [
      { x: mid1X, y: mid1Y, duration: dur * 0.35, ease: "sine.inOut" },
      { x: mid2X, y: mid2Y, duration: dur * 0.33, ease: "sine.inOut" },
      { x: endX, y: endY, duration: dur * 0.32, ease: "sine.inOut" },
    ],
    onComplete() {
      el.remove();
    },
  });

  gsap.to(el, {
    rotation: endTilt,
    duration: dur,
    ease: "sine.inOut",
  });
}

// Cada imagen tiene su propio ciclo independiente con intervalo distinto
function stickerLoop(src, baseMs) {
  function cycle() {
    launchSticker(src);
    setTimeout(cycle, baseMs + Math.random() * baseMs);
  }
  // Delay inicial diferente para cada uno — nunca sincrónicos
  setTimeout(cycle, 5000 + Math.random() * baseMs);
}

// ── SPACE LIFE ────────────────────────────────────────────
const spaceBg = () => document.querySelector(".crewmates");

// ── SHOOTING STARS ────────────────────────────────────────
function shootingStar() {
  const el = document.createElement("div");
  el.className = "space-streak";
  const len = 110 + Math.random() * 160;
  const angle = -(8 + Math.random() * 28);
  const startX = Math.random() * window.innerWidth * 0.85;
  const startY = Math.random() * window.innerHeight * 0.55;
  el.style.width = len + "px";
  el.style.background =
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.92) 55%, rgba(255,255,255,0.15))";
  spaceBg().appendChild(el);

  gsap.set(el, { x: startX, y: startY, rotation: angle, opacity: 0, scaleX: 0.15 });
  gsap
    .timeline({ onComplete: () => el.remove() })
    .to(el, { opacity: 1, scaleX: 1, duration: 0.07, ease: "power3.out" })
    .to(el, {
      x: startX + (len + 320) * Math.cos((angle * Math.PI) / 180),
      y: startY + (len + 320) * Math.sin((angle * Math.PI) / 180),
      opacity: 0,
      duration: 0.45 + Math.random() * 0.3,
      ease: "power2.in",
    });
}

function initSpaceLife() {
  (function starLoop() {
    shootingStar();
    setTimeout(starLoop, 5000 + Math.random() * 9000);
  })();
}

// ── STARFIELD ─────────────────────────────────────────────
function initStars() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Generate stars: 160 tiny + 30 slightly bigger
  const stars = [
    ...Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random() * 0.9,
      opacity: 0.3 + Math.random() * 0.6,
    })),
    ...Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 1.2,
      opacity: 0.5 + Math.random() * 0.5,
    })),
  ];

  // Twinkle: GSAP continuously updates each star's opacity
  stars.forEach((s) => {
    gsap.to(s, {
      opacity: Math.random() * 0.25 + 0.05,
      duration: 1.2 + Math.random() * 3.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 5,
    });
  });

  // RAF draw loop
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

document.addEventListener("DOMContentLoaded", () => {
  initStars();
  initSpaceLife();
  init();
});
