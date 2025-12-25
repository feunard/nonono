# [fix] Hide Powers With Unmet Requirements From Selection

**Status:** Done
**Priority:** Medium
**Type:** Bug

## Description

When opening a loot bag to choose powers, powers with unmet requirements (prerequisites) are currently shown but disabled/locked. This is confusing UX because players see powers they cannot actually pick. Instead, powers with unmet prerequisites should be completely hidden from the selection pool, showing only powers the player can actually choose.

## Current Behavior (wrong)

1. Player opens loot bag
2. `getRandomPowers(3)` is called, which does NOT check prerequisites
3. Powers with unmet requirements appear in selection with a lock icon
4. Player sees grayed-out, unselectable options taking up slots

## Desired Behavior

1. Player opens loot bag
2. Only powers that meet ALL criteria are shown:
   - Not at max stack
   - Prerequisites met (stat requirements AND power requirements)
3. All 3 displayed powers are immediately selectable
4. No locked/disabled powers visible

## Acceptance Criteria

- [x] Powers with unmet stat requirements are NOT shown in loot selection
- [x] Powers with unmet power requirements (need another power first) are NOT shown
- [x] Only valid, immediately selectable powers appear in the choice pool
- [x] If fewer than 3 valid powers exist, show however many are available
- [x] Existing `maxStack` filtering continues to work

## Technical Context

### Key Files

**`src/App.tsx` (line 138)**
```typescript
// Current: uses legacy function that ignores prerequisites
const powers = getRandomPowers(3);
```

**`src/config/PowersConfig.ts`**
- `getRandomPowers()` - Legacy function, no filtering (lines 1109-1125)
- `getRandomAvailablePowers()` - Filters by maxStack only (lines 1128-1158)
- `isPowerLocked()` - Checks if prerequisites are met (lines 1260-1266)
- `checkPrerequisites()` - Full prerequisite validation (lines 1211-1256)

**`src/ui/dialogs/LootSelectionDialog.tsx`**
- Currently checks prerequisites at render time (lines 140-144)
- Shows locked powers with lock icon instead of hiding them

### Implementation Approach

1. **Modify `getAvailablePowers()` and `getAvailablePowersByRank()`** in `PowersConfig.ts`:
   - Add prerequisite checking to the filter
   - These functions need access to `bonusStats` and `collectedPowers`
   - May need to change function signatures or create new variants

2. **Update `getRandomAvailablePowers()`** to use the enhanced filtering

3. **Update `src/App.tsx` `handleOpenBag()`**:
   - Pass current `bonusStats` and `collectedPowers` from game store
   - Call the updated function that filters by prerequisites

4. **Optional cleanup in `LootSelectionDialog.tsx`**:
   - Remove or simplify the lock icon logic since locked powers won't appear
   - Keep `checkPrerequisites` for defensive coding (edge cases)

### Example Function Signature Change

```typescript
// Current
export function getAvailablePowers(collectedPowers: Power[]): Power[]

// New (needs bonus stats for prerequisite checking)
export function getAvailablePowers(
  collectedPowers: Power[],
  bonusStats: Record<BonusStat, number>
): Power[]
```

### Prerequisite Types (from PowersConfig.ts)

```typescript
export type Prerequisites = {
  stats?: StatRequirement[];  // Minimum stat values required
  powers?: string[];          // Power IDs that must be owned
};
```

Examples of powers with prerequisites:
- `strength-5` (Godlike Strength): Requires 50+ Strength
- `multishot-3` (Arrow Storm): Requires `multishot-1` power
- `riposte-1` (Riposte): Requires 10+ Dodge
- `execute-2` (Execute): Requires `execute-1` power

## History

- 2025-12-25: Implemented prerequisite filtering in power selection. Modified `getAvailablePowersByRank()`, `getAvailablePowers()`, `rollAvailableRank()`, `getRandomAvailablePowerOfRank()`, and `getRandomAvailablePowers()` to accept optional `bonusStats` parameter and filter out locked powers. Updated `App.tsx` to use `getRandomAvailablePowers()` with current game state. Simplified `LootSelectionDialog.tsx` by removing lock icon logic since locked powers no longer appear.
