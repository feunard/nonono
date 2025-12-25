# [fix] Clean up LogsCard message formatting and styling

**Status:** Backlog
**Priority:** Medium
**Type:** Bug

## Description
The combat log in LogsCard has poor readability due to cluttered messages and incorrect text highlighting. Log messages currently include unnecessary identifiers (L1 for level, orc IDs like #123) and the highlighting logic marks too many numbers as white, making it hard to quickly scan damage values.

## Acceptance Criteria
- [ ] Log messages no longer contain "L{n}" level indicators (e.g., "Orc L1" becomes just "Orc")
- [ ] Log messages no longer contain orc ID numbers (e.g., "#123" is removed)
- [ ] Only damage values are highlighted in white/bold
- [ ] Action text, entity names, and other content remain grey (text-neutral-500)
- [ ] Critical hits still display distinctly (crit keyword can remain highlighted)
- [ ] Death messages are clean (e.g., "Orc dies." instead of "Orc L1 #42 dies.")

## Context

### Files to modify

**Message generation (source of L1/ID clutter):**
- `src/entities/Orc.ts` (lines 480-497, 562) - Contains `addLog()` calls with level and ID in message format:
  - `You crit Orc L${this.level} #${this.orcId} for ${finalDamage}!`
  - `You hit Orc L${this.level} #${this.orcId} for ${finalDamage}.`
  - `Orc L${this.level} #${this.orcId} dies.`

**Display styling (highlighting logic):**
- `src/ui/cards/LogsCard.tsx` (lines 6-15) - `formatLogMessage()` currently highlights ALL numbers with regex `/(\d+|crit|dies\.?|killed)/gi`

### Implementation approach
1. Update message strings in `Orc.ts` to remove `L${this.level}` and `#${this.orcId}` patterns
2. Refine the regex in `LogsCard.tsx` to only capture damage numbers (numbers that appear after "for" or similar patterns) rather than all digits
3. Consider using a structured log format (object with separate fields for action, target, damage) rather than string parsing, for cleaner separation of concerns

### Current log examples
- Current: `You hit Orc L1 #42 for 25.`
- Desired: `You hit Orc for 25.`

- Current: `You crit Orc L2 #17 for 50!`
- Desired: `You crit Orc for 50!`

- Current: `Orc L1 #42 dies.`
- Desired: `Orc dies.`
