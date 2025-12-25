# [chore] GameStore Refactoring

**Status:** Done
**Priority:** Medium
**Type:** Refactor
**Agent:** task-worker

## Description

Refactor the monolithic gameStore into multiple focused stores based on logic. Remove unused state keys and fix any broken tests after refactoring.

## Current State

- Single `gameStore.ts` with all game state
- Mixed concerns (hero, UI, game flow, debug)
- Possibly unused keys from old features
- May have stale state that's never cleaned up

## Target State

- Multiple small, focused stores
- Clear separation of concerns
- No unused state
- All tests passing

## Acceptance Criteria

- [x] Audit current gameStore for unused keys
- [x] Remove all unused state and actions
- [x] Split into logical stores (see suggested structure)
- [x] Update all imports across codebase
- [x] Run `npm run v` - all checks must pass
- [x] Fix any broken tests

## Suggested Store Structure

```
src/stores/
├── heroStore.ts      # Hero stats, health, energy, position
├── gameStore.ts      # Game state (playing, paused, gameover), wave, score
├── uiStore.ts        # UI state (dialogs open, debug mode)
├── inventoryStore.ts # Collected powers, loot bag
└── index.ts          # Re-export all stores
```

## Example Split

```typescript
// heroStore.ts
- health, maxHealth
- energy
- position (x, y)
- bonusStats
- actions: takeDamage, heal, updateEnergy, etc.

// gameStore.ts
- gameState ('menu' | 'loading' | 'playing' | 'paused' | 'gameover')
- wave, score, time
- isGameReady
- actions: startGame, pauseGame, gameOver, etc.

// uiStore.ts
- isPaused, isDebugMode
- activeDialog
- actions: openDialog, closeDialog, toggleDebug

// inventoryStore.ts
- collectedPowers
- lootBag
- actions: addPower, addLoot, etc.
```

## Context

- Current store: `src/stores/gameStore.ts`
- Tests: `test/` directory
- Used by: all UI components, GameScene, entities

## Notes

- Keep backwards compatibility during migration if possible
- Consider using Zustand's `combine` or `persist` middleware
- Document new store structure in code comments

## History

- 2025-12-25: Completed refactoring. Split gameStore into:
  - `heroStore.ts`: Health, energy, position, bonusStats, cooldowns
  - `gameStore.ts`: App screen, game state, wave, kills, time, fps, orc positions
  - `uiStore.ts`: Debug mode, logs, zoom, spawn pause
  - `inventoryStore.ts`: Collected powers, bags, loot selection
  - `index.ts`: Re-exports all stores
  - Updated all imports across 20+ files
  - Rewrote tests to cover all stores
  - All validation passes (lint, typecheck, test, build)
