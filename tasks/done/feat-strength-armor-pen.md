# [feat] Strength grants armor penetration chance

**Status:** Done
**Priority:** Medium
**Type:** Feature
**Agent:** Kenny

## Description

Add armor penetration mechanic linked to Strength stat. Base Strength starts at 100. Each point of Strength above base grants 0.1% armor penetration chance. When armor is penetrated, attack ignores enemy armor.

## Formula

```
armorPenChance = (strength - 100) * 0.1%
```

Example: 200 STR = 10% armor pen chance

## Acceptance Criteria

- [x] Armor pen chance calculated from Strength stat
- [x] Base Strength is 100 (0% armor pen at base)
- [x] Each STR point = 0.1% armor pen chance
- [x] Armor pen roll happens on hero attacks
- [x] When proc'd, attack ignores target's armor entirely
- [x] Visual feedback when armor pen occurs
- [x] Armor pen stat visible in hero stats UI
- [x] Update `docs/STATS.md` with armor pen formula

## Context

- Combat: `src/systems/CombatSystem.ts`
- Hero stats: `src/entities/Hero.ts`
- Calculations: `src/systems/calculations.ts`

## History

### 2025-12-25 - Kenny - In Progress
Claimed task. Starting implementation of armor penetration mechanic linked to Strength stat.

### 2025-12-25 - Kenny - Done
Implemented armor penetration mechanic:
- Added `getArmorPenChance()` and `rollArmorPen()` methods to Hero.ts
- Added `ignoreArmor` parameter to Orc.takeDamage() and Arrow class
- Updated melee attacks (single and cleave) to roll for armor pen
- Updated arrow attacks to carry and apply armor pen flag
- Added cyan "ARMOR PEN!" visual feedback text when proc occurs
- Added armor pen stat display to DebugHeroStatsCard
- Updated docs/STATS.md with full documentation including formulas, tables, and combat flow
