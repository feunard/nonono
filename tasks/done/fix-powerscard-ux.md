# [fix] PowersCard UX Improvements

**Status:** Done
**Priority:** Medium
**Type:** Bug

## Description
The PowersCard component has two UX issues that need to be addressed:
1. The card has awkward width/layout with unnecessary empty space and multi-line wrapping
2. The hexagon orbs lack a visible colored border that should match the power's rank color

## Acceptance Criteria
- [x] PowersCard width fits content tightly without unnecessary empty space
- [x] Hexagon orbs display a visible colored border matching the power's rank (common=neutral, uncommon=green, rare=blue, epic=purple, legendary=amber)
- [x] Layout flows naturally without awkward line breaks
- [x] Hover effects still work correctly
- [x] Count badges remain visible and positioned correctly
- [x] Visual design stays consistent with the black & white theme (colored borders are acceptable for rank indication)

## Context

### Current Implementation Issues

**File:** `src/ui/cards/PowersCard.tsx`

**Width Issue (lines 152-159):**
```tsx
<Card className="p-2 w-fit">
  <div className="flex flex-wrap gap-1.5 max-w-[180px]">
```
The `max-w-[180px]` constraint is forcing a fixed maximum width that may not match the actual content, causing:
- Empty space when fewer orbs are present
- Awkward wrapping at arbitrary points

**Hexagon Border Issue (lines 117-127):**
```tsx
<div
  className={`w-8 h-9 ${ringColor.replace("ring-", "bg-")} flex items-center justify-center...`}
  style={{ clipPath: hexagonClipPath }}
>
  {/* Inner hexagon */}
  <div
    className="w-7 h-8 bg-neutral-800 flex items-center justify-center"
    style={{ clipPath: hexagonClipPath }}
  >
```
The current approach uses a background-color workaround to simulate a border, but:
- The outer hexagon uses `bg-` class converted from `ring-` (line 118)
- The 1px difference between outer (w-8/h-9) and inner (w-7/h-8) hexagons creates a thin edge
- This creates an uneven/barely visible border effect

### Available Rank Colors (from PowersConfig.ts)
```tsx
export const RANK_HEX_COLORS: Record<PowerRank, string> = {
  common: "#a3a3a3",    // neutral-400
  uncommon: "#22c55e",  // green-500
  rare: "#3b82f6",      // blue-500
  epic: "#a855f7",      // purple-500
  legendary: "#fbbf24", // amber-400
};

export const RANK_RING_COLORS: Record<PowerRank, string> = {
  common: "ring-neutral-500",
  uncommon: "ring-green-500",
  rare: "ring-blue-500",
  epic: "ring-purple-500",
  legendary: "ring-amber-400",
};
```

### Implementation Approach

**1. Fix Width/Layout:**
- Remove the `max-w-[180px]` constraint
- Consider using `inline-flex` or `grid` for more predictable layout
- Let content determine width naturally with `w-fit` on the Card
- If a max is still needed, compute it based on a target number of orbs per row (e.g., 5 orbs = 5 * 32px + gaps)

**2. Add Visible Hexagon Border:**
Option A - Increase size difference between outer and inner hexagon:
- Outer: `w-9 h-10` (36px x 40px)
- Inner: `w-7 h-8` (28px x 32px)
- This creates a 4px border that is clearly visible

Option B - Use CSS filter/drop-shadow for border effect:
- Apply a colored drop-shadow to simulate a border
- Example: `style={{ filter: 'drop-shadow(0 0 2px ${hexColor})' }}`

Option C - Use SVG hexagon with stroke:
- Replace the clipped divs with an SVG hexagon
- Use `stroke` property for the border

**Recommendation:** Option A is the simplest and maintains the current approach. Just increase the size difference between outer and inner hexagons to make the border more prominent.

### Related Files
- `src/ui/cards/PowersCard.tsx` - Main component to modify
- `src/config/PowersConfig.ts` - Contains `RANK_HEX_COLORS` and `RANK_RING_COLORS`
- `docs/UI.md` - Update if component behavior changes significantly

## History
- 2025-12-25: Completed. Removed `max-w-[180px]` constraint to let layout flow naturally. Increased outer hexagon size from `w-8 h-9` to `w-9 h-10` to create a more visible 4px colored border matching the power's rank.
