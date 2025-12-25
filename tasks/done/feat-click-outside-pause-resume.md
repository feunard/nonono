# [feat] Click outside PauseCard to resume

**Status:** Done
**Priority:** High
**Type:** Feature
**Agent:** Kenny

## Description

Allow players to resume the game by clicking outside the pause menu card, in addition to the existing resume button. Improves UX by providing a familiar dismiss pattern.

## Acceptance Criteria

- [x] Clicking outside PauseCard area resumes the game
- [x] Clicking inside PauseCard does NOT resume (only buttons work)
- [x] Resume button still works as before
- [x] Escape key behavior unchanged (if applicable)

## Context

- Pause overlay: `src/ui/PauseOverlay.tsx` (or similar)
- May need backdrop click handler

## History

### Completed - Kenny - Done

Added `onClick={onResume}` to Overlay and `stopPropagation` on Card in `src/ui/dialogs/PauseDialog.tsx`.
