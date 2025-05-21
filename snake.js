const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const finalScoreElement = document.getElementById('final-score');
const finalLevelElement = document.getElementById('final-level');
const gameOverScreen = document.getElementById('game-over');

// Mobile controls
const upBtn = document.getElementById('up-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7;
let level = 1;

// Snake properties
let snake = [];
let food = { x: 15, y: 15 };
let powerUps = [];
let dx = 0;
let dy = 0;
let score = 0;

// Colors for snake gradient
const snakeColors = ['#2ecc71', '#27ae60', '#219a52'];

// Game state
let gameStarted = false;
let gameOver = false;
let gameLoop;

// Initialize game
function init() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    food = { x: 15, y: 15 };
    powerUps = [];
    dx = 0;
    dy = 0;
    score = 0;
    level = 1;
    speed = 7;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    gameOver = false;
    gameOverScreen.style.display = 'none';
    generateFood();
    generatePowerUps();
}

// Main game loop
function update() {
    if (gameOver || !gameStarted) return;
    
    moveSnake();
    checkCollision();
    draw();
}

// Draw game elements
function draw() {
    clearCanvas();
    drawGrid();
    drawFood();
    drawPowerUps();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function drawSnake() {
    // Draw snake body with gradient
    snake.forEach((segment, index) => {
        const colorIndex = Math.min(Math.floor(index / 3), snakeColors.length - 1);
        ctx.fillStyle = snakeColors[colorIndex];
        ctx.beginPath();
        ctx.roundRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2,
            4
        );
        ctx.fill();
    });

    // Draw snake head
    const head = snake[0];
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.roundRect(
        head.x * gridSize,
        head.y * gridSize,
        gridSize,
        gridSize,
        4
    );
    ctx.fill();

    // Draw snake eyes
    ctx.fillStyle = 'black';
    const eyeSize = 3;
    const eyeOffset = 4;
    
    if (dx === 1) { // facing right
        ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
    } else if (dx === -1) { // facing left
        ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
    } else if (dy === -1) { // facing up
        ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
    } else if (dy === 1) { // facing down
        ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
    }
}

function drawFood() {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(
        food.x * gridSize + 1,
        food.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2,
        4
    );
    ctx.fill();

    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize * 0.3,
        food.y * gridSize + gridSize * 0.3,
        gridSize * 0.2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = '#f1c40f'; // Color for power-ups
        ctx.beginPath();
        ctx.roundRect(
            powerUp.x * gridSize + 1,
            powerUp.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2,
            4
        );
        ctx.fill();
    });
}

// Move the snake
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        // Level up every 50 points
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelElement.textContent = level;
            speed = Math.min(15, 7 + Math.floor(score / 50)); // Increase speed up to a maximum
        }
        
        generateFood();
        generatePowerUps();
    } else {
        snake.pop();
    }

    // Check for power-up collisions
    powerUps.forEach((powerUp, index) => {
        if (head.x === powerUp.x && head.y === powerUp.y) {
            applyPowerUp(powerUp);
            powerUps.splice(index, 1); // Remove the power-up after collection
        }
    });
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }
}

// Generate new food position
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (tileCount - 2)) + 1,
            y: Math.floor(Math.random() * (tileCount - 2)) + 1
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) || powerUps.some(powerUp => powerUp.x === newFood.x && powerUp.y === newFood.y));
    
    food = newFood;
}

// Generate power-ups
function generatePowerUps() {
    if (Math.random() < 0.1) { // 10% chance to generate a power-up
        let newPowerUp;
        do {
            newPowerUp = {
                x: Math.floor(Math.random() * (tileCount - 2)) + 1,
                y: Math.floor(Math.random() * (tileCount - 2)) + 1
            };
        } while (snake.some(segment => segment.x === newPowerUp.x && segment.y === newPowerUp.y) || powerUps.some(powerUp => powerUp.x === newPowerUp.x && powerUp.y === newPowerUp.y));
        
        powerUps.push(newPowerUp);
    }
}

// Apply power-up effects
function applyPowerUp(powerUp) {
    // Example effect: Increase score by 20
    score += 20;
    scoreElement.textContent = score;
}

// End the game
function endGame() {
    gameOver = true;
    gameStarted = false;
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    gameOverScreen.style.display = 'block';
    clearInterval(gameLoop);
}

// Start the game
function startGame() {
    if (!gameStarted && !gameOver) {
        init();
        gameStarted = true;
        dx = 1; // Start moving right
        dy = 0;
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 / speed);
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    init();
    gameStarted = true;
    dx = 1; // Start moving right
    dy = 0;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / speed);
});

// Keyboard controls
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// Mobile controls
upBtn.addEventListener('click', () => {
    if (dy !== 1) {
        dx = 0;
        dy = -1;
    }
});

downBtn.addEventListener('click', () => {
    if (dy !== -1) {
        dx = 0;
        dy = 1;
    }
});

leftBtn.addEventListener('click', () => {
    if (dx !== 1) {
        dx = -1;
        dy = 0;
    }
});

rightBtn.addEventListener('click', () => {
    if (dx !== -1) {
        dx = 1;
        dy = 0;
    }
});

// Initialize the game
init();
draw(); // Initial draw
