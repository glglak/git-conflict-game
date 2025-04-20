// Git Conflict Game - Simple working version

// Constants
const TILE_SIZE = 40;
const COLORS = {
  EMPTY: '#161b22',
  WALL: '#30363d',
  CONFLICT: '#f0883e',
  BUG: '#f85149',
  POWERUP: '#58a6ff',
  COMMIT: '#7ee787',
  PLAYER: '#c9d1d9'
};

// Game state
let gameState = {};

// Simple level data
const LEVEL_DATA = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 2, 0, 3, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Reset game state
function resetGame() {
  gameState = {
    grid: JSON.parse(JSON.stringify(LEVEL_DATA)),
    playerX: 1,
    playerY: 1,
    score: 0,
    level: 1,
    lives: 3,
    gameRunning: false
  };
}

// Main initialization
window.onload = function() {
  console.log('Window loaded - Simple game init');
  
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = LEVEL_DATA[0].length * TILE_SIZE;
  canvas.height = LEVEL_DATA.length * TILE_SIZE;
  
  // Initialize game
  resetGame();
  
  // Draw start screen
  drawStartScreen(ctx, canvas);
  
  // Handle start button
  const startButton = document.getElementById('startButton');
  if (startButton) {
    startButton.onclick = function() {
      startGame(ctx, canvas);
    };
  } else {
    console.error('Start button not found!');
  }
  
  // Handle restart button
  const restartButton = document.getElementById('restartButton');
  if (restartButton) {
    restartButton.onclick = function() {
      startGame(ctx, canvas);
    };
  }
  
  // Handle keyboard
  document.addEventListener('keydown', function(e) {
    if (gameState.gameRunning) {
      handleKeyDown(e, ctx, canvas);
    }
  });
  
  // Handle other buttons
  setupModalButtons(ctx, canvas);
};

function drawStartScreen(ctx, canvas) {
  // Clear canvas
  ctx.fillStyle = COLORS.EMPTY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = '24px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Git Conflict Game', canvas.width / 2, canvas.height / 3);
  ctx.fillText('Press "Start Game" to begin', canvas.width / 2, canvas.height / 2);
  
  // Show start button and hide restart
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  startButton.classList.remove('hidden');
  restartButton.classList.add('hidden');
}

function startGame(ctx, canvas) {
  console.log('Starting game!');
  
  // Reset state
  resetGame();
  gameState.gameRunning = true;
  
  // Update UI
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('level').textContent = gameState.level;
  document.getElementById('lives').textContent = gameState.lives;
  
  // Hide start button and show restart
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  startButton.classList.add('hidden');
  restartButton.classList.remove('hidden');
  
  // Start game loop
  gameLoop(ctx, canvas);
}

function gameLoop(ctx, canvas) {
  if (!gameState.gameRunning) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  drawGrid(ctx);
  
  // Draw player
  drawPlayer(ctx);
  
  // Continue loop
  requestAnimationFrame(() => gameLoop(ctx, canvas));
}

function drawGrid(ctx) {
  const { grid } = gameState;
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      let color;
      
      switch (tile) {
        case 0: color = COLORS.EMPTY; break;
        case 1: color = COLORS.WALL; break;
        case 2: color = COLORS.CONFLICT; break;
        case 3: color = COLORS.BUG; break;
        case 4: color = COLORS.POWERUP; break;
        case 5: color = COLORS.COMMIT; break;
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      
      // Draw symbols
      if (tile > 1) {
        ctx.fillStyle = 'white';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = y * TILE_SIZE + TILE_SIZE / 2;
        
        let symbol;
        switch (tile) {
          case 2: symbol = '!'; break;
          case 3: symbol = '🐞'; break;
          case 4: symbol = '⚡'; break;
          case 5: symbol = '✓'; break;
        }
        
        if (symbol) {
          ctx.fillText(symbol, centerX, centerY);
        }
      }
    }
  }
}

function drawPlayer(ctx) {
  const { playerX, playerY } = gameState;
  ctx.fillStyle = COLORS.PLAYER;
  ctx.beginPath();
  ctx.arc(
    playerX * TILE_SIZE + TILE_SIZE / 2,
    playerY * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE * 0.35,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function handleKeyDown(e, ctx, canvas) {
  let newX = gameState.playerX;
  let newY = gameState.playerY;
  
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      newY--;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      newY++;
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      newX--;
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      newX++;
      break;
  }
  
  if (isValidMove(newX, newY)) {
    gameState.playerX = newX;
    gameState.playerY = newY;
    checkCollision(ctx, canvas);
  }
}

function isValidMove(x, y) {
  const { grid } = gameState;
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[y].length) return false;
  return grid[y][x] !== 1; // not a wall
}

function checkCollision(ctx, canvas) {
  const { grid, playerX, playerY } = gameState;
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
      handleCommit(ctx, canvas);
      break;
  }
}

function handleConflict() {
  gameState.gameRunning = false;
  const modal = document.getElementById('conflictModal');
  modal.classList.remove('hidden');
}

function handleBug() {
  gameState.lives--;
  gameState.score = Math.max(0, gameState.score - 50);
  
  // Update UI
  document.getElementById('lives').textContent = gameState.lives;
  document.getElementById('score').textContent = gameState.score;
  
  // Reset position
  gameState.playerX = 1;
  gameState.playerY = 1;
  
  if (gameState.lives <= 0) {
    gameOver();
  }
}

function handlePowerup() {
  gameState.score += 50;
  gameState.grid[gameState.playerY][gameState.playerX] = 0;
  document.getElementById('score').textContent = gameState.score;
}

function handleCommit(ctx, canvas) {
  gameState.gameRunning = false;
  gameState.score += 500;
  const modal = document.getElementById('levelCompleteModal');
  document.getElementById('levelScore').textContent = gameState.score;
  modal.classList.remove('hidden');
}

function gameOver() {
  gameState.gameRunning = false;
  const modal = document.getElementById('gameOverModal');
  document.getElementById('finalScore').textContent = gameState.score;
  modal.classList.remove('hidden');
}

function setupModalButtons(ctx, canvas) {
  // Conflict resolution
  const acceptCurrentButton = document.getElementById('acceptCurrent');
  if (acceptCurrentButton) {
    acceptCurrentButton.onclick = function() {
      resolveConflict();
    };
  }
  
  const acceptIncomingButton = document.getElementById('acceptIncoming');
  if (acceptIncomingButton) {
    acceptIncomingButton.onclick = function() {
      resolveConflict();
    };
  }
  
  const mergeManuallyButton = document.getElementById('mergeManually');
  if (mergeManuallyButton) {
    mergeManuallyButton.onclick = function() {
      document.getElementById('manualMergeArea').classList.remove('hidden');
    };
  }
  
  const submitMergeButton = document.getElementById('submitMerge');
  if (submitMergeButton) {
    submitMergeButton.onclick = function() {
      resolveConflict();
    };
  }
  
  function resolveConflict() {
    gameState.score += 100;
    gameState.grid[gameState.playerY][gameState.playerX] = 0;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('conflictModal').classList.add('hidden');
    document.getElementById('manualMergeArea').classList.add('hidden');
    gameState.gameRunning = true;
  }
  
  // Game over
  const newGameButton = document.getElementById('newGameButton');
  if (newGameButton) {
    newGameButton.onclick = function() {
      document.getElementById('gameOverModal').classList.add('hidden');
      startGame(ctx, canvas);
    };
  }
  
  // Level complete
  const nextLevelButton = document.getElementById('nextLevelButton');
  if (nextLevelButton) {
    nextLevelButton.onclick = function() {
      document.getElementById('levelCompleteModal').classList.add('hidden');
      // For now, just restart the same level
      startGame(ctx, canvas);
    };
  }
  
  // Game complete
  const restartGameButton = document.getElementById('restartGameButton');
  if (restartGameButton) {
    restartGameButton.onclick = function() {
      document.getElementById('gameCompleteModal').classList.add('hidden');
      startGame(ctx, canvas);
    };
  }
}
