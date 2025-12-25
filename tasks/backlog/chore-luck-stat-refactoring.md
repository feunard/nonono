# [chore] Luck stat refactoring

**Status:** Backlog
**Priority:** Medium
**Type:** Refactor
**Agent:** -

## Description

Refactor the Luck stat system. Luck now starts at 10. Drop chance formula: base 10% + 10% of Luck value. Orc level reduces drop chance by 2% per level. Minimum drop rate is 1% (not 0%).

## Formula

```
dropChance = max(1%, (10% + luck * 10%) - (orcLevel * 2%))
```

Example: 15 Luck, L5 orc = 10% + 15% - 10% = 15% drop chance

## Acceptance Criteria

- [ ] Luck base value is 10
- [ ] Drop chance = 10% + (luck * 10%)
- [ ] Orc level reduces drop by 2% per level
- [ ] Minimum drop rate is 1% (never 0%)
- [ ] Formula correctly calculated in loot system
- [ ] Update `docs/STATS.md` with new Luck formula

## Context

- Loot system in combat or dedicated file
- Hero stats: `src/entities/Hero.ts`
- Calculations: `src/systems/calculations.ts`

## History

_No history yet_
