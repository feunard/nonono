# [feat] Chat Bubble System

**Status:** Backlog
**Priority:** Low
**Type:** Feature
**Agent:** -

## Description

Refactor the chat bubble feature into a generic, reusable system. Currently chat bubbles appear randomly on orc kills. Make this a proper system that can be triggered from anywhere with support for random message selection.

## Current State

- Chat bubbles appear randomly when hero kills an orc
- Hardcoded in one place
- Not reusable for other events

## Target State

- Generic `showChatBubble(messages: string[])` function
- Picks random message from array
- Can be triggered from any game event
- Centralized message definitions

## Acceptance Criteria

- [ ] Create `ChatBubbleSystem` or add to existing system
- [ ] `showChatBubble(messages: string[], duration?: number)` API
- [ ] Randomly selects one message from the array
- [ ] Refactor orc kill bubbles to use new system
- [ ] Add game start bubbles (see examples below)
- [ ] Messages configurable (not hardcoded in components)

## Example Messages

```typescript
const CHAT_MESSAGES = {
  gameStart: [
    "Here we go again...",
    "What a beautiful day!",
    "Time to hunt some orcs.",
    "Another day, another battle.",
    "Let's do this!",
  ],
  orcKill: [
    "Got one!",
    "Too easy.",
    "Next!",
    // ... existing messages
  ],
  lowHealth: [
    "That hurt!",
    "I need to be careful...",
    "Close call!",
  ],
  powerPickup: [
    "Nice!",
    "I feel stronger.",
    "This will help.",
  ],
}
```

## Context

- Current implementation: search for chat bubble in codebase
- Hero entity: `src/entities/Hero.ts`
- Could be `src/systems/ChatBubbleSystem.ts`
- Or config: `src/config/ChatMessages.ts`

## Future Use Cases (do not implement now)

- Wave start messages
- Boss encounter
- Achievement unlocks
- Near death experience

## History

_No history yet_
