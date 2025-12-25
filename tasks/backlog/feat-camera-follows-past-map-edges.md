# [feat] Camera Follows Hero Past Map Edges

**Status:** Backlog
**Priority:** Medium
**Type:** Feature

## Description
Currently, the camera stops at map edges due to camera bounds being set to the exact map dimensions. This creates a jarring experience when the hero reaches the edge of the map. The camera should continue following the hero past map borders, showing a white area outside the map with a thin black border line to clearly delineate the playable area.

## Acceptance Criteria

### Camera Behavior
- [ ] Camera follows the hero smoothly even when approaching or at map edges
- [ ] Camera can pan beyond the map boundaries when hero is near edges
- [ ] Existing camera follow smoothing (0.1, 0.1 lerp) is preserved
- [ ] Zoom functionality continues to work correctly at map edges

### Visual Outside Map
- [ ] Area outside the map appears as white (using existing Phaser background color `#ffffff`)
- [ ] A thin black border (1-2px) is drawn around the entire map perimeter
- [ ] Border clearly distinguishes the playable map from the outside area
- [ ] Border does not interfere with gameplay or feel obtrusive

### Edge Cases
- [ ] Hero collision with map edge tiles still works correctly
- [ ] Physics world bounds still constrain hero movement to within the map
- [ ] Minimap (if present) continues to display correctly

## Context

### Current Camera Setup (GameScene.ts lines 351-367)
```typescript
private setupCamera(): void {
    const mapConfig = this.mapSystem.getMapConfig();
    this.zoomIndex = 2;
    const targetZoom = ZOOM_LEVELS[this.zoomIndex];

    this.cameras.main.setZoom(targetZoom);
    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
    this.cameras.main.setBounds(
        0,
        0,
        mapConfig.width * mapConfig.tileSize,
        mapConfig.height * mapConfig.tileSize,
    );
    // ...
}
```

The `camera.setBounds()` call restricts camera movement to the map area. This needs to be removed or the bounds expanded significantly.

### Current Map Rendering (MapSystem.ts lines 80-139)
```typescript
private renderMap(): void {
    const { width, height, tileSize, tilemap } = this.mapConfig;
    const mapWidth = width * tileSize;
    const mapHeight = height * tileSize;

    this.graphics = this.scene.add.graphics();

    // Draw background (white for empty tiles)
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillRect(0, 0, mapWidth, mapHeight);

    // ... tile rendering ...

    // Add subtle grid lines for all tiles
    this.graphics.lineStyle(0.5, 0x000000, 0.05);
    // ...
}
```

A black border stroke needs to be added around the map perimeter after all tiles are rendered.

### Files to Modify

1. **`src/scenes/GameScene.ts`**
   - Remove or modify `camera.setBounds()` in `setupCamera()` method
   - Physics world bounds should remain unchanged (hero still constrained to map)

2. **`src/systems/MapSystem.ts`**
   - Add black border stroke around map perimeter in `renderMap()` method
   - Use `this.graphics.strokeRect()` with black color and 1-2px line width

### Implementation Notes

**Camera bounds options:**
- Option A: Remove `camera.setBounds()` entirely - camera has no restrictions
- Option B: Expand bounds by a large margin (e.g., 1000px on each side) to allow some freedom

**Border implementation:**
```typescript
// After all tiles are rendered, before generating texture
this.graphics.lineStyle(2, 0x000000, 1);  // 2px solid black
this.graphics.strokeRect(0, 0, mapWidth, mapHeight);
```

**Background color:**
The Phaser game config in `App.tsx` already sets `backgroundColor: "#ffffff"`, so areas outside the map texture will automatically appear white.

### Testing Checklist
- Walk hero to each edge of the map (north, south, east, west)
- Walk hero to each corner of the map
- Verify camera smoothly continues past map edge
- Verify black border is visible and clean
- Test with different zoom levels
- Verify hero cannot walk outside the map (physics bounds still work)
