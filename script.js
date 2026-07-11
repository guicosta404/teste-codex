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
}

function updatePlayerName() {
    playerNameElement.textContent = playerName;
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
    context.fillStyle = getCssVariable("--board");
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
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const inset = index === 0 ? 2 : 3;
        context.fillStyle = index === 0 ? getSnakeHeadColor() : snakeColor;
        context.fillRect(
            segment.x * gridSize + inset,
            segment.y * gridSize + inset,
            gridSize - inset * 2,
            gridSize - inset * 2
        );
    });
}

function drawFruit() {
    const centerX = fruit.x * gridSize + gridSize / 2;
    const centerY = fruit.y * gridSize + gridSize / 2;

    context.fillStyle = getCssVariable("--fruit");
    context.beginPath();
    context.arc(centerX, centerY, gridSize * 0.32, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ffe6d9";
    context.beginPath();
    context.arc(centerX - 3, centerY - 3, gridSize * 0.08, 0, Math.PI * 2);
    context.fill();
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

function isReverseDirection(proposedDirection) {
    return (
        proposedDirection.x === -direction.x &&
        proposedDirection.y === -direction.y
    );
}

function handleDirectionChange(event) {
    if (!sessionStarted) {
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
    updatePlayerName();
    startOverlayElement.classList.add("hidden");
    resetGame();
}

function previewTheme(event) {
    activeTheme = event.target.value === "dark" ? "dark" : "light";
    applyTheme();
    saveSettings();
}

function updateSnakeColor(event) {
    snakeColor = event.target.value;
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
updatePlayerName();
syncFormWithSettings();

document.addEventListener("keydown", handleDirectionChange);
restartButton.addEventListener("click", handleRestart);
setupForm.addEventListener("submit", startSession);
themeSelect.addEventListener("change", previewTheme);
snakeColorInput.addEventListener("change", updateSnakeColor);
