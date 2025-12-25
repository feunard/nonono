# [chore] GameStore Refactoring

**Status:** Backlog
**Priority:** Medium
**Type:** Refactor
**Agent:** -

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

- [ ] Audit current gameStore for unused keys
- [ ] Remove all unused state and actions
- [ ] Split into logical stores (see suggested structure)
- [ ] Update all imports across codebase
- [ ] Run `npm run v` - all checks must pass
- [ ] Fix any broken tests

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

_No history yet_
