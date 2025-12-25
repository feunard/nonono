# [feat] Log System Part 2

**Status:** Backlog
**Priority:** Medium
**Type:** Feature
**Agent:** -

## Description

Improve the logging system UI. LogsCard should display user-friendly formatted messages instead of raw JSON. Move the export functionality from LogsCard to GameOverCard so players can export their run logs after death.

## Acceptance Criteria

- [ ] LogsCard displays human-readable messages (not raw JSON)
- [ ] Create a formatter function to convert log events to friendly text
- [ ] Remove "Export Logs" button from LogsCard
- [ ] Add "Export Logs" button to GameOverCard
- [ ] Export still outputs JSON lines format (for replay engine compatibility)

## Message Format Examples

```
Raw: {"type":"orc_spawn","id":42,"level":3,"hp":150}
Display: "Orc #42 (L3) spawned"

Raw: {"type":"orc_kill","id":42,"damage":25}
Display: "Orc #42 killed"

Raw: {"type":"power_pickup","power":"Swift Strike"}
Display: "Picked up: Swift Strike"

Raw: {"type":"wave_start","wave":5}
Display: "Wave 5 started"

Raw: {"type":"hero_damage","amount":15,"source":"orc"}
Display: "Took 15 damage"
```

## Context

- LogsCard: `src/ui/LogsCard.tsx` (or similar)
- GameOverCard: `src/ui/GameOverOverlay.tsx` or `src/ui/dialogs/`
- LogSystem: `src/systems/LogSystem.ts`
- Create formatter: `src/systems/LogFormatter.ts` or add to LogSystem

## History

_No history yet_
