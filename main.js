// Git Conflict Game - Complete Rewrite
// Main game logic using a more straightforward state management approach

// Game states
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  CONFLICT: 'conflict',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over',
  GAME_COMPLETE: 'game_complete'
};

// Current game state
let currentState = GameState.MENU;
let gameData = {};

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const livesDisplay = document.getElementById('lives');
const conflictModal = document.getElementById('conflictModal');
const gameOverModal = document.getElementById('gameOverModal');
const levelCompleteModal = document.getElementById('levelCompleteModal');
const gameCompleteModal = document.getElementById('gameCompleteModal');
const finalScore = document.getElementById('finalScore');
const levelScore = document.getElementById('levelScore');
const completeScore = document.getElementById('completeScore');
const newGameButton = document.getElementById('newGameButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const restartGameButton = document.getElementById('restartGameButton');

// Hide all modals
function hideAllModals() {
  conflictModal.classList.add('hidden');
  gameOverModal.classList.add('hidden');
  levelCompleteModal.classList.add('hidden');
  gameCompleteModal.classList.add('hidden');
}

// Initialize game data
function initGameData() {
  return {
    level: 0,
    score: 0,
    lives: GAME_SETTINGS.initialLives,
    playerPosition: { ...LEVELS[0].playerStart },
    activePowerups: [],
    solvedConflicts: [],
    grid: JSON.parse(JSON.stringify(LEVELS[0].grid)),
    currentConflict: null,
    autoResolveNextConflict: false,
    bugIntervals: [],
    animationFrameId: null
  };
}

// Switch to a new game state
function changeState(newState) {
  // Clean up current state
  if (gameData.animationFrameId) {
    cancelAnimationFrame(gameData.animationFrameId);
    gameData.animationFrameId = null;
  }
  
  // Stop all bug movement intervals
  if (gameData.bugIntervals && gameData.bugIntervals.length > 0) {
    gameData.bugIntervals.forEach(interval => clearInterval(interval));
    gameData.bugIntervals = [];
  }
  
  // Hide all modals
  hideAllModals();
  
  // Set new state
  currentState = newState;
  
  // Initialize new state
  switch (newState) {
    case GameState.MENU:
      drawMenuScreen();
      startButton.classList.remove('hidden');
      restartButton.classList.add('hidden');
      break;
      
    case GameState.PLAYING:
      startButton.classList.add('hidden');
      restartButton.classList.remove('hidden');
      startGameLoop();
      startBugMovement();
      break;
      
    case GameState.CONFLICT:
      showConflictModal();
      break;
      
    case GameState.LEVEL_COMPLETE:
      levelScore.textContent = gameData.score;
      levelCompleteModal.classList.remove('hidden');
      break;
      
    case GameState.GAME_OVER:
      finalScore.textContent = gameData.score;
      gameOverModal.classList.remove('hidden');
      break;
      
    case GameState.GAME_COMPLETE:
      completeScore.textContent = gameData.score;
      gameCompleteModal.classList.remove('hidden');
      break;
  }
}

// Start a new game
function startNewGame() {
  // Reset game data
  gameData = initGameData();
  
  // Update UI
  updateScoreDisplay();
  updateLevelDisplay();
  updateLivesDisplay();
  
  // Set canvas size
  updateCanvasSize();
  
  // Change to playing state
  changeState(GameState.PLAYING);
}

// Draw menu screen
function drawMenuScreen() {
  canvas.width = 800;
  canvas.height = 400;
  
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Git Conflict - A Git-themed Puzzle Game', canvas.width / 2, canvas.height / 3);
  ctx.fillText('Press "Start Game" to begin', canvas.width / 2, canvas.height / 2);
}

// Update canvas size based on current level
function updateCanvasSize() {
  const currentLevel = LEVELS[gameData.level];
  canvas.width = currentLevel.grid[0].length * GAME_SETTINGS.tileSize;
  canvas.height = currentLevel.grid.length * GAME_SETTINGS.tileSize;
}

// Start game loop
function startGameLoop() {
  // Define game loop function
  function gameLoop() {
    if (currentState !== GameState.PLAYING) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw player
    drawPlayer();
    
    // Check for collisions
    checkCollisions();
    
    // Request next frame
    gameData.animationFrameId = requestAnimationFrame(gameLoop);
  }
  
  // Start the loop
  gameLoop();
}

// Draw the game grid
function drawGrid() {
  const { grid } = gameData;
  const { tileSize } = GAME_SETTINGS;
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tileType = grid[y][x];
      
      // Draw tile background
      ctx.fillStyle = TILE_COLORS[tileType];
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      
      // Draw tile content based on type
      ctx.fillStyle = '#ffffff';
      ctx.font = `${tileSize / 2}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = x * tileSize + tileSize / 2;
      const centerY = y * tileSize + tileSize / 2;
      
      switch (tileType) {
        case TILE_TYPES.CONFLICT:
          ctx.fillText('!', centerX, centerY);
          break;
        case TILE_TYPES.BUG:
          ctx.fillText('🐞', centerX, centerY);
          break;
        case TILE_TYPES.POWERUP:
          ctx.fillText('⚡', centerX, centerY);
          break;
        case TILE_TYPES.COMMIT:
          ctx.fillText('✓', centerX, centerY);
          break;
      }
    }
  }
}

// Draw the player
function drawPlayer() {
  const { playerPosition } = gameData;
  const { tileSize } = GAME_SETTINGS;
  const { size, color } = PLAYER;
  
  // Calculate player position
  const x = playerPosition.x * tileSize + tileSize / 2;
  const y = playerPosition.y * tileSize + tileSize / 2;
  const radius = tileSize * size / 2;
  
  // Draw player circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw active powerup effect if any
  if (gameData.activePowerups.length > 0) {
    ctx.strokeStyle = TILE_COLORS[TILE_TYPES.POWERUP];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Start bug movement
function startBugMovement() {
  const currentLevel = LEVELS[gameData.level];
  
  // Create a deep copy of bugs array for movement
  const bugs = JSON.parse(JSON.stringify(currentLevel.bugs));
  
  // Set up movement intervals for each bug
  bugs.forEach((bug, index) => {
    const intervalId = setInterval(() => {
      if (currentState === GameState.PLAYING) {
        moveBug(bug, index);
      }
    }, GAME_SETTINGS.bugMovementInterval);
    
    gameData.bugIntervals.push(intervalId);
  });
}

// Move a bug
function moveBug(bug, bugIndex) {
  const { grid } = gameData;
  const currentX = bug.x;
  const currentY = bug.y;
  
  // Remove bug from current position
  if (grid[currentY][currentX] === TILE_TYPES.BUG) {
    grid[currentY][currentX] = TILE_TYPES.EMPTY;
  }
  
  // Calculate new position based on movement pattern
  let newX = currentX;
  let newY = currentY;
  
  switch (bug.movementPattern) {
    case 'horizontal':
      // Move horizontally within range
      bug.direction = bug.direction || 1; // 1 for right, -1 for left
      newX = currentX + bug.direction;
      
      // Check if at edge of range
      if (newX >= currentX + bug.range || newX <= currentX - bug.range ||
          grid[newY][newX] !== TILE_TYPES.EMPTY) {
        bug.direction *= -1; // Reverse direction
        newX = currentX + bug.direction;
      }
      break;
      
    case 'vertical':
      // Move vertically within range
      bug.direction = bug.direction || 1; // 1 for down, -1 for up
      newY = currentY + bug.direction;
      
      // Check if at edge of range
      if (newY >= currentY + bug.range || newY <= currentY - bug.range ||
          grid[newY][newX] !== TILE_TYPES.EMPTY) {
        bug.direction *= -1; // Reverse direction
        newY = currentY + bug.direction;
      }
      break;
      
    case 'circular':
      // Move in a clockwise circle
      bug.angle = bug.angle || 0;
      bug.angle = (bug.angle + Math.PI/2) % (Math.PI * 2); // 90 degree turns
      
      const offsetX = Math.round(Math.cos(bug.angle));
      const offsetY = Math.round(Math.sin(bug.angle));
      
      newX = currentX + offsetX;
      newY = currentY + offsetY;
      
      // Check if new position is valid
      if (grid[newY][newX] !== TILE_TYPES.EMPTY) {
        bug.angle = (bug.angle + Math.PI/2) % (Math.PI * 2); // Try next direction
        newX = currentX + Math.round(Math.cos(bug.angle));
        newY = currentY + Math.round(Math.sin(bug.angle));
      }
      break;
  }
  
  // Update bug position
  bug.x = newX;
  bug.y = newY;
  
  // Place bug at new position
  if (grid[newY][newX] === TILE_TYPES.EMPTY) {
    grid[newY][newX] = TILE_TYPES.BUG;
    
    // Check if player is at this position
    if (gameData.playerPosition.x === newX && gameData.playerPosition.y === newY) {
      if (!hasPowerupOfType(1)) { // If not immune
        handleBugCollision();
      }
    }
  }
  
  // Update the bugs array in the current level
  const currentLevel = LEVELS[gameData.level];
  currentLevel.bugs[bugIndex] = { ...bug };
}

// Check for collisions with special tiles
function checkCollisions() {
  const { playerPosition, grid } = gameData;
  const currentTile = grid[playerPosition.y][playerPosition.x];
  
  switch (currentTile) {
    case TILE_TYPES.CONFLICT:
      handleConflict();
      break;
    case TILE_TYPES.BUG:
      if (!hasPowerupOfType(1)) { // If not immune
        handleBugCollision();
      }
      break;
    case TILE_TYPES.POWERUP:
      collectPowerup();
      break;
    case TILE_TYPES.COMMIT:
      completeLevel();
      break;
  }
}

// Handle conflict resolution
function handleConflict() {
  const currentLevel = LEVELS[gameData.level];
  const conflict = currentLevel.conflicts.find(c => 
    c.x === gameData.playerPosition.x && 
    c.y === gameData.playerPosition.y &&
    !gameData.solvedConflicts.includes(`${c.x},${c.y}`)
  );
  
  if (!conflict) return; // Already solved
  
  // Get puzzle details
  const puzzle = CONFLICT_PUZZLES[conflict.puzzleIndex];
  gameData.currentConflict = { conflict, puzzle };
  
  // Check if we have auto-resolve powerup
  if (gameData.autoResolveNextConflict) {
    autoResolveConflict();
    return;
  }
  
  // Format conflict display
  const conflictCode = document.getElementById('conflictCode');
  conflictCode.innerHTML = `
    <h3>${puzzle.name}</h3>
    <p>Current code:</p>
    <pre class="current-code">${puzzle.currentCode}</pre>
    <p>Incoming code:</p>
    <pre class="incoming-code">${puzzle.incomingCode}</pre>
  `;
  
  // Show conflict modal
  changeState(GameState.CONFLICT);
}

// Show conflict modal
function showConflictModal() {
  const manualMergeArea = document.getElementById('manualMergeArea');
  manualMergeArea.classList.add('hidden');
  conflictModal.classList.remove('hidden');
}

// Auto-resolve a conflict (cherry-pick powerup)
function autoResolveConflict() {
  const { conflict, puzzle } = gameData.currentConflict;
  
  // Mark as resolved
  resolveConflict(puzzle.correctSolution);
  
  // Show notification
  showNotification('Auto-resolved!', 'Cherry-pick resolved the conflict automatically.');
  
  // Reset the powerup flag
  gameData.autoResolveNextConflict = false;
}

// Resolve a conflict
function resolveConflict(solution) {
  const { conflict } = gameData.currentConflict;
  const { x, y } = conflict;
  
  // Mark as solved
  gameData.solvedConflicts.push(`${x},${y}`);
  
  // Clear conflict from grid
  gameData.grid[y][x] = TILE_TYPES.EMPTY;
  
  // Award points
  addScore(GAME_SETTINGS.pointsPerConflict);
  
  // Resume game
  changeState(GameState.PLAYING);
}

// Handle collision with a bug
function handleBugCollision() {
  // Lose a life
  gameData.lives--;
  updateLivesDisplay();
  
  // Deduct points
  addScore(-GAME_SETTINGS.pointPenaltyPerBug);
  
  // Move player back to start position
  const currentLevel = LEVELS[gameData.level];
  gameData.playerPosition = { ...currentLevel.playerStart };
  
  // Check for game over
  if (gameData.lives <= 0) {
    changeState(GameState.GAME_OVER);
  }
}

// Handle collecting a powerup
function collectPowerup() {
  // Find which powerup was collected
  const currentLevel = LEVELS[gameData.level];
  const powerupIndex = currentLevel.powerups.findIndex(p => 
    p.x === gameData.playerPosition.x && 
    p.y === gameData.playerPosition.y
  );
  
  if (powerupIndex === -1) return; // Not found
  
  const powerup = currentLevel.powerups[powerupIndex];
  const powerupType = POWERUP_TYPES[powerup.type];
  
  // Remove from grid
  gameData.grid[gameData.playerPosition.y][gameData.playerPosition.x] = TILE_TYPES.EMPTY;
  
  // Apply powerup effect
  applyPowerup(powerup.type);
  
  // Show notification
  showNotification(powerupType.name, powerupType.effect);
}

// Apply powerup effect
function applyPowerup(type) {
  const powerupType = POWERUP_TYPES[type];
  
  switch (type) {
    case 0: // Rebase - remove all bugs
      removeAllBugs();
      break;
    case 1: // Stash - immunity to bugs
      addActivePowerup(type, powerupType.duration);
      break;
    case 2: // Cherry-pick - auto-resolve next conflict
      gameData.autoResolveNextConflict = true;
      break;
  }
}

// Add an active powerup
function addActivePowerup(type, duration) {
  const newPowerup = { type, expiresAt: Date.now() + duration };
  gameData.activePowerups.push(newPowerup);
  
  // Set timeout to remove the powerup
  if (duration > 0) {
    setTimeout(() => {
      gameData.activePowerups = gameData.activePowerups.filter(p => p !== newPowerup);
    }, duration);
  }
}

// Check if player has a specific powerup
function hasPowerupOfType(type) {
  return gameData.activePowerups.some(p => p.type === type);
}

// Remove all bugs from the level
function removeAllBugs() {
  const { grid } = gameData;
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === TILE_TYPES.BUG) {
        grid[y][x] = TILE_TYPES.EMPTY;
      }
    }
  }
  
  // Stop and restart bug movement with new positions
  if (gameData.bugIntervals) {
    gameData.bugIntervals.forEach(interval => clearInterval(interval));
    gameData.bugIntervals = [];
  }
  startBugMovement();
}

// Complete the current level
function completeLevel() {
  // Calculate level score
  const levelScoreValue = gameData.score + GAME_SETTINGS.pointsPerLevel;
  gameData.score = levelScoreValue;
  
  // Update UI
  updateScoreDisplay();
  
  // Check if all levels are complete
  if (gameData.level >= LEVELS.length - 1) {
    // Game complete
    changeState(GameState.GAME_COMPLETE);
  } else {
    // Level complete
    changeState(GameState.LEVEL_COMPLETE);
  }
}

// Start the next level
function startNextLevel() {
  // Advance to next level
  gameData.level++;
  
  // Load level
  const currentLevel = LEVELS[gameData.level];
  gameData.grid = JSON.parse(JSON.stringify(currentLevel.grid)); // Deep copy
  gameData.playerPosition = { ...currentLevel.playerStart };
  gameData.solvedConflicts = [];
  gameData.activePowerups = [];
  gameData.autoResolveNextConflict = false;
  
  // Update UI
  updateLevelDisplay();
  
  // Set canvas size based on grid dimensions
  updateCanvasSize();
  
  // Switch to playing state
  changeState(GameState.PLAYING);
}

// Handle keyboard input
function handleKeyDown(event) {
  if (currentState !== GameState.PLAYING) return;
  
  const { playerPosition, grid } = gameData;
  let newX = playerPosition.x;
  let newY = playerPosition.y;
  
  // Determine direction based on key pressed
  switch (event.key) {
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
  
  // Check if new position is valid
  if (isValidMove(newX, newY)) {
    // Update player position
    gameData.playerPosition = { x: newX, y: newY };
    
    // Check for collisions immediately
    checkCollisions();
  }
}

// Check if a move is valid
function isValidMove(x, y) {
  const { grid } = gameData;
  
  // Check bounds
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
    return false;
  }
  
  // Check if not a wall
  return grid[y][x] !== TILE_TYPES.WALL;
}

// Show notification
function showNotification(title, message) {
  const powerupNotification = document.getElementById('powerupNotification');
  const powerupName = document.getElementById('powerupName');
  const powerupEffect = document.getElementById('powerupEffect');
  
  powerupName.textContent = title;
  powerupEffect.textContent = message;
  powerupNotification.classList.remove('hidden');
  
  // Hide after 5 seconds
  setTimeout(() => {
    powerupNotification.classList.add('hidden');
  }, 5000);
}

// Update score display
function updateScoreDisplay() {
  scoreDisplay.textContent = gameData.score;
}

// Update level display
function updateLevelDisplay() {
  levelDisplay.textContent = gameData.level + 1; // 1-based display
}

// Update lives display
function updateLivesDisplay() {
  livesDisplay.textContent = gameData.lives;
}

// Add to score (can be negative)
function addScore(points) {
  gameData.score += points;
  if (gameData.score < 0) gameData.score = 0;
  updateScoreDisplay();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  // Button event listeners
  startButton.addEventListener('click', function() {
    console.log('Start button clicked');
    startNewGame();
  });
  
  restartButton.addEventListener('click', function() {
    console.log('Restart button clicked');
    startNewGame();
  });
  
  // Conflict resolution buttons
  const acceptCurrentButton = document.getElementById('acceptCurrent');
  acceptCurrentButton.addEventListener('click', function() {
    console.log('Accept current clicked');
    const { puzzle } = gameData.currentConflict;
    resolveConflict(puzzle.currentCode);
  });
  
  const acceptIncomingButton = document.getElementById('acceptIncoming');
  acceptIncomingButton.addEventListener('click', function() {
    console.log('Accept incoming clicked');
    const { puzzle } = gameData.currentConflict;
    resolveConflict(puzzle.incomingCode);
  });
  
  const mergeManuallyButton = document.getElementById('mergeManually');
  mergeManuallyButton.addEventListener('click', function() {
    console.log('Merge manually clicked');
    const { puzzle } = gameData.currentConflict;
    const manualMergeArea = document.getElementById('manualMergeArea');
    const mergeEditor = document.getElementById('mergeEditor');
    manualMergeArea.classList.remove('hidden');
    mergeEditor.value = puzzle.currentCode;
  });
  
  const submitMergeButton = document.getElementById('submitMerge');
  submitMergeButton.addEventListener('click', function() {
    console.log('Submit merge clicked');
    const mergeEditor = document.getElementById('mergeEditor');
    const solution = mergeEditor.value;
    const { puzzle } = gameData.currentConflict;
    
    // Simple check if the solution is correct
    if (solution.trim() === puzzle.correctSolution.trim()) {
      // Award bonus points for correct manual merge
      addScore(GAME_SETTINGS.pointsPerConflict * 0.5);
    }
    
    resolveConflict(solution);
  });
  
  // Game over and level complete buttons
  newGameButton.addEventListener('click', function() {
    console.log('New game clicked');
    startNewGame();
  });
  
  nextLevelButton.addEventListener('click', function() {
    console.log('Next level clicked');
    startNextLevel();
  });
  
  restartGameButton.addEventListener('click', function() {
    console.log('Restart game clicked');
    startNewGame();
  });
  
  // Keyboard event listener
  window.addEventListener('keydown', handleKeyDown);
  
  // Initialize game to menu state
  console.log('Initializing to menu state');
  gameData = initGameData();
  changeState(GameState.MENU);
});
