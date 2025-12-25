# [feat] Map Editor Step 2 - JSON Data Model and Loading System

**Status:** Done
**Priority:** High
**Type:** Feature

## Description

Create a shared JSON data model for maps that works seamlessly between the game (`src/systems/MapSystem.ts`) and the map editor (`src/ui/editor/`). This enables maps to be exported from the editor, saved as JSON files, and loaded into the game at runtime. The game will randomly select one of multiple available maps on startup.

## Goals

1. Define a unified JSON schema for map files compatible with both game and editor
2. Enable the editor to import/export maps as JSON
3. Create 3 sample map JSON files with different layouts
4. Update game to load maps from JSON and randomly select one on startup

## Acceptance Criteria

### JSON Schema and Data Model
- [x] Define TypeScript type `MapData` (JSON-serializable version of MapConfig)
- [x] Schema includes: id, name, width, height, tileSize, tilemap (2D array)
- [x] Create validation function `validateMapData(data: unknown): MapData`
- [x] Export schema/types from a shared location accessible by both game and editor

### Map Files
- [x] Create `src/assets/maps/` directory
- [x] Create 3 sample map JSON files with different layouts:
  - `arena-simple.json` - Open arena with minimal walls
  - `arena-maze.json` - Maze-like layout with corridors
  - `arena-pillars.json` - Open area with scattered pillar obstacles
- [x] Each map is 64x64 tiles, uses only tile 0 (empty) and 1 (wall)
- [x] Maps have interesting but playable layouts (hero can navigate, orcs can path)

### MapConfig Updates
- [x] Update `src/config/MapConfig.ts` to load maps from JSON files
- [x] Create `getAvailableMaps(): string[]` function returning list of map IDs
- [x] Create `getRandomMapId(): string` function for random selection
- [x] Maintain backward compatibility with existing `getMapConfig(mapId)` API

### Game Integration
- [x] Update game startup to randomly select from available maps
- [x] Selected map ID is used when creating MapSystem
- [x] Log which map was selected to console for debugging

### Editor Import/Export
- [x] Add "Export" button to EditorToolbar - downloads current map as JSON
- [x] Add "Import" button to EditorToolbar - loads JSON file into editor
- [x] Export uses map name input or generates default name
- [x] Import validates JSON structure before loading
- [x] Show error toast/message if import fails validation

## Context

### Current MapConfig Structure

From `src/config/MapConfig.ts`:
```typescript
export type MapConfig = {
  id: string;
  name: string;
  width: number;      // in tiles
  height: number;     // in tiles
  tileSize: number;
  tilemap: number[][]; // 2D array of tile IDs
};
```

### Current Editor State

From `src/ui/editor/useMapEditor.ts`:
```typescript
type EditorState = {
  width: MapSize;     // 32 | 64 | 128
  height: MapSize;
  tiles: number[][];  // 2D array of tile IDs
  selectedTile: TileId;
  showGrid: boolean;
  tool: 'paint' | 'erase';
  // ...
};
```

### MapSystem Usage

From `src/systems/MapSystem.ts`:
- Constructor: `new MapSystem(scene, mapId)`
- Uses `getMapConfig(mapId)` to load configuration
- `getCollisionGrid()` converts tilemap to pathfinding data

### Relevant Files

- `src/config/MapConfig.ts` - Map definitions, needs JSON loading capability
- `src/systems/MapSystem.ts` - Map rendering, uses MapConfig
- `src/ui/editor/useMapEditor.ts` - Editor state, needs import/export actions
- `src/ui/editor/EditorToolbar.tsx` - Toolbar, needs import/export buttons
- `src/scenes/GameScene.ts` - Game startup, needs random map selection

### JSON Map File Format

```json
{
  "id": "arena-simple",
  "name": "Simple Arena",
  "width": 64,
  "height": 64,
  "tileSize": 16,
  "tilemap": [
    [1, 1, 1, 1, ...],
    [1, 0, 0, 0, ...],
    ...
  ]
}
```

### Implementation Notes

1. **Vite JSON Import**: Vite supports importing JSON files directly:
   ```typescript
   import arenaSimple from '../assets/maps/arena-simple.json';
   ```

2. **Dynamic Import**: For runtime flexibility, may need:
   ```typescript
   const mapModules = import.meta.glob('../assets/maps/*.json');
   ```

3. **Editor Export**: Use Blob + download link pattern:
   ```typescript
   const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   // Create <a> element and click it
   ```

4. **Editor Import**: Use file input element:
   ```typescript
   <input type="file" accept=".json" onChange={handleFileLoad} />
   ```

### Sample Map Ideas

1. **arena-simple.json**: Border walls only, large open center, maybe 2-3 small obstacles
2. **arena-maze.json**: Connected corridors, multiple paths, no dead ends
3. **arena-pillars.json**: Scattered 2x2 or 3x3 pillar blocks, good for dodging

## Testing Considerations

- Verify maps load correctly in game
- Test pathfinding works on all 3 maps (orcs can reach hero)
- Verify random selection works (play multiple times)
- Test editor export produces valid JSON
- Test editor import loads exported maps correctly
- Test import rejects invalid JSON gracefully

## History

- 2025-12-25: Completed implementation
  - Created `src/config/MapData.ts` with MapData type and validateMapData function
  - Created 3 sample maps in `src/assets/maps/`: arena-simple.json, arena-maze.json, arena-pillars.json
  - Updated MapConfig.ts to load maps from JSON with getAvailableMaps(), getRandomMapId(), setCurrentMapId(), getCurrentMapId()
  - Updated GameScene.ts to randomly select map on startup with console logging
  - Added Import/Export functionality to EditorToolbar with error handling
  - All validation checks pass (lint, typecheck, tests, build)
