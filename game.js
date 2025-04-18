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