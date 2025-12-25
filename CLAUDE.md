# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow

**After every code change, run full validation:**

```bash
npm run v
```

This runs lint + typecheck + test + build. All must pass before considering the task complete.

## Commands

```bash
npm run dev           # Start dev server with HMR (http://localhost:5173)
npm run build         # TypeScript check + production build
npm run preview       # Preview production build
npm run typecheck     # Type check without emitting
npm run lint          # Check code with Biome (lint + format)
npm run lint:fix      # Auto-fix lint issues
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage report
npm run v             # Full validation: lint + typecheck + test + build
```

## Architecture

2D survival game built with **Phaser 3 + React + TypeScript + Vite + Tailwind CSS**.

### Core Structure

- `src/main.tsx` - React entry point, mounts App component
- `src/App.tsx` - Root component, initializes Phaser game and React UI overlay
- `src/config/GameConfig.ts` - All tunable game constants (health, damage, speeds, timings)
- `src/scenes/` - Phaser scenes (BootScene → GameScene)
- `src/entities/` - Game objects (Hero, Orc, Arrow)
- `src/systems/` - Game logic managers (WaveManager, CombatSystem, PathfindingManager)
- `src/stores/` - State management for Phaser-React communication
- `src/ui/` - React UI components (HUD overlay)

### Scene Flow

1. **BootScene** - Loads all assets, creates animations, then starts GameScene
2. **GameScene** - Main game logic, spawns hero, manages camera, handles pause, updates gameStore

### UI Architecture

- React renders UI overlay on top of Phaser canvas
- Zustand (`useGameStore`) provides reactive state bridge between Phaser and React
- All UI in `src/ui/`:
  - `primitives/` - Reusable UI building blocks (Button, Card, IconBox, Kbd, Overlay, Stat)
  - `utils.ts` - Tailwind utility (`cn` function)
  - Game components at root: HealthBar, HeroStats, GameStats, MenuBar, PauseOverlay, GameOverOverlay
  - `GameUI.tsx` - Main UI container, `HUD.tsx` - HUD layout
- Tailwind CSS for styling
- Always use relative imports (never `@/` alias)

### Entity Pattern

Entities extend `Phaser.Physics.Arcade.Sprite` and implement:
- Constructor: setup physics body, animations, debug graphics
- `update()`: called each frame for AI/movement logic
- Two hitbox system: pink (attack) drawn via Graphics, blue (map collision) via physics body

### Combat System

- Hero has auto-attack (ranged arrows) and auto-melee when orcs are close
- Orcs chase hero and melee attack when adjacent
- Combat uses distance-based checks from sprite center, not physics overlap
- Arrow collision with orcs uses physics overlap

### Key Config Values

All gameplay values are in `src/config/GameConfig.ts`:
- `debug.showHitboxes` - Toggle pink/blue hitbox visualization (enabled via `?debug=true` URL param)
- `hero.autoAttackInterval` / `hero.meleeInterval` - Attack speeds
- `hero.attackRange` - Arrow range in tiles
- `hero.meleeRange` - Melee trigger distance in pixels

### Input

- Movement: WASD, ZQSD (French), Arrow keys
- Pause/Resume: Space
- Debug hitboxes: X (toggle)

### Visual Theme

**Black & White only.** All UI components must use:
- Black (`black`, `neutral-900`, `neutral-800`, `neutral-700`)
- White (`white`, `neutral-400`, `neutral-500`)

No colors (red, amber, blue, green, etc.) are allowed in the UI.

## Documentation Maintenance

When modifying game mechanics, **update the corresponding documentation**:

| Change Type | Update File |
|-------------|-------------|
| Powers (add/modify/remove) | `docs/POWERS.md` |
| Stats, formulas, caps | `docs/STATS.md` |
| Combat mechanics | `docs/STATS.md` (Combat Flow section) |
| Enemy scaling | `docs/STATS.md` (Enemy Scaling section) |

**Key files that require doc updates when changed:**
- `src/config/PowersConfig.ts` → Update `docs/POWERS.md`
- `src/config/GameConfig.ts` → Update `docs/STATS.md`
- `src/systems/calculations.ts` → Update `docs/STATS.md`
- `src/entities/Hero.ts` (stat methods) → Update `docs/STATS.md`
- `src/entities/Orc.ts` (scaling) → Update `docs/STATS.md`

## AI Agents

### Chef (Task Manager)

If your session name is **Chef**, your only goal is to create tasks for the boys (Kenny, Kyle, Cartman, Stan).

**Responsibilities:**
- Analyze user requests and break them into well-defined tasks
- Create task files in `tasks/backlog/` with proper format
- Update `tasks/README.md` with new tasks
- Ensure tasks have clear acceptance criteria and context
- Do NOT implement tasks yourself

**Task creation workflow:**
1. Understand the user's request
2. Break it down into atomic, implementable tasks
3. Create task file: `tasks/backlog/{prefix}-{short-title}.md`
4. Add task to the Backlog table in `tasks/README.md`

---

### Worker Agents (Kenny, Kyle, Cartman, Stan)

If your session name is **Kenny**, **Kyle**, **Cartman**, or **Stan**, follow this workflow:

### Rules

- **NEVER pick a task yourself** - Wait for the user to assign you a task
- One task at a time
- Always `git pull` before starting and before committing
- Always run `npm run v` before committing
- Never push without explicit permission

### Task Workflow

1. **Wait for task assignment** - User will tell you which task to work on

2. **Pull latest changes:**
   ```bash
   git pull
   ```
   Handle any conflicts before proceeding.

3. **Claim the task:**
   - Update status to `In Progress` and add your agent name in the task file (stays in `backlog/`)
   - Update `tasks/README.md`

4. **Implement the task**

5. **Validate (ALL must pass):**
   ```bash
   npm run v
   # or individually:
   npm run lint
   npm run typecheck
   npm run test:run
   npm run build
   ```

6. **Pull again before commit:**
   ```bash
   git pull
   ```
   Handle any conflicts.

7. **Commit:**
   ```bash
   git commit -m "feat(scope): task title"
   ```
   - One line only, just the task name
   - Use `feat` for features, `fix` for bugs, `chore` for refactors
   - Scope = affected area (e.g., `hero`, `ui`, `combat`)
   - Use user's default git config (do NOT add Co-Authored-By or Claude signatures)

8. **DO NOT PUSH** - Wait for further instructions

9. **Move task to done:**
   - Move file from `backlog/` to `done/`
   - Update status to `Done` and document what was accomplished in History
   - Update `tasks/README.md`
