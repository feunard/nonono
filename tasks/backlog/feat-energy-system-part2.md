# [feat] Energy System Part 2

**Status:** Backlog
**Priority:** Medium
**Type:** Feature
**Agent:** -

## Description

Rebalance the energy/sprint system to be a "life saver" ability rather than something to spam. Increase the speed boost significantly but drain energy much faster (5 seconds to empty). Integrate the energy bar UI directly into the HealthBar component for a cleaner HUD.

## Design Goals

- Sprint should feel powerful when used
- Short duration forces strategic use
- "Oh shit" button to escape danger, not permanent speed boost
- Clear visual feedback integrated with health

## Acceptance Criteria

- [ ] Energy bar displayed inside/below HealthBar component
- [ ] Remove standalone energy bar (if exists)
- [ ] Increase speed boost (e.g., +80-100% instead of +50%)
- [ ] Energy drains completely in ~5 seconds of sprinting
- [ ] Adjust regen rate to balance (not too fast, not too slow)
- [ ] Update GameConfig.ts with new values
- [ ] Energy bar follows same visual style as health bar

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

_No history yet_
