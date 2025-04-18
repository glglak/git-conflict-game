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

// Conflict puzzles
const CONFLICT_PUZZLES = [
    {
        name: 'Function Parameter Conflict',
        currentCode: 'function processData(data) {\n  return data.filter(item => item.active);\n}',
        incomingCode: 'function processData(data, options) {\n  return data.filter(item => item.active && options.includeArchived);\n}',
        correctSolution: 'function processData(data, options = {}) {\n  return data.filter(item => item.active && (options.includeArchived || false));\n}',
        difficulty: 1
    },
    {
        name: 'CSS Style Conflict',
        currentCode: '.button {\n  background-color: blue;\n  color: white;\n  padding: 10px;\n}',
        incomingCode: '.button {\n  background-color: green;\n  color: white;\n  border-radius: 5px;\n}',
        correctSolution: '.button {\n  background-color: green;\n  color: white;\n  padding: 10px;\n  border-radius: 5px;\n}',
        difficulty: 1
    },
    {
        name: 'Array Method Conflict',
        currentCode: 'const filteredItems = items.filter(item => {\n  return item.price > 20;\n});',
        incomingCode: 'const filteredItems = items.filter(item => {\n  return item.price > 20 && item.inStock;\n}).sort((a, b) => a.price - b.price);',
        correctSolution: 'const filteredItems = items.filter(item => {\n  return item.price > 20 && item.inStock;\n}).sort((a, b) => a.price - b.price);',
        difficulty: 2
    },
    {
        name: 'HTML Structure Conflict',
        currentCode: '<div class="container">\n  <h1>Welcome</h1>\n  <p>This is a paragraph.</p>\n</div>',
        incomingCode: '<div class="container">\n  <h1>Hello World</h1>\n  <button>Click me</button>\n</div>',
        correctSolution: '<div class="container">\n  <h1>Hello World</h1>\n  <p>This is a paragraph.</p>\n  <button>Click me</button>\n</div>',
        difficulty: 2
    },
    {
        name: 'JSON Configuration Conflict',
        currentCode: '{\n  "name": "project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^17.0.2"\n  }\n}',
        incomingCode: '{\n  "name": "project",\n  "version": "1.1.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "lodash": "^4.17.21"\n  }\n}',
        correctSolution: '{\n  "name": "project",\n  "version": "1.1.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "lodash": "^4.17.21"\n  }\n}',
        difficulty: 3
    }
];

// Power-up types
const POWERUP_TYPES = [
    {
        name: 'Rebase',
        effect: 'Removes all bugs from the current level',
        duration: 0  // Instant effect
    },
    {
        name: 'Stash',
        effect: 'Immunity to bugs for a short time',
        duration: 10000  // 10 seconds
    },
    {
        name: 'Cherry-pick',
        effect: 'Solve the next conflict automatically',
        duration: 0  // Until next conflict
    }
];