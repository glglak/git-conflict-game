// Game levels

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
        conflicts: [{ x: 4, y: 4, puzzleIndex: 0 }],
        bugs: [{ x: 6, y: 4, movementPattern: 'horizontal', range: 2 }],
        powerups: [],
        message: "Welcome to your first feature branch! Navigate to the conflict, resolve it, and reach the commit zone."
    },

    // Level 2: More conflicts and bugs
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
        conflicts: [
            { x: 2, y: 2, puzzleIndex: 1 },
            { x: 11, y: 2, puzzleIndex: 2 }
        ],
        bugs: [
            { x: 3, y: 7, movementPattern: 'horizontal', range: 3 },
            { x: 8, y: 7, movementPattern: 'vertical', range: 2 }
        ],
        powerups: [{ x: 10, y: 9, type: 0 }],
        message: "Time to handle a merge request! There are multiple conflicts to resolve and more bugs to avoid."
    },

    // Level 3: Complex level with more elements
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
        conflicts: [
            { x: 3, y: 7, puzzleIndex: 3 },
            { x: 9, y: 7, puzzleIndex: 4 }
        ],
        bugs: [
            { x: 8, y: 10, movementPattern: 'horizontal', range: 2 },
            { x: 12, y: 13, movementPattern: 'vertical', range: 3 },
            { x: 5, y: 5, movementPattern: 'circular', range: 2 }
        ],
        powerups: [
            { x: 3, y: 3, type: 1 },
            { x: 11, y: 11, type: 2 }
        ],
        message: "Welcome to rebase hell! Navigate the complex maze, solve multiple conflicts, and watch out for those pesky bugs."
    }
];