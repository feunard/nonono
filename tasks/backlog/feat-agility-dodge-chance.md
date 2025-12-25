# [feat] Agility grants dodge chance

**Status:** In Progress
**Priority:** Medium
**Type:** Feature
**Agent:** Kenny

## Description

Add dodge mechanic linked to Agility stat. Base Agility starts at 100. Each point of Agility above base grants 0.1% dodge chance. When an attack is dodged, no damage is taken.

## Formula

```
dodgeChance = (agility - 100) * 0.1%
```

Example: 150 AGI = 5% dodge chance

## Acceptance Criteria

- [ ] Dodge chance calculated from Agility stat
- [ ] Base Agility is 100 (0% dodge at base)
- [ ] Each AGI point = 0.1% dodge chance
- [ ] Dodge roll happens when hero would take damage
- [ ] Visual/audio feedback when dodge occurs (e.g., "DODGE!" text)
- [ ] Dodge stat visible in hero stats UI
- [ ] Update `docs/STATS.md` with dodge formula

## Context

- Combat: `src/systems/CombatSystem.ts`
- Hero stats: `src/entities/Hero.ts`
- Calculations: `src/systems/calculations.ts`

## History

_No history yet_
