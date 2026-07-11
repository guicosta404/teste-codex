const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const overlayElement = document.getElementById("overlay");
const overlayTextElement = document.getElementById("overlay-text");
const restartButton = document.getElementById("restart-button");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const initialTickMs = 180;
const minimumTickMs = 80;
const speedStepMs = 12;
const fruitsPerLevel = 3;

let snake;
let direction;
let nextDirection;
let fruit;
let score;
let gameOver;
let loopId;

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
    context.fillStyle = "#1f3122";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "rgba(240, 237, 221, 0.07)";
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
        context.fillStyle = index === 0 ? "#f7f3e8" : "#7bc96f";
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

    context.fillStyle = "#ff6b35";
    context.beginPath();
    context.arc(centerX, centerY, gridSize * 0.32, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ffe6d9";
    context.beginPath();
    context.arc(centerX - 3, centerY - 3, gridSize * 0.08, 0, Math.PI * 2);
    context.fill();
}

function isReverseDirection(proposedDirection) {
    return (
        proposedDirection.x === -direction.x &&
        proposedDirection.y === -direction.y
    );
}

function handleDirectionChange(event) {
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

document.addEventListener("keydown", handleDirectionChange);
restartButton.addEventListener("click", resetGame);

resetGame();
