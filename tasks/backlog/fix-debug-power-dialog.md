# [fix] Debug Power Dialog improvements

**Status:** Backlog
**Priority:** Low
**Type:** Bug
**Agent:** -

## Description

Fix and improve the DebugPowerDialog UI. Clean up the power row display, ensure all powers are visible, and respect power prerequisites.

## Current Issues

1. Not all powers may be displayed (need to verify)
2. Weird "+5" text on the right side (shows remaining stacks)
3. Layout is cluttered with too much info

## Acceptance Criteria

- [ ] Verify all powers from PowersConfig are displayed
- [ ] Remove the "+X" remaining count on the right
- [ ] Simplify row layout: `[Rank] Power Name` on left, `0/5` on right
- [ ] Disable power if prerequisites not met (grey out + tooltip explaining why)
- [ ] Keep MAX indicator for fully stacked powers

## Target Layout

```
Current:  [R] Power Name  0/5  +5
Target:   [R] Power Name       0/5
          [R] Power Name       MAX  (when maxed)
          [R] Power Name       🔒   (when prereq not met)
```

## Context

- File: `src/ui/dialogs/debug/DebugPowerDialog.tsx`
- PowerRow component (lines 102-152)
- Prerequisites: check if feat-power-prerequisites is implemented

## History

_No history yet_
