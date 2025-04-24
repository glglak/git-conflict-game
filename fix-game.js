/**
 * Git Conflict Game - Fix Script
 * 
 * Run this script to automatically apply enhanced error handling and new features
 * to the Git Conflict Game by updating the simple-game.js file.
 * 
 * Usage: Just include this script in your HTML after simple-game.js
 * This will automatically enhance the game with improved features
 */

(() => {
  console.log('⚡ Applying Git Conflict Game enhancements...');
  
  // 1. Add cherry-pick support
  if (!gameState.cherryPickActive && POWERUP_TYPES) {
    console.log('Adding cherry-pick support');
    
    // Update resetGame function to include cherryPickActive
    const originalResetGame = resetGame;
    resetGame = function() {
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
    };
  }
  
  // 2. Enhanced handleConflict function with cherry-pick support
  const originalHandleConflict = handleConflict;
  handleConflict = function() {
    try {
      // Check if conflict already solved
      const conflictKey = `${gameState.playerX},${gameState.playerY}`;
      if (gameState.solvedConflicts.includes(conflictKey)) return;
      
      // Check if cherry-pick is active
      if (gameState.cherryPickActive) {
        // Auto-resolve conflict
        resolveConflict(true);
        gameState.cherryPickActive = false;
        showNotification("Cherry-pick", "Conflict automatically resolved!");
        return;
      }
      
      gameState.gameRunning = false;
      const modal = document.getElementById('conflictModal');
      const codeDisplay = document.querySelector('.code-display p');
      
      if (modal && codeDisplay) {
        codeDisplay.textContent = CONFLICT_MESSAGES[gameState.solvedConflicts.length % CONFLICT_MESSAGES.length];
        modal.classList.remove('hidden');
      } else {
        throw new Error("Conflict modal elements not found");
      }
    } catch (error) {
      console.error("Error handling conflict:", error);
      gameState.gameRunning = true;
      showNotification("Error", "Could not process conflict: " + error.message);
    }
  };
  
  // 3. Create improved resolveConflict function with auto-resolve support
  const originalResolveConflict = window.resolveConflict || function() {
    gameState.score += 100;
    gameState.grid[gameState.playerY][gameState.playerX] = TILE_TYPES.EMPTY;
    gameState.solvedConflicts.push(`${gameState.playerX},${gameState.playerY}`);
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('conflictModal').classList.add('hidden');
    document.getElementById('manualMergeArea').classList.add('hidden');
    gameState.gameRunning = true;
  };
  
  window.resolveConflict = function(autoResolved = false) {
    try {
      gameState.score += autoResolved ? 50 : 100;
      gameState.grid[gameState.playerY][gameState.playerX] = TILE_TYPES.EMPTY;
      gameState.solvedConflicts.push(`${gameState.playerX},${gameState.playerY}`);
      
      document.getElementById('score').textContent = gameState.score;
      
      // Hide modal and resume game
      if (!autoResolved) {
        document.getElementById('conflictModal').classList.add('hidden');
        document.getElementById('manualMergeArea').classList.add('hidden');
      }
      
      gameState.gameRunning = true;
    } catch (error) {
      console.error("Error resolving conflict:", error);
      showNotification("Error", "Failed to resolve conflict: " + error.message);
      
      // Try to resume game
      gameState.gameRunning = true;
    }
  };
  
  // 4. Add central updateUIElements function
  if (!window.updateUIElements) {
    window.updateUIElements = function() {
      try {
        document.getElementById('score').textContent = gameState.score;
        document.getElementById('level').textContent = gameState.level + 1;
        document.getElementById('lives').textContent = gameState.lives;
      } catch (error) {
        console.error("Error updating UI elements:", error);
      }
    };
  }
  
  // 5. Enhance handlePowerup function
  const originalHandlePowerup = handlePowerup;
  handlePowerup = function() {
    try {
      gameState.score += 50;
      gameState.grid[gameState.playerY][gameState.playerX] = TILE_TYPES.EMPTY;
      updateUIElements();
      
      // Get random powerup
      const powerupIndex = Math.floor(Math.random() * POWERUP_TYPES.length);
      const powerup = POWERUP_TYPES[powerupIndex];
      
      // Apply powerup effect
      switch (powerupIndex) {
        case 0: // Rebase - remove bugs temporarily
          const bugPositions = [];
          gameState.bugs.forEach(bug => {
            if (gameState.grid[bug.y][bug.x] === TILE_TYPES.BUG) {
              gameState.grid[bug.y][bug.x] = TILE_TYPES.EMPTY;
              bugPositions.push({x: bug.x, y: bug.y});
            }
          });
          
          // Restore bugs after 5 seconds
          setTimeout(() => {
            if (gameState.gameRunning) {
              bugPositions.forEach(pos => {
                if (gameState.grid[pos.y][pos.x] === TILE_TYPES.EMPTY) {
                  gameState.grid[pos.y][pos.x] = TILE_TYPES.BUG;
                }
              });
            }
          }, 5000);
          break;
          
        case 1: // Stash - extra life
          gameState.lives++;
          updateUIElements();
          break;
          
        case 2: // Cherry-pick - auto-resolve next conflict
          gameState.cherryPickActive = true;
          break;
      }
      
      // Show powerup message
      showNotification(powerup.name, powerup.effect);
    } catch (error) {
      console.error("Error handling powerup:", error);
      showNotification("Error", "Could not process powerup: " + error.message);
    }
  };
  
  // 6. Enhance handleBug function with better error handling and messages
  const originalHandleBug = handleBug;
  handleBug = function(message) {
    try {
      gameState.lives--;
      gameState.score = Math.max(0, gameState.score - 50);
      
      // Update UI
      updateUIElements();
      
      // Reset position
      const currentLevel = LEVELS[gameState.level];
      gameState.playerX = currentLevel.playerStart.x;
      gameState.playerY = currentLevel.playerStart.y;
      
      if (gameState.lives <= 0) {
        gameOver(message);
      } else {
        showNotification("Warning", message || "You hit a bug!" + ` ${gameState.lives} lives remaining.`);
      }
    } catch (error) {
      console.error("Error handling bug collision:", error);
      showNotification("Error", "Bug collision error: " + error.message);
    }
  };
  
  // 7. Enhance gameOver function with random messages
  const originalGameOver = gameOver;
  gameOver = function(message) {
    try {
      gameState.gameRunning = false;
      
      // Clear bug movement
      if (bugInterval) {
        clearInterval(bugInterval);
        bugInterval = null;
      }
      
      const modal = document.getElementById('gameOverModal');
      const msgElement = document.getElementById('gameOverMessage');
      const scoreElement = document.getElementById('finalScore');
      
      if (modal && scoreElement) {
        // Set a random game over message if not specified
        if (!message) {
          message = GAME_OVER_MESSAGES[Math.floor(Math.random() * GAME_OVER_MESSAGES.length)];
        }
        
        if (msgElement) {
          msgElement.textContent = message;
        }
        
        scoreElement.textContent = gameState.score;
        modal.classList.remove('hidden');
      } else {
        throw new Error("Game over modal elements not found");
      }
    } catch (error) {
      console.error("Error displaying game over:", error);
      alert(`Game Over! Final score: ${gameState.score}`);
    }
  };
  
  // 8. Enhanced handleCommit with better error handling
  const originalHandleCommit = handleCommit;
  handleCommit = function(ctx, canvas) {
    try {
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
    } catch (error) {
      console.error("Error handling commit:", error);
      showNotification("Error", "Level completion error: " + error.message);
    }
  };
  
  // 9. Add error modal function
  if (!window.showErrorModal) {
    window.showErrorModal = function(title, message) {
      try {
        // Create error modal if it doesn't exist
        let errorModal = document.getElementById('errorModal');
        
        if (!errorModal) {
          errorModal = document.createElement('div');
          errorModal.id = 'errorModal';
          errorModal.className = 'modal';
          
          const content = document.createElement('div');
          content.className = 'modal-content';
          
          const heading = document.createElement('h2');
          heading.textContent = title;
          heading.style.color = '#f85149';
          
          const text = document.createElement('p');
          text.textContent = message;
          
          const button = document.createElement('button');
          button.textContent = 'OK';
          button.onclick = function() {
            errorModal.classList.add('hidden');
          };
          
          content.appendChild(heading);
          content.appendChild(text);
          content.appendChild(button);
          errorModal.appendChild(content);
          
          document.body.appendChild(errorModal);
        } else {
          // Update existing modal
          errorModal.querySelector('h2').textContent = title;
          errorModal.querySelector('p').textContent = message;
          errorModal.classList.remove('hidden');
        }
      } catch (error) {
        console.error("Failed to show error modal:", error);
        alert(`Error: ${title}\n${message}`);
      }
    };
  }
  
  // 10. Enhance notification function
  const originalShowNotification = showNotification;
  showNotification = function(title, message) {
    try {
      const notificationDiv = document.createElement('div');
      notificationDiv.className = 'notification';
      
      notificationDiv.innerHTML = `
        <h3 style="color: #58a6ff; margin: 0 0 5px 0;">${title}</h3>
        <p style="margin: 0;">${message}</p>
      `;
      
      document.body.appendChild(notificationDiv);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notificationDiv.style.opacity = '0';
        notificationDiv.style.transform = 'translateX(100%)';
        
        // Remove from DOM after animation
        setTimeout(() => {
          notificationDiv.remove();
        }, 300);
      }, 3000);
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  };
  
  // 11. Add game over messages array if it doesn't exist
  if (!window.GAME_OVER_MESSAGES) {
    window.GAME_OVER_MESSAGES = [
      "Your repository has become corrupted!",
      "Too many merge conflicts - repository abandoned!",
      "Fatal: cannot rebase onto multiple branches",
      "Error: detached HEAD state cannot be resolved",
      "Refusing to merge unrelated histories"
    ];
  }
  
  // Report successful enhancement
  console.log('✅ All enhancements have been applied successfully!');
  console.log('Enjoy the improved Git Conflict Game with better error handling and new features.');
})();
