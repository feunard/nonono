# [feat] Accordion Component

**Status:** Done
**Priority:** Medium
**Type:** Feature
**Agent:** -

## Description

DebugHeroStatsCard is too tall on small screens. Create a reusable Accordion component and refactor the card to use collapsible sections. First section open by default, others collapsed.

## Acceptance Criteria

- [x] Create `src/ui/primitives/Accordion.tsx` component
- [x] Props: `allowMultiple?: boolean` (default false = only one open at a time)
- [x] Props: `defaultOpen?: number | number[]` (index of initially open section)
- [x] Smooth expand/collapse animation
- [x] Visual indicator for open/closed state (chevron or +/-)
- [x] Follows black & white theme
- [x] Refactor DebugHeroStatsCard to use Accordion
- [x] Set `allowMultiple={false}` for DebugHeroStatsCard
- [x] First category (Core Stats) open by default

## API Design

```tsx
<Accordion allowMultiple={false} defaultOpen={0}>
  <AccordionItem title="Core Stats">
    <DebugRow label="Max HP" value={100} />
    ...
  </AccordionItem>
  <AccordionItem title="Modifiers">
    ...
  </AccordionItem>
  <AccordionItem title="Offensive">
    ...
  </AccordionItem>
</Accordion>
```

## Current Categories in DebugHeroStatsCard

1. Core Stats (Max HP, Move Spd, Bow Range, Luck)
2. Modifiers (Agi Mod, Str Mod, Total Agi, Total Str, Crit %)
3. Offensive (Crit Mult, Dmg Mult, Accuracy, Piercing, Armor Pen)
4. Defensive (Dodge, Armor, HP Regen)
5. Bow (Interval, Damage, Atk/sec, DPS)
6. Sword (Interval, Damage, Atk/sec, DPS)
7. Arrow Powers (conditional)
8. Sword Powers (conditional)
9. On-Hit (conditional)

## Context

- Target file: `src/ui/cards/debug/DebugHeroStatsCard.tsx`
- New primitive: `src/ui/primitives/Accordion.tsx`
- Update `docs/UI.md` with new primitive

## History

- 2025-12-25: Implemented Accordion component with smooth CSS grid-based expand/collapse animation, chevron indicator, and black & white theme. Refactored DebugHeroStatsCard to use collapsible sections with Core Stats open by default. Updated docs/UI.md with new primitive documentation.
