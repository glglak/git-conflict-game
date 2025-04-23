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

// Game over messages
const GAME_OVER_MESSAGES = [
  "Your repository has become corrupted!",
  "Too many merge conflicts - repository abandoned!",
  "Fatal: cannot rebase onto multiple branches",
  "Error: detached HEAD state cannot be resolved",
  "Refusing to merge unrelated histories"
];

// Power-up types
const POWERUP_TYPES = [
  { name: 'Rebase', effect: 'Removes all bugs temporarily' },
  { name: 'Stash', effect: 'Extra life granted' },
  { name: 'Cherry-pick', effect: 'Auto-resolve next conflict' }
];

// Reset game state
function resetGame() {
  try {
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
      cherryPickActive: false,
      bugs: JSON.parse(JSON.stringify(currentLevel.bugs))
    };
  } catch (error) {
    console.error("Error resetting game:", error);
    showErrorModal("Game Reset Error", "Could not reset the game state. Please refresh the page.");
  }
}

// Main initialization
window.onload = function() {
  console.log('Window loaded - Enhanced game init');
  
  try {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Canvas not found!');
      showErrorModal("Initialization Error", "Game canvas not found. Please refresh the page.");
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
  } catch (error) {
    console.error("Error initializing game:", error);
    showErrorModal("Initialization Error", error.message);
  }
};

function updateCanvasSize() {
  try {
    const canvas = document.getElementById('gameCanvas');
    const currentLevel = LEVELS[gameState.level];
    canvas.width = currentLevel.grid[0].length * TILE_SIZE;
    canvas.height = currentLevel.grid.length * TILE_SIZE;
  } catch (error) {
    console.error("Error updating canvas size:", error);
    showNotification("Error", "Failed to resize game area");
  }
}

function drawStartScreen(ctx, canvas) {
  try {
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
    if (startButton && restartButton) {
      startButton.classList.remove('hidden');
      restartButton.classList.add('hidden');
    }
  } catch (error) {
    console.error("Error drawing start screen:", error);
    showNotification("Error", "Failed to draw start screen");
  }
}