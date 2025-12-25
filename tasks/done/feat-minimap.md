# [feat] Develop a minimap

**Status:** Done
**Priority:** Low
**Type:** Feature
**Agent:** Cartman

## Description

Create a minimap showing an abstract representation of the current stage and the player's position. The minimap should provide spatial awareness without being too detailed. Implementation can be either React-based (canvas/SVG) or Phaser-based depending on performance considerations.

## Acceptance Criteria

- [x] Minimap displays in corner of screen (non-intrusive)
- [x] Shows abstract representation of the map/stage boundaries
- [x] Player position is clearly visible and updates in real-time
- [x] Enemy positions shown as simple markers (optional, if performant)
- [x] Follows black & white visual theme
- [x] No significant performance impact (test with many orcs on screen)

## Context

- UI components in `src/ui/`
- Game state available via `useGameStore` in `src/stores/gameStore.ts`
- Map/world bounds defined in `src/scenes/GameScene.ts`
- Consider: React canvas for simpler implementation, Phaser RenderTexture for better performance with many entities

## Implementation Notes

- Start with React canvas approach
- If performance is poor with 50+ enemies, switch to Phaser-based solution
- Minimap scale: ~1:20 or configurable

## History

### Completed by Cartman

- Added `heroPosition` and `orcPositions` state to `gameStore.ts`
- Added `Position` type to gameStore exports
- Extended `UIBatchUpdate` to include hero/orc positions
- Updated `GameScene.ts` to push hero position and orc positions every 100ms via `batchUpdateUI`
- Created `MinimapCard.tsx` component:
  - 100x100 pixel canvas-based minimap
  - Black background with dark grey map boundary
  - Hero shown as white dot (radius 3)
  - Orcs shown as grey dots (radius 1.5)
  - Scale automatically calculated from GAME_CONFIG map dimensions
- Integrated minimap into `GameUI.tsx` in bottom-left corner (above LogsCard)
- Updated `cards/index.ts` barrel export
