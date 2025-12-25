# [feat] Dash/Sprint with energy system

**Status:** Done
**Priority:** Medium
**Type:** Feature
**Agent:** Cartman

## Description

Add a sprint/dash mechanic with a new "Energy" resource. Holding Shift consumes energy for a speed boost. Energy regenerates over time. Cannot sprint if energy is below 20%. This is a standalone system for now - stats do not affect energy (future: may link to agility stat and new powers).

## Mechanics

- **Activation:** Hold Shift to sprint
- **Cost:** Continuous energy drain while sprinting
- **Threshold:** Cannot activate sprint if energy < 20%
- **Regen:** Energy regenerates when not sprinting
- **Speed Boost:** e.g., +50% movement speed while sprinting

## Acceptance Criteria

- [x] New "Energy" resource added to Hero (0-100, starts at 100)
- [x] Energy bar displayed in UI (below or near health bar)
- [x] Holding Shift activates sprint (increased movement speed)
- [x] Energy drains while sprinting
- [x] Sprint automatically stops when energy reaches 0
- [x] Cannot start sprinting if energy < 20%
- [x] Energy regenerates when not sprinting
- [x] Visual feedback when sprint is active (optional: trail effect or speed lines)
- [x] Energy bar follows black & white theme
- [x] Config values in GameConfig.ts (drain rate, regen rate, speed multiplier, threshold)

## Context

- Hero movement: `src/entities/Hero.ts`
- Input handling: `src/scenes/GameScene.ts`
- UI components: `src/ui/`
- Config: `src/config/GameConfig.ts`
- State: `src/stores/gameStore.ts` (add energy to hero state)

## Future Considerations (do not implement now)

- Agility stat may affect energy regen or capacity
- New powers may interact with energy system
- Dash ability (quick burst) vs sustained sprint

## History

### Completed by Cartman

- Added energy config to `GameConfig.ts`:
  - `max: 100` - Maximum energy
  - `drainRate: 25` - Energy drained per second while sprinting
  - `regenRate: 15` - Energy regenerated per second when not sprinting
  - `sprintThreshold: 20` - Minimum energy % to start sprinting
  - `speedMultiplier: 1.5` - Speed multiplier while sprinting (+50%)
- Added energy state to `gameStore.ts`:
  - `energy: number` - Current energy (0-100)
  - `isSprinting: boolean` - Whether sprint is active
  - `updateEnergy()` and `setIsSprinting()` actions
- Implemented sprint in `Hero.ts`:
  - Added Shift key input handling
  - `handleSprint()` method for energy drain/regen logic
  - Speed multiplier applied in `handleMovement()`
  - Cannot start sprint if energy < 20%
  - Sprint auto-stops when energy reaches 0
- Created `EnergyBarCard.tsx`:
  - Displays below health bar
  - Shows current/max energy
  - Pulse animation when sprinting
  - Dimmed bar when below threshold
  - Shows Shift key hint
  - Black & white theme consistent with other UI
