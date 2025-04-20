// Git Conflict Game - Enhanced version with multiple levels

// Constants
const TILE_SIZE = 40;
const TILE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  CONFLICT: 2,
  BUG: 3,
  POWERUP: 4,
  COMMIT: 5
};

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
let bugInterval = null;

// Multiple levels
const LEVELS = [
  // Level 1: Introduction
  {
    name: 'Feature Branch',
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
    playerStart: { x: 1, y: 1 },
    bugs: [{ x: 6, y: 4, direction: 1, range: 2 }],
    conflicts: [{ x: 4, y: 4 }],
    powerups: []
  },
  // Level 2: More complex
  {
    name: 'Merge Request',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 1, 0, 1, 1, 1, 1, 0, 2, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { x: 2, y: 1 },
    bugs: [{ x: 3, y: 7, direction: 1, range: 3 }, { x: 8, y: 7, direction: 1, range: 2 }],
    conflicts: [{ x: 2, y: 2 }, { x: 11, y: 2 }],
    powerups: [{ x: 10, y: 9 }]
  },
  // Level 3: Complex maze
  {
    name: 'Rebase Hell',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 5, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 4, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 1, 2, 1, 0, 0, 0, 0, 2, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 3, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    playerStart: { x: 1, y: 1 },
    bugs: [
      { x: 8, y: 10, direction: 1, range: 2 },
      { x: 12, y: 13, direction: 1, range: 3 },
      { x: 5, y: 5, direction: 1, range: 2 }
    ],
    conflicts: [{ x: 3, y: 7 }, { x: 9, y: 7 }],
    powerups: [{ x: 3, y: 3 }, { x: 11, y: 11 }]
  }
];

// Conflict messages
const CONFLICT_MESSAGES = [
  "Function parameter conflict!",
  "CSS style conflict!",
  "Array method conflict!",
  "HTML structure conflict!",
  "JSON configuration conflict!"
];

// Power-up types
const POWERUP_TYPES = [
  { name: 'Rebase', effect: 'Removes all bugs temporarily' },
  { name: 'Stash', effect: 'Extra life granted' },
  { name: 'Cherry-pick', effect: 'Auto-resolve next conflict' }
];

// Reset game state
function resetGame() {
  const currentLevel = LEVELS[gameState.level || 0];
  gameState = {
    level: gameState.level || 0,
    grid: JSON.parse(JSON.stringify(currentLevel.grid)),
    playerX: currentLevel.playerStart.x,
    playerY: currentLevel.playerStart.y,
    score: gameState.score || 0,
    lives: 3,
    gameRunning: false,
    solvedConflicts: [],
    activePowerups: [],
    bugs: JSON.parse(JSON.stringify(currentLevel.bugs))
  };
}

// Main initialization
window.onload = function() {
  console.log('Window loaded - Enhanced game init');
  
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Initialize game
  gameState.level = 0;
  resetGame();
  
  // Set canvas size
  updateCanvasSize();
  
  // Draw start screen
  drawStartScreen(ctx, canvas);
  
  // Event listeners
  setupEventListeners(ctx, canvas);
};

function updateCanvasSize() {
  const canvas = document.getElementById('gameCanvas');
  const currentLevel = LEVELS[gameState.level];
  canvas.width = currentLevel.grid[0].length * TILE_SIZE;
  canvas.height = currentLevel.grid.length * TILE_SIZE;
}

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
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText(`Level ${gameState.level + 1}: ${LEVELS[gameState.level].name}`, canvas.width / 2, canvas.height * 0.6);
  
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
  document.getElementById('level').textContent = gameState.level + 1;
  document.getElementById('lives').textContent = gameState.lives;
  
  // Hide start button and show restart
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  startButton.classList.add('hidden');
  restartButton.classList.remove('hidden');
  
  // Start bug movement
  startBugMovement();
  
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
        case TILE_TYPES.EMPTY: color = COLORS.EMPTY; break;
        case TILE_TYPES.WALL: color = COLORS.WALL; break;
        case TILE_TYPES.CONFLICT: color = COLORS.CONFLICT; break;
        case TILE_TYPES.BUG: color = COLORS.BUG; break;
        case TILE_TYPES.POWERUP: color = COLORS.POWERUP; break;
        case TILE_TYPES.COMMIT: color = COLORS.COMMIT; break;
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
          case TILE_TYPES.CONFLICT: symbol = '!'; break;
          case TILE_TYPES.BUG: symbol = '🐞'; break;
          case TILE_TYPES.POWERUP: symbol = '⚡'; break;
          case TILE_TYPES.COMMIT: symbol = '✓'; break;
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

function startBugMovement() {
  // Clear any existing interval
  if (bugInterval) {
    clearInterval(bugInterval);
  }
  
  // Move bugs every 500ms
  bugInterval = setInterval(() => {
    if (gameState.gameRunning) {
      moveBugs();
    }
  }, 500);
}

function moveBugs() {
  const { grid, bugs } = gameState;
  
  bugs.forEach(bug => {
    // Clear bug's current position
    if (grid[bug.y][bug.x] === TILE_TYPES.BUG) {
      grid[bug.y][bug.x] = TILE_TYPES.EMPTY;
    }
    
    // Calculate new position
    const newX = bug.x + bug.direction;
    
    // Check if we need to change direction
    if (newX >= bug.x + bug.range || newX <= bug.x - bug.range) {
      bug.direction *= -1;
    } else if (grid[bug.y][newX] === TILE_TYPES.WALL) {
      bug.direction *= -1;
    } else {
      bug.x = newX;
    }
    
    // Place bug at new position if empty
    if (grid[bug.y][bug.x] === TILE_TYPES.EMPTY) {
      grid[bug.y][bug.x] = TILE_TYPES.BUG;
    }
    
    // Check if bug hits player
    if (bug.x === gameState.playerX && bug.y === gameState.playerY) {
      handleBug();
    }
  });
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
  return grid[y][x] !== TILE_TYPES.WALL;
}

function checkCollision(ctx, canvas) {
  const { grid, playerX, playerY } = gameState;
  const tile = grid[playerY][playerX];
  
  switch (tile) {
    case TILE_TYPES.CONFLICT:
      handleConflict();
      break;
    case TILE_TYPES.BUG:
      handleBug();
      break;
    case TILE_TYPES.POWERUP:
      handlePowerup();
      break;
    case TILE_TYPES.COMMIT:
      handleCommit(ctx, canvas);
      break;
  }
}

function handleConflict() {
  // Check if conflict already solved
  const conflictKey = `${gameState.playerX},${gameState.playerY}`;
  if (gameState.solvedConflicts.includes(conflictKey)) return;
  
  gameState.gameRunning = false;
  const modal = document.getElementById('conflictModal');
  const codeDisplay = document.getElementById('conflictCode').querySelector('p');
  codeDisplay.textContent = CONFLICT_MESSAGES[gameState.solvedConflicts.length % CONFLICT_MESSAGES.length];
  modal.classList.remove('hidden');
}

function handleBug() {
  gameState.lives--;
  gameState.score = Math.max(0, gameState.score - 50);
  
  // Update UI
  document.getElementById('lives').textContent = gameState.lives;
  document.getElementById('score').textContent = gameState.score;
  
  // Reset position
  const currentLevel = LEVELS[gameState.level];
  gameState.playerX = currentLevel.playerStart.x;
  gameState.playerY = currentLevel.playerStart.y;
  
  if (gameState.lives <= 0) {
    gameOver();
  }
}

function handlePowerup() {
  gameState.score += 50;
  gameState.grid[gameState.playerY][gameState.playerX] = TILE_TYPES.EMPTY;
  document.getElementById('score').textContent = gameState.score;
  
  // Show random powerup message
  const powerup = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  showNotification(powerup.name, powerup.effect);
}

function handleCommit(ctx, canvas) {
  gameState.gameRunning = false;
  gameState.score += 500;
  
  // Clear bug movement
  if (bugInterval) {
    clearInterval(bugInterval);
    bugInterval = null;
  }
  
  if (gameState.level >= LEVELS.length - 1) {
    // Game complete
    const modal = document.getElementById('gameCompleteModal');
    document.getElementById('completeScore').textContent = gameState.score;
    modal.classList.remove('hidden');
  } else {
    // Level complete
    const modal = document.getElementById('levelCompleteModal');
    document.getElementById('levelScore').textContent = gameState.score;
    modal.classList.remove('hidden');
  }
}

function gameOver() {
  gameState.gameRunning = false;
  
  // Clear bug movement
  if (bugInterval) {
    clearInterval(bugInterval);
    bugInterval = null;
  }
  
  const modal = document.getElementById('gameOverModal');
  document.getElementById('finalScore').textContent = gameState.score;
  modal.classList.remove('hidden');
}

function showNotification(title, message) {
  const notificationDiv = document.createElement('div');
  notificationDiv.className = 'notification';
  notificationDiv.style.position = 'fixed';
  notificationDiv.style.top = '20px';
  notificationDiv.style.right = '20px';
  notificationDiv.style.backgroundColor = '#161b22';
  notificationDiv.style.border = '1px solid #30363d';
  notificationDiv.style.borderRadius = '6px';
  notificationDiv.style.padding = '15px';
  notificationDiv.style.color = '#c9d1d9';
  notificationDiv.style.zIndex = '2000';
  
  notificationDiv.innerHTML = `
    <h3 style="color: #58a6ff; margin: 0 0 5px 0;">${title}</h3>
    <p style="margin: 0;">${message}</p>
  `;
  
  document.body.appendChild(notificationDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notificationDiv.remove();
  }, 3000);
}

function setupEventListeners(ctx, canvas) {
  // Start button
  const startButton = document.getElementById('startButton');
  if (startButton) {
    startButton.onclick = function() {
      gameState.level = 0;
      gameState.score = 0;
      startGame(ctx, canvas);
    };
  }
  
  // Restart button
  const restartButton = document.getElementById('restartButton');
  if (restartButton) {
    restartButton.onclick = function() {
      startGame(ctx, canvas);
    };
  }
  
  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (gameState.gameRunning) {
      handleKeyDown(e, ctx, canvas);
    }
  });
  
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
    gameState.grid[gameState.playerY][gameState.playerX] = TILE_TYPES.EMPTY;
    gameState.solvedConflicts.push(`${gameState.playerX},${gameState.playerY}`);
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
      gameState.level = 0;
      gameState.score = 0;
      startGame(ctx, canvas);
    };
  }
  
  // Next level
  const nextLevelButton = document.getElementById('nextLevelButton');
  if (nextLevelButton) {
    nextLevelButton.onclick = function() {
      document.getElementById('levelCompleteModal').classList.add('hidden');
      gameState.level++;
      resetGame();
      updateCanvasSize();
      startGame(ctx, canvas);
    };
  }
  
  // Game complete
  const restartGameButton = document.getElementById('restartGameButton');
  if (restartGameButton) {
    restartGameButton.onclick = function() {
      document.getElementById('gameCompleteModal').classList.add('hidden');
      gameState.level = 0;
      gameState.score = 0;
      resetGame();
      updateCanvasSize();
      startGame(ctx, canvas);
    };
  }
}
