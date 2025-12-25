# feat: Wave Level Tooltip

**Status:** Backlog
**Priority:** Medium
**Type:** Feature

## Description

Add tooltip functionality to show wave-based enemy scaling information when hovering over the Wave stat in the GameStatsCard. This involves two parts:

1. Enhance the Tooltip primitive to support configurable positioning
2. Add a tooltip to the Wave stat displaying current enemy scaling bonuses

## Acceptance Criteria

### Part 1: Tooltip Positioning
- [ ] Tooltip component accepts a `position` prop with options: `"top"` | `"bottom"` | `"left"` | `"right"`
- [ ] Default position is `"top"` (preserving current behavior)
- [ ] Tooltip placement adjusts correctly for each position option
- [ ] Arrow direction points toward the trigger element for each position
- [ ] Existing Tooltip usages continue to work without modification

### Part 2: Wave Level Tooltip
- [ ] Wave stat in GameStatsCard displays a tooltip on hover
- [ ] Tooltip shows current wave's enemy scaling bonuses
- [ ] Scaling values are calculated from game config, not hardcoded
- [ ] Display format shows percentage bonuses clearly (e.g., "+10% health", "+10% damage")
- [ ] Tooltip uses `position="bottom"` to avoid overlapping with top UI elements

## Context

### Relevant Files
- `/src/ui/primitives/Tooltip.tsx` - Current tooltip implementation (top position only)
- `/src/ui/cards/GameStatsCard.tsx` - Contains the Wave stat to enhance
- `/src/config/GameConfig.ts` - Contains wave scaling configuration values
- `/src/ui/primitives/Stat.tsx` - Stat component (may need wrapper for tooltip)

### Wave Scaling Formulas (from GameConfig.ts and Orc.ts)

The scaling system uses these config values:
```typescript
orc: {
  levelHpMultiplier: 0.1,      // +10% HP per level beyond 1
  levelDamageMultiplier: 0.1,  // +10% damage per level beyond 1
  levelSpeedMultiplier: 0.1,   // +10% speed per level beyond 1
  speedPerWave: 5,             // +5 speed per wave (additive)
  dodgePerWave: 1,             // +1% dodge per wave
  armorPerWave: 2,             // +2% armor per wave
}
```

Formula: `multiplier = 1 + (wave - 1) * levelMultiplier`

Example for Wave 5:
- HP: +40% (`1 + (5-1) * 0.1 = 1.4`)
- Damage: +40%
- Speed: +40% multiplicative + 20 flat speed
- Dodge: +4%
- Armor: +8%

### Tooltip Position CSS Classes

For reference, the positioning logic should use:
- **top**: `bottom-full mb-2`, arrow at `top-full border-t-*`
- **bottom**: `top-full mt-2`, arrow at `bottom-full border-b-*`
- **left**: `right-full mr-2`, arrow at `left-full border-l-*`
- **right**: `left-full ml-2`, arrow at `right-full border-r-*`

### Visual Theme Constraint
All UI must remain black & white only. Use existing color scheme from Tooltip (black/90 background, neutral-600 border).
