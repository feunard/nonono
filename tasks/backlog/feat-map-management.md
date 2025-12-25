# [feat] Map Management System

**Status:** Backlog
**Priority:** High
**Type:** Feature
**Agent:** -

## Description

Remove random map generation and implement a proper tile-based map system. Maps are defined in config with fixed sizes (64x64 or 128x128). Tiles have collision properties. Foundation for supporting multiple maps in the future.

## Current State

- Map is randomly generated
- No structured tilemap system
- Hard to create designed levels

## Target State

- Maps defined in config files
- Fixed grid sizes (64x64 or 128x128)
- Tile-based collision system
- Easy to add new maps later

## Acceptance Criteria

- [ ] Create `src/config/MapConfig.ts`
- [ ] Remove random map generation
- [ ] Map size configurable (64x64 or 128x128)
- [ ] Tileset definition with tile types
- [ ] Tile 0 = empty/passable (no render)
- [ ] Tile 1 = solid black wall (collide: true)
- [ ] Default map: 64x64 empty (all 0s)
- [ ] Collision system reads from tilemap
- [ ] Update GameScene to use new map system

## Config Structure

```typescript
// src/config/MapConfig.ts

export type TileType = {
  id: number;
  collide: boolean;
  color?: string; // for rendering
};

export const TILE_TYPES: Record<number, TileType> = {
  0: { id: 0, collide: false },                    // Empty/passable
  1: { id: 1, collide: true, color: '#000000' },   // Black wall
  // Future: 2 = water, 3 = lava, etc.
};

export type MapConfig = {
  id: string;
  name: string;
  width: number;   // in tiles
  height: number;  // in tiles
  tileSize: number;
  tilemap: number[][]; // 2D array of tile IDs
};

export const MAPS: Record<string, MapConfig> = {
  default: {
    id: 'default',
    name: 'Empty Arena',
    width: 64,
    height: 64,
    tileSize: 16,
    tilemap: Array(64).fill(Array(64).fill(0)), // All empty
  },
};

export const CURRENT_MAP = 'default';
```

## Context

- Current map logic: `src/scenes/GameScene.ts`
- May need: `src/systems/MapSystem.ts`
- Tile size likely 16px (check GameConfig)
- Phaser has built-in tilemap support

## Future Considerations (do not implement now)

- Map editor tool
- Multiple map selection
- Procedural map generation with templates
- Special tiles (spawn points, objectives)

## History

_No history yet_
