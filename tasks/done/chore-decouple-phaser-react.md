# [chore] Decouple Phaser initialization from React startup

**Status:** Done
**Priority:** High
**Type:** Refactor
**Agent:** Francis

## Description

Restructure the app so React loads first and controls the entire loading experience. Phaser should be treated as an "addon" that initializes in the background while React shows a loading screen. This improves perceived performance and gives full control of the loading UX to React.

**Current Flow:**
React + Phaser init together → Phaser BootScene shows loading → Game starts

**Target Flow:**
1. React app mounts immediately
2. React shows a loading screen (styled, with progress if possible)
3. Phaser initializes in background (canvas hidden)
4. Phaser BootScene loads assets (hidden)
5. When Phaser is fully ready, signal React
6. React hides loading screen, reveals Phaser canvas
7. Game starts

## Acceptance Criteria

- [x] React app renders instantly with a loading screen
- [x] Phaser canvas is hidden during initialization
- [x] Phaser BootScene loading is not visible to user
- [x] React receives "ready" signal from Phaser when game is loaded
- [x] Smooth transition from React loading to Phaser canvas
- [x] Loading screen follows black & white theme
- [x] No flash of unstyled content or blank screens

## Context

- Entry point: `src/main.tsx`, `src/App.tsx`
- Phaser config in `src/App.tsx`
- BootScene: `src/scenes/BootScene.ts`
- State bridge: `src/stores/gameStore.ts` (add `isGameReady` state)

## Implementation Notes

- Add `isGameReady` to gameStore, set to `true` when GameScene starts
- Phaser canvas: `visibility: hidden` or `opacity: 0` until ready
- Consider adding loading progress from Phaser's loader events

## History

### Completed - Francis - Done

- Added `isGameReady` state to gameStore with `setGameReady()` action
- Created `LoadingScreen` component (black & white theme, spinning loader)
- App.tsx shows LoadingScreen until Phaser signals ready
- Phaser canvas is hidden (opacity: 0) during initialization
- GameScene calls `gameStore.setGameReady()` at end of create()
- Smooth 500ms fade transition between loading screen and game
