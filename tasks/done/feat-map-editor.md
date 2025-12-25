# [feat] Map Editor

**Status:** Done
**Priority:** Medium
**Type:** Feature
**Agent:** -

## Description

Create a visual map editor for designing tile-based maps. Focus on the editor UI structure first with an internal datamodel. JSON export will come later. Design inspired by popular tileset editors like Tiled.

## Goals

- Visual tile placement editor
- Reuse existing UI primitives
- Clean, intuitive interface
- Internal state management (no file I/O yet)

## Acceptance Criteria

- [x] Create `src/ui/editor/` directory structure
- [x] MapEditor main component
- [x] Tile palette panel (select tile to paint)
- [x] Canvas/grid area for painting tiles
- [x] Map size selector (32x32, 64x64, 128x128)
- [x] Click/drag to paint tiles
- [x] Clear map button
- [x] Only 2 tiles: ID 0 (empty), ID 1 (black wall)
- [x] Grid overlay toggle
- [x] Zoom controls (optional)
- [x] Internal state with useState/useReducer

## Editor Layout

```
┌─────────────────────────────────────────────────────────┐
│  Map Editor                              [Grid] [Clear] │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  TILES   │                                              │
│  ┌───┐   │              MAP CANVAS                      │
│  │ 0 │   │                                              │
│  └───┘   │         (click/drag to paint)                │
│  ┌───┐   │                                              │
│  │ 1 │   │                                              │
│  └───┘   │                                              │
│          │                                              │
├──────────┴──────────────────────────────────────────────┤
│  Size: [32x32 ▼]    Tile: Empty (0)    Pos: (12, 34)   │
└─────────────────────────────────────────────────────────┘
```

## Tile Definitions

```typescript
const TILES = [
  { id: 0, name: 'Empty', color: 'transparent', collide: false },
  { id: 1, name: 'Wall', color: '#000000', collide: true },
];
```

## Component Structure

```
src/ui/editor/
├── MapEditor.tsx           # Main editor container
├── TilePalette.tsx         # Tile selection panel
├── MapCanvas.tsx           # Grid canvas for painting
├── EditorToolbar.tsx       # Top toolbar (clear, grid toggle)
├── EditorStatusBar.tsx     # Bottom info bar
└── useMapEditor.ts         # Editor state hook
```

## Internal State

```typescript
type EditorState = {
  width: number;          // 32, 64, or 128
  height: number;
  tiles: number[][];      // 2D array of tile IDs
  selectedTile: number;   // Currently selected tile ID
  showGrid: boolean;
  tool: 'paint' | 'erase';
};
```

## Context

- Add route/screen for editor (or modal)
- Primitives: `src/ui/primitives/`
- May need new primitives: Select/Dropdown, ToggleButton
- Black & white theme

## Future Considerations (do not implement now)

- Export to JSON
- Import from JSON
- More tile types
- Undo/redo
- Copy/paste regions
- Flood fill tool

## History

- 2025-12-25: Implemented visual map editor with all acceptance criteria met. Created 6 new files in src/ui/editor/: MapEditor.tsx (main container), TilePalette.tsx (tile selection), MapCanvas.tsx (grid painting with click/drag), EditorToolbar.tsx (toolbar with back, size selector, zoom, grid toggle, clear), EditorStatusBar.tsx (status info), and useMapEditor.ts (reducer-based state hook). Added "editor" screen to app routing with "Map Editor" button on launch screen.
