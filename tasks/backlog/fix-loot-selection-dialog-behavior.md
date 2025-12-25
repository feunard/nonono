# [fix] Loot selection dialog behavior

**Status:** Backlog
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

- [ ] Pressing Escape (cancel) hides the dialog WITHOUT consuming a bag
- [ ] After selecting a power and consuming a bag, if `bagCount > 0`, generate new random powers and show the dialog again
- [ ] Dialog loop continues until all bags are opened or player cancels
- [ ] Player can reopen remaining bags at any time with E key after canceling
- [ ] Existing keyboard shortcuts (1, 2, 3 for selection, Escape for cancel) continue to work

## Context

**Files to modify:**

1. `/Users/nfo/git/vibe-game-1/src/App.tsx`
   - `handleLootSelect` (line 124): After consuming bag, check if `bagCount > 0` and show new selection
   - `handleLootCancel` (line 136): Remove `inventoryStore.consumeBag()` call

2. `/Users/nfo/git/vibe-game-1/src/stores/inventoryStore.ts`
   - No changes needed - existing `consumeBag()` and `showLootSelection()` methods are sufficient

3. `/Users/nfo/git/vibe-game-1/src/ui/game/dialogs/LootSelectionDialog.tsx`
   - No changes needed - UI already supports the required callbacks

**Implementation approach:**

```tsx
// In handleLootSelect:
const handleLootSelect = useCallback((power: Power) => {
    LogSystem.logPowerPickup(power);
    inventoryStore.applyPower(power);
    heroStore.addBonus(power.effect.stat, power.effect.value);
    inventoryStore.consumeBag();

    // Check if more bags remain - need to get fresh state after consumeBag
    const { bagCount } = inventoryStore.getState();
    if (bagCount > 0) {
        // Generate new powers and show dialog again
        const powers = getRandomAvailablePowers(3, collectedPowers, bonusStats);
        inventoryStore.showLootSelection(powers);
    } else {
        inventoryStore.hideLootSelection();
    }
}, [collectedPowers, bonusStats]);

// In handleLootCancel:
const handleLootCancel = useCallback(() => {
    // Just hide - don't consume bag
    inventoryStore.hideLootSelection();
}, []);
```

**Note:** The chained selection needs access to fresh `collectedPowers` state after each power is applied, so the implementation should read from the store directly rather than relying on the closure values.
