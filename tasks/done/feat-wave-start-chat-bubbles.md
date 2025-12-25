# [feat] Add Wave Start Chat Bubble Messages

**Status:** Done
**Priority:** Low
**Type:** Feature

## Description
Add hero chat bubble messages that trigger at the beginning of each wave (starting from wave 2). Messages should be role-play themed while announcing the upcoming wave. This enhances game immersion by making the hero react to new waves of enemies.

## Acceptance Criteria

### Chat Messages Configuration
- [x] `src/config/ChatMessages.ts` has new `waveStart` category in `CHAT_MESSAGES` object
- [x] `waveStart` contains 4-5 thematic messages (e.g., "Wave 2... bring it on!", "More orcs? Wave 3, let's go!")
- [x] Messages follow existing RP tone (confident, heroic, slightly sarcastic)
- [x] `ChatMessageCategory` type automatically includes `waveStart` via existing `keyof typeof` pattern

### Wave Manager Integration
- [x] `src/systems/WaveManager.ts` triggers hero chat bubble when a new wave starts
- [x] Chat bubble only triggers for wave 2 and beyond (wave 1 is covered by `gameStart` messages)
- [x] Chat bubble triggers AFTER wave transition (when `startNextWave()` runs)
- [x] Uses `getRandomMessage('waveStart')` pattern consistent with other triggers

### Implementation Details
- [x] WaveManager needs access to Hero instance to call `showChatBubble()`
- [x] WaveManager already has `hero` reference in constructor (line 18)
- [x] Chat bubble call placed after `this.scene.events.emit("waveStarted", this.currentWave)` (line 63)

## Context

### Current ChatMessages.ts Structure
```typescript
export const CHAT_MESSAGES = {
    gameStart: [...],      // Triggers at game start
    orcKill: [...],        // Triggers on orc kill
    lowHealth: [...],      // Triggers when health is low
    powerPickup: [...],    // Triggers on power pickup
} as const;

export function getRandomMessage(category: ChatMessageCategory): string { ... }
```

### Current WaveManager.ts Wave Start Logic (lines 51-79)
```typescript
private startNextWave(): void {
    this.currentWave++;
    // ... wave setup logic ...

    this.scene.events.emit("waveStarted", this.currentWave);
    LogSystem.logWaveStart(this.currentWave, this.foesToSpawn);

    // Spawn timer setup...
}
```

### Existing Chat Bubble Trigger Pattern (GameScene.ts)
```typescript
// On game start (line 73)
this.hero.showChatBubble(CHAT_MESSAGES.gameStart, { force: true });

// On orc kill (line 410)
this.hero.showChatBubble(CHAT_MESSAGES.orcKill);
```

### Example Wave Start Messages
- "Wave 2... bring it on!"
- "More orcs? Wave 3, let's go!"
- "They keep coming... Wave 4 begins!"
- "Another wave approaches..."
- "Here comes wave X!"
- "Is that all you've got?"

### Files to Modify

1. **`src/config/ChatMessages.ts`** - Add `waveStart` array with 4-5 messages
2. **`src/systems/WaveManager.ts`** - Import chat utilities and trigger bubble on wave start (wave >= 2)

### Technical Notes

- Messages can be generic (not include wave number) since dynamic string interpolation would require refactoring the message system
- The `force: true` option may be useful to ensure the message shows even if another bubble is active
- WaveManager already imports Hero type and has hero reference, so no new dependencies needed
- Consider whether wave 2 should have slightly different messaging than later waves (optional enhancement)

## History

- 2025-12-25: Implemented wave start chat bubbles. Added 5 thematic messages to `waveStart` category in ChatMessages.ts. Modified WaveManager.ts to trigger chat bubble on wave 2+ after the waveStarted event is emitted.
