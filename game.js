// Main game logic

// Game state
let gameState = {
    level: 0,
    score: 0,
    lives: GAME_SETTINGS.initialLives,
    playerPosition: { x: 0, y: 0 },
    activePowerups: [],
    solvedConflicts: [],
    gameRunning: false,
    animationFrameId: null,
    currentConflict: null,
    autoResolveNextConflict: false,
    grid: [],
    bugIntervals: []
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI elements
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const livesDisplay = document.getElementById('lives');
const conflictModal = document.getElementById('conflictModal');
const conflictCode = document.getElementById('conflictCode');
const acceptCurrentButton = document.getElementById('acceptCurrent');
const acceptIncomingButton = document.getElementById('acceptIncoming');
const mergeManuallyButton = document.getElementById('mergeManually');
const manualMergeArea = document.getElementById('manualMergeArea');
const mergeEditor = document.getElementById('mergeEditor');
const submitMergeButton = document.getElementById('submitMerge');
const gameOverModal = document.getElementById('gameOverModal');
const finalScore = document.getElementById('finalScore');
const newGameButton = document.getElementById('newGameButton');
const levelCompleteModal = document.getElementById('levelCompleteModal');
const levelScore = document.getElementById('levelScore');
const nextLevelButton = document.getElementById('nextLevelButton');
const gameCompleteModal = document.getElementById('gameCompleteModal');
const completeScore = document.getElementById('completeScore');
const restartGameButton = document.getElementById('restartGameButton');
const powerupNotification = document.getElementById('powerupNotification');
const powerupName = document.getElementById('powerupName');
const powerupEffect = document.getElementById('powerupEffect');

// Initialize game
function initGame() {
    // Reset game state
    gameState = {
        level: 0,
        score: 0,
        lives: GAME_SETTINGS.initialLives,
        playerPosition: { ...LEVELS[0].playerStart },
        activePowerups: [],
        solvedConflicts: [],
        gameRunning: true,
        animationFrameId: null,
        currentConflict: null,
        autoResolveNextConflict: false,
        grid: JSON.parse(JSON.stringify(LEVELS[0].grid)), // Deep copy
        bugIntervals: []
    };
    
    // Make sure all modals are hidden
    conflictModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    levelCompleteModal.classList.add('hidden');
    gameCompleteModal.classList.add('hidden');
    
    // Update UI
    updateScoreDisplay();
    updateLevelDisplay();
    updateLivesDisplay();
    
    // Set canvas size based on grid dimensions
    const currentLevel = LEVELS[gameState.level];
    canvas.width = currentLevel.grid[0].length * GAME_SETTINGS.tileSize;
    canvas.height = currentLevel.grid.length * GAME_SETTINGS.tileSize;
    
    // Start game loop
    gameLoop();
    
    // Start bug movement
    startBugMovement();
}

// Game loop
function gameLoop() {
    if (!gameState.gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw player
    drawPlayer();
    
    // Check for collisions
    checkCollisions();
    
    // Request next frame
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// Draw the game grid
function drawGrid() {
    const { grid } = gameState;
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
    const { playerPosition } = gameState;
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
    if (gameState.activePowerups.length > 0) {
        ctx.strokeStyle = TILE_COLORS[TILE_TYPES.POWERUP];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Check for collisions with special tiles
function checkCollisions() {
    const { playerPosition, grid } = gameState;
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
    // Pause game
    pauseGame();
    
    // Find which conflict was encountered
    const currentLevel = LEVELS[gameState.level];
    const conflict = currentLevel.conflicts.find(c => 
        c.x === gameState.playerPosition.x && 
        c.y === gameState.playerPosition.y &&
        !gameState.solvedConflicts.includes(`${c.x},${c.y}`)
    );
    
    if (!conflict) return; // Already solved
    
    // Get puzzle details
    const puzzle = CONFLICT_PUZZLES[conflict.puzzleIndex];
    gameState.currentConflict = { conflict, puzzle };
    
    // Check if we have auto-resolve powerup
    if (gameState.autoResolveNextConflict) {
        autoResolveConflict();
        return;
    }
    
    // Format conflict display
    conflictCode.innerHTML = `
        <h3>${puzzle.name}</h3>
        <p>Current code:</p>
        <pre class="current-code">${puzzle.currentCode}</pre>
        <p>Incoming code:</p>
        <pre class="incoming-code">${puzzle.incomingCode}</pre>
    `;
    
    // Show conflict modal
    conflictModal.classList.remove('hidden');
    
    // Reset manual merge area
    manualMergeArea.classList.add('hidden');
}

// Auto-resolve a conflict (cherry-pick powerup)
function autoResolveConflict() {
    const { conflict, puzzle } = gameState.currentConflict;
    
    // Mark as resolved
    resolveConflict(puzzle.correctSolution);
    
    // Show notification
    showNotification('Auto-resolved!', 'Cherry-pick resolved the conflict automatically.');
    
    // Reset the powerup flag
    gameState.autoResolveNextConflict = false;
}

// Resolve a conflict
function resolveConflict(solution) {
    const { conflict } = gameState.currentConflict;
    const { x, y } = conflict;
    
    // Mark as solved
    gameState.solvedConflicts.push(`${x},${y}`);
    
    // Clear conflict from grid
    gameState.grid[y][x] = TILE_TYPES.EMPTY;
    
    // Award points
    addScore(GAME_SETTINGS.pointsPerConflict);
    
    // Resume game
    resumeGame();
}

// Handle collision with a bug
function handleBugCollision() {
    // Lose a life
    gameState.lives--;
    updateLivesDisplay();
    
    // Deduct points
    addScore(-GAME_SETTINGS.pointPenaltyPerBug);
    
    // Move player back to start position
    const currentLevel = LEVELS[gameState.level];
    gameState.playerPosition = { ...currentLevel.playerStart };
    
    // Check for game over
    if (gameState.lives <= 0) {
        gameOver();
    }
}

// Handle collecting a powerup
function collectPowerup() {
    // Find which powerup was collected
    const currentLevel = LEVELS[gameState.level];
    const powerupIndex = currentLevel.powerups.findIndex(p => 
        p.x === gameState.playerPosition.x && 
        p.y === gameState.playerPosition.y
    );
    
    if (powerupIndex === -1) return; // Not found
    
    const powerup = currentLevel.powerups[powerupIndex];
    const powerupType = POWERUP_TYPES[powerup.type];
    
    // Remove from grid
    gameState.grid[gameState.playerPosition.y][gameState.playerPosition.x] = TILE_TYPES.EMPTY;
    
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
            gameState.autoResolveNextConflict = true;
            break;
    }
}

// Add an active powerup
function addActivePowerup(type, duration) {
    const newPowerup = { type, expiresAt: Date.now() + duration };
    gameState.activePowerups.push(newPowerup);
    
    // Set timeout to remove the powerup
    if (duration > 0) {
        setTimeout(() => {
            gameState.activePowerups = gameState.activePowerups.filter(p => p !== newPowerup);
        }, duration);
    }
}

// Check if player has a specific powerup
function hasPowerupOfType(type) {
    return gameState.activePowerups.some(p => p.type === type);
}

// Remove all bugs from the level
function removeAllBugs() {
    const { grid } = gameState;
    
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === TILE_TYPES.BUG) {
                grid[y][x] = TILE_TYPES.EMPTY;
            }
        }
    }
    
    // Stop and restart bug movement with new positions
    stopBugMovement();
    startBugMovement();
}

// Handle level completion
function completeLevel() {
    // Pause game
    pauseGame();
    
    // Calculate level score
    const levelScoreValue = gameState.score + GAME_SETTINGS.pointsPerLevel;
    gameState.score = levelScoreValue;
    
    // Update UI
    levelScore.textContent = levelScoreValue;
    updateScoreDisplay();
    
    // Check if all levels are complete
    if (gameState.level >= LEVELS.length - 1) {
        // Game complete
        completeScore.textContent = gameState.score;
        gameCompleteModal.classList.remove('hidden');
    } else {
        // Next level
        levelCompleteModal.classList.remove('hidden');
    }
}

// Start the next level
function startNextLevel() {
    // Hide modal
    levelCompleteModal.classList.add('hidden');
    
    // Stop bug movement
    stopBugMovement();
    
    // Advance to next level
    gameState.level++;
    
    // Load level
    const currentLevel = LEVELS[gameState.level];
    gameState.grid = JSON.parse(JSON.stringify(currentLevel.grid)); // Deep copy
    gameState.playerPosition = { ...currentLevel.playerStart };
    gameState.solvedConflicts = [];
    gameState.activePowerups = [];
    gameState.autoResolveNextConflict = false;
    
    // Update UI
    updateLevelDisplay();
    
    // Set canvas size based on grid dimensions
    canvas.width = currentLevel.grid[0].length * GAME_SETTINGS.tileSize;
    canvas.height = currentLevel.grid.length * GAME_SETTINGS.tileSize;
    
    // Resume game
    resumeGame();
    
    // Start bug movement
    startBugMovement();
}

// Game over
function gameOver() {
    // Pause game
    pauseGame();
    
    // Stop bug movement
    stopBugMovement();
    
    // Update UI
    finalScore.textContent = gameState.score;
    gameOverModal.classList.remove('hidden');
}

// Start bug movement
function startBugMovement() {
    const currentLevel = LEVELS[gameState.level];
    
    // Create a deep copy of bugs array for movement
    const bugs = JSON.parse(JSON.stringify(currentLevel.bugs));
    
    // Set up movement intervals for each bug
    bugs.forEach((bug, index) => {
        const intervalId = setInterval(() => {
            moveBug(bug, index);
        }, GAME_SETTINGS.bugMovementInterval);
        
        gameState.bugIntervals.push(intervalId);
    });
}

// Stop bug movement
function stopBugMovement() {
    // Clear all intervals
    gameState.bugIntervals.forEach(intervalId => clearInterval(intervalId));
    gameState.bugIntervals = [];
}

// Move a bug
function moveBug(bug, bugIndex) {
    if (!gameState.gameRunning) return;
    
    const { grid } = gameState;
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
        if (gameState.playerPosition.x === newX && gameState.playerPosition.y === newY) {
            if (!hasPowerupOfType(1)) { // If not immune
                handleBugCollision();
            }
        }
    }
    
    // Update the bugs array in the current level
    const currentLevel = LEVELS[gameState.level];
    currentLevel.bugs[bugIndex] = { ...bug };
}

// Handle keyboard input
function handleKeyDown(event) {
    if (!gameState.gameRunning) return;
    
    const { playerPosition, grid } = gameState;
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
        gameState.playerPosition = { x: newX, y: newY };
        
        // Check for collisions immediately
        checkCollisions();
    }
}

// Check if a move is valid
function isValidMove(x, y) {
    const { grid } = gameState;
    
    // Check bounds
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
        return false;
    }
    
    // Check if not a wall
    return grid[y][x] !== TILE_TYPES.WALL;
}

// Pause the game
function pauseGame() {
    gameState.gameRunning = false;
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
        gameState.animationFrameId = null;
    }
}

// Resume the game
function resumeGame() {
    gameState.gameRunning = true;
    gameLoop();
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = gameState.score;
}

// Update level display
function updateLevelDisplay() {
    levelDisplay.textContent = gameState.level + 1; // 1-based display
}

// Update lives display
function updateLivesDisplay() {
    livesDisplay.textContent = gameState.lives;
}

// Add to score (can be negative)
function addScore(points) {
    gameState.score += points;
    if (gameState.score < 0) gameState.score = 0;
    updateScoreDisplay();
}

// Show notification
function showNotification(title, message) {
    powerupName.textContent = title;
    powerupEffect.textContent = message;
    powerupNotification.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
        powerupNotification.classList.add('hidden');
    }, 5000);
}

// Event listeners
startButton.addEventListener('click', () => {
    startButton.classList.add('hidden');
    restartButton.classList.remove('hidden');
    initGame();
});

restartButton.addEventListener('click', () => {
    stopBugMovement();
    initGame();
});

// Conflict resolution buttons
acceptCurrentButton.addEventListener('click', () => {
    const { puzzle } = gameState.currentConflict;
    resolveConflict(puzzle.currentCode);
    conflictModal.classList.add('hidden');
});

acceptIncomingButton.addEventListener('click', () => {
    const { puzzle } = gameState.currentConflict;
    resolveConflict(puzzle.incomingCode);
    conflictModal.classList.add('hidden');
});

mergeManuallyButton.addEventListener('click', () => {
    const { puzzle } = gameState.currentConflict;
    manualMergeArea.classList.remove('hidden');
    mergeEditor.value = puzzle.currentCode;
});

submitMergeButton.addEventListener('click', () => {
    const solution = mergeEditor.value;
    const { puzzle } = gameState.currentConflict;
    
    // Simple check if the solution is correct
    // In a real game, you'd want more sophisticated validation
    if (solution.trim() === puzzle.correctSolution.trim()) {
        // Award bonus points for correct manual merge
        addScore(GAME_SETTINGS.pointsPerConflict * 0.5);
    }
    
    resolveConflict(solution);
    conflictModal.classList.add('hidden');
});

// Game over and level complete buttons
newGameButton.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    initGame();
});

nextLevelButton.addEventListener('click', () => {
    startNextLevel();
});

restartGameButton.addEventListener('click', () => {
    gameCompleteModal.classList.add('hidden');
    initGame();
});

// Keyboard event listener
window.addEventListener('keydown', handleKeyDown);

// Initialize game when window loads
window.addEventListener('load', () => {
    // Make sure all modals are hidden initially
    conflictModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    levelCompleteModal.classList.add('hidden');
    gameCompleteModal.classList.add('hidden');
    
    // Just show the start button, don't auto-start
    startButton.classList.remove('hidden');
    restartButton.classList.add('hidden');
});