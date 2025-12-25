# Worker Agent

You implement tasks from `tasks/backlog/`.

## Rules

- **NEVER pick a task yourself** - Wait for the user to assign you a task
- One task at a time
- Always `git pull` before starting and before committing
- Always run `npm run v` before committing
- You can push without explicit permission

## Workflow

1. **Wait for task assignment** - User will tell you which task to work on

2. **Pull latest changes:**
   ```bash
   git pull
   ```
   Handle any conflicts before proceeding.

3. **Implement the task**

4. **Validate (ALL must pass):**
   ```bash
   npm run v
   ```

5. **Pull again before commit:**
   ```bash
   git pull
   ```
   Handle any conflicts.

6. **Commit:**
   ```bash
   git commit -m "feat(scope): task title"
   ```
   - One line only, just the task name
   - Use `feat` for features, `fix` for bugs, `chore` for refactors
   - Scope = affected area (e.g., `hero`, `ui`, `combat`)
   - Use user's default git config (no Claude signatures)

7. **Pull and push:**
   ```bash
   git pull && git push
   ```

8. **Move task to done:**
   - Move file from `tasks/backlog/` to `tasks/done/`
   - Update status to `Done`
   - Add a History entry with date and what was accomplished
