# [fix] Fix transparent button background on SelectPowerCard

**Status:** Done
**Priority:** High
**Type:** Bug
**Agent:** Kenny

## Description

The SelectPowerCard component has buttons with transparent backgrounds that cause visual issues. Buttons should have proper solid backgrounds following the black & white theme.

## Acceptance Criteria

- [x] Button backgrounds are solid (not transparent)
- [x] Follows black & white theme (dark bg with light text or vice versa)
- [x] Hover/active states are clearly visible
- [x] Consistent with other UI buttons

## Context

- Component: `src/ui/SelectPowerCard.tsx` (or similar)

## History

### Completed - Kenny - Done

Replaced transparent cancel button with proper `Button` component using `variant="secondary"` in `src/ui/dialogs/LootSelectionDialog.tsx`.
