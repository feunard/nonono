# [feat] Add Spawn Point Tiles to Map System

**Status:** Done
**Priority:** High
**Type:** Feature

## Description
Add special tile types for hero and foe spawn points that can be placed in the map editor and used by the game to determine where entities spawn. This replaces the current hardcoded center spawn for the hero and edge-based random spawning for foes.

## Acceptance Criteria

### Map Configuration
- [x] `src/config/MapConfig.ts` defines new tile types:
  - `hero_spawn` (id: 3) - marks hero starting position, `collide: false`, distinct editor color
  - `foe_spawn` (id: 4) - marks enemy spawn points, `collide: false`, distinct editor color
- [x] `src/stores/editorStore.ts` TILES array includes the new spawn tile types with appropriate colors for editor visibility

### Map Editor Integration
- [x] `src/ui/editor/TilePalette.tsx` renders spawn tiles with visual distinction (special markers/icons)
- [x] Spawn tiles are selectable and paintable like regular tiles
- [x] Hero spawn tile has a distinct visual indicator in the editor (e.g., contrasting marker)
- [x] Foe spawn tiles have a distinct visual indicator in the editor (different from hero spawn)

### Game Logic - Hero Spawning
- [x] `src/systems/MapSystem.ts` has method `getHeroSpawnPosition()` that scans tilemap for hero_spawn tile
- [x] `src/scenes/GameScene.ts` uses `getHeroSpawnPosition()` instead of hardcoded center coordinates
- [x] If no hero_spawn tile exists, fallback to map center with console warning

### Game Logic - Foe Spawning
- [x] `src/systems/MapSystem.ts` has method `getFoeSpawnPositions()` that returns array of all foe_spawn tile positions
- [x] `src/systems/WaveManager.ts` reads foe spawn positions from MapSystem
- [x] Each foe randomly selects one spawn point from available foe_spawn tiles
- [x] If no foe_spawn tiles exist, fallback to current edge-spawning logic with console warning

### Validation
- [x] Console warning logged if map has no hero_spawn tile
- [x] Console warning logged if map has no foe_spawn tiles
- [x] Maps can have 0-1 hero_spawn tiles (1 recommended)
- [x] Maps can have 0-10 foe_spawn tiles (at least 1 recommended)

### Visual Rendering
- [x] In editor: spawn tiles render with clear visual markers on top of the tile color
- [x] In game: spawn tiles render as walkable floor (no special visual - they're just markers)

## History

- **2025-12-25**: Implemented spawn point tiles feature
  - Added hero_spawn (id:3) and foe_spawn (id:4) tile types to MapConfig.ts
  - Updated editorStore.ts with spawn tiles (green for hero, red for foe)
  - Added getHeroSpawnPosition() and getFoeSpawnPositions() methods to MapSystem.ts
  - Updated GameScene.ts to use MapSystem spawn position for hero
  - Updated WaveManager.ts to use MapSystem spawn positions for foes with fallback to edge spawning
  - Updated TilePalette.tsx and EditorScene.ts with visual markers (H/F letters) for spawn tiles
  - Console warnings logged when maps lack spawn tiles

## Context

### Implementation Notes

- Spawn tiles use id:3 (hero) and id:4 (foe) instead of id:2/id:3 as originally planned, because id:2 was already used for "hard wall" tiles
- Hero spawn tile renders with green (#00ff00) background and black "H" marker
- Foe spawn tile renders with red (#ff0000) background and white "F" marker
- Spawn tiles are passable (collide: false) and render as walkable floor in-game
- Existing maps gracefully fall back to center spawning (hero) and edge spawning (foes)

### Files Modified

1. **`src/config/MapConfig.ts`** - Added hero_spawn (id:3) and foe_spawn (id:4) tile types
2. **`src/stores/editorStore.ts`** - Updated TileId type and TILES array with spawn tiles
3. **`src/systems/MapSystem.ts`** - Added `getHeroSpawnPosition()` and `getFoeSpawnPositions()` methods
4. **`src/scenes/GameScene.ts`** - Uses MapSystem spawn position for hero
5. **`src/systems/WaveManager.ts`** - Uses MapSystem spawn positions for foes
6. **`src/ui/editor/TilePalette.tsx`** - Updated tile rendering for spawn tiles with visual markers
7. **`src/scenes/EditorScene.ts`** - Updated canvas rendering for spawn tile markers
