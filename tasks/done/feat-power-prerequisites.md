# [feat] Power card prerequisites system

**Status:** Done
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

- [x] Powers can define stat requirements in PowersConfig
- [x] Powers can define required other powers in PowersConfig
- [x] Locked powers shown greyed out with requirement tooltip
- [x] Requirements checked when power selection is offered
- [x] Clear UI indication of what's missing
- [x] Update `docs/POWERS.md` with prerequisites documentation

## Context

- Powers config: `src/config/PowersConfig.ts`
- Power selection UI: `src/ui/PowersCard.tsx` or `SelectPowerCard.tsx`
- Hero state for checking owned powers

## History

### Completed by Cartman

- Added `Prerequisites` type with `stats` and `powers` fields to `PowersConfig.ts`
- Added `StatRequirement` type for stat-based prerequisites
- Extended `Power` type with optional `prerequisites` field
- Added helper functions:
  - `checkPrerequisites()` - checks if a power's requirements are met
  - `isPowerLocked()` - simple boolean check
  - `formatMissingPrerequisites()` - human-readable requirement string
  - `getStatDisplayName()` - display names for stats
  - `getPowerById()` - lookup power by ID
- Added prerequisites to 12 powers:
  - Godlike Strength/Agility/Critical (require 50+/50+/25+ of respective stat)
  - Executioner (requires 20+ Critical)
  - Arrow Storm (requires Double Shot)
  - Riposte/Retribution (require Dodge/Riposte)
  - Execute chain (Finishing Blow → Execute → Decapitate)
  - Vorpal chain (Vorpal Edge → Vorpal Blade)
- Updated `LootSelectionDialog.tsx`:
  - Locked powers shown greyed out with 50% opacity
  - Lock icon displayed in top-left corner
  - Tooltip shows missing requirements with current values
  - Locked powers cannot be clicked
- Updated `docs/POWERS.md` with new Prerequisites System section
