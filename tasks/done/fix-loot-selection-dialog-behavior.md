# [fix] Loot selection dialog behavior

**Status:** Done
**Priority:** Medium
**Type:** Bug

## Description

The loot selection dialog has incorrect behavior when canceling and does not support chained bag opening.

**Current behavior:**
- Cancel consumes a bag (incorrect - player loses loot opportunity)
- After selecting a power, dialog closes even if more bags exist
- Player must manually press E to open each bag

**Desired behavior:**
- Cancel should NOT consume the bag, just hide the dialog so player can return later
- After selecting a power, if more bags remain, immediately show the next bag's power choices
- Continue showing choices until no more bags remain
- Player can cancel at any time to return to game, then open bags again later with E key

## Acceptance Criteria

- [x] Pressing Escape (cancel) hides the dialog WITHOUT consuming a bag
- [x] After selecting a power and consuming a bag, if `bagCount > 0`, generate new random powers and show the dialog again
- [x] Dialog loop continues until all bags are opened or player cancels
- [x] Player can reopen remaining bags at any time with E key after canceling
- [x] Existing keyboard shortcuts (1, 2, 3 for selection, Escape for cancel) continue to work

## Context

**Files modified:**

1. `/Users/nfo/git/nonono/kenny/src/App.tsx`
   - `handleLootSelect`: After consuming bag, reads fresh state from stores and shows new selection if bags remain
   - `handleLootCancel`: Removed `inventoryStore.consumeBag()` call - now just hides the dialog

## History

- 2025-12-25: Fixed loot selection dialog behavior - cancel no longer consumes bag, and selecting a power chains to next bag if available
