# [fix] Energy Bar Part 3

**Status:** Done
**Priority:** High
**Type:** Bug
**Agent:** Kenny

## Description

Fix multiple issues with the energy bar UI and animation. The bar behaves incorrectly when health changes and the animation continues after stopping sprint.

## Issues

1. **Width changes:** Energy bar width follows health bar width, so when HP drops, energy bar shrinks too
2. **Icon too big:** Energy icon is oversized compared to the bar
3. **Animation lag:** When stopping sprint, energy bar continues to empty for ~1 second before stopping
4. **Balance:** Adjust drain/regen rates per user feedback

## Acceptance Criteria

- [x] HealthBar has fixed width (doesn't shrink when HP drops)
- [x] Energy bar inherits fixed width from parent
- [x] Reduce energy icon size
- [x] Fix animation: energy stops draining immediately when sprint stops
- [x] Update GameConfig: energy empties in 2 seconds (`drainPerSecond: 50`)
- [x] Update GameConfig: energy fills in 10 seconds (`regenPerSecond: 10`)

## Balance Values

```typescript
energy: {
  max: 100,
  drainPerSecond: 50,   // Empty in 2 seconds (was 20)
  regenPerSecond: 10,   // Full in 10 seconds
  sprintThreshold: 0.2,
  speedMultiplier: 1.8,
}
```

## Context

- HealthBar: `src/ui/HealthBar.tsx` or `src/ui/cards/HealthBar.tsx`
- GameConfig: `src/config/GameConfig.ts`
- Energy state: `src/entities/Hero.ts`
- Animation issue likely in how React state updates vs game loop

## History

- **Kenny**: Fixed energy bar UI and balance issues
  - Changed bar container from `flex-1` to `w-48` for fixed width
  - Reduced energy icon from `w-4 h-4` to `w-3 h-3`
  - Removed CSS `transition-all duration-150` from energy bar fill to fix animation lag
  - Updated GameConfig drainRate from 20 to 50 (empties in 2 seconds)
  - regenRate stays at 10 (fills in 10 seconds)
