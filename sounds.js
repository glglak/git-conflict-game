// Game sound effects
const SOUNDS = {
    move: new Audio('sounds/move.mp3'),
    conflict: new Audio('sounds/conflict.mp3'),
    powerup: new Audio('sounds/powerup.mp3'),
    bug: new Audio('sounds/bug.mp3'),
    win: new Audio('sounds/win.mp3'),
    lose: new Audio('sounds/lose.mp3'),
    commit: new Audio('sounds/commit.mp3')
};

// Initialize all sounds
Object.values(SOUNDS).forEach(sound => {
    sound.volume = 0.3;  // Set default volume
});

// Sound control
let soundEnabled = true;

function playSound(soundName) {
    if (soundEnabled && SOUNDS[soundName]) {
        SOUNDS[soundName].currentTime = 0;  // Reset sound to start
        SOUNDS[soundName].play().catch(e => console.log('Sound play error:', e));
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

// Export sound functions
window.GameSounds = {
    play: playSound,
    toggle: toggleSound,
    isEnabled: () => soundEnabled
};
