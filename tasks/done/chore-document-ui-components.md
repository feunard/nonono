# [chore] Document UI Cards/Dialogs

**Status:** Done
**Priority:** Low
**Type:** Docs
**Agent:** Kenny

## Description

Create documentation listing all UI cards and dialogs in the main game screen. Each component should have a brief explanation of what it does, how it works, and why it exists. This doc must be kept updated when new UI components are created.

## Acceptance Criteria

- [x] Create `docs/UI.md` documenting all UI components
- [x] List all cards (HUD elements visible during gameplay)
- [x] List all dialogs/overlays (modal screens)
- [x] For each component: What | How | Why
- [x] Include file paths for each component
- [x] Add rule to `CLAUDE.md` requiring UI doc updates when creating new UI

## Document Structure

```markdown
# UI Components

## Cards (HUD)

### HealthBar
- **What:** Displays hero HP
- **How:** Reads health from gameStore
- **Why:** Player needs to monitor health
- **File:** `src/ui/HealthBar.tsx`

### LogsCard
...

## Dialogs/Overlays

### PauseDialog
- **What:** Pause menu with resume/quit options
- **How:** Shown when game is paused
- **Why:** Allow player to pause and access options
- **File:** `src/ui/dialogs/PauseDialog.tsx`

...
```

## Context

- UI components in `src/ui/`
- Dialogs in `src/ui/dialogs/`
- Primitives in `src/ui/primitives/` (don't document these individually)

## Maintenance Rule

Add to `CLAUDE.md` Documentation Maintenance table:
| UI components (add/modify) | `docs/UI.md` |

## History

- **Kenny**: Created comprehensive UI documentation
  - Created `docs/UI.md` with all UI components documented
  - Organized into sections: Screens, Cards (HUD), Debug Cards, Dialogs, Debug Dialogs
  - Each component has What/How/Why/File format
  - Added maintenance rule to `CLAUDE.md` documentation table
  - Updated to include new EnergyBarCard component
