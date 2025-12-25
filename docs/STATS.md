# Stats System

Complete documentation of all stats, formulas, and mechanics.

## Table of Contents

- [Stat Caps](#stat-caps)
- [Core Stats](#core-stats)
  - [Strength](#strength)
  - [Agility](#agility)
  - [Critical](#critical)
  - [Luck](#luck)
- [Defensive Stats](#defensive-stats)
  - [Health](#health)
  - [Armor](#armor)
  - [Dodge](#dodge)
  - [HP Regen](#hp-regen)
- [Offensive Stats](#offensive-stats)
  - [Piercing](#piercing)
  - [Accuracy](#accuracy)
  - [Damage Multiplier](#damage-multiplier)
  - [Critical Multiplier](#critical-multiplier)
  - [Armor Penetration](#armor-penetration)
- [Movement Stats](#movement-stats)
  - [Move Speed](#move-speed)
- [Bow Stats](#bow-stats)
  - [Bow Range](#bow-range)
  - [Arrow Count](#arrow-count)
  - [Arrow Pierce](#arrow-pierce)
  - [Arrow Bounce](#arrow-bounce)
  - [Arrow Homing](#arrow-homing)
  - [Arrow Explosive](#arrow-explosive)
- [Sword Stats](#sword-stats)
  - [Sword Attack Speed](#sword-attack-speed)
  - [Cleave](#cleave)
  - [Riposte](#riposte)
  - [Execute](#execute)
  - [Vorpal](#vorpal)
- [On-Hit Stats](#on-hit-stats)
  - [Lifesteal](#lifesteal)
- [Combat Flow](#combat-flow)
  - [Attack Resolution](#attack-resolution)
  - [Damage Calculation](#damage-calculation)
- [Enemy Scaling](#enemy-scaling)

---

## Stat Caps

| Stat | Cap | Notes |
|------|-----|-------|
| Strength | 500 | Soft cap via diminishing returns |
| Agility | 500 | Soft cap via diminishing returns |
| Critical | 100 | Hard cap (100% crit chance) |
| Luck | 100 | Hard cap (100% drop chance) |
| Dodge | 100 | Hard cap (100% evasion) |
| Armor | 100 | Hard cap (100% damage reduction) |
| Accuracy | No cap | Reduces target's effective dodge |
| Piercing | No cap | Reduces target's effective armor |

---

## Core Stats

### Strength

**Base Value:** 50
**Purpose:** Increases all damage dealt and grants armor penetration chance

**Damage Formula:**
```
strengthModifier = 1 + ((strength - 1) * 0.495) / 499
finalDamage = baseDamage * strengthModifier
```

**Armor Penetration Formula:**
```
armorPenChance = max(0, (strength - 100) * 0.1%)
```

When armor penetration procs, the attack ignores the target's armor entirely.

**Scaling Examples:**
| Strength | Damage Multiplier | Armor Pen Chance |
|----------|-------------------|------------------|
| 1 | 1.00x | 0% |
| 50 (base) | 1.05x | 0% |
| 100 | 1.10x | 0% |
| 150 | 1.15x | 5% |
| 200 | 1.20x | 10% |
| 300 | 1.30x | 20% |
| 500 (cap) | 1.495x (~50% more) | 40% |

**Affected By:**
- Minor Strength (+5)
- Strength (+10)
- Major Strength (+20)
- Superior Strength (+35)
- Godlike Strength (+50)

---

### Agility

**Base Value:** 50
**Purpose:** Reduces attack intervals (faster attacks) and grants dodge chance

**Attack Speed Formula:**
```
agilityModifier = 1 - ((agility - 50) * 0.995) / 450
attackInterval = baseInterval * agilityModifier / speedMultipliers
```

**Dodge Chance Formula:**
```
agilityDodge = max(0, (agility - 100) * 0.1%)
```

Each point of Agility above 100 grants 0.1% dodge chance. This stacks with base dodge and dodge from powers.

**Attack Speed Scaling:**
| Agility | Interval Multiplier | Bow Interval (base 2000ms) |
|---------|---------------------|----------------------------|
| 1 | 1.11x | 2220ms (slower) |
| 50 (base) | 1.00x | 2000ms |
| 100 | 0.89x | 1780ms |
| 250 | 0.56x | 1120ms |
| 500 (cap) | 0.005x | 10ms (200 attacks/sec) |

**Dodge Chance Scaling:**
| Agility | Dodge Bonus |
|---------|-------------|
| ≤100 | 0% |
| 150 | 5% |
| 200 | 10% |
| 300 | 20% |
| 500 (cap) | 40% |

**Affected By:**
- Minor Agility (+5)
- Agility (+10)
- Major Agility (+20)
- Superior Agility (+35)
- Godlike Agility (+50)

**Note:** Agility affects both bow and sword attack speed, and grants dodge chance above 100 AGI.

---

### Critical

**Base Value:** 10%
**Purpose:** Chance to deal critical damage (2x base, modified by critMultiplier)

**Formula:**
```
isCritical = random(0, 100) < totalCritical
critDamage = baseDamage * critMultiplier  // Default critMultiplier = 2
```

**Cap:** 100 (100% crit chance)

**Affected By:**
- Minor Critical (+3%)
- Critical (+5%)
- Major Critical (+10%)
- Superior Critical (+15%)
- Godlike Critical (+25%)

---

### Luck

**Base Value:** 10
**Purpose:** Affects loot drop chance from enemies

**Formula:**
```
dropChance = max(1%, 10% + luck% - orcLevel * 2%)
```

**Mechanics:**
- Base drop chance: 10%
- Each luck point: +1% drop chance
- Each orc level: -2% drop chance
- Minimum drop chance: 1% (never 0%)

**Scaling Examples:**
| Luck | Orc Level | Drop Chance |
|------|-----------|-------------|
| 10 (base) | 1 | 10% + 10% - 2% = 18% |
| 10 (base) | 5 | 10% + 10% - 10% = 10% |
| 15 | 5 | 10% + 15% - 10% = 15% |
| 20 | 10 | 10% + 20% - 20% = 10% |
| 50 | 20 | 10% + 50% - 40% = 20% |

**Affected By:**
- Minor Luck (+2)
- Luck (+4)
- Major Luck (+7)
- Superior Luck (+12)
- Godlike Luck (+20)

---

## Defensive Stats

### Health

**Base Value:** 100 HP
**Purpose:** Total hit points before death

**Mechanics:**
- When gaining bonus health from powers, current HP increases by the same amount
- Health cannot exceed max health
- Death occurs at 0 HP

**Affected By:**
- Minor Vitality (+10 HP)
- Vitality (+20 HP)
- Major Vitality (+35 HP)
- Superior Vitality (+50 HP)
- Godlike Vitality (+100 HP)

---

### Armor

**Base Value:** 5%
**Purpose:** Percentage damage reduction

**Formula:**
```
effectiveArmor = max(0, armor - attackerPiercing)
finalDamage = floor(baseDamage * (1 - effectiveArmor / 100))
```

**Cap:** 100 (100% damage reduction)

**Example:**
- 50 armor vs 0 piercing = 50% damage reduction
- 50 armor vs 30 piercing = 20% damage reduction
- 50 armor vs 60 piercing = 0% damage reduction

**Affected By:**
- Tough Skin (+3)
- Iron Will (+6)
- Stone Body (+12)
- Adamantine (+20)
- Invincible (+35)

---

### Dodge

**Base Value:** 10%
**Purpose:** Chance to completely avoid incoming damage

**Total Dodge Formula:**
```
totalDodge = baseDodge + bonusDodge + agilityDodge
agilityDodge = max(0, (agility - 100) * 0.1%)
```

**Combat Formula:**
```
effectiveDodge = max(0, totalDodge - attackerAccuracy)
isDodged = random(0, 100) < effectiveDodge
```

**Cap:** 100 (100% evasion)

**Mechanics:**
- Dodge is rolled before armor
- Successful dodge triggers "Miss" text and particle effect
- Riposte can trigger on successful dodge
- Agility above 100 grants bonus dodge (0.1% per point)

**Affected By:**
- Quick Reflexes (+3)
- Nimble (+6)
- Evasive (+10)
- Ghost Step (+15)
- Untouchable (+25)
- Agility (+0.1% per point above 100)

---

### HP Regen

**Base Value:** 0 HP/sec
**Purpose:** Passive health regeneration over time

**Formula:**
```
regenPerFrame = hpRegen * (deltaTime / 1000)
// Accumulated and applied as whole HP
```

**Mechanics:**
- Regeneration is continuous, applied every frame
- Partial HP is accumulated until >= 1
- Cannot exceed max health

**Affected By:**
- Minor Regeneration (+0.2 HP/sec)
- Regeneration (+0.33 HP/sec)
- Fast Healing (+0.5 HP/sec)
- Rapid Recovery (+1.0 HP/sec)
- Immortal Flesh (+2.0 HP/sec)

---

## Offensive Stats

### Piercing

**Base Value:** 0
**Purpose:** Flat reduction to target's effective armor

**Formula:**
```
effectiveArmor = max(0, targetArmor - attackerPiercing)
```

**No Cap:** Can exceed target's armor (extra piercing has no effect)

**Affected By:**
- Sharp Edge (+3)
- Piercing Strikes (+6)
- Armor Breaker (+12)
- Titan Slayer (+20)
- True Damage (+35)

---

### Accuracy

**Base Value:** 0
**Purpose:** Flat reduction to target's effective dodge

**Formula:**
```
effectiveDodge = max(0, targetDodge - attackerAccuracy)
```

**No Cap:** Can exceed target's dodge (extra accuracy has no effect)

**Affected By:**
- Steady Aim (+3)
- Precise Strikes (+6)
- Eagle Eye (+12)
- Unerring Blows (+20)
- Perfect Aim (+35)

---

### Damage Multiplier

**Base Value:** 1.0x (100%)
**Purpose:** Multiplicative bonus to all damage

**Formula:**
```
damageMultiplier = 1 + bonusDamageMultiplier
finalDamage = baseDamage * strengthMod * damageMultiplier
```

**Affected By:**
- Power Surge (+15%)
- Overwhelming Force (+30%)
- Godlike Power (+50%)

**Note:** This stacks multiplicatively with strength modifier and crit multiplier.

---

### Critical Multiplier

**Base Value:** 2.0x (200%)
**Purpose:** Damage multiplier on critical hits

**Formula:**
```
critMultiplier = 2 + bonusCritMultiplier
critDamage = baseDamage * critMultiplier
```

**Affected By:**
- Brutal Strikes (+10% = 2.1x)
- Savage Blows (+25% = 2.25x)
- Devastating Force (+50% = 2.5x)
- Annihilator (+100% = 3x)
- Executioner (+200% = 4x)

---

### Armor Penetration

**Base Value:** 0%
**Purpose:** Chance to completely ignore target's armor

**Formula:**
```
armorPenChance = max(0, (totalStrength - 100) * 0.1%)
```

**Mechanics:**
- Derived from Strength stat (not a separate stat)
- Requires Strength > 100 to have any effect
- When proc'd, attack deals full damage ignoring armor
- Rolled separately for each attack (melee and arrow)
- Does not affect dodge (dodge is rolled first)

**Visual Feedback:**
- "ARMOR PEN!" text appears in cyan when proc'd
- Combat log shows "(ARMOR PEN)" suffix

**Scaling Examples:**
| Strength | Armor Pen Chance |
|----------|------------------|
| ≤100 | 0% |
| 150 | 5% |
| 200 | 10% |
| 300 | 20% |
| 500 (cap) | 40% |

**Note:** Armor penetration is separate from Piercing. Piercing reduces effective armor before the armor pen roll, while armor pen completely bypasses armor when it procs.

---

## Movement Stats

### Move Speed

**Base Value:** 100 pixels/sec
**Purpose:** Hero movement velocity

**Formula:**
```
totalSpeed = baseMoveSpeed + bonusMoveSpeed
// Diagonal movement normalized to prevent faster diagonal speed
```

**Affected By:**
- Minor Speed (+10)
- Speed (+20)
- Major Speed (+35)
- Superior Speed (+50)
- Godlike Speed (+75)

---

## Bow Stats

### Bow Range

**Base Value:** 8 tiles (128 pixels)
**Purpose:** Maximum distance for auto-attack targeting

**Formula:**
```
rangeInPixels = totalBowRange * tileSize  // tileSize = 16
```

**Affected By:**
- Minor Range (+1 tile)
- Range (+2 tiles)
- Major Range (+3 tiles)
- Superior Range (+5 tiles)
- Godlike Range (+8 tiles)

---

### Arrow Count

**Base Value:** 1 arrow
**Purpose:** Number of arrows fired per attack

**Formula:**
```
totalArrows = 1 + bonusArrowCount
spreadAngle = 15 degrees between arrows
```

**Affected By:**
- Double Shot (+1 = 2 total)
- Triple Shot (+2 = 3 total)
- Arrow Storm (+4 = 5 total)

---

### Arrow Pierce

**Base Value:** 0
**Purpose:** Number of enemies an arrow can pass through

**Mechanics:**
- Arrow tracks which enemies it has hit
- Continues through enemies until pierce count exhausted
- Each pierce deals full damage

**Affected By:**
- Piercing Arrows (pierce 1)
- Impaling Arrows (pierce 2)
- Unstoppable Arrows (pierce 99 = unlimited)

---

### Arrow Bounce

**Base Value:** 0
**Purpose:** Number of times an arrow can ricochet to new targets

**Mechanics:**
- After hitting an enemy, arrow redirects to nearest unhit enemy
- Maximum bounce range: 200 pixels
- Each bounce deals full damage

**Affected By:**
- Ricochet (bounce 1)
- Chain Shot (bounce 2)
- Endless Bounty (bounce 4)

---

### Arrow Homing

**Base Value:** 0 (off)
**Purpose:** Arrows track toward targets

**Mechanics:**
- Value determines tracking strength
- 1 = gentle tracking
- 2 = strong tracking

**Affected By:**
- Seeking Arrows (level 1)
- Homing Arrows (level 2)

---

### Arrow Explosive

**Base Value:** 0 pixels (off)
**Purpose:** AoE explosion radius on arrow impact

**Mechanics:**
- Explosion triggers on arrow impact
- Splash damage = 50% of arrow damage
- Primary target takes full damage
- Splash applies lifesteal

**Affected By:**
- Blast Arrows (32 pixel radius)
- Explosive Arrows (48 pixel radius)
- Devastation (64 pixel radius)

---

## Sword Stats

### Sword Attack Speed

**Base Value:** 0% bonus
**Purpose:** Additional sword attack speed

**Formula:**
```
swordInterval = baseInterval * agilityMod / (1 + swordAttackSpeed)
```

**Affected By:**
- Quick Slash (+15%)
- Blade Dance (+30%)
- Whirlwind (+50%)

---

### Cleave

**Base Value:** Off
**Purpose:** Hit all enemies in melee range with each attack

**Mechanics:**
- When enabled, sword attacks hit all enemies within range
- Each enemy receives full damage
- Lifesteal applies to total damage dealt

**Affected By:**
- Cleave (enables)

---

### Riposte

**Base Value:** 0%
**Purpose:** Counter-attack on successful dodge

**Mechanics:**
- Triggers when hero dodges an attack
- Deals base sword damage to attacker
- Lifesteal applies to riposte damage

**Affected By:**
- Riposte (50% chance)
- Retribution (100% chance)

---

### Execute

**Base Value:** 0%
**Purpose:** Instantly kill low-health enemies

**Mechanics:**
- Checked on each melee hit
- Kills enemy if their HP% is below threshold
- Triggers before normal damage calculation

**Affected By:**
- Finishing Blow (10% threshold)
- Execute (20% threshold)
- Decapitate (33% threshold)

---

### Vorpal

**Base Value:** 0%
**Purpose:** Chance to instantly kill any enemy

**Mechanics:**
- Rolled on each melee hit
- Instant kill regardless of enemy HP
- Triggers before normal damage

**Affected By:**
- Vorpal Edge (1% chance)
- Vorpal Blade (3% chance)

---

## On-Hit Stats

### Lifesteal

**Base Value:** 0%
**Purpose:** Heal based on damage dealt

**Formula:**
```
healAmount = floor(damageDealt * lifesteal)
// Heals if >= 1 HP
```

**Mechanics:**
- Applies to bow damage, melee damage, and splash damage
- Only heals if calculated amount >= 1
- Cannot exceed max health

**Affected By:**
- Vampiric Touch (3%)
- Life Drain (6%)
- Siphon (10%)
- Leech Lord (15%)

---

## Combat Flow

### Attack Resolution

1. **Dodge Check**
   - Calculate effective dodge: `targetDodge - attackerAccuracy`
   - Roll random 0-100 against effective dodge
   - If dodged: attack misses, check riposte

2. **Special Effects** (Melee only)
   - Vorpal: Roll for instant kill
   - Execute: Check if target below HP threshold

3. **Damage Calculation**
   - Apply strength modifier
   - Apply damage multiplier
   - Roll for critical, apply crit multiplier

4. **Armor Resolution**
   - Roll for armor penetration (if strength > 100)
   - If armor pen procs: effective armor = 0
   - Otherwise: effective armor = `targetArmor - attackerPiercing`
   - Apply armor reduction: `damage * (1 - effectiveArmor / 100)`

5. **Post-Damage**
   - Apply lifesteal
   - Trigger knockback (enemies only)
   - Check for death

### Damage Calculation

```
// Full damage formula
baseDamage = weaponDamage
baseDamage *= strengthModifier           // 1.0 to 1.495
baseDamage *= damageMultiplier           // 1.0 + bonus
if (isCritical) baseDamage *= critMultiplier

// Armor resolution
armorPenChance = max(0, (strength - 100) * 0.001)
if (random() < armorPenChance)
    effectiveArmor = 0                    // Armor penetration proc!
else
    effectiveArmor = max(0, targetArmor - attackerPiercing)

finalDamage = floor(baseDamage * (1 - effectiveArmor / 100))
```

---

## Enemy Scaling

### Orc Level System

Orcs have a **level** equal to the current wave number. Higher level orcs are stronger but have reduced drop chance.

#### Level Scaling (Multiplicative)

| Stat | Base | Per Level | Formula |
|------|------|-----------|---------|
| HP | 50 | +10% | `50 * (1 + (level - 1) * 0.1)` |
| Damage | 10 | +10% | `10 * (1 + (level - 1) * 0.1)` |
| Speed | 80 | +10% | `(80 + additive) * (1 + (level - 1) * 0.1)` |

**Level Examples:**
| Level | HP | Damage | Speed Multiplier |
|-------|-----|--------|------------------|
| 1 | 50 | 10 | 1.0x |
| 2 | 55 | 11 | 1.1x |
| 5 | 70 | 14 | 1.4x |
| 10 | 95 | 19 | 1.9x |

#### Additive Per-Wave Bonuses

These bonuses are added per wave, separate from level multipliers:

| Stat | Base | Per Wave | Cap | Formula |
|------|------|----------|-----|---------|
| Speed | 80 | +5 | None | `80 + (wave - 1) * 5` |
| Armor | 0 | +2 | 100 | `min(100, (wave - 1) * 2)` |
| Dodge | 0 | +1 | 100 | `min(100, (wave - 1) * 1)` |

#### Drop Chance Reduction

Higher level orcs have reduced drop chance:

```
dropChance = max(1, 10 + luck - orcLevel * 2)
```

| Orc Level | With 10 Luck | With 20 Luck |
|-----------|--------------|--------------|
| 1 | 18% | 28% |
| 5 | 10% | 20% |
| 10 | 1% (min) | 10% |
| 20 | 1% (min) | 1% (min) |

**Minimum:** 1% drop chance (never goes below)

#### Example: Wave 10 Orc

- **Level:** 10
- **HP:** 50 × 1.9 = 95
- **Damage:** 10 × 1.9 = 19
- **Speed:** (80 + 45) × 1.9 = 237.5 → 237
- **Armor:** min(100, 18) = 18%
- **Dodge:** min(100, 9) = 9%
- **Drop Chance:** max(1, 10 + 10 - 20) = 1% (with base 10 luck)

#### Combat Log

Orc level is shown in combat messages:
- `You hit Orc L5 for 45.`
- `You crit Orc L5 for 90!`
- `Orc L5 dies.`

This scaling makes **piercing** and **accuracy** increasingly valuable in later waves, while **luck** becomes important to maintain drop rates against higher level orcs.
