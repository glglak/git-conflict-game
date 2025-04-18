// Game assets and constants

// Tile types
const TILE_TYPES = {
    EMPTY: 0,
    WALL: 1,
    CONFLICT: 2,
    BUG: 3,
    POWERUP: 4,
    COMMIT: 5
};

// Tile colors
const TILE_COLORS = {
    [TILE_TYPES.EMPTY]: '#161b22',    // Dark background
    [TILE_TYPES.WALL]: '#30363d',     // Gray walls
    [TILE_TYPES.CONFLICT]: '#f0883e', // Orange conflict
    [TILE_TYPES.BUG]: '#f85149',      // Red bug
    [TILE_TYPES.POWERUP]: '#58a6ff',  // Blue powerup
    [TILE_TYPES.COMMIT]: '#7ee787'    // Green commit
};

// Player settings
const PLAYER = {
    color: '#c9d1d9',
    size: 0.7,  // Size relative to tile (0-1)
    speed: 5    // Movement speed
};

// Game settings
const GAME_SETTINGS = {
    tileSize: 40,
    animationSpeed: 16, // ms per frame
    bugMovementInterval: 1000, // ms between bug movements
    initialLives: 3,
    pointsPerConflict: 100,
    pointsPerLevel: 500,
    pointPenaltyPerBug: 50
};