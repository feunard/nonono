# [feat] Improve Power Card list UX

**Status:** Done
**Priority:** Medium
**Type:** Feature
**Agent:** Kenny

## Description

Redesign the power card selection UI. Change card shape from circle to hexagon for better visual identity. Display 4-5 cards per row. Ensure the bottom StatsCard remains fixed and doesn't shift when power list changes.

## Acceptance Criteria

- [x] Power cards use hexagonal shape instead of circles
- [x] Layout displays 4-5 cards per row (responsive)
- [x] StatsCard at bottom remains in fixed position
- [x] Power list scrolls if needed without affecting StatsCard
- [x] Maintains black & white theme
- [x] Touch/click targets remain accessible

## Context

- Power card components in `src/ui/`
- May need CSS grid or flexbox adjustments

## History

- **Kenny**: Redesigned power orbs to hexagons
  - Changed `PowerOrb` from `rounded-full` circles to hexagons using CSS `clip-path`
  - Implemented double-hexagon pattern: outer colored ring + inner neutral background
  - Increased `max-w` from 120px to 180px to fit 4-5 items per row
  - HeroStatsCard position unchanged due to `items-start` flex alignment
  - Updated `docs/UI.md` to reflect hexagon shape
