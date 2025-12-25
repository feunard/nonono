// Power ranks from least to most rare
export type PowerRank = "common" | "uncommon" | "rare" | "epic" | "legendary";

// Stat types that can be modified by powers
export type BonusStat =
	| "strength"
	| "agility"
	| "critical"
	| "luck"
	| "health"
	| "moveSpeed"
	| "bowRange"
	// Offensive powers
	| "critMultiplier"
	| "piercing"
	| "accuracy"
	| "damageMultiplier"
	// Defensive powers
	| "dodge"
	| "armor"
	| "hpRegen"
	// Arrow powers
	| "arrowCount" // Extra arrows fired per shot
	| "arrowPierce" // Number of enemies arrows can pierce through
	| "arrowBounce" // Number of times arrows can bounce to new targets
	// On-Hit powers
	| "lifesteal" // % of damage dealt healed (0.05 = 5%)
	// Sword powers
	| "swordCleave" // Hit all enemies in melee range (0 = off, 1+ = on)
	| "swordAttackSpeed" // % bonus sword attack speed (0.1 = +10%)
	| "riposteChance" // % chance to counter attack when dodging (0.5 = 50%)
	| "executeThreshold" // Kill enemies below this % HP (0.1 = 10%)
	| "vorpalChance" // % chance to instant kill on hit (0.01 = 1%)
	// Advanced arrow powers
	| "arrowHoming" // Arrows track targets (0 = off, 1+ = on)
	| "arrowExplosive"; // Explosion radius in pixels (0 = off, 32 = small, etc.)

// Icon names for each stat type (maps to lucide-react icons)
export const STAT_ICON_NAMES: Record<BonusStat, string> = {
	strength: "Sword",
	agility: "Zap",
	critical: "Sparkles",
	luck: "Clover",
	health: "Heart",
	moveSpeed: "Footprints",
	bowRange: "Target",
	// Offensive powers
	critMultiplier: "Flame",
	piercing: "Shield",
	accuracy: "Crosshair",
	damageMultiplier: "Swords",
	// Defensive powers
	dodge: "Wind",
	armor: "ShieldHalf",
	hpRegen: "HeartPulse",
	// Arrow powers
	arrowCount: "CopyPlus",
	arrowPierce: "Crosshair",
	arrowBounce: "IterationCcw",
	// On-Hit powers
	lifesteal: "Droplets",
	// Sword powers
	swordCleave: "Axe",
	swordAttackSpeed: "Timer",
	riposteChance: "ShieldAlert",
	executeThreshold: "Skull",
	vorpalChance: "Slice",
	// Advanced arrow powers
	arrowHoming: "Navigation",
	arrowExplosive: "Bomb",
};

export type PowerEffect = {
	stat: BonusStat;
	value: number;
};

// Stat requirement for prerequisites
export type StatRequirement = {
	stat: BonusStat;
	minValue: number;
};

// Prerequisites for unlocking a power
export type Prerequisites = {
	stats?: StatRequirement[]; // Minimum stat values required
	powers?: string[]; // Power IDs that must be owned
};

export type Power = {
	id: string;
	name: string;
	description: string;
	rank: PowerRank;
	effect: PowerEffect;
	maxStack: number; // Maximum times this specific power can be collected
	prerequisites?: Prerequisites; // Optional requirements to unlock this power
};

// Rank weights for random selection (higher = more common)
export const RANK_WEIGHTS: Record<PowerRank, number> = {
	common: 50,
	uncommon: 30,
	rare: 15,
	epic: 4,
	legendary: 1,
};

// Canonical hex colors for each rank (single source of truth)
export const RANK_HEX_COLORS: Record<PowerRank, string> = {
	common: "#a3a3a3", // neutral-400
	uncommon: "#22c55e", // green-500
	rare: "#3b82f6", // blue-500
	epic: "#a855f7", // purple-500
	legendary: "#fbbf24", // amber-400
};

// Rank display colors (for UI text)
export const RANK_COLORS: Record<PowerRank, string> = {
	common: "text-neutral-400",
	uncommon: "text-green-500",
	rare: "text-blue-500",
	epic: "text-purple-500",
	legendary: "text-amber-400",
};

// Rank border colors (for cards)
export const RANK_BORDER_COLORS: Record<PowerRank, string> = {
	common: "border-neutral-500",
	uncommon: "border-green-500",
	rare: "border-blue-500",
	epic: "border-purple-500",
	legendary: "border-amber-400",
};

// Rank ring colors (for power orbs)
export const RANK_RING_COLORS: Record<PowerRank, string> = {
	common: "ring-neutral-500",
	uncommon: "ring-green-500",
	rare: "ring-blue-500",
	epic: "ring-purple-500",
	legendary: "ring-amber-400",
};

// All available powers
export const POWERS: Power[] = [
	// Strength powers (max 5 stacks each - stat cap will naturally limit)
	{
		id: "strength-1",
		name: "Minor Strength",
		description: "+5 Strength",
		rank: "common",
		effect: { stat: "strength", value: 5 },
		maxStack: 5,
	},
	{
		id: "strength-2",
		name: "Strength",
		description: "+10 Strength",
		rank: "uncommon",
		effect: { stat: "strength", value: 10 },
		maxStack: 5,
	},
	{
		id: "strength-3",
		name: "Major Strength",
		description: "+20 Strength",
		rank: "rare",
		effect: { stat: "strength", value: 20 },
		maxStack: 5,
	},
	{
		id: "strength-4",
		name: "Superior Strength",
		description: "+35 Strength",
		rank: "epic",
		effect: { stat: "strength", value: 35 },
		maxStack: 5,
	},
	{
		id: "strength-5",
		name: "Godlike Strength",
		description: "+50 Strength",
		rank: "legendary",
		effect: { stat: "strength", value: 50 },
		maxStack: 5,
		prerequisites: { stats: [{ stat: "strength", minValue: 50 }] },
	},

	// Agility powers (max 5 stacks each - stat cap will naturally limit)
	{
		id: "agility-1",
		name: "Minor Agility",
		description: "+5 Agility",
		rank: "common",
		effect: { stat: "agility", value: 5 },
		maxStack: 5,
	},
	{
		id: "agility-2",
		name: "Agility",
		description: "+10 Agility",
		rank: "uncommon",
		effect: { stat: "agility", value: 10 },
		maxStack: 5,
	},
	{
		id: "agility-3",
		name: "Major Agility",
		description: "+20 Agility",
		rank: "rare",
		effect: { stat: "agility", value: 20 },
		maxStack: 5,
	},
	{
		id: "agility-4",
		name: "Superior Agility",
		description: "+35 Agility",
		rank: "epic",
		effect: { stat: "agility", value: 35 },
		maxStack: 5,
	},
	{
		id: "agility-5",
		name: "Godlike Agility",
		description: "+50 Agility",
		rank: "legendary",
		effect: { stat: "agility", value: 50 },
		maxStack: 5,
		prerequisites: { stats: [{ stat: "agility", minValue: 50 }] },
	},

	// Critical powers (max 4 stacks - caps at 100%)
	{
		id: "critical-1",
		name: "Minor Critical",
		description: "+3% Critical",
		rank: "common",
		effect: { stat: "critical", value: 3 },
		maxStack: 4,
	},
	{
		id: "critical-2",
		name: "Critical",
		description: "+5% Critical",
		rank: "uncommon",
		effect: { stat: "critical", value: 5 },
		maxStack: 4,
	},
	{
		id: "critical-3",
		name: "Major Critical",
		description: "+10% Critical",
		rank: "rare",
		effect: { stat: "critical", value: 10 },
		maxStack: 4,
	},
	{
		id: "critical-4",
		name: "Superior Critical",
		description: "+15% Critical",
		rank: "epic",
		effect: { stat: "critical", value: 15 },
		maxStack: 4,
	},
	{
		id: "critical-5",
		name: "Godlike Critical",
		description: "+25% Critical",
		rank: "legendary",
		effect: { stat: "critical", value: 25 },
		maxStack: 4,
		prerequisites: { stats: [{ stat: "critical", minValue: 25 }] },
	},

	// Luck powers (max 5 stacks each)
	{
		id: "luck-1",
		name: "Minor Luck",
		description: "+2% Luck",
		rank: "common",
		effect: { stat: "luck", value: 2 },
		maxStack: 5,
	},
	{
		id: "luck-2",
		name: "Luck",
		description: "+4% Luck",
		rank: "uncommon",
		effect: { stat: "luck", value: 4 },
		maxStack: 5,
	},
	{
		id: "luck-3",
		name: "Major Luck",
		description: "+7% Luck",
		rank: "rare",
		effect: { stat: "luck", value: 7 },
		maxStack: 5,
	},
	{
		id: "luck-4",
		name: "Superior Luck",
		description: "+12% Luck",
		rank: "epic",
		effect: { stat: "luck", value: 12 },
		maxStack: 5,
	},
	{
		id: "luck-5",
		name: "Godlike Luck",
		description: "+20% Luck",
		rank: "legendary",
		effect: { stat: "luck", value: 20 },
		maxStack: 5,
	},

	// Health powers (max 5 stacks each)
	{
		id: "health-1",
		name: "Minor Vitality",
		description: "+10 Health",
		rank: "common",
		effect: { stat: "health", value: 10 },
		maxStack: 5,
	},
	{
		id: "health-2",
		name: "Vitality",
		description: "+20 Health",
		rank: "uncommon",
		effect: { stat: "health", value: 20 },
		maxStack: 5,
	},
	{
		id: "health-3",
		name: "Major Vitality",
		description: "+35 Health",
		rank: "rare",
		effect: { stat: "health", value: 35 },
		maxStack: 5,
	},
	{
		id: "health-4",
		name: "Superior Vitality",
		description: "+50 Health",
		rank: "epic",
		effect: { stat: "health", value: 50 },
		maxStack: 5,
	},
	{
		id: "health-5",
		name: "Godlike Vitality",
		description: "+100 Health",
		rank: "legendary",
		effect: { stat: "health", value: 100 },
		maxStack: 5,
	},

	// Move speed powers (max 4 stacks each)
	{
		id: "speed-1",
		name: "Minor Speed",
		description: "+10 Speed",
		rank: "common",
		effect: { stat: "moveSpeed", value: 10 },
		maxStack: 4,
	},
	{
		id: "speed-2",
		name: "Speed",
		description: "+20 Speed",
		rank: "uncommon",
		effect: { stat: "moveSpeed", value: 20 },
		maxStack: 4,
	},
	{
		id: "speed-3",
		name: "Major Speed",
		description: "+35 Speed",
		rank: "rare",
		effect: { stat: "moveSpeed", value: 35 },
		maxStack: 4,
	},
	{
		id: "speed-4",
		name: "Superior Speed",
		description: "+50 Speed",
		rank: "epic",
		effect: { stat: "moveSpeed", value: 50 },
		maxStack: 4,
	},
	{
		id: "speed-5",
		name: "Godlike Speed",
		description: "+75 Speed",
		rank: "legendary",
		effect: { stat: "moveSpeed", value: 75 },
		maxStack: 4,
	},

	// Bow range powers (max 3 stacks each)
	{
		id: "range-1",
		name: "Minor Range",
		description: "+1 Range",
		rank: "common",
		effect: { stat: "bowRange", value: 1 },
		maxStack: 3,
	},
	{
		id: "range-2",
		name: "Range",
		description: "+2 Range",
		rank: "uncommon",
		effect: { stat: "bowRange", value: 2 },
		maxStack: 3,
	},
	{
		id: "range-3",
		name: "Major Range",
		description: "+3 Range",
		rank: "rare",
		effect: { stat: "bowRange", value: 3 },
		maxStack: 3,
	},
	{
		id: "range-4",
		name: "Superior Range",
		description: "+5 Range",
		rank: "epic",
		effect: { stat: "bowRange", value: 5 },
		maxStack: 3,
	},
	{
		id: "range-5",
		name: "Godlike Range",
		description: "+8 Range",
		rank: "legendary",
		effect: { stat: "bowRange", value: 8 },
		maxStack: 3,
	},

	// ==========================================
	// OFFENSIVE POWERS
	// ==========================================

	// Critical Damage Multiplier powers (max 3 stacks each - adds to base 2x crit)
	{
		id: "crit-dmg-1",
		name: "Brutal Strikes",
		description: "Crits deal +10% damage",
		rank: "common",
		effect: { stat: "critMultiplier", value: 0.1 },
		maxStack: 3,
	},
	{
		id: "crit-dmg-2",
		name: "Savage Blows",
		description: "Crits deal +25% damage",
		rank: "uncommon",
		effect: { stat: "critMultiplier", value: 0.25 },
		maxStack: 3,
	},
	{
		id: "crit-dmg-3",
		name: "Devastating Force",
		description: "Crits deal +50% damage",
		rank: "rare",
		effect: { stat: "critMultiplier", value: 0.5 },
		maxStack: 3,
	},
	{
		id: "crit-dmg-4",
		name: "Annihilator",
		description: "Crits deal +100% damage",
		rank: "epic",
		effect: { stat: "critMultiplier", value: 1.0 },
		maxStack: 3,
	},
	{
		id: "crit-dmg-5",
		name: "Executioner",
		description: "Crits deal +200% damage",
		rank: "legendary",
		effect: { stat: "critMultiplier", value: 2.0 },
		maxStack: 3,
		prerequisites: { stats: [{ stat: "critical", minValue: 20 }] },
	},

	// Piercing powers (max 4 stacks each - flat points that reduce target's effective armor)
	{
		id: "piercing-1",
		name: "Sharp Edge",
		description: "+3 Piercing",
		rank: "common",
		effect: { stat: "piercing", value: 3 },
		maxStack: 4,
	},
	{
		id: "piercing-2",
		name: "Piercing Strikes",
		description: "+6 Piercing",
		rank: "uncommon",
		effect: { stat: "piercing", value: 6 },
		maxStack: 4,
	},
	{
		id: "piercing-3",
		name: "Armor Breaker",
		description: "+12 Piercing",
		rank: "rare",
		effect: { stat: "piercing", value: 12 },
		maxStack: 4,
	},
	{
		id: "piercing-4",
		name: "Titan Slayer",
		description: "+20 Piercing",
		rank: "epic",
		effect: { stat: "piercing", value: 20 },
		maxStack: 4,
	},
	{
		id: "piercing-5",
		name: "True Damage",
		description: "+35 Piercing",
		rank: "legendary",
		effect: { stat: "piercing", value: 35 },
		maxStack: 4,
	},

	// Accuracy powers (max 4 stacks each - flat points that reduce target's effective dodge)
	{
		id: "accuracy-1",
		name: "Steady Aim",
		description: "+3 Accuracy",
		rank: "common",
		effect: { stat: "accuracy", value: 3 },
		maxStack: 4,
	},
	{
		id: "accuracy-2",
		name: "Precise Strikes",
		description: "+6 Accuracy",
		rank: "uncommon",
		effect: { stat: "accuracy", value: 6 },
		maxStack: 4,
	},
	{
		id: "accuracy-3",
		name: "Eagle Eye",
		description: "+12 Accuracy",
		rank: "rare",
		effect: { stat: "accuracy", value: 12 },
		maxStack: 4,
	},
	{
		id: "accuracy-4",
		name: "Unerring Blows",
		description: "+20 Accuracy",
		rank: "epic",
		effect: { stat: "accuracy", value: 20 },
		maxStack: 4,
	},
	{
		id: "accuracy-5",
		name: "Perfect Aim",
		description: "+35 Accuracy",
		rank: "legendary",
		effect: { stat: "accuracy", value: 35 },
		maxStack: 4,
	},

	// Damage Multiplier powers (max 2 stacks each - very powerful)
	{
		id: "dmg-mult-1",
		name: "Power Surge",
		description: "+15% all damage",
		rank: "rare",
		effect: { stat: "damageMultiplier", value: 0.15 },
		maxStack: 2,
	},
	{
		id: "dmg-mult-2",
		name: "Overwhelming Force",
		description: "+30% all damage",
		rank: "epic",
		effect: { stat: "damageMultiplier", value: 0.3 },
		maxStack: 2,
	},
	{
		id: "dmg-mult-3",
		name: "Godlike Power",
		description: "+50% all damage",
		rank: "legendary",
		effect: { stat: "damageMultiplier", value: 0.5 },
		maxStack: 2,
	},

	// ==========================================
	// DEFENSIVE POWERS
	// ==========================================

	// Armor powers (max 4 stacks each - caps at 100%)
	{
		id: "armor-1",
		name: "Tough Skin",
		description: "+3 Armor",
		rank: "common",
		effect: { stat: "armor", value: 3 },
		maxStack: 4,
	},
	{
		id: "armor-2",
		name: "Iron Will",
		description: "+6 Armor",
		rank: "uncommon",
		effect: { stat: "armor", value: 6 },
		maxStack: 4,
	},
	{
		id: "armor-3",
		name: "Stone Body",
		description: "+12 Armor",
		rank: "rare",
		effect: { stat: "armor", value: 12 },
		maxStack: 4,
	},
	{
		id: "armor-4",
		name: "Adamantine",
		description: "+20 Armor",
		rank: "epic",
		effect: { stat: "armor", value: 20 },
		maxStack: 4,
	},
	{
		id: "armor-5",
		name: "Invincible",
		description: "+35 Armor",
		rank: "legendary",
		effect: { stat: "armor", value: 35 },
		maxStack: 4,
	},

	// HP Regeneration powers (max 3 stacks each)
	{
		id: "hp-regen-1",
		name: "Minor Regeneration",
		description: "Regen 0.2 HP/sec",
		rank: "common",
		effect: { stat: "hpRegen", value: 0.2 },
		maxStack: 3,
	},
	{
		id: "hp-regen-2",
		name: "Regeneration",
		description: "Regen 0.33 HP/sec",
		rank: "uncommon",
		effect: { stat: "hpRegen", value: 0.33 },
		maxStack: 3,
	},
	{
		id: "hp-regen-3",
		name: "Fast Healing",
		description: "Regen 0.5 HP/sec",
		rank: "rare",
		effect: { stat: "hpRegen", value: 0.5 },
		maxStack: 3,
	},
	{
		id: "hp-regen-4",
		name: "Rapid Recovery",
		description: "Regen 1 HP/sec",
		rank: "epic",
		effect: { stat: "hpRegen", value: 1.0 },
		maxStack: 3,
	},
	{
		id: "hp-regen-5",
		name: "Immortal Flesh",
		description: "Regen 2 HP/sec",
		rank: "legendary",
		effect: { stat: "hpRegen", value: 2.0 },
		maxStack: 3,
	},

	// Dodge powers (max 4 stacks each - caps at 100%)
	{
		id: "dodge-1",
		name: "Quick Reflexes",
		description: "+3 Dodge",
		rank: "common",
		effect: { stat: "dodge", value: 3 },
		maxStack: 4,
	},
	{
		id: "dodge-2",
		name: "Nimble",
		description: "+6 Dodge",
		rank: "uncommon",
		effect: { stat: "dodge", value: 6 },
		maxStack: 4,
	},
	{
		id: "dodge-3",
		name: "Evasive",
		description: "+10 Dodge",
		rank: "rare",
		effect: { stat: "dodge", value: 10 },
		maxStack: 4,
	},
	{
		id: "dodge-4",
		name: "Ghost Step",
		description: "+15 Dodge",
		rank: "epic",
		effect: { stat: "dodge", value: 15 },
		maxStack: 4,
	},
	{
		id: "dodge-5",
		name: "Untouchable",
		description: "+25 Dodge",
		rank: "legendary",
		effect: { stat: "dodge", value: 25 },
		maxStack: 4,
	},

	// ==========================================
	// ARROW POWERS
	// ==========================================

	// Multi-shot powers (max 1 stack each - very powerful, get one tier only)
	{
		id: "multishot-1",
		name: "Double Shot",
		description: "Fire 2 arrows",
		rank: "rare",
		effect: { stat: "arrowCount", value: 1 },
		maxStack: 1,
	},
	{
		id: "multishot-2",
		name: "Triple Shot",
		description: "Fire 3 arrows",
		rank: "epic",
		effect: { stat: "arrowCount", value: 2 },
		maxStack: 1,
	},
	{
		id: "multishot-3",
		name: "Arrow Storm",
		description: "Fire 5 arrows",
		rank: "legendary",
		effect: { stat: "arrowCount", value: 4 },
		maxStack: 1,
		prerequisites: { powers: ["multishot-1"] },
	},

	// Arrow Pierce powers (max 1 stack each - values already stack well)
	{
		id: "pierce-1",
		name: "Piercing Arrows",
		description: "Arrows pierce 1 enemy",
		rank: "uncommon",
		effect: { stat: "arrowPierce", value: 1 },
		maxStack: 1,
	},
	{
		id: "pierce-2",
		name: "Impaling Arrows",
		description: "Arrows pierce 2 enemies",
		rank: "rare",
		effect: { stat: "arrowPierce", value: 2 },
		maxStack: 1,
	},
	{
		id: "pierce-3",
		name: "Unstoppable Arrows",
		description: "Arrows pierce all enemies",
		rank: "legendary",
		effect: { stat: "arrowPierce", value: 99 },
		maxStack: 1,
	},

	// Ricochet powers (max 1 stack each - values already stack well)
	{
		id: "ricochet-1",
		name: "Ricochet",
		description: "Arrows bounce to 1 enemy",
		rank: "rare",
		effect: { stat: "arrowBounce", value: 1 },
		maxStack: 1,
	},
	{
		id: "ricochet-2",
		name: "Chain Shot",
		description: "Arrows bounce to 2 enemies",
		rank: "epic",
		effect: { stat: "arrowBounce", value: 2 },
		maxStack: 1,
	},
	{
		id: "ricochet-3",
		name: "Endless Bounty",
		description: "Arrows bounce to 4 enemies",
		rank: "legendary",
		effect: { stat: "arrowBounce", value: 4 },
		maxStack: 1,
	},

	// ==========================================
	// ON-HIT POWERS
	// ==========================================

	// Lifesteal powers (max 2 stacks each)
	{
		id: "lifesteal-1",
		name: "Vampiric Touch",
		description: "Heal 3% of damage dealt",
		rank: "uncommon",
		effect: { stat: "lifesteal", value: 0.03 },
		maxStack: 2,
	},
	{
		id: "lifesteal-2",
		name: "Life Drain",
		description: "Heal 6% of damage dealt",
		rank: "rare",
		effect: { stat: "lifesteal", value: 0.06 },
		maxStack: 2,
	},
	{
		id: "lifesteal-3",
		name: "Siphon",
		description: "Heal 10% of damage dealt",
		rank: "epic",
		effect: { stat: "lifesteal", value: 0.1 },
		maxStack: 2,
	},
	{
		id: "lifesteal-4",
		name: "Leech Lord",
		description: "Heal 15% of damage dealt",
		rank: "legendary",
		effect: { stat: "lifesteal", value: 0.15 },
		maxStack: 2,
	},

	// ==========================================
	// SWORD POWERS
	// ==========================================

	// Cleave power (max 1 - toggle ability)
	{
		id: "cleave-1",
		name: "Cleave",
		description: "Sword hits all enemies in range",
		rank: "rare",
		effect: { stat: "swordCleave", value: 1 },
		maxStack: 1,
	},

	// Blade Dance powers (max 2 stacks each)
	{
		id: "blade-dance-1",
		name: "Quick Slash",
		description: "+15% sword attack speed",
		rank: "uncommon",
		effect: { stat: "swordAttackSpeed", value: 0.15 },
		maxStack: 2,
	},
	{
		id: "blade-dance-2",
		name: "Blade Dance",
		description: "+30% sword attack speed",
		rank: "rare",
		effect: { stat: "swordAttackSpeed", value: 0.3 },
		maxStack: 2,
	},
	{
		id: "blade-dance-3",
		name: "Whirlwind",
		description: "+50% sword attack speed",
		rank: "epic",
		effect: { stat: "swordAttackSpeed", value: 0.5 },
		maxStack: 2,
	},

	// Riposte powers (max 1 stack each - second tier already caps at 100%)
	{
		id: "riposte-1",
		name: "Riposte",
		description: "50% chance to counter when dodging",
		rank: "rare",
		effect: { stat: "riposteChance", value: 0.5 },
		maxStack: 1,
		prerequisites: { stats: [{ stat: "dodge", minValue: 10 }] },
	},
	{
		id: "riposte-2",
		name: "Retribution",
		description: "100% chance to counter when dodging",
		rank: "epic",
		effect: { stat: "riposteChance", value: 1.0 },
		maxStack: 1,
		prerequisites: { powers: ["riposte-1"] },
	},

	// Execute powers (max 1 stack each - thresholds don't stack meaningfully)
	{
		id: "execute-1",
		name: "Finishing Blow",
		description: "Kill enemies below 10% HP",
		rank: "rare",
		effect: { stat: "executeThreshold", value: 0.1 },
		maxStack: 1,
		prerequisites: { stats: [{ stat: "strength", minValue: 20 }] },
	},
	{
		id: "execute-2",
		name: "Execute",
		description: "Kill enemies below 20% HP",
		rank: "epic",
		effect: { stat: "executeThreshold", value: 0.2 },
		maxStack: 1,
		prerequisites: { powers: ["execute-1"] },
	},
	{
		id: "execute-3",
		name: "Decapitate",
		description: "Kill enemies below 33% HP",
		rank: "legendary",
		effect: { stat: "executeThreshold", value: 0.33 },
		maxStack: 1,
		prerequisites: { powers: ["execute-2"] },
	},

	// Vorpal Blade powers (max 1 stack each - very powerful)
	{
		id: "vorpal-1",
		name: "Vorpal Edge",
		description: "1% chance to instantly kill",
		rank: "epic",
		effect: { stat: "vorpalChance", value: 0.01 },
		maxStack: 1,
		prerequisites: { stats: [{ stat: "critical", minValue: 15 }] },
	},
	{
		id: "vorpal-2",
		name: "Vorpal Blade",
		description: "3% chance to instantly kill",
		rank: "legendary",
		effect: { stat: "vorpalChance", value: 0.03 },
		maxStack: 1,
		prerequisites: { powers: ["vorpal-1"] },
	},

	// ==========================================
	// ADVANCED ARROW POWERS
	// ==========================================

	// Homing arrows (max 1 stack each - tracking strength doesn't need stacking)
	{
		id: "homing-1",
		name: "Seeking Arrows",
		description: "Arrows gently track targets",
		rank: "rare",
		effect: { stat: "arrowHoming", value: 1 },
		maxStack: 1,
	},
	{
		id: "homing-2",
		name: "Homing Arrows",
		description: "Arrows strongly track targets",
		rank: "epic",
		effect: { stat: "arrowHoming", value: 2 },
		maxStack: 1,
	},

	// Explosive arrows (max 1 stack each - radius values don't stack well)
	{
		id: "explosive-1",
		name: "Blast Arrows",
		description: "Arrows explode for small AoE",
		rank: "rare",
		effect: { stat: "arrowExplosive", value: 32 },
		maxStack: 1,
	},
	{
		id: "explosive-2",
		name: "Explosive Arrows",
		description: "Arrows explode for medium AoE",
		rank: "epic",
		effect: { stat: "arrowExplosive", value: 48 },
		maxStack: 1,
	},
	{
		id: "explosive-3",
		name: "Devastation",
		description: "Arrows explode for large AoE",
		rank: "legendary",
		effect: { stat: "arrowExplosive", value: 64 },
		maxStack: 1,
	},
];

// Helper to get powers by rank
export function getPowersByRank(rank: PowerRank): Power[] {
	return POWERS.filter((p) => p.rank === rank);
}

// Helper to count how many times a specific power has been collected
export function countPowerStacks(
	powerId: string,
	collectedPowers: Power[],
): number {
	return collectedPowers.filter((p) => p.id === powerId).length;
}

// Helper to check if a power is at max stack
export function isPowerMaxed(power: Power, collectedPowers: Power[]): boolean {
	return countPowerStacks(power.id, collectedPowers) >= power.maxStack;
}

// Helper to get available powers (not at max stack) filtered by rank
export function getAvailablePowersByRank(
	rank: PowerRank,
	collectedPowers: Power[],
): Power[] {
	return POWERS.filter(
		(p) => p.rank === rank && !isPowerMaxed(p, collectedPowers),
	);
}

// Helper to get all available powers (not at max stack)
export function getAvailablePowers(collectedPowers: Power[]): Power[] {
	return POWERS.filter((p) => !isPowerMaxed(p, collectedPowers));
}

// Helper to roll a random rank based on weights
export function rollRandomRank(): PowerRank {
	const totalWeight = Object.values(RANK_WEIGHTS).reduce((a, b) => a + b, 0);
	let random = Math.random() * totalWeight;

	for (const [rank, weight] of Object.entries(RANK_WEIGHTS)) {
		random -= weight;
		if (random <= 0) {
			return rank as PowerRank;
		}
	}

	return "common";
}

// Helper to roll a random rank that has available powers
export function rollAvailableRank(collectedPowers: Power[]): PowerRank | null {
	// Build weights only for ranks that have available powers
	const availableRanks: { rank: PowerRank; weight: number }[] = [];

	for (const [rank, weight] of Object.entries(RANK_WEIGHTS)) {
		const available = getAvailablePowersByRank(
			rank as PowerRank,
			collectedPowers,
		);
		if (available.length > 0) {
			availableRanks.push({ rank: rank as PowerRank, weight });
		}
	}

	if (availableRanks.length === 0) {
		return null; // No powers available at all
	}

	const totalWeight = availableRanks.reduce((sum, r) => sum + r.weight, 0);
	let random = Math.random() * totalWeight;

	for (const { rank, weight } of availableRanks) {
		random -= weight;
		if (random <= 0) {
			return rank;
		}
	}

	return availableRanks[0].rank;
}

// Helper to get a random power of a specific rank (legacy - no filtering)
export function getRandomPowerOfRank(rank: PowerRank): Power {
	const powers = getPowersByRank(rank);
	return powers[Math.floor(Math.random() * powers.length)];
}

// Helper to get a random available power of a specific rank
export function getRandomAvailablePowerOfRank(
	rank: PowerRank,
	collectedPowers: Power[],
): Power | null {
	const powers = getAvailablePowersByRank(rank, collectedPowers);
	if (powers.length === 0) {
		return null;
	}
	return powers[Math.floor(Math.random() * powers.length)];
}

// Helper to get N random powers with weighted ranks (legacy - no filtering)
export function getRandomPowers(count: number): Power[] {
	const powers: Power[] = [];
	const usedIds = new Set<string>();

	while (powers.length < count) {
		const rank = rollRandomRank();
		const power = getRandomPowerOfRank(rank);

		// Avoid duplicates
		if (!usedIds.has(power.id)) {
			powers.push(power);
			usedIds.add(power.id);
		}
	}

	return powers;
}

// Helper to get N random powers excluding maxed powers
export function getRandomAvailablePowers(
	count: number,
	collectedPowers: Power[],
): Power[] {
	const powers: Power[] = [];
	const usedIds = new Set<string>();
	let attempts = 0;
	const maxAttempts = count * 20; // Prevent infinite loop

	while (powers.length < count && attempts < maxAttempts) {
		attempts++;

		const rank = rollAvailableRank(collectedPowers);
		if (rank === null) {
			break; // No more available powers
		}

		const power = getRandomAvailablePowerOfRank(rank, collectedPowers);
		if (power === null) {
			continue; // No powers available at this rank
		}

		// Avoid duplicates in the selection
		if (!usedIds.has(power.id)) {
			powers.push(power);
			usedIds.add(power.id);
		}
	}

	return powers;
}

// ==========================================
// PREREQUISITES HELPERS
// ==========================================

// Stat names for display
const STAT_DISPLAY_NAMES: Record<BonusStat, string> = {
	strength: "Strength",
	agility: "Agility",
	critical: "Critical",
	luck: "Luck",
	health: "Health",
	moveSpeed: "Speed",
	bowRange: "Range",
	critMultiplier: "Crit Damage",
	piercing: "Piercing",
	accuracy: "Accuracy",
	damageMultiplier: "Damage",
	dodge: "Dodge",
	armor: "Armor",
	hpRegen: "HP Regen",
	arrowCount: "Arrow Count",
	arrowPierce: "Arrow Pierce",
	arrowBounce: "Arrow Bounce",
	lifesteal: "Lifesteal",
	swordCleave: "Cleave",
	swordAttackSpeed: "Sword Speed",
	riposteChance: "Riposte",
	executeThreshold: "Execute",
	vorpalChance: "Vorpal",
	arrowHoming: "Homing",
	arrowExplosive: "Explosive",
};

// Get display name for a stat
export function getStatDisplayName(stat: BonusStat): string {
	return STAT_DISPLAY_NAMES[stat];
}

// Get power by ID
export function getPowerById(powerId: string): Power | undefined {
	return POWERS.find((p) => p.id === powerId);
}

// Result of checking prerequisites
export type PrerequisiteCheckResult = {
	met: boolean;
	missingStats: { stat: BonusStat; required: number; current: number }[];
	missingPowers: { powerId: string; powerName: string }[];
};

// Check if prerequisites are met for a power
export function checkPrerequisites(
	power: Power,
	bonusStats: Record<BonusStat, number>,
	collectedPowers: Power[],
): PrerequisiteCheckResult {
	const result: PrerequisiteCheckResult = {
		met: true,
		missingStats: [],
		missingPowers: [],
	};

	if (!power.prerequisites) {
		return result;
	}

	// Check stat requirements
	if (power.prerequisites.stats) {
		for (const req of power.prerequisites.stats) {
			const currentValue = bonusStats[req.stat];
			if (currentValue < req.minValue) {
				result.met = false;
				result.missingStats.push({
					stat: req.stat,
					required: req.minValue,
					current: currentValue,
				});
			}
		}
	}

	// Check power requirements
	if (power.prerequisites.powers) {
		const ownedPowerIds = new Set(collectedPowers.map((p) => p.id));
		for (const requiredPowerId of power.prerequisites.powers) {
			if (!ownedPowerIds.has(requiredPowerId)) {
				result.met = false;
				const requiredPower = getPowerById(requiredPowerId);
				result.missingPowers.push({
					powerId: requiredPowerId,
					powerName: requiredPower?.name ?? requiredPowerId,
				});
			}
		}
	}

	return result;
}

// Check if a power is locked (prerequisites not met)
export function isPowerLocked(
	power: Power,
	bonusStats: Record<BonusStat, number>,
	collectedPowers: Power[],
): boolean {
	return !checkPrerequisites(power, bonusStats, collectedPowers).met;
}

// Format missing prerequisites as a human-readable string
export function formatMissingPrerequisites(
	result: PrerequisiteCheckResult,
): string {
	const parts: string[] = [];

	for (const missing of result.missingStats) {
		const statName = getStatDisplayName(missing.stat);
		parts.push(`${missing.required}+ ${statName} (${missing.current})`);
	}

	for (const missing of result.missingPowers) {
		parts.push(`"${missing.powerName}"`);
	}

	return parts.join(", ");
}
