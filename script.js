const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const playerNameElement = document.getElementById("player-name");
const overlayElement = document.getElementById("overlay");
const overlayTextElement = document.getElementById("overlay-text");
const startOverlayElement = document.getElementById("start-overlay");
const restartButton = document.getElementById("restart-button");
const setupForm = document.getElementById("setup-form");
const nicknameInput = document.getElementById("nickname-input");
const snakeColorInput = document.getElementById("snake-color-input");
const themeSelect = document.getElementById("theme-select");
const themePillElement = document.getElementById("theme-pill");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const initialTickMs = 180;
const minimumTickMs = 80;
const speedStepMs = 12;
const fruitsPerLevel = 3;
const storageKey = "snake-game-settings";

let snake;
let direction;
let nextDirection;
let fruit;
let score;
let gameOver;
let loopId;
let sessionStarted = false;
let playerName = "Guest";
let snakeColor = "#7bc96f";
let activeTheme = "light";

function loadSettings() {
    const rawSettings = window.localStorage.getItem(storageKey);

    if (!rawSettings) {
        return;
    }

    try {
        const parsedSettings = JSON.parse(rawSettings);

        if (typeof parsedSettings.nickname === "string") {
            playerName = parsedSettings.nickname.trim() || "Guest";
        }

        if (typeof parsedSettings.snakeColor === "string" && /^#[0-9a-f]{6}$/i.test(parsedSettings.snakeColor)) {
            snakeColor = parsedSettings.snakeColor;
        }

        if (parsedSettings.theme === "dark" || parsedSettings.theme === "light") {
            activeTheme = parsedSettings.theme;
        }
    } catch {
        window.localStorage.removeItem(storageKey);
    }
}

function saveSettings() {
    window.localStorage.setItem(
        storageKey,
        JSON.stringify({
            nickname: playerName,
            snakeColor,
            theme: activeTheme,
        })
    );
}

function syncFormWithSettings() {
    nicknameInput.value = playerName === "Guest" ? "" : playerName;
    snakeColorInput.value = snakeColor;
    themeSelect.value = activeTheme;
}

function applyTheme() {
    document.body.dataset.theme = activeTheme;
    themePillElement.textContent = activeTheme === "dark" ? "Dark Mode" : "Light Mode";
}

function updatePlayerName() {
    playerNameElement.textContent = playerName;
}

function syncSnakeAccent() {
    document.documentElement.style.setProperty("--snake-body", snakeColor);
    const [red, green, blue] = hexToRgb(snakeColor);
    document.documentElement.style.setProperty("--accent-rgb", `${red}, ${green}, ${blue}`);
}

function resetGame() {
    snake = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    fruit = spawnFruit();

    updateHud();
    hideOverlay();
    draw();
    startLoop();
}

function startLoop() {
    if (loopId) {
        window.clearTimeout(loopId);
    }

    const tick = () => {
        advanceGame();
        draw();

        if (!gameOver) {
            loopId = window.setTimeout(tick, getCurrentTickMs());
        }
    };

    loopId = window.setTimeout(tick, getCurrentTickMs());
}

function getCurrentTickMs() {
    const level = Math.floor(score / fruitsPerLevel);
    return Math.max(minimumTickMs, initialTickMs - level * speedStepMs);
}

function getDisplayLevel() {
    return Math.floor(score / fruitsPerLevel) + 1;
}

function advanceGame() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
    };

    if (hitWall(head) || hitSnake(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === fruit.x && head.y === fruit.y) {
        score += 1;
        fruit = spawnFruit();
        updateHud();
        return;
    }

    snake.pop();
}

function hitWall(segment) {
    return (
        segment.x < 0 ||
        segment.y < 0 ||
        segment.x >= tileCount ||
        segment.y >= tileCount
    );
}

function hitSnake(segment) {
    return snake.some((bodyPart) => bodyPart.x === segment.x && bodyPart.y === segment.y);
}

function spawnFruit() {
    let candidate;

    do {
        candidate = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
        };
    } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));

    return candidate;
}

function endGame() {
    gameOver = true;
    if (loopId) {
        window.clearTimeout(loopId);
    }
    overlayTextElement.textContent = `Final score: ${score}. Press Enter or use the restart button.`;
    overlayElement.classList.remove("hidden");
}

function hideOverlay() {
    overlayElement.classList.add("hidden");
}

function updateHud() {
    scoreElement.textContent = String(score);
    levelElement.textContent = String(getDisplayLevel());
}

function draw() {
    drawBoard();
    drawFruit();
    drawSnake();
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const boardGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    boardGradient.addColorStop(0, shiftColor(getCssVariable("--board"), 18));
    boardGradient.addColorStop(0.48, getCssVariable("--board"));
    boardGradient.addColorStop(1, shiftColor(getCssVariable("--board"), -12));
    context.fillStyle = boardGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const glow = context.createRadialGradient(
        canvas.width * 0.22,
        canvas.height * 0.18,
        0,
        canvas.width * 0.22,
        canvas.height * 0.18,
        canvas.width * 0.55
    );
    glow.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = getCssVariable("--grid");
    context.lineWidth = 1;

    for (let index = 1; index < tileCount; index += 1) {
        const position = index * gridSize;
        context.beginPath();
        context.moveTo(position, 0);
        context.lineTo(position, canvas.height);
        context.stroke();

        context.beginPath();
        context.moveTo(0, position);
        context.lineTo(canvas.width, position);
        context.stroke();
    }

    context.strokeStyle = "rgba(255, 255, 255, 0.08)";
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const inset = index === 0 ? 2 : 3;
        const x = segment.x * gridSize + inset;
        const y = segment.y * gridSize + inset;
        const size = gridSize - inset * 2;
        const radius = index === 0 ? 7 : 6;
        const baseColor = index === 0 ? getSnakeHeadColor() : snakeColor;
        const shadowColor = `rgba(${hexToRgbString(snakeColor)}, ${index === 0 ? 0.32 : 0.2})`;
        const fillGradient = context.createLinearGradient(x, y, x, y + size);

        fillGradient.addColorStop(0, shiftColor(baseColor, 42));
        fillGradient.addColorStop(0.5, baseColor);
        fillGradient.addColorStop(1, shiftColor(baseColor, -18));

        context.save();
        context.shadowColor = shadowColor;
        context.shadowBlur = index === 0 ? 18 : 12;
        context.shadowOffsetY = 4;
        fillRoundedRect(x, y, size, size, radius, fillGradient);
        context.restore();

        context.save();
        context.globalAlpha = 0.38;
        fillRoundedRect(x + 2, y + 2, size - 4, Math.max(4, size * 0.28), radius, "rgba(255, 255, 255, 0.58)");
        context.restore();

        if (index === 0) {
            drawHeadDetails(x, y, size);
        }
    });
}

function drawFruit() {
    const centerX = fruit.x * gridSize + gridSize / 2;
    const centerY = fruit.y * gridSize + gridSize / 2;
    const radius = gridSize * 0.34;
    const fruitGradient = context.createRadialGradient(
        centerX - 3,
        centerY - 4,
        2,
        centerX,
        centerY,
        radius + 4
    );

    fruitGradient.addColorStop(0, shiftColor(getCssVariable("--fruit"), 52));
    fruitGradient.addColorStop(0.55, getCssVariable("--fruit"));
    fruitGradient.addColorStop(1, shiftColor(getCssVariable("--fruit"), -24));

    context.save();
    context.shadowColor = getCssVariable("--fruit-glow");
    context.shadowBlur = 18;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fillStyle = fruitGradient;
    context.fill();
    context.restore();

    context.fillStyle = "rgba(255, 241, 230, 0.8)";
    context.beginPath();
    context.arc(centerX - 4, centerY - 5, gridSize * 0.09, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#92d46b";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(centerX + 1, centerY - radius + 3);
    context.quadraticCurveTo(centerX + 5, centerY - radius - 6, centerX + 9, centerY - radius - 1);
    context.stroke();
}

function getSnakeHeadColor() {
    const [red, green, blue] = hexToRgb(snakeColor);
    const highlight = 64;

    return `rgb(${Math.min(255, red + highlight)}, ${Math.min(255, green + highlight)}, ${Math.min(255, blue + highlight)})`;
}

function hexToRgb(hexColor) {
    const normalized = hexColor.replace("#", "");
    return [
        Number.parseInt(normalized.slice(0, 2), 16),
        Number.parseInt(normalized.slice(2, 4), 16),
        Number.parseInt(normalized.slice(4, 6), 16),
    ];
}

function getCssVariable(variableName) {
    return window.getComputedStyle(document.body).getPropertyValue(variableName).trim();
}

function hexToRgbString(hexColor) {
    return hexToRgb(hexColor).join(", ");
}

function shiftColor(color, amount) {
    if (color.startsWith("#")) {
        const [red, green, blue] = hexToRgb(color);
        return `rgb(${clampColor(red + amount)}, ${clampColor(green + amount)}, ${clampColor(blue + amount)})`;
    }

    const matches = color.match(/\d+(\.\d+)?/g);

    if (!matches || matches.length < 3) {
        return color;
    }

    const [red, green, blue] = matches.slice(0, 3).map(Number);
    return `rgb(${clampColor(red + amount)}, ${clampColor(green + amount)}, ${clampColor(blue + amount)})`;
}

function clampColor(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

function fillRoundedRect(x, y, width, height, radius, fillStyle) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    context.fillStyle = fillStyle;
    context.fill();
}

function drawHeadDetails(x, y, size) {
    const eyeY = y + size * 0.36;
    const leftEyeX = x + size * 0.34;
    const rightEyeX = x + size * 0.66;

    context.fillStyle = "#04101b";
    context.beginPath();
    context.arc(leftEyeX, eyeY, 1.5, 0, Math.PI * 2);
    context.arc(rightEyeX, eyeY, 1.5, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(4, 16, 27, 0.46)";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(x + size * 0.5, y + size * 0.54);
    context.lineTo(x + size * 0.5, y + size * 0.76);
    context.stroke();
}

function isReverseDirection(proposedDirection) {
    return (
        proposedDirection.x === -direction.x &&
        proposedDirection.y === -direction.y
    );
}

function isTypingTarget(target) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    const tagName = target.tagName;

    return (
        target.isContentEditable ||
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        tagName === "BUTTON"
    );
}

function handleDirectionChange(event) {
    if (!sessionStarted) {
        return;
    }

    if (isTypingTarget(event.target)) {
        return;
    }

    const key = event.key.toLowerCase();
    let proposedDirection = null;

    if (key === "arrowup" || key === "w") {
        proposedDirection = { x: 0, y: -1 };
    } else if (key === "arrowdown" || key === "s") {
        proposedDirection = { x: 0, y: 1 };
    } else if (key === "arrowleft" || key === "a") {
        proposedDirection = { x: -1, y: 0 };
    } else if (key === "arrowright" || key === "d") {
        proposedDirection = { x: 1, y: 0 };
    } else if ((key === "enter" || key === " ") && gameOver) {
        resetGame();
        return;
    } else {
        return;
    }

    event.preventDefault();

    if (!proposedDirection || isReverseDirection(proposedDirection)) {
        return;
    }

    nextDirection = proposedDirection;
}

function startSession(event) {
    event.preventDefault();

    const submittedNickname = nicknameInput.value.trim();

    if (!submittedNickname) {
        nicknameInput.focus();
        nicknameInput.reportValidity();
        return;
    }

    playerName = submittedNickname;
    snakeColor = snakeColorInput.value;
    activeTheme = themeSelect.value === "dark" ? "dark" : "light";
    sessionStarted = true;

    saveSettings();
    applyTheme();
    syncSnakeAccent();
    updatePlayerName();
    startOverlayElement.classList.add("hidden");
    resetGame();
}

function previewTheme(event) {
    activeTheme = event.target.value === "dark" ? "dark" : "light";
    applyTheme();
    saveSettings();

    if (sessionStarted) {
        draw();
    }
}

function updateSnakeColor(event) {
    snakeColor = event.target.value;
    syncSnakeAccent();
    saveSettings();

    if (sessionStarted) {
        draw();
    }
}

function handleRestart() {
    if (!sessionStarted) {
        nicknameInput.focus();
        return;
    }

    resetGame();
}

loadSettings();
applyTheme();
syncSnakeAccent();
updatePlayerName();
syncFormWithSettings();

document.addEventListener("keydown", handleDirectionChange);
restartButton.addEventListener("click", handleRestart);
setupForm.addEventListener("submit", startSession);
themeSelect.addEventListener("change", previewTheme);
snakeColorInput.addEventListener("change", updateSnakeColor);
