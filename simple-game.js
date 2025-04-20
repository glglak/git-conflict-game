// Git Conflict Game - Simple single-file implementation
// This is a simplified version to ensure everything works correctly

// Constants
const TILE_SIZE = 40;
const GRID_WIDTH = 12;
const GRID_HEIGHT = 9;
const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE;
const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE;

// Simple game state
let gameRunning = false;
let score = 0;
let level = 0;
let playerX = 1;
let playerY = 1;

// Simple level design
const levels = [
  {
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 2, 0, 3, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { x: 1, y: 1 }
  }
];

// Tile colors
const tileColors = {
  0: '#161b22',    // Empty
  1: '#30363d',    // Wall
  2: '#f0883e',    // Conflict
  3: '#f85149',    // Bug
  4: '#58a6ff',    // Powerup
  5: '#7ee787'     // Commit
};

// DOM elements
let canvas;
let ctx;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - Simple game initialization');
  
  // Create canvas if it doesn't exist
  canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(canvas);
  } else {
    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
  }
  
  ctx = canvas.getContext('2d');
  
  // Create start button if it doesn't exist
  let startButton = document.getElementById('startButton');
  if (!startButton) {
    startButton = document.createElement('button');
    startButton.id = 'startButton';
    startButton.textContent = 'Start Game';
    document.body.appendChild(startButton);
  }
  
  // Add click handler to start button
  startButton.onclick = startGame;
  
  // Draw initial screen
  drawStartScreen();
  
  // Add keyboard controls
  document.addEventListener('keydown', handleKeyDown);
});

// Draw start screen
function drawStartScreen() {
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  ctx.fillStyle = 'white';
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Git Conflict Game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
  ctx.fillText('Press Start to Play', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}

// Start the game
function startGame() {
  console.log('Starting game');
  gameRunning = true;
  score = 0;
  level = 0;
  playerX = levels[0].playerStart.x;
  playerY = levels[0].playerStart.y;
  
  // Update UI
  const startButton = document.getElementById('startButton');
  startButton.style.display = 'none';
  
  // Start game loop
  requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw grid
  drawGrid();
  
  // Draw player
  drawPlayer();
  
  // Request next frame
  requestAnimationFrame(gameLoop);
}

// Draw the game grid
function drawGrid() {
  const grid = levels[level].grid;
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      ctx.fillStyle = tileColors[tile];
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      
      // Draw symbols for special tiles
      ctx.fillStyle = 'white';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = x * TILE_SIZE + TILE_SIZE / 2;
      const centerY = y * TILE_SIZE + TILE_SIZE / 2;
      
      switch (tile) {
        case 2: ctx.fillText('!', centerX, centerY); break;
        case 3: ctx.fillText('B', centerX, centerY); break;
        case 4: ctx.fillText('P', centerX, centerY); break;
        case 5: ctx.fillText('C', centerX, centerY); break;
      }
    }
  }
}

// Draw the player
function drawPlayer() {
  ctx.fillStyle = '#c9d1d9';
  ctx.beginPath();
  ctx.arc(
    playerX * TILE_SIZE + TILE_SIZE / 2,
    playerY * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE * 0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Handle keyboard input
function handleKeyDown(event) {
  if (!gameRunning) return;
  
  let newX = playerX;
  let newY = playerY;
  
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      newY--;
      break;
    case 'ArrowDown':
    case 's':
      newY++;
      break;
    case 'ArrowLeft':
    case 'a':
      newX--;
      break;
    case 'ArrowRight':
    case 'd':
      newX++;
      break;
  }
  
  // Check if move is valid
  if (isValidMove(newX, newY)) {
    playerX = newX;
    playerY = newY;
    checkCollisions();
  }
}

// Check if a move is valid
function isValidMove(x, y) {
  const grid = levels[level].grid;
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[y].length) {
    return false;
  }
  return grid[y][x] !== 1; // Can move if not a wall
}

// Check for collisions
function checkCollisions() {
  const grid = levels[level].grid;
  const tile = grid[playerY][playerX];
  
  switch (tile) {
    case 2: // Conflict
      handleConflict();
      break;
    case 3: // Bug
      handleBug();
      break;
    case 4: // Powerup
      handlePowerup();
      break;
    case 5: // Commit
      handleCommit();
      break;
  }
}

// Handle conflict
function handleConflict() {
  alert('You hit a conflict! Resolve it!');
  score += 100;
  // Remove conflict from grid
  levels[level].grid[playerY][playerX] = 0;
}

// Handle bug
function handleBug() {
  alert('Oh no! A bug!');
  score -= 50;
  // Reset player position
  playerX = levels[level].playerStart.x;
  playerY = levels[level].playerStart.y;
}

// Handle powerup
function handlePowerup() {
  alert('Power-up collected!');
  score += 50;
  // Remove powerup from grid
  levels[level].grid[playerY][playerX] = 0;
}

// Handle reaching commit
function handleCommit() {
  alert('Level Complete! Score: ' + score);
  gameRunning = false;
  
  // Show start button again
  const startButton = document.getElementById('startButton');
  startButton.style.display = 'block';
  startButton.textContent = 'Play Again';
}
