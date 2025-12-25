# [feat] Agility grants dodge chance

**Status:** Done
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

- [x] Dodge chance calculated from Agility stat
- [x] Base Agility is 100 (0% dodge at base)
- [x] Each AGI point = 0.1% dodge chance
- [x] Dodge roll happens when hero would take damage
- [x] Visual/audio feedback when dodge occurs (e.g., "DODGE!" text)
- [x] Dodge stat visible in hero stats UI
- [x] Update `docs/STATS.md` with dodge formula

## Context

- Combat: `src/systems/CombatSystem.ts`
- Hero stats: `src/entities/Hero.ts`
- Calculations: `src/systems/calculations.ts`

## History

- **Kenny**: Implemented agility-based dodge chance
  - Added `calculateAgilityDodge()` function to `src/systems/calculations.ts`
  - Updated `Hero.getDodge()` to include agility bonus (base + power bonus + agility bonus, capped at 100)
  - Updated `HeroStatsCard.tsx` to display total dodge including agility bonus
  - Updated `docs/STATS.md` with dodge formula in both Agility and Dodge sections
  - Visual feedback already existed: "Miss" text and dodge particle effect
