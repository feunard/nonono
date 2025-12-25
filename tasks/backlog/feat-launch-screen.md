# [feat] Launch Screen

**Status:** Backlog
**Priority:** High
**Type:** Feature
**Agent:** -

## Description

Add a React-based launch screen that displays before the game starts. This is the first step towards a multi-page React application where Phaser is only used for the actual gameplay, not the entire app lifecycle.

## Goals

- Separate "app" from "game"
- React controls the full user journey (menus, settings, game, game over)
- Phaser only runs during active gameplay
- Foundation for future screens (settings, stats, leaderboard, etc.)

## Acceptance Criteria

- [ ] Launch screen displays on app start (pure React, no Phaser yet)
- [ ] Follows black & white theme (consistent with other UI)
- [ ] Game title/logo displayed
- [ ] "Start Game" button prominently visible
- [ ] Clicking "Start Game" initializes Phaser and shows game
- [ ] Phaser does NOT initialize until "Start Game" is clicked
- [ ] Smooth transition from launch screen to game

## UI Layout

```
┌─────────────────────────────┐
│                             │
│                             │
│        [GAME TITLE]         │
│                             │
│       [ Start Game ]        │
│                             │
│                             │
└─────────────────────────────┘
```

## Context

- Entry point: `src/App.tsx`
- Create: `src/ui/screens/LaunchScreen.tsx`
- Reuse existing primitives: Button, Card from `src/ui/primitives/`
- State: Add `gameState` to gameStore (`menu` | `loading` | `playing` | `gameover`)

## Implementation Notes

- App.tsx manages which screen to show based on gameState
- LaunchScreen is a full-screen React component
- Only initialize Phaser game instance when transitioning to `playing`
- Consider: lazy load Phaser to improve initial load time

## Future Considerations (do not implement now)

- Settings screen
- Character/loadout selection
- Stats/leaderboard screen
- Sound toggle on launch screen

## History

_No history yet_
