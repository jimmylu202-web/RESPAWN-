const cardData = window.respawnCardData || [
  {
    title: "SUPPLY BOX",
    subtitle: "TACTICAL PACKAGE / 001",
    text: "战术补给盒载入中。黑色机能包装与荧光标识构成 RESPAWN 复活点系统。",
    image: "card-image-box.png"
  },
  {
    title: "SYSTEM RECOVERY",
    subtitle: "ENERGY DRINK / 002",
    text: "LOAD. MIX. RESPAWN. 深夜疲惫进入低电量状态时，能量补给核心开始恢复。",
    image: "card-image-cup.png"
  },
  {
    title: "ENERGY RELOAD",
    subtitle: "FUNCTION / 003",
    text: "功能性咖啡冲剂被包装成一种能量补给道具，适合深夜设计师、玩家和程序员。",
    image: "card-image-sachet.png"
  },
  {
    title: "ACCESS LEVEL",
    subtitle: "CLEARANCE / 004",
    text: "玩家通行证与品牌识别模块。将游戏系统语言转化为现实补给体验。",
    image: "card-image-access.png"
  },
  {
    title: "NO GAME OVER",
    subtitle: "RESPAWN CASE / 005",
    text: "你看到的是一个空间化作品墙，卡片不是平铺，而是像漂浮在游戏系统界面里的任务面板。",
    image: "respawn-product-scene.png"
  },
  {
    title: "RESPAWN READY",
    subtitle: "MIDNIGHT MODE / 006",
    text: "品牌故事从低电量状态开始，进入补给、加载、重启的完整过程。",
    video: "respawn-bg-clean.mp4"
  }
];

const root = document.documentElement;
const deck = document.getElementById("cardsDeck");
const currentCard = document.getElementById("currentCard");
const totalCards = document.getElementById("totalCards");
const progressReadout = document.querySelector(".progress-readout");
const canvas = document.getElementById("particleField");
const ctx = canvas.getContext("2d");

let activeIndex = 0;
let isAnimating = false;
let width = 0;
let height = 0;
let ratio = 1;
let particles = [];
let pointer = { x: 0.55, y: 0.45, tx: 0.55, ty: 0.45 };

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderMedia(card) {
  if (card.video) {
    return `<video src="${card.video}" autoplay muted loop playsinline aria-label="${escapeHtml(card.title)}"></video>`;
  }
  return `<img src="${card.image}" alt="${escapeHtml(card.title)}">`;
}

function renderCards() {
  deck.innerHTML = cardData.map((card, index) => `
    <article class="card" data-card-index="${index}">
      <div class="card-media">
        ${renderMedia(card)}
      </div>
      <div class="card-body">
        <small>${escapeHtml(card.subtitle)}</small>
        <h2>${escapeHtml(card.title)}</h2>
        <p>${escapeHtml(card.text)}</p>
      </div>
    </article>
  `).join("");
  totalCards.textContent = String(cardData.length).padStart(2, "0");
  updateCards();
}

function getSlot(relative) {
  const direction = Math.sign(relative);
  const distance = Math.abs(relative);

  if (distance === 0) {
    return {
      x: 0,
      y: -10,
      z: 240,
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      opacity: 1,
      blur: 0,
      brightness: 1.04,
      zIndex: 20
    };
  }

  if (distance === 1) {
    return {
      x: direction * 420,
      y: 8,
      z: 36,
      scale: 0.78,
      rotateY: direction * -32,
      rotateX: 2,
      opacity: 0.66,
      blur: 0.4,
      brightness: 0.82,
      zIndex: 12
    };
  }

  if (distance === 2) {
    return {
      x: direction * 590,
      y: 86,
      z: -190,
      scale: 0.58,
      rotateY: direction * -48,
      rotateX: 5,
      opacity: 0.34,
      blur: 1.3,
      brightness: 0.66,
      zIndex: 8
    };
  }

  return {
    x: direction * 720,
    y: 160,
    z: -330,
    scale: 0.42,
    rotateY: direction * -58,
    rotateX: 7,
    opacity: 0,
    blur: 2.2,
    brightness: 0.52,
    zIndex: 1
  };
}

function updateCards() {
  const cards = Array.from(deck.querySelectorAll(".card"));
  cards.forEach((card, index) => {
    const relative = index - activeIndex;
    const slot = getSlot(relative);
    card.classList.toggle("is-active", index === activeIndex);
    card.style.setProperty("--x", `${slot.x}px`);
    card.style.setProperty("--y", `${slot.y}px`);
    card.style.setProperty("--z", `${slot.z}px`);
    card.style.setProperty("--scale", slot.scale);
    card.style.setProperty("--rotate-y", `${slot.rotateY}deg`);
    card.style.setProperty("--rotate-x", `${slot.rotateX}deg`);
    card.style.setProperty("--opacity", slot.opacity);
    card.style.setProperty("--blur", `${slot.blur}px`);
    card.style.setProperty("--brightness", slot.brightness);
    card.style.setProperty("--z-index", slot.zIndex);
  });

  currentCard.textContent = String(activeIndex + 1).padStart(2, "0");
  progressReadout.style.setProperty("--progress", (activeIndex + 1) / cardData.length);
}

function goToCard(nextIndex) {
  const clampedIndex = Math.max(0, Math.min(cardData.length - 1, nextIndex));
  if (clampedIndex === activeIndex || isAnimating) return;

  activeIndex = clampedIndex;
  isAnimating = true;
  updateCards();
  window.setTimeout(() => {
    isAnimating = false;
  }, 640);
}

function resizeParticles() {
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.round(Math.min(190, Math.max(88, width * height / 13000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 0.8 + 0.2,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.9 + 0.7,
    hue: Math.random() > 0.64 ? 215 : 78
  }));
}

function updatePointer(event) {
  pointer.tx = event.clientX / width;
  pointer.ty = event.clientY / height;
}

function drawParticles() {
  pointer.x += (pointer.tx - pointer.x) * 0.07;
  pointer.y += (pointer.ty - pointer.y) * 0.07;
  const mx = (pointer.x - 0.5) * 2;
  const my = (pointer.y - 0.5) * 2;
  root.style.setProperty("--mx", mx.toFixed(4));
  root.style.setProperty("--my", my.toFixed(4));

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  const px = pointer.x * width;
  const py = pointer.y * height;
  for (const particle of particles) {
    const dx = particle.x - px;
    const dy = particle.y - py;
    const distance = Math.max(Math.hypot(dx, dy), 1);
    const force = Math.max(0, 128 - distance) / 128;

    particle.x += particle.vx + mx * particle.z * 0.36 + (dx / distance) * force * 1.9;
    particle.y += particle.vy + my * particle.z * 0.28 + (dy / distance) * force * 1.9;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    const alpha = 0.18 + particle.z * 0.45 + force * 0.32;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${particle.hue}, 94%, 62%, ${alpha})`;
    ctx.arc(particle.x, particle.y, particle.r * particle.z * (1 + force * 2.2), 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawParticles);
}

window.addEventListener("wheel", (event) => {
  event.preventDefault();
  goToCard(activeIndex + (event.deltaY > 0 ? 1 : -1));
}, { passive: false });

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowRight") goToCard(activeIndex + 1);
  if (event.key === "ArrowUp" || event.key === "ArrowLeft") goToCard(activeIndex - 1);
});

window.addEventListener("resize", () => {
  resizeParticles();
  updateCards();
});
window.addEventListener("pointermove", updatePointer);

renderCards();
resizeParticles();
drawParticles();
