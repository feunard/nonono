# [feat] BagCard visual feedback animations

**Status:** Done
**Priority:** Low
**Type:** Feature
**Agent:** Cartman

## Description

Add visual feedback animations to BagCard to indicate item collection progress. Small animation when picking up first item, larger celebratory animation when bag is full (9 items).

## Acceptance Criteria

- [x] Subtle animation plays when bag has 1 item (first pickup feedback)
- [x] More prominent animation plays when bag reaches 9 items (full bag celebration)
- [x] Animations follow black & white theme
- [x] Animations are non-intrusive and don't block gameplay

## Context

- UI component: `src/ui/BagCard.tsx` (or similar)
- Consider CSS animations or Framer Motion

## History

### Completed by Cartman

- Added CSS keyframe animations in `src/index.css`:
  - `bag-pop`: Subtle scale animation (1 → 1.15 → 1) for first item
  - `bag-celebrate`: Shake/wiggle animation with scale for full bag
- Updated `BagCard.tsx`:
  - Track previous bagCount with useRef to detect transitions
  - Apply `animate-bag-pop` when bag goes from 0 → 1 items
  - Apply `animate-bag-celebrate` when bag reaches 9 items (maxBagsInventory)
  - Badge pulses when bag is full as persistent visual indicator
- Animations are pure CSS, black & white themed, non-blocking
