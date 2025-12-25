# [feat] Power card prerequisites system

**Status:** In Progress
**Priority:** Medium
**Type:** Feature
**Agent:** Cartman

## Description

Add a prerequisites system for power cards. Some powers require minimum stat values or owning other specific powers before they can be selected. Adds strategic depth to deck building.

## Requirement Types

1. **Stat Requirements:** "Requires 150+ Agility"
2. **Power Requirements:** "Requires [Power X] in deck"
3. **Combined:** "Requires 100+ STR and [Power Y]"

## Acceptance Criteria

- [ ] Powers can define stat requirements in PowersConfig
- [ ] Powers can define required other powers in PowersConfig
- [ ] Locked powers shown greyed out with requirement tooltip
- [ ] Requirements checked when power selection is offered
- [ ] Clear UI indication of what's missing
- [ ] Update `docs/POWERS.md` with prerequisites documentation

## Context

- Powers config: `src/config/PowersConfig.ts`
- Power selection UI: `src/ui/PowersCard.tsx` or `SelectPowerCard.tsx`
- Hero state for checking owned powers

## History

_No history yet_
