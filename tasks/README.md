# Tasks

Task tracker for AI implementation. Each task is a standalone file with full history.

## Task Index

### Backlog

| Task | Priority | Type | Status | Agent |
|------|----------|------|--------|-------|
| [feat-minimap](./backlog/feat-minimap.md) | Low | Feature | Backlog | - |
| [feat-dash-sprint-energy](./backlog/feat-dash-sprint-energy.md) | Medium | Feature | Backlog | - |
| [feat-bagcard-visual-feedback](./backlog/feat-bagcard-visual-feedback.md) | Low | Feature | Backlog | - |
| [feat-power-card-list-ux](./backlog/feat-power-card-list-ux.md) | Medium | Feature | Backlog | - |
| [feat-agility-dodge-chance](./backlog/feat-agility-dodge-chance.md) | Medium | Feature | Backlog | - |
| [chore-luck-stat-refactoring](./backlog/chore-luck-stat-refactoring.md) | Medium | Refactor | Backlog | - |
| [feat-power-prerequisites](./backlog/feat-power-prerequisites.md) | Medium | Feature | Backlog | - |

### Done

| Task | Priority | Type | Agent |
|------|----------|------|-------|
| [feat-logging-system](./done/feat-logging-system.md) | Medium | Feature | Cartman |
| [feat-strength-armor-pen](./done/feat-strength-armor-pen.md) | Medium | Feature | Kenny |
| [fix-pause-animations](./done/fix-pause-animations.md) | Medium | Bug | Kenny |
| [chore-decouple-phaser-react](./done/chore-decouple-phaser-react.md) | High | Refactor | Francis |
| [fix-transparent-button-bg](./done/fix-transparent-button-bg.md) | High | Bug | Jack |
| [feat-orc-leveling-system](./done/feat-orc-leveling-system.md) | High | Feature | Jack |
| [fix-pause-arrow-bug](./done/fix-pause-arrow-bug.md) | High | Bug | Jack |
| [feat-click-outside-pause-resume](./done/feat-click-outside-pause-resume.md) | High | Feature | Jack |

---

## AI Session Rules

> **Why these rules?** Multiple AI sessions may work in parallel on different tasks. Session names prevent conflicts, track ownership, and ensure no two sessions work on the same task simultaneously.

### Rules

1. **Choose a session name:** At the start of a session, pick a short unique name (e.g., "Atlas", "Nova", "Bolt").
2. **Check in-progress first:** Before claiming a task, check `in-progress/` folder.
3. **Claim the task:** Move file from `backlog/` to `in-progress/`, update status and agent in file.
4. **One task at a time:** Complete your current task before claiming another.
5. **Update history:** Add entries to the History section as you work.
6. **Mark complete:** Move file from `in-progress/` to `done/`, update status, document what was accomplished.
7. **Update this README:** Keep the Task Index tables in sync.

### Prefixes

| Prefix | Type |
|--------|------|
| `feat-` | Feature |
| `fix-` | Bug fix |
| `chore-` | Refactor, maintenance, docs |

### File Naming

```
{prefix}-{short-title}.md
```

Examples:
- `feat-dash-sprint-energy.md`
- `fix-transparent-button-bg.md`
- `chore-luck-stat-refactoring.md`

### Task File Format

```markdown
# [prefix] Title

**Status:** Backlog | In Progress | Done
**Priority:** High | Medium | Low
**Type:** Feature | Bug | Refactor
**Agent:** - (or session name when claimed)

## Description
...

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Context
...

## History

### YYYY-MM-DD - [Agent] - Status Change
Notes about what was done...
```

---

## Validation

All code changes must pass:
```bash
npm run v
```
