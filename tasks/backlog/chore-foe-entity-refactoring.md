# [chore] Foe Entity System Refactoring

**Status:** Backlog
**Priority:** Medium
**Type:** Refactor
**Agent:** -

## Description

Refactor the current `Orc` entity into a flexible enemy class hierarchy. The goal is to create a `Foe` base class that encapsulates all common enemy behavior, allowing easy creation of new enemy types (Orc, BigOrc, Zombie, etc.) through subclasses that only define their specific parameters.

## Current State

- Single `Orc` class in `src/entities/Orc.ts` (~580 lines)
- Hardcoded sprite key (`"orc-idle"`) and animation names (`"orc-walk"`, `"orc-attack"`, `"orc-death"`)
- Stats sourced directly from `GAME_CONFIG.orc.*`
- No way to create enemy variants without duplicating the entire class
- `WaveManager` directly instantiates `Orc` class

## Target State

- `Foe` base class with all common enemy behavior
- `Orc` subclass extending `Foe` with orc-specific config
- `BigOrc` subclass extending `Foe` (scaled orc with boosted stats)
- Architecture ready for future enemy types (Zombie, Skeleton, etc.)
- `WaveManager` can spawn different enemy types based on wave or config

## Acceptance Criteria

- [ ] Rename current `Orc` class to `Foe` (keep in same file or new `Foe.ts`)
- [ ] Extract all hardcoded values into a `FoeConfig` interface/type
- [ ] `Foe` constructor accepts a config object for: sprite keys, animation mappings, base stats, scale
- [ ] Create new `Orc` class extending `Foe` with orc-specific config
- [ ] Create `BigOrc` class extending `Foe` (1.5x scale, +50% HP, +25% damage)
- [ ] Update `WaveManager.spawnOrc()` to support spawning different foe types
- [ ] Update `GameScene` imports and type references (`Orc` -> `Foe` where appropriate)
- [ ] Update `GAME_CONFIG` to support per-enemy-type stats (or use config objects)
- [ ] Ensure logging still works with foe type identification
- [ ] Run `npm run v` - all checks must pass
- [ ] Fix any broken tests

## Proposed Architecture

```
src/entities/
├── Foe.ts        # Base class with all common behavior
├── Orc.ts        # Orc-specific config, extends Foe
├── BigOrc.ts     # BigOrc-specific config, extends Foe
└── index.ts      # Re-export all foe types
```

### FoeConfig Interface

```typescript
interface FoeConfig {
  // Sprite configuration
  spriteKey: string;           // e.g., "orc-idle"
  animations: {
    idle: string;              // e.g., "orc-idle"
    walk: string;              // e.g., "orc-walk"
    attack: string;            // e.g., "orc-attack"
    death: string;             // e.g., "orc-death"
  };

  // Visual
  scale: number;               // e.g., 1 for Orc, 1.5 for BigOrc

  // Hitbox configuration
  bodySize: { width: number; height: number };
  bodyOffset: { x: number; y: number };

  // Base stats (before wave scaling)
  baseHealth: number;
  baseDamage: number;
  baseSpeed: number;
  baseArmor: number;
  baseDodge: number;
  baseAccuracy: number;

  // Stat multipliers (applied on top of base stats)
  statMultiplier?: number;     // e.g., 1.5 for BigOrc (optional, default 1)

  // For logging/identification
  typeName: string;            // e.g., "Orc", "BigOrc"
}
```

### Example Subclass

```typescript
// Orc.ts
export class Orc extends Foe {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    pathfindingManager: PathfindingManager,
    collisionLayer: Phaser.Tilemaps.TilemapLayer,
    effectsManager: EffectsManager,
    wave: number,
  ) {
    super(scene, x, y, pathfindingManager, collisionLayer, effectsManager, wave, {
      spriteKey: "orc-idle",
      animations: {
        idle: "orc-idle",
        walk: "orc-walk",
        attack: "orc-attack",
        death: "orc-death",
      },
      scale: 1,
      bodySize: { width: 8, height: 8 },
      bodyOffset: { x: 46, y: 52 },
      baseHealth: GAME_CONFIG.orc.health,
      baseDamage: GAME_CONFIG.orc.damage,
      baseSpeed: GAME_CONFIG.orc.speed,
      baseArmor: GAME_CONFIG.orc.armor,
      baseDodge: GAME_CONFIG.orc.dodge,
      baseAccuracy: GAME_CONFIG.orc.accuracy,
      typeName: "Orc",
    });
  }
}
```

### WaveManager Changes

```typescript
// In WaveManager.ts
private spawnFoe(foeType: 'orc' | 'bigOrc' = 'orc'): void {
  // ... position calculation ...

  let foe: Foe;
  switch (foeType) {
    case 'bigOrc':
      foe = new BigOrc(/* params */);
      break;
    case 'orc':
    default:
      foe = new Orc(/* params */);
  }

  foe.setTarget(this.hero);
  this.orcs.add(foe);  // Consider renaming to `this.foes`
}
```

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/entities/Orc.ts` | Refactor to `Foe` base class |
| `src/entities/Orc.ts` (new) | New `Orc` subclass |
| `src/entities/BigOrc.ts` | New `BigOrc` subclass |
| `src/systems/WaveManager.ts` | Support multiple foe types |
| `src/scenes/GameScene.ts` | Update type references |
| `src/config/GameConfig.ts` | Optional: per-type config sections |

## Migration Strategy

1. Create `FoeConfig` interface
2. Refactor `Orc` class internals to use config pattern (don't rename yet)
3. Once working, rename `Orc` -> `Foe`
4. Create new `Orc` class extending `Foe`
5. Create `BigOrc` class extending `Foe`
6. Update `WaveManager` to use factory pattern or type parameter
7. Update all imports and type annotations
8. Test thoroughly

## Testing Considerations

- Verify orc spawning still works
- Verify combat damage/knockback/death for all foe types
- Verify BigOrc appears larger and has correct stats
- Verify pathfinding works for all foe types
- Verify logging correctly identifies foe types
- Check debug hitboxes render correctly at different scales

## Context

- Current orc implementation: `src/entities/Orc.ts`
- Wave spawning: `src/systems/WaveManager.ts`
- Game scene: `src/scenes/GameScene.ts`
- Config: `src/config/GameConfig.ts`
- Orc sprites loaded in: `src/scenes/BootScene.ts`

## Future Extensions

Once this refactoring is complete, adding new enemy types becomes trivial:

```typescript
// Future: Zombie.ts
export class Zombie extends Foe {
  constructor(/* params */) {
    super(/* params */, {
      spriteKey: "zombie-idle",
      animations: { idle: "zombie-idle", walk: "zombie-walk", ... },
      scale: 1,
      baseHealth: 80,
      baseDamage: 8,
      baseSpeed: 50,  // Slower but tankier
      ...
      typeName: "Zombie",
    });
  }
}
```

## Notes

- Keep `orcId` naming for now (or rename to `foeId` for consistency)
- Consider renaming `WaveManager.orcs` group to `foes`
- BigOrc should use same sprites as Orc, just scaled up
- Logging should include foe type: `"BigOrc L3 #42 dies."` instead of `"Orc L3 #42 dies."`

## History

_No history yet_
