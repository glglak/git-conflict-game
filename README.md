# Git Conflict Game

A fun game that teaches Git concepts through gameplay! Navigate through levels, resolve conflicts, avoid bugs, and earn power-ups.

## Enhanced Features

The game has been improved with:

1. **Comprehensive error handling** with try/catch blocks throughout the code
   - Prevents the game from crashing on unexpected errors
   - Provides informative error messages to users

2. **Improved notification system** with styling and animations
   - Better visual feedback
   - Notifications fade out after displaying

3. **Random game over messages** related to Git concepts
   - Makes the game more engaging and educational
   - Ties into the Git theme of the game

4. **Cherry-pick powerup** for auto-resolving conflicts
   - New gameplay mechanic
   - Allows automatic conflict resolution

5. **Better UI feedback** when bugs are encountered
   - Clear messaging about lives remaining
   - More informative error modals

## How to Play

1. **Objective**: Navigate through the maze, resolve conflicts, and reach the commit (green checkmark) while avoiding bugs.

2. **Controls**: Use WASD or arrow keys to move.

3. **Game Elements**:
   - **Player**: You control the white circle
   - **Conflicts**: Orange tiles with ! marks - Must be resolved
   - **Bugs**: Red tiles with bug icons - Avoid these!
   - **Power-ups**: Blue tiles with lightning icons - Collect for special abilities
   - **Commit**: Green tile with checkmark - Reach this to complete the level

4. **Power-ups**:
   - **Rebase**: Removes all bugs temporarily
   - **Stash**: Gives an extra life
   - **Cherry-pick**: Auto-resolves next conflict

## Implementation Details

The game is implemented using vanilla JavaScript with HTML5 Canvas for rendering. The enhanced version uses:

- Self-healing error handling to prevent crashes
- Enhanced UI features with transitions and animations
- Improved game mechanics with additional power-up effects

Enjoy playing and learning Git concepts at the same time!
