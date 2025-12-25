# Tasks

Task tracker for AI implementation. Each task is a standalone file with full history.

## Browsing Tasks

```bash
ls tasks/backlog    # Available tasks
ls tasks/done       # Completed tasks
```

## Agents

Use `/planner` to create tasks, `/worker` to implement them.

See `.claude/agents/` for agent workflows.

## Prefixes

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

**Status:** Backlog | Done
**Priority:** High | Medium | Low
**Type:** Feature | Bug | Refactor

## Description
...

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Context
...

## History

### YYYY-MM-DD - Done
Notes about what was done...
```

---

## Validation

All code changes must pass:
```bash
npm run v
```
