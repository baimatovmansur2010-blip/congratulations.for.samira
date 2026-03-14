let currentScreen = 0;
const totalScreens = 5;

function goTo(n) {
  document.getElementById("screen" + currentScreen).classList.remove("active");
  currentScreen = n;
  document.getElementById("screen" + n).classList.add("active");
  updateDots();
  if (n === 2) initGame();
  if (n === 4) initConfetti();
}

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === currentScreen));
}

const pd = document.getElementById("progressDots");
for (let i = 0; i < totalScreens; i++) {
  const d = document.createElement("div");
  d.className = "dot" + (i === 0 ? " active" : "");
  pd.appendChild(d);
}

const heartEmojis = ["💖", "🌸", "💝", "✨", "🩷", "💕"];
const hc = document.getElementById("heartsContainer");
for (let i = 0; i < 18; i++) {
  const h = document.createElement("div");
  h.className = "floating-heart";
  h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  h.style.left = Math.random() * 100 + "%";
  h.style.fontSize = 14 + Math.random() * 22 + "px";
  h.style.animationDuration = 4 + Math.random() * 6 + "s";
  h.style.animationDelay = Math.random() * 5 + "s";
  hc.appendChild(h);
}

const reasons = [
  {
    icon: "😊",
    title: "Твоя улыбка",
    text: "Когда ты улыбаешься — весь мир становится лучше. Серьёзно, это моя любимая картина во вселенной.",
  },
  {
    icon: "🧠",
    title: "Твой ум",
    text: "Ты умеешь видеть вещи иначе. Разговоры с тобой — это всегда открытие чего-то нового.",
  },
  {
    icon: "🤝",
    title: "Твоя доброта",
    text: "Ты заботишься о людях по-настоящему. Это редкость, и именно за это я тебя обожаю.",
  },
  {
    icon: "🌟",
    title: "Ты вдохновляешь меня",
    text: "Рядом с тобой я хочу быть лучше — в каждом смысле этого слова.",
  },
  {
    icon: "😂",
    title: "Твой смех",
    text: "Твой смех заразительный. Стоит тебе засмеяться — и у меня не остаётся шансов оставаться серьёзным.",
  },
  {
    icon: "💪",
    title: "Твоя сила",
    text: "Ты справляешься со всем так, что я только восхищаюсь. Ты сильнее, чем думаешь.",
  },
];
let openedReasons = 0;
const rl = document.getElementById("reasonsList");
reasons.forEach((r, i) => {
  const card = document.createElement("div");
  card.className = "reason-card";
  card.innerHTML = `
    <div class="reason-header">
      <div class="reason-left">
        <span class="reason-icon">${r.icon}</span>
        <span class="reason-title-text">${r.title}</span>
      </div>
      <span class="reason-arrow" id="arrow${i}">›</span>
    </div>
    <p class="reason-body" id="body${i}">${r.text}</p>`;
  card.onclick = () => {
    const wasOpen = card.classList.contains("open");
    card.classList.toggle("open");
    document.getElementById("arrow" + i).classList.toggle("rotated", !wasOpen);
    if (!wasOpen) {
      openedReasons++;
      if (openedReasons >= 3) {
        document.getElementById("reasonsHint").style.display = "none";
        document.getElementById("reasonsNextBtn").style.display =
          "inline-block";
      }
    }
  };
  rl.appendChild(card);
});

const EMOJIS = ["💖", "🌹", "💌", "🍫", "💍", "🌸"];
const COLS = 6,
  ROWS = 6;
let board = [],
  selected = null,
  score = 0,
  gameWon = false;

function createBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from(
      { length: COLS },
      () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    ),
  );
}

function findMatches(b) {
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS - 2; c++)
      if (b[r][c] === b[r][c + 1] && b[r][c] === b[r][c + 2])
        [c, c + 1, c + 2].forEach((x) => (m[r][x] = true));
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS - 2; r++)
      if (b[r][c] === b[r + 1][c] && b[r][c] === b[r + 2][c])
        [r, r + 1, r + 2].forEach((x) => (m[x][c] = true));
  return m;
}

function removeMatches(b, m) {
  const nb = b.map((r) => [...r]);
  for (let c = 0; c < COLS; c++) {
    let col = [];
    for (let r = 0; r < ROWS; r++) if (!m[r][c]) col.push(nb[r][c]);
    while (col.length < ROWS)
      col.unshift(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    for (let r = 0; r < ROWS; r++) nb[r][c] = col[r];
  }
  return nb;
}

function renderBoard() {
  const gb = document.getElementById("gameBoard");
  gb.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className =
        "cell" +
        (selected && selected[0] === r && selected[1] === c ? " selected" : "");
      cell.textContent = board[r][c];
      cell.onclick = () => handleCell(r, c);
      gb.appendChild(cell);
    }
  }
}

function processBoard() {
  const m = findMatches(board);
  if (!m.some((r) => r.some(Boolean))) return;
  // mark matched
  const gb = document.getElementById("gameBoard");
  const cells = gb.querySelectorAll(".cell");
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (m[r][c]) cells[r * COLS + c].classList.add("matched");
  const cnt = m.flat().filter(Boolean).length;
  score += cnt * 10;
  document.getElementById("scoreBadge").textContent = "⭐ " + score + " / 150";
  if (score >= 150 && !gameWon) {
    gameWon = true;
    setTimeout(() => {
      document.getElementById("winBlock").style.display = "block";
    }, 600);
  }
  setTimeout(() => {
    board = removeMatches(board, m);
    renderBoard();
    setTimeout(processBoard, 100);
  }, 400);
}

function handleCell(r, c) {
  if (gameWon) return;
  if (!selected) {
    selected = [r, c];
    renderBoard();
    return;
  }
  const [sr, sc] = selected;
  if (Math.abs(r - sr) + Math.abs(c - sc) === 1) {
    const nb = board.map((row) => [...row]);
    [nb[r][c], nb[sr][sc]] = [nb[sr][sc], nb[r][c]];
    const m = findMatches(nb);
    if (m.some((row) => row.some(Boolean))) {
      board = nb;
      selected = null;
      renderBoard();
      setTimeout(processBoard, 50);
      return;
    }
  }
  selected = null;
  renderBoard();
}

function initGame() {
  if (board.length > 0) return;
  board = createBoard();
  score = 0;
  gameWon = false;
  renderBoard();
  setTimeout(processBoard, 100);
}

const photos = [
  { src: 'img/bio.img.jpeg', label: "Зоопарк" },
  { src: 'img/us.img.jpg', label: "Мы созданы друг для друга" },
  { src: 'img/culon.img.jpeg', label: "Лучшая парочка" },
  { src: 'img/heart.img.jpeg', label: "Люблю тебя" },
  { src: 'img/heart2.img.jpeg', label: "Всегда буду любить тебя" },
  { src: 'img/wedrink.img.jpeg', label: "Любимый видринк" },
];

const gg = document.getElementById("galleryGrid");
photos.forEach((p) => {
  const card = document.createElement("div");
  card.className = "photo-card";
  card.innerHTML = `
    <div class="photo-placeholder">
      <img src="${p.src}" alt="${p.label}" style="width: 80px; height: 80px; border-radius: 16px; object-fit: cover;">
    </div>
    <span class="photo-label">${p.label}</span>`;
  card.onclick = () => {
    document.getElementById("modalImage").src = p.src;
    document.getElementById("modalLabel").textContent = p.label;
    document.getElementById("photoModal").style.display = "flex";
  };
  gg.appendChild(card);
});

function closeModal() {
  document.getElementById("photoModal").style.display = "none";
}

function initConfetti() {
  const cc = document.getElementById("confettiContainer");
  if (cc.children.length > 0) return;
  const emojis = ["🎊", "🌸", "💖", "✨", "🩷", "🎉"];
  for (let i = 0; i < 30; i++) {
    const c = document.createElement("div");
    c.className = "confetti-piece";
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    c.style.left = Math.random() * 100 + "%";
    c.style.animationDuration = 2 + Math.random() * 3 + "s";
    c.style.animationDelay = Math.random() * 2 + "s";
    cc.appendChild(c);
  }
}