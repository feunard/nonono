# [feat] Add Spawn Point Tiles to Map System

**Status:** Backlog
**Priority:** High
**Type:** Feature

## Description
Add special tile types for hero and foe spawn points that can be placed in the map editor and used by the game to determine where entities spawn. This replaces the current hardcoded center spawn for the hero and edge-based random spawning for foes.

## Acceptance Criteria

### Map Configuration
- [ ] `src/config/MapConfig.ts` defines new tile types:
  - `hero_spawn` (id: 2) - marks hero starting position, `collide: false`, distinct editor color
  - `foe_spawn` (id: 3) - marks enemy spawn points, `collide: false`, distinct editor color
- [ ] `src/stores/editorStore.ts` TILES array includes the new spawn tile types with appropriate colors for editor visibility

### Map Editor Integration
- [ ] `src/ui/editor/TilePalette.tsx` renders spawn tiles with visual distinction (special markers/icons)
- [ ] Spawn tiles are selectable and paintable like regular tiles
- [ ] Hero spawn tile has a distinct visual indicator in the editor (e.g., contrasting marker)
- [ ] Foe spawn tiles have a distinct visual indicator in the editor (different from hero spawn)

### Game Logic - Hero Spawning
- [ ] `src/systems/MapSystem.ts` has method `getHeroSpawnPosition()` that scans tilemap for hero_spawn tile
- [ ] `src/scenes/GameScene.ts` uses `getHeroSpawnPosition()` instead of hardcoded center coordinates (lines 296-298)
- [ ] If no hero_spawn tile exists, fallback to map center with console warning

### Game Logic - Foe Spawning
- [ ] `src/systems/MapSystem.ts` has method `getFoeSpawnPositions()` that returns array of all foe_spawn tile positions
- [ ] `src/systems/WaveManager.ts` reads foe spawn positions from MapSystem
- [ ] Each foe randomly selects one spawn point from available foe_spawn tiles
- [ ] If no foe_spawn tiles exist, fallback to current edge-spawning logic with console warning

### Validation
- [ ] Console warning logged if map has no hero_spawn tile
- [ ] Console warning logged if map has no foe_spawn tiles
- [ ] Maps can have 0-1 hero_spawn tiles (1 recommended)
- [ ] Maps can have 0-10 foe_spawn tiles (at least 1 recommended)

### Visual Rendering
- [ ] In editor: spawn tiles render with clear visual markers on top of the tile color
- [ ] In game: spawn tiles render as walkable floor (no special visual - they're just markers)

## Context

### Current Implementation

**Hero spawning** (`src/scenes/GameScene.ts` lines 293-299):
```typescript
private createHero(): void {
  const mapConfig = this.mapSystem.getMapConfig();
  const centerX = (mapConfig.width * mapConfig.tileSize) / 2;
  const centerY = (mapConfig.height * mapConfig.tileSize) / 2;
  this.hero = new Hero(this, centerX, centerY);
  // ...
}
```

**Foe spawning** (`src/systems/WaveManager.ts` lines 103-143):
- Spawns foes at random positions along map edges
- Uses collision checking to avoid walls
- No designated spawn points

**Tile types** (`src/config/MapConfig.ts` lines 23-26):
```typescript
export const TILE_TYPES: Record<number, TileType> = {
  0: { id: 0, collide: false }, // Empty/passable
  1: { id: 1, collide: true, color: "#000000" }, // Black wall
};
```

**Editor tiles** (`src/stores/editorStore.ts` lines 24-27):
```typescript
export const TILES = [
  { id: 0 as const, name: "Empty", color: "transparent", collide: false },
  { id: 1 as const, name: "Wall", color: "#000000", collide: true },
] as const;
```

### Files to Modify

1. **`src/config/MapConfig.ts`** - Add hero_spawn (id:2) and foe_spawn (id:3) tile types
2. **`src/stores/editorStore.ts`** - Update TileId type and TILES array with spawn tiles
3. **`src/systems/MapSystem.ts`** - Add `getHeroSpawnPosition()` and `getFoeSpawnPositions()` methods
4. **`src/scenes/GameScene.ts`** - Use MapSystem spawn position for hero
5. **`src/systems/WaveManager.ts`** - Use MapSystem spawn positions for foes
6. **`src/ui/editor/TilePalette.tsx`** - Update tile rendering for spawn tiles with visual markers

### Technical Notes

- Spawn tiles should have `collide: false` so entities can stand on them
- Editor should show spawn points clearly but game rendering treats them as walkable floor
- Consider using green (#00ff00) for hero spawn and red (#ff0000) for foe spawns in editor
- The game follows a black & white visual theme, but editor can use colors for clarity
- Existing maps will need migration or graceful fallback behavior

### Related Tasks
- Map editor improvements
- Map validation system
