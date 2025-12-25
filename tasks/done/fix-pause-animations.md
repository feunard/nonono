# [fix] Pause animations when game is paused

**Status:** Done
**Priority:** Medium
**Type:** Bug
**Agent:** Kenny

## Description

When the game is paused, orc animations continue playing. Orcs appear to be "walking in place" even though the game is paused. All entity animations should freeze when paused.

## Acceptance Criteria

- [x] Orc walk/idle animations stop when game is paused
- [x] Hero animations stop when game is paused
- [x] Arrow animations (if any) stop when game is paused
- [x] Animations resume correctly when game is unpaused

## Context

- Pause logic is in `src/scenes/GameScene.ts`
- Entity classes: `src/entities/Hero.ts`, `src/entities/Orc.ts`, `src/entities/Arrow.ts`
- Phaser's `this.anims.pause()` and `this.anims.resume()` can be used on sprites

## History

### Completed - Kenny - Done

Added `pauseAllAnimations()` and `resumeAllAnimations()` methods in `GameScene.ts`. These are called in `togglePause()`, `openDebugPowerOverlay()`, `closeDebugPowerOverlay()`, and `onGameOver()` to freeze all hero and orc animations when the game is paused.
