# [feat] Energy System Part 2

**Status:** Done
**Priority:** Medium
**Type:** Feature
**Agent:** Cartman

## Description

Rebalance the energy/sprint system to be a "life saver" ability rather than something to spam. Increase the speed boost significantly but drain energy much faster (5 seconds to empty). Integrate the energy bar UI directly into the HealthBar component for a cleaner HUD.

## Design Goals

- Sprint should feel powerful when used
- Short duration forces strategic use
- "Oh shit" button to escape danger, not permanent speed boost
- Clear visual feedback integrated with health

## Acceptance Criteria

- [x] Energy bar displayed inside/below HealthBar component
- [x] Remove standalone energy bar (if exists)
- [x] Increase speed boost (e.g., +80-100% instead of +50%)
- [x] Energy drains completely in ~5 seconds of sprinting
- [x] Adjust regen rate to balance (not too fast, not too slow)
- [x] Update GameConfig.ts with new values
- [x] Energy bar follows same visual style as health bar

## Balance Values (suggested)

```typescript
energy: {
  max: 100,
  drainPerSecond: 20,      // Empty in 5 seconds
  regenPerSecond: 10,      // Full regen in 10 seconds
  sprintThreshold: 0.2,    // 20% minimum to start
  speedMultiplier: 1.8,    // 80% speed boost
}
```

## UI Layout

```
┌─────────────────────────────┐
│ ████████████░░░░░ HP        │  <- Health bar
│ ██████░░░░░░░░░░░ Energy    │  <- Energy bar (smaller, below)
└─────────────────────────────┘
```

## Context

- HealthBar: `src/ui/HealthBar.tsx`
- Energy system: `src/entities/Hero.ts`
- Config: `src/config/GameConfig.ts`
- Existing energy implementation from feat-dash-sprint-energy

## History

### Completed by Cartman

- Updated `GameConfig.ts` with rebalanced energy values:
  - `drainRate: 20` (empties in 5 seconds)
  - `regenRate: 10` (full in 10 seconds)
  - `sprintThreshold: 20` (20% minimum)
  - `speedMultiplier: 1.8` (80% speed boost)
- Integrated energy bar into `HealthBarCard.tsx`:
  - Added `energy` and `isSprinting` props
  - Energy bar rendered below health bar with smaller height (h-1.5 vs h-2.5)
  - Zap icon with pulse animation when sprinting
  - Shows Shift keybind next to Energy label
  - Visual states: low energy (grey), sprinting (pulsing gradient), normal (gradient)
- Removed standalone `EnergyBarCard.tsx`
- Updated `GameUI.tsx` to pass energy/isSprinting props to HealthBarCard
- Updated `cards/index.ts` barrel export
