# [fix] Loot Power Selection Keyboard Handling

**Status:** Backlog
**Priority:** Medium
**Type:** Bug

## Description
The keyboard handling for loot power selection in `App.tsx` uses `e.key` with `parseInt` to detect number key presses. This approach is unreliable across different keyboard layouts (e.g., French AZERTY, German QWERTZ) because `e.key` returns the character produced by the key, which may vary.

The fix is to use `e.code` which returns the physical key pressed (e.g., "Digit1", "Digit2", "Digit3") regardless of keyboard layout.

## Acceptance Criteria
- [ ] Loot power selection uses `e.code` instead of `e.key` for number key detection
- [ ] "Digit1" selects the first power option
- [ ] "Digit2" selects the second power option (if available)
- [ ] "Digit3" selects the third power option (if available)
- [ ] Each digit code check verifies the corresponding power exists in `lootPowers` array
- [ ] Validation passes (`npm run v`)

## Context

**File:** `/Users/nfo/git/vibe-game-1/src/App.tsx`
**Lines:** 215-222

**Current implementation (problematic):**
```tsx
// 1, 2, 3 - Select loot power
if (isLootSelection && lootPowers.length > 0) {
    const keyNum = Number.parseInt(e.key, 10);
    if (keyNum >= 1 && keyNum <= lootPowers.length) {
        handleLootSelect(lootPowers[keyNum - 1]);
        return;
    }
}
```

**Expected implementation:**
```tsx
// 1, 2, 3 - Select loot power
if (isLootSelection && lootPowers.length > 0) {
    if (e.code === "Digit1" && lootPowers.length >= 1) {
        handleLootSelect(lootPowers[0]);
        return;
    }
    if (e.code === "Digit2" && lootPowers.length >= 2) {
        handleLootSelect(lootPowers[1]);
        return;
    }
    if (e.code === "Digit3" && lootPowers.length >= 3) {
        handleLootSelect(lootPowers[2]);
        return;
    }
}
```

**Why `e.code` is better:**
- `e.key` returns the character the key produces, which varies by layout
- `e.code` returns the physical key location, which is consistent
- "Digit1", "Digit2", "Digit3" correspond to the number row keys regardless of what character they produce
