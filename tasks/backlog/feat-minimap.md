# [feat] Develop a minimap

**Status:** Backlog
**Priority:** Low
**Type:** Feature
**Agent:** -

## Description

Create a minimap showing an abstract representation of the current stage and the player's position. The minimap should provide spatial awareness without being too detailed. Implementation can be either React-based (canvas/SVG) or Phaser-based depending on performance considerations.

## Acceptance Criteria

- [ ] Minimap displays in corner of screen (non-intrusive)
- [ ] Shows abstract representation of the map/stage boundaries
- [ ] Player position is clearly visible and updates in real-time
- [ ] Enemy positions shown as simple markers (optional, if performant)
- [ ] Follows black & white visual theme
- [ ] No significant performance impact (test with many orcs on screen)

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

_No history yet_
