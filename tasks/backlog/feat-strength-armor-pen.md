# [feat] Strength grants armor penetration chance

**Status:** Backlog
**Priority:** Medium
**Type:** Feature
**Agent:** -

## Description

Add armor penetration mechanic linked to Strength stat. Base Strength starts at 100. Each point of Strength above base grants 0.1% armor penetration chance. When armor is penetrated, attack ignores enemy armor.

## Formula

```
armorPenChance = (strength - 100) * 0.1%
```

Example: 200 STR = 10% armor pen chance

## Acceptance Criteria

- [ ] Armor pen chance calculated from Strength stat
- [ ] Base Strength is 100 (0% armor pen at base)
- [ ] Each STR point = 0.1% armor pen chance
- [ ] Armor pen roll happens on hero attacks
- [ ] When proc'd, attack ignores target's armor entirely
- [ ] Visual feedback when armor pen occurs
- [ ] Armor pen stat visible in hero stats UI
- [ ] Update `docs/STATS.md` with armor pen formula

## Context

- Combat: `src/systems/CombatSystem.ts`
- Hero stats: `src/entities/Hero.ts`
- Calculations: `src/systems/calculations.ts`

## History

_No history yet_
