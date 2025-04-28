# Git Conflict Game

A fun game that teaches Git concepts through gameplay! Navigate through levels, resolve conflicts, avoid bugs, and earn power-ups.

## Enhanced Features

The game has been improved with:

1. **Sound Effects** for immersive gameplay
   - Movement, conflict resolution, power-up collection
   - Bug collisions and level completion
   - Toggleable in settings

2. **Multiple Themes** to suit your preferences
   - Dark theme (default)
   - Light theme for better visibility
   - Matrix theme for a retro feel

3. **Difficulty Settings** to match your skill level
   - Easy: Slower bugs, longer power-up duration
   - Normal: Balanced gameplay
   - Hard: Faster bugs, shorter power-up duration

4. **Settings Panel** for customization
   - Sound toggle
   - Theme selection
   - Difficulty adjustment
   - Settings persist between sessions

5. **Improved UI/UX**
   - Better visual feedback
   - Smooth transitions
   - Persistent user preferences
   - Responsive controls

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
