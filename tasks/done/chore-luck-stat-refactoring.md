# [chore] Luck stat refactoring

**Status:** Done
**Priority:** Medium
**Type:** Refactor
**Agent:** Kenny

## Description

Refactor the Luck stat system. Luck now starts at 10. Drop chance formula: base 10% + 10% of Luck value. Orc level reduces drop chance by 2% per level. Minimum drop rate is 1% (not 0%).

## Formula

```
dropChance = max(1%, (10% + luck * 10%) - (orcLevel * 2%))
```

Example: 15 Luck, L5 orc = 10% + 15% - 10% = 15% drop chance

## Acceptance Criteria

- [x] Luck base value is 10
- [x] Drop chance = 10% + (luck * 10%)
- [x] Orc level reduces drop by 2% per level
- [x] Minimum drop rate is 1% (never 0%)
- [x] Formula correctly calculated in loot system
- [x] Update `docs/STATS.md` with new Luck formula

## Context

- Loot system in combat or dedicated file
- Hero stats: `src/entities/Hero.ts`
- Calculations: `src/systems/calculations.ts`

## History

- **Kenny**: Refactored luck stat and drop chance formula
  - Changed `hero.luck` base value from 20 to 10 in `GameConfig.ts`
  - Changed `orc.levelDropReduction` from 1 to 2 (2% per level)
  - Changed `orc.minDropChance` from 50 to 1 (1% minimum)
  - Added `calculateDropChance()` function to `calculations.ts`
  - Updated `GameScene.trySpawnLoot()` to use new formula
  - Updated `docs/STATS.md` with new Luck section and Enemy Scaling
