# [fix] Clean up LogsCard message formatting and styling

**Status:** Done
**Priority:** Medium
**Type:** Bug

## Description
The combat log in LogsCard has poor readability due to cluttered messages and incorrect text highlighting. Log messages currently include unnecessary identifiers (L1 for level, orc IDs like #123) and the highlighting logic marks too many numbers as white, making it hard to quickly scan damage values.

## Acceptance Criteria
- [x] Log messages no longer contain "L{n}" level indicators (e.g., "Orc L1" becomes just "Orc")
- [x] Log messages no longer contain orc ID numbers (e.g., "#123" is removed)
- [x] Only damage values are highlighted in white/bold
- [x] Action text, entity names, and other content remain grey (text-neutral-500)
- [x] Critical hits still display distinctly (crit keyword can remain highlighted)
- [x] Death messages are clean (e.g., "Orc dies." instead of "Orc L1 #42 dies.")

## Context

### Files modified

**Message generation:**
- `src/entities/Foe.ts` - Removed `L${this.level}` and `#${this.foeId}` from all log messages

**Log formatting:**
- `src/systems/LogFormatter.ts` - Removed level/ID patterns from all event formatters (foe_spawn, foe_kill, damage_dealt, damage_received, loot_drop)

**Display styling:**
- `src/ui/cards/LogsCard.tsx` - Changed regex from `/(\d+|crit|dies\.?|killed)/gi` to `/(for \d+|crit|ARMOR PEN)/gi` to only highlight damage values and special keywords

### Log examples (after fix)
- `You hit Orc for 25.`
- `You crit Orc for 50!`
- `Orc dies.`
- `You hit Orc for 30. (ARMOR PEN)`

## History
- 2025-12-25: Completed - Removed L{n} and #{id} from all log messages, refined highlighting to only damage values and keywords (crit, ARMOR PEN)
