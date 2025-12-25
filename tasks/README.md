# Tasks

Task tracker for AI implementation. Each task is a standalone file with full history.

## Browsing Tasks

```bash
ls tasks/backlog    # Available tasks
ls tasks/done       # Completed tasks
```

---

## AI Session Rules

> **Why these rules?** Multiple AI sessions may work in parallel on different tasks. Session names prevent conflicts, track ownership, and ensure no two sessions work on the same task simultaneously.

See `CLAUDE.md` for full agent workflow.

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
