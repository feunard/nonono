# [feat] Add Collision Between Orcs

**Status:** Done
**Priority:** Medium
**Type:** Feature

## Description

Orcs currently have no collision detection between each other, allowing them to stack and overlap when multiple foes converge on the hero. When 10+ orcs are present, they pile on top of each other making it difficult to gauge the actual threat level visually. This feature adds orc-to-orc collision so foes push each other and spread out naturally.

## Current Behavior (Problem)

- Orcs can walk through each other and occupy the same space
- Large groups of orcs stack into a single visual mass
- Makes gameplay harder to read and threat assessment difficult
- Visually confusing during intense combat

## Desired Behavior

- Orcs collide with each other and cannot overlap
- Foes naturally spread out when crowded
- Reuses existing physics body/hitbox (blue hitbox in debug mode)
- Maintains smooth gameplay without orcs getting permanently stuck

## Acceptance Criteria

- [x] Orcs collide with other orcs and cannot walk through each other
- [x] Collision uses the existing physics body (8x8 hitbox at offset 46,52)
- [x] Orcs naturally spread out when multiple converge on the same point
- [x] No performance degradation with 20+ orcs on screen
- [x] Orcs do not get permanently stuck due to collision
- [x] Pathfinding still works correctly (orcs find alternate routes around each other)
- [x] Knockback behavior still functions properly with orc-orc collision

## Context

### Relevant Files

- `src/entities/Orc.ts` - Orc entity with existing physics body
  - Line 106-107: Physics body setup `setSize(8, 8)` and `setOffset(46, 52)`
  - Line 114: Individual orc-to-tilemap collision already exists
  - Has stuck detection (lines 217-238) that may need adjustment

- `src/systems/WaveManager.ts` - Where orcs are spawned and the group is managed
  - Line 37-40: `orcs` group created with `physics.add.group()`
  - Line 127: Orcs added to group via `this.orcs.add(orc)`

- `src/scenes/GameScene.ts` - Scene setup and collision configuration
  - Line 303-318: `setupSystems()` where WaveManager is initialized
  - This is where orc-to-orc collision should be configured

### Implementation Approach

1. **Option A: Group self-collision** (Recommended)
   - Phaser supports group-to-group collision: `physics.add.collider(orcs, orcs)`
   - Enable in GameScene after WaveManager is created
   - Simple and uses existing physics bodies

2. **Option B: Separation behavior**
   - Use `Phaser.Physics.Arcade.World.separate()` for softer pushing
   - May need to combine with collider for solid collision

### Potential Considerations

- **Stuck detection**: Orc.ts already has stuck detection (lines 217-238) that nudges stuck orcs. This may need tuning if orcs get stuck against each other more often.
- **Pathfinding**: Current pathfinding doesn't account for other orcs as obstacles. May need to add separation steering or the stuck detection will handle it.
- **Performance**: Group self-collision is O(n^2) - monitor with 30+ orcs.
- **Knockback**: When an orc is knocked back, it may push other orcs. This could be desirable or need limiting.

### Phaser Documentation Reference

```typescript
// Basic group self-collision
this.physics.add.collider(this.waveManager.orcs, this.waveManager.orcs);
```

## History

- 2025-12-25: Implemented orc-to-orc collision using Phaser's group self-collision in GameScene.setupSystems(). Added single line `this.physics.add.collider(this.waveManager.orcs, this.waveManager.orcs)` after WaveManager creation. Existing stuck detection in Orc.ts handles any collision-induced stuck states.
