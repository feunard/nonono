# [feat] Add Wave Start Chat Bubble Messages

**Status:** Backlog
**Priority:** Low
**Type:** Feature

## Description
Add hero chat bubble messages that trigger at the beginning of each wave (starting from wave 2). Messages should be role-play themed while announcing the upcoming wave. This enhances game immersion by making the hero react to new waves of enemies.

## Acceptance Criteria

### Chat Messages Configuration
- [ ] `src/config/ChatMessages.ts` has new `waveStart` category in `CHAT_MESSAGES` object
- [ ] `waveStart` contains 4-5 thematic messages (e.g., "Wave 2... bring it on!", "More orcs? Wave 3, let's go!")
- [ ] Messages follow existing RP tone (confident, heroic, slightly sarcastic)
- [ ] `ChatMessageCategory` type automatically includes `waveStart` via existing `keyof typeof` pattern

### Wave Manager Integration
- [ ] `src/systems/WaveManager.ts` triggers hero chat bubble when a new wave starts
- [ ] Chat bubble only triggers for wave 2 and beyond (wave 1 is covered by `gameStart` messages)
- [ ] Chat bubble triggers AFTER wave transition (when `startNextWave()` runs)
- [ ] Uses `getRandomMessage('waveStart')` pattern consistent with other triggers

### Implementation Details
- [ ] WaveManager needs access to Hero instance to call `showChatBubble()`
- [ ] WaveManager already has `hero` reference in constructor (line 18)
- [ ] Chat bubble call placed after `this.scene.events.emit("waveStarted", this.currentWave)` (line 63)

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
