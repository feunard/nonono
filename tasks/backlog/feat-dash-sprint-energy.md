# [feat] Dash/Sprint with energy system

**Status:** In Progress
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

- [ ] New "Energy" resource added to Hero (0-100, starts at 100)
- [ ] Energy bar displayed in UI (below or near health bar)
- [ ] Holding Shift activates sprint (increased movement speed)
- [ ] Energy drains while sprinting
- [ ] Sprint automatically stops when energy reaches 0
- [ ] Cannot start sprinting if energy < 20%
- [ ] Energy regenerates when not sprinting
- [ ] Visual feedback when sprint is active (optional: trail effect or speed lines)
- [ ] Energy bar follows black & white theme
- [ ] Config values in GameConfig.ts (drain rate, regen rate, speed multiplier, threshold)

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

_No history yet_
