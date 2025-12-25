# [feat] Orc leveling system in Wave Manager

**Status:** Done
**Priority:** High
**Type:** Feature
**Agent:** Jack

## Description

Enhance Wave Manager to scale orc difficulty per wave. Each wave increases orc level. Higher level orcs have increased stats but slightly reduced drop chance. Enables creation of orc "profiles" (tanky, glass cannon, balanced).

## Per Level Bonuses

- +10% HP
- +10% Agility
- +10% Strength
- -1% drop chance (minimum 50% drop chance)

## Acceptance Criteria

- [x] Orcs have a level property
- [x] Wave number determines orc level
- [x] Stats scale by +10% per level (multiplicative)
- [x] Drop chance reduces by 1% per level (floor: 50%)
- [x] Orc level displayed in-game (optional: above health bar)
- [x] Config values in GameConfig.ts
- [x] Update `docs/STATS.md` with enemy scaling section

## Context

- Wave Manager: `src/systems/WaveManager.ts`
- Orc entity: `src/entities/Orc.ts`
- Config: `src/config/GameConfig.ts`

## Future Considerations

- Orc profiles/variants (tanky, fast, balanced) using percentage-based scaling

## History

### Completed - Jack - Done

- Added `level` property to Orc class (equals wave number)
- Added level scaling config in GameConfig: +10% HP/damage/speed per level
- Stats scale multiplicatively: `base * (1 + (level - 1) * 0.1)`
- Drop chance reduces by 1% per level (minimum 50%)
- Combat log shows orc level: "Orc L5 dies."
- Updated `docs/STATS.md` with comprehensive enemy scaling section
