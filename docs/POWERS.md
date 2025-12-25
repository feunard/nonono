# Powers System

Powers are collectible upgrades that enhance the hero's combat abilities. They drop from defeated enemies and provide permanent stat bonuses for the current run.

## Table of Contents

- [Rarity System](#rarity-system)
- [Max Stack System](#max-stack-system)
- [Prerequisites System](#prerequisites-system)
- [Core Stats](#core-stats)
- [Offensive Powers](#offensive-powers)
- [Defensive Powers](#defensive-powers)
- [Arrow Powers](#arrow-powers)
- [Sword Powers](#sword-powers)
- [On-Hit Powers](#on-hit-powers)
- [Mechanics Reference](#mechanics-reference)

---

## Rarity System

Powers come in five rarity tiers, each with different drop weights and visual indicators.

| Rank | Weight | Drop Chance | Color |
|------|--------|-------------|-------|
| Common | 50 | 50% | Gray |
| Uncommon | 30 | 30% | Green |
| Rare | 15 | 15% | Blue |
| Epic | 4 | 4% | Purple |
| Legendary | 1 | 1% | Amber/Gold |

Higher rarity powers provide stronger effects but are much harder to obtain.

---

## Max Stack System

Each power has a **maximum stack limit** that determines how many times it can be collected. Once a power reaches its max stack, it will no longer appear in power selection.

### Stack Limits by Category

| Category | Max Stack | Reasoning |
|----------|-----------|-----------|
| **Core Stats** (Str, Agi, HP, Luck) | 5 | Stat caps naturally limit effectiveness |
| **Critical Chance** | 4 | Caps at 100% |
| **Move Speed** | 4 | Diminishing returns |
| **Bow Range** | 3 | Map size limits usefulness |
| **Crit Damage Multiplier** | 3 | Very powerful scaling |
| **Piercing/Accuracy** | 4 | Counters enemy scaling |
| **Damage Multiplier** | 2 | Extremely powerful |
| **Armor/Dodge** | 4 | Caps at 100% |
| **HP Regen** | 3 | Sufficient sustain |
| **Arrow Powers** (Multi, Pierce, Bounce, Homing, Explosive) | 1 | Already powerful, different tiers provide upgrades |
| **Lifesteal** | 2 | Strong with high DPS |
| **Sword Attack Speed** | 2 | Stacks with Agility |
| **Toggle Powers** (Cleave, Riposte, Execute, Vorpal) | 1 | Binary effects or hard caps |

### Key Behaviors

- **Each power tracks separately:** "Double Shot" and "Triple Shot" each have their own max stack
- **Collecting different tiers:** You can get Double Shot (x1) AND Triple Shot (x1) for combined effect
- **When maxed:** Power won't appear in random selections, freeing up slots for other powers
- **Build diversity:** Encourages trying different power combinations instead of stacking one type

---

## Prerequisites System

Some powerful abilities require certain conditions to be met before they can be selected. Prerequisites add strategic depth to deck building by creating progression paths.

### Prerequisite Types

| Type | Description | Example |
|------|-------------|---------|
| **Stat Requirement** | Minimum bonus stat value from powers | "Requires 50+ Strength" |
| **Power Requirement** | Must own a specific power | "Requires Double Shot" |
| **Combined** | Both stat and power requirements | "Requires 20+ Strength and Finishing Blow" |

### UI Indication

- **Locked powers** appear greyed out with a lock icon
- **Tooltip** shows exactly what's missing (stat name, required value, current value)
- **Power names** are shown for required power prerequisites

### Powers with Prerequisites

| Power | Rarity | Prerequisite |
|-------|--------|--------------|
| **Godlike Strength** | Legendary | 50+ Strength |
| **Godlike Agility** | Legendary | 50+ Agility |
| **Godlike Critical** | Legendary | 25+ Critical |
| **Executioner** | Legendary | 20+ Critical |
| **Arrow Storm** | Legendary | Requires "Double Shot" |
| **Riposte** | Rare | 10+ Dodge |
| **Retribution** | Epic | Requires "Riposte" |
| **Finishing Blow** | Rare | 20+ Strength |
| **Execute** | Epic | Requires "Finishing Blow" |
| **Decapitate** | Legendary | Requires "Execute" |
| **Vorpal Edge** | Epic | 15+ Critical |
| **Vorpal Blade** | Legendary | Requires "Vorpal Edge" |

### Build Implications

- **Power chains:** Some abilities form progression chains (Finishing Blow → Execute → Decapitate)
- **Stat investment:** Higher-tier powers reward investing in related stats
- **Planning ahead:** Consider prerequisites when choosing early powers

---

## Core Stats

Base attribute powers that directly modify the hero's fundamental statistics.

### Strength

Increases damage output. Scales from 1x damage at 1 strength to ~1.5x damage at 500 strength (cap).

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Strength | Common | +5 Strength | Small damage increase |
| Strength | Uncommon | +10 Strength | Moderate damage increase |
| Major Strength | Rare | +20 Strength | Significant damage increase |
| Superior Strength | Epic | +35 Strength | Large damage increase |
| Godlike Strength | Legendary | +50 Strength | Massive damage increase |

### Agility

Increases attack speed. Base agility (50) = normal speed. Max agility (500) = 200x faster attacks.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Agility | Common | +5 Agility | Slightly faster attacks |
| Agility | Uncommon | +10 Agility | Faster attacks |
| Major Agility | Rare | +20 Agility | Much faster attacks |
| Superior Agility | Epic | +35 Agility | Very fast attacks |
| Godlike Agility | Legendary | +50 Agility | Extremely fast attacks |

### Critical Chance

Percentage chance for attacks to deal critical damage (base 2x multiplier).

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Critical | Common | +3% Crit | Small crit chance increase |
| Critical | Uncommon | +5% Crit | Moderate crit chance |
| Major Critical | Rare | +10% Crit | Good crit chance |
| Superior Critical | Epic | +15% Crit | High crit chance |
| Godlike Critical | Legendary | +25% Crit | Very high crit chance |

### Luck

Affects loot drop rates and quality. Higher luck = better power drops.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Luck | Common | +2% Luck | Slightly better drops |
| Luck | Uncommon | +4% Luck | Better drops |
| Major Luck | Rare | +7% Luck | Much better drops |
| Superior Luck | Epic | +12% Luck | Great drops |
| Godlike Luck | Legendary | +20% Luck | Excellent drops |

### Health (Vitality)

Increases maximum health pool.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Vitality | Common | +10 HP | Small health increase |
| Vitality | Uncommon | +20 HP | Moderate health increase |
| Major Vitality | Rare | +35 HP | Significant health increase |
| Superior Vitality | Epic | +50 HP | Large health increase |
| Godlike Vitality | Legendary | +100 HP | Massive health increase |

### Move Speed

Increases hero movement speed (base: 150).

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Speed | Common | +10 Speed | Slightly faster movement |
| Speed | Uncommon | +20 Speed | Faster movement |
| Major Speed | Rare | +35 Speed | Much faster movement |
| Superior Speed | Epic | +50 Speed | Very fast movement |
| Godlike Speed | Legendary | +75 Speed | Extremely fast movement |

### Bow Range

Increases arrow attack range (measured in tiles, base: 10).

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Range | Common | +1 Range | Slightly longer range |
| Range | Uncommon | +2 Range | Longer range |
| Major Range | Rare | +3 Range | Much longer range |
| Superior Range | Epic | +5 Range | Very long range |
| Godlike Range | Legendary | +8 Range | Extreme range |

---

## Offensive Powers

Powers focused on dealing more damage to enemies.

### Critical Damage Multiplier

Increases the damage multiplier when landing critical hits (base: 2x).

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Brutal Strikes | Common | +10% crit damage | Crits deal 2.1x damage |
| Savage Blows | Uncommon | +25% crit damage | Crits deal 2.25x damage |
| Devastating Force | Rare | +50% crit damage | Crits deal 2.5x damage |
| Annihilator | Epic | +100% crit damage | Crits deal 3x damage |
| Executioner | Legendary | +200% crit damage | Crits deal 4x damage |

*Note: Critical damage bonuses stack additively. Multiple powers add to the base 2x multiplier.*

### Piercing

Reduces target's effective armor before damage calculation.

**Formula:** `effectiveArmor = max(0, targetArmor - yourPiercing)`

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Sharp Edge | Common | +3 Piercing | Ignores 3% armor |
| Piercing Strikes | Uncommon | +6 Piercing | Ignores 6% armor |
| Armor Breaker | Rare | +12 Piercing | Ignores 12% armor |
| Titan Slayer | Epic | +20 Piercing | Ignores 20% armor |
| True Damage | Legendary | +35 Piercing | Ignores 35% armor |

*Note: Late-game orcs can have up to 50% armor (2% per wave). Piercing is essential for dealing full damage.*

### Accuracy

Reduces target's effective dodge chance before the dodge roll.

**Formula:** `effectiveDodge = max(0, targetDodge - yourAccuracy)`

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Steady Aim | Common | +3 Accuracy | Target has 3% less dodge |
| Precise Strikes | Uncommon | +6 Accuracy | Target has 6% less dodge |
| Eagle Eye | Rare | +12 Accuracy | Target has 12% less dodge |
| Unerring Blows | Epic | +20 Accuracy | Target has 20% less dodge |
| Perfect Aim | Legendary | +35 Accuracy | Target has 35% less dodge |

*Note: Orcs gain 1% dodge per wave. Accuracy ensures your attacks land.*

### Damage Multiplier

Flat percentage increase to all damage dealt.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Power Surge | Rare | +15% all damage | 1.15x damage multiplier |
| Overwhelming Force | Epic | +30% all damage | 1.30x damage multiplier |
| Godlike Power | Legendary | +50% all damage | 1.50x damage multiplier |

*Note: Stacks additively with other damage multipliers.*

---

## Defensive Powers

Powers that help the hero survive longer.

### Armor

Percentage-based damage reduction. Each point of armor reduces incoming damage by 1%.

**Formula:** `finalDamage = floor(baseDamage * (1 - effectiveArmor / 100))`

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Tough Skin | Common | +3 Armor | Take 3% less damage |
| Iron Will | Uncommon | +6 Armor | Take 6% less damage |
| Stone Body | Rare | +12 Armor | Take 12% less damage |
| Adamantine | Epic | +20 Armor | Take 20% less damage |
| Invincible | Legendary | +35 Armor | Take 35% less damage |

*Note: Armor is capped at 100%. Base hero armor is 5%.*

### Dodge

Percentage chance to completely avoid an incoming attack. When dodged, "Miss" text appears and no damage is taken.

**Formula:** `effectiveDodge = max(0, min(100, yourDodge - attackerAccuracy))`

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Quick Reflexes | Common | +3 Dodge | 3% chance to avoid attacks |
| Nimble | Uncommon | +6 Dodge | 6% chance to avoid attacks |
| Evasive | Rare | +10 Dodge | 10% chance to avoid attacks |
| Ghost Step | Epic | +15 Dodge | 15% chance to avoid attacks |
| Untouchable | Legendary | +25 Dodge | 25% chance to avoid attacks |

*Note: Dodge is capped at 100%. Base hero dodge is 10%. Synergizes with Riposte.*

### HP Regeneration

Passive health regeneration per second.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Minor Regeneration | Common | +0.2 HP/sec | 1 HP every 5 seconds |
| Regeneration | Uncommon | +0.33 HP/sec | 1 HP every 3 seconds |
| Fast Healing | Rare | +0.5 HP/sec | 1 HP every 2 seconds |
| Rapid Recovery | Epic | +1.0 HP/sec | 1 HP per second |
| Immortal Flesh | Legendary | +2.0 HP/sec | 2 HP per second |

*Note: Stacks additively. Great for sustain in long fights.*

---

## Arrow Powers

Powers that modify bow attack behavior.

### Multi-Shot (Arrow Count)

Fire multiple arrows per attack in a spread pattern (15 degrees between arrows).

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Double Shot | Rare | 2 arrows | Fire 2 arrows in a spread |
| Triple Shot | Epic | 3 arrows | Fire 3 arrows in a spread |
| Arrow Storm | Legendary | 5 arrows | Fire 5 arrows in a spread |

*Note: Each arrow deals full damage. Effectively multiplies DPS against groups.*

### Arrow Pierce

Arrows pass through enemies, hitting multiple targets in a line.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Piercing Arrows | Uncommon | Pierce 1 enemy | Hit 2 enemies per arrow |
| Impaling Arrows | Rare | Pierce 2 enemies | Hit 3 enemies per arrow |
| Unstoppable Arrows | Legendary | Pierce all | Infinite piercing |

*Note: Combines multiplicatively with Multi-Shot for massive group damage.*

### Ricochet (Arrow Bounce)

Arrows bounce to nearby enemies after hitting a target.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Ricochet | Rare | 1 bounce | Bounces to 1 nearby enemy |
| Chain Shot | Epic | 2 bounces | Bounces to 2 nearby enemies |
| Endless Bounty | Legendary | 4 bounces | Bounces to 4 nearby enemies |

*Note: Bounces seek the nearest enemy within 200 pixels.*

### Homing Arrows

Arrows track toward the nearest enemy, curving mid-flight.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Seeking Arrows | Rare | Gentle tracking | Arrows curve slightly toward targets |
| Homing Arrows | Epic | Strong tracking | Arrows curve strongly toward targets |

*Note: Helps ensure arrows hit mobile targets.*

### Explosive Arrows

Arrows explode on impact, dealing AoE damage.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Blast Arrows | Rare | 32px radius | Small explosion |
| Explosive Arrows | Epic | 48px radius | Medium explosion |
| Devastation | Legendary | 64px radius | Large explosion |

*Note: Explosion damage applies to all enemies in radius.*

---

## Sword Powers

Powers that modify melee attack behavior.

### Cleave

Sword attacks hit all enemies within melee range instead of just one.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Cleave | Rare | AoE melee | Hit all nearby enemies |

*Note: Essential for melee builds against hordes.*

### Blade Dance (Sword Attack Speed)

Increases sword attack speed specifically (does not affect bow).

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Quick Slash | Uncommon | +15% sword speed | Faster melee attacks |
| Blade Dance | Rare | +30% sword speed | Much faster melee attacks |
| Whirlwind | Epic | +50% sword speed | Very fast melee attacks |

*Note: Stacks with Agility. Melee-focused build enabler.*

### Riposte

When dodging an attack, automatically counter-attack the attacker.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Riposte | Rare | 50% counter chance | Half of dodges trigger counter |
| Retribution | Epic | 100% counter chance | Always counter on dodge |

*Note: Synergizes heavily with Dodge powers. Counter deals full sword damage.*

### Execute

Instantly kill enemies below a health threshold.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Finishing Blow | Rare | Execute < 10% HP | Instant kill at low health |
| Execute | Epic | Execute < 20% HP | Instant kill at moderate health |
| Decapitate | Legendary | Execute < 33% HP | Instant kill at high health |

*Note: Works on all attacks. Extremely powerful against high-HP enemies.*

### Vorpal Blade

Chance to instantly kill any enemy on hit, regardless of health.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Vorpal Edge | Epic | 1% instant kill | Rare instant kills |
| Vorpal Blade | Legendary | 3% instant kill | More frequent instant kills |

*Note: Low chance but devastating effect. Procs on every attack.*

---

## On-Hit Powers

Powers that trigger effects when dealing damage.

### Lifesteal

Heal for a percentage of damage dealt.

| Power | Rarity | Effect | Description |
|-------|--------|--------|-------------|
| Vampiric Touch | Uncommon | 3% lifesteal | Heal 3% of damage dealt |
| Life Drain | Rare | 6% lifesteal | Heal 6% of damage dealt |
| Siphon | Epic | 10% lifesteal | Heal 10% of damage dealt |
| Leech Lord | Legendary | 15% lifesteal | Heal 15% of damage dealt |

*Note: Works on all damage sources. Synergizes with high DPS builds.*

---

## Mechanics Reference

### Combat Flow

When an attack is made, the following order is applied:

1. **Accuracy vs Dodge:** `effectiveDodge = targetDodge - attackerAccuracy`
2. **Dodge Roll:** If `random(0-100) < effectiveDodge`, attack misses (show "Miss")
3. **Piercing vs Armor:** `effectiveArmor = targetArmor - attackerPiercing`
4. **Damage Calculation:** `finalDamage = floor(baseDamage * (1 - effectiveArmor/100))`
5. **On-Hit Effects:** Lifesteal, Execute check, Vorpal check, etc.

### Stat Caps

| Stat | Cap | Notes |
|------|-----|-------|
| Strength | 500 | ~1.5x damage at cap |
| Agility | 500 | ~200x attack speed at cap |
| Critical | 100% | Can reach 100% crit chance |
| Dodge | 100% | Capped at guaranteed dodge |
| Armor | 100% | Capped at full damage reduction |

### Wave Scaling (Orcs)

Orcs gain stats each wave:
- **Dodge:** +1% per wave (e.g., Wave 10 = 9% dodge)
- **Armor:** +2% per wave (e.g., Wave 10 = 18% armor)

This makes Accuracy and Piercing increasingly valuable in late game.

### Power Stacking

- **Same powers stack:** Getting "Minor Strength" twice gives +10 total
- **Different tiers stack:** "Minor Strength" + "Major Strength" = +25 total
- **Multiplicative effects:** Multi-Shot × Pierce × Bounce = exponential damage potential

### Recommended Builds

**Glass Cannon:** Agility + Critical + Crit Damage + Damage Multiplier
- Maximize DPS, rely on killing before taking damage

**Tank:** Health + Armor + Dodge + HP Regen
- Survive everything, slow but steady kills

**Arrow Master:** Multi-Shot + Pierce + Bounce + Explosive
- Clear entire screens with single attacks

**Melee Berserker:** Cleave + Blade Dance + Lifesteal + Riposte
- Get in close, survive through lifesteal and counters

**Assassin:** Critical + Vorpal + Execute + Accuracy
- Instant kill everything with guaranteed hits
