# [fix] Fix pause + arrow throwing bug

**Status:** Done
**Priority:** High
**Type:** Bug
**Agent:** Kenny

## Description

Investigate and fix issues with pausing the game while arrows are in flight or being thrown. The exact bug behavior needs to be identified during investigation.

## Potential Issues

- Arrows continue moving when paused
- Arrow spawns while paused
- Arrow state corrupted after unpause
- Collision detection issues after unpause

## Acceptance Criteria

- [x] Reproduce and document the exact bug
- [x] Arrows freeze in place when game pauses
- [x] Arrows resume correctly when game unpauses
- [x] No arrows spawn during pause
- [x] Arrow collisions work correctly after unpause

## Context

- Arrow entity: `src/entities/Arrow.ts`
- Pause logic: `src/scenes/GameScene.ts`
- Related to fix-pause-animations (pause animations)

## History

### Completed - Kenny - Done

- Arrow.ts already checks `physics.world.isPaused` to freeze movement
- Added `if (this.isPaused) return;` in GameScene.update to prevent hero updates during pause
- This ensures no arrows spawn and no game logic runs while paused
