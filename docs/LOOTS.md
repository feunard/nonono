# Loot System

Loot bags are collectible items dropped by defeated enemies. Each bag contains a random power that can be selected to permanently enhance the hero.

## Table of Contents

- [Bag Overview](#bag-overview)
- [Drop Mechanics](#drop-mechanics)
- [Bag Inventory](#bag-inventory)
- [Opening Bags](#opening-bags)
- [Power Selection](#power-selection)
- [Configuration](#configuration)
- [Technical Details](#technical-details)

---

## Bag Overview

When enemies die, they have a chance to drop a **loot bag**. Bags appear on the battlefield as floating sprites that the hero can walk over to collect.

### Key Features

- **Non-blocking pickup**: Collecting a bag adds it to inventory without pausing gameplay
- **Inventory system**: Hero stores bags and opens them when ready
- **Player choice**: Opening a bag presents 3 random powers to choose from
- **Cancel option**: Player can discard a bag without selecting a power

---

## Drop Mechanics

### Drop Chance

Loot drop chance is determined by the hero's **Luck** stat:

```
Drop Chance = Base Luck + Bonus Luck (from powers)
```

| Source | Value |
|--------|-------|
| Base Luck | 20% |
| Luck Power (per stack) | +5% |

### Drop Limits

To prevent battlefield clutter, loot drops are capped:

| Limit | Value | Config Key |
|-------|-------|------------|
| Max bags on field | 32 | `GAME_CONFIG.loot.maxBagsOnField` |

When the battlefield has 32 bags, no new bags will drop until some are collected.

---

## Bag Inventory

The hero has a limited inventory for carrying bags:

| Limit | Value | Config Key |
|-------|-------|------------|
| Max bags in inventory | 9 | `GAME_CONFIG.loot.maxBagsInventory` |

### Inventory Behavior

- **Full inventory**: If hero has 9 bags, walking over additional bags will NOT pick them up
- **Bags remain**: Uncollected bags stay on the battlefield until picked up
- **Visual indicator**: The BagCard UI shows current bag count (top-right HUD)

---

## Opening Bags

### Controls

| Action | Input |
|--------|-------|
| Open bag | Press **E** or click BagCard |

### Requirements

- Must have at least 1 bag in inventory
- Cannot open during: Game Over, existing power selection, or debug overlay

### Behavior

- Opening a bag shows the power selection UI
- **Game continues running** - enemies still move and attack
- Only one bag can be opened at a time

---

## Power Selection

When a bag is opened, 3 random powers are presented.

### Selection Options

| Action | Input | Result |
|--------|-------|--------|
| Select Power 1 | Press **1** or click card | Apply power, consume bag |
| Select Power 2 | Press **2** or click card | Apply power, consume bag |
| Select Power 3 | Press **3** or click card | Apply power, consume bag |
| Cancel | Press **Escape** or click Cancel | Discard bag, no power gained |

### Power Generation

Powers are selected using weighted randomness based on rarity:

| Rank | Weight | Approx. Chance |
|------|--------|----------------|
| Common | 50 | 50% |
| Uncommon | 30 | 30% |
| Rare | 15 | 15% |
| Epic | 4 | 4% |
| Legendary | 1 | 1% |

Powers that have reached their max stack limit will not appear in selection.

---

## Configuration

All loot-related values are configurable in `src/config/GameConfig.ts`:

```typescript
loot: {
  hitboxSize: 32,        // Pickup collision area (pixels)
  maxBagsInventory: 9,   // Max bags hero can carry
  maxBagsOnField: 32,    // Max bags on battlefield
}
```

### Related Config

```typescript
hero: {
  luck: 20,              // Base loot drop chance (%)
}
```

---

## Technical Details

### File Locations

| Component | File |
|-----------|------|
| Loot entity | `src/entities/Loot.ts` |
| Drop logic | `src/scenes/GameScene.ts` (`trySpawnLoot`) |
| Pickup logic | `src/scenes/GameScene.ts` (`onLootPickup`) |
| Inventory state | `src/stores/gameStore.ts` (`bagCount`) |
| Bag UI | `src/ui/BagCard.tsx` |
| Selection UI | `src/ui/LootSelectionOverlay.tsx` |
| Power config | `src/config/PowersConfig.ts` |

### State Management

```typescript
// gameStore state
bagCount: number        // Current bags in inventory

// gameStore actions
addBag()                // Increment bag count
consumeBag()            // Decrement bag count (min 0)
showLootSelection()     // Open power selection UI
hideLootSelection()     // Close power selection UI
```

### Flow Diagram

```
Enemy Dies
    |
    v
trySpawnLoot(x, y)
    |
    +-- Check: bags on field < 32? --NO--> Stop
    |
    +-- Check: random < luck%? --NO--> Stop
    |
    v
Spawn Loot at (x, y)
    |
    v
Hero walks over loot
    |
    v
onLootPickup()
    |
    +-- Check: bagCount < 9? --NO--> Stop (bag stays)
    |
    v
Destroy loot sprite
Add to inventory (bagCount++)
    |
    v
Player presses E / clicks BagCard
    |
    v
Generate 3 random powers
Show LootSelectionOverlay
    |
    +-- Player selects power --> Apply power, bagCount--
    |
    +-- Player cancels --------> bagCount-- (no power)
    |
    v
Close overlay
Game continues
```
