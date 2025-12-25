# [feat] Comprehensive game logging system

**Status:** Done
**Priority:** Medium
**Type:** Feature
**Agent:** Cartman

## Description

Build a robust logging system that records all significant game events. Logs should be stored in memory during the run and exportable to a text file. The goal is to enable full run replay analysis via logs. Logs are JSON lines. Logs can be formatted and displayed in LogsCard for Player.

## Log Events to Capture

- Power pickups (which power, when)
- Player death (cause, stats at death)
- Orc spawns (ID, level, stats)
- Orc kills (ID, level, who killed)
- Wave starts/ends
- Damage dealt/received
- Level ups

## Acceptance Criteria

- [x] Log system captures all key game events
- [x] Each orc has unique ID and displays level (e.g., "Orc L3 #42")
- [x] Orc spawn logs include full stats and ID
- [x] Power pickup logged with power name and timestamp
- [x] Death event logged with cause and final stats
- [x] All logs stored in memory during run
- [x] Export button to download logs as .jsonl file
- [x] Log format is parseable for potential replay engine (JSON lines)

## Context

- Create new system: `src/systems/LogSystem.ts`
- Add log state to gameStore
- Add export UI button

## Future Considerations

- Replay engine that can recreate runs from log files

## History

### 2025-12-25 - Cartman - Done
Completed implementation:
- Created `src/systems/LogSystem.ts` with JSON lines event logging
- Added unique orc IDs (displayed as "Orc L3 #42")
- Integrated logging into all game events (spawn, kill, power pickup, wave, death, loot)
- Added export button to LogsCard for downloading .jsonl files

### 2025-12-25 - Cartman - In Progress
Claimed task. Starting implementation of comprehensive logging system.
