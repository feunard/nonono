# [feat] Launch Screen

**Status:** Done
**Priority:** High
**Type:** Feature
**Agent:** Cartman

## Description

Add a React-based launch screen that displays before the game starts. This is the first step towards a multi-page React application where Phaser is only used for the actual gameplay, not the entire app lifecycle.

## Goals

- Separate "app" from "game"
- React controls the full user journey (menus, settings, game, game over)
- Phaser only runs during active gameplay
- Foundation for future screens (settings, stats, leaderboard, etc.)

## Acceptance Criteria

- [x] Launch screen displays on app start (pure React, no Phaser yet)
- [x] Follows black & white theme (consistent with other UI)
- [x] Game title/logo displayed
- [x] "Start Game" button prominently visible
- [x] Clicking "Start Game" initializes Phaser and shows game
- [x] Phaser does NOT initialize until "Start Game" is clicked
- [x] Smooth transition from launch screen to game

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

### Completed by Cartman

- Added `AppScreen` type (`"menu" | "playing"`) to gameStore
- Added `appScreen` state initialized to `"menu"`
- Added `startGame()` action to transition from menu to playing
- Created `src/ui/screens/LaunchScreen.tsx`:
  - Full-screen white background with centered content
  - Game title "SURVIVOR" with subtitle
  - "Start Game" button using existing Button primitive
  - Shows Enter key hint via Kbd primitive
- Updated `App.tsx`:
  - Shows LaunchScreen when `appScreen === "menu"`
  - Phaser only initializes when `appScreen === "playing"`
  - Added Enter key handler to start game from menu
  - Smooth transition via existing LoadingScreen
