const urlParams = new URLSearchParams(window.location.search);
const isDebug = urlParams.get("debug") === "true";

// Mutable debug state for runtime toggling
export const debugState = {
	showHitboxes: isDebug,
};

export const GAME_CONFIG = {
	debug: {
		showHitboxes: isDebug,
		showFPS: isDebug,
	},
	map: {
		widthInTiles: 128,
		heightInTiles: 128,
		tileSize: 16,
		seed: undefined as number | undefined, // Map generation seed (undefined = random)
	},
	hero: {
		health: 100,
		moveSpeed: 100,
		agility: 50, // 1-1000, reduces attack intervals (1000 = 10ms bow interval)
		strength: 50, // 1-100, increases damage (100 = 50% more damage)
		critical: 10, // 0-100, % chance to deal x2 damage
		luck: 10, // Base luck stat, affects drop chance (10% + luck% - orcLevel*2%)
		dodge: 10, // 0-100, % chance to avoid an attack
		accuracy: 0, // 0-100, % subtracted from target's dodge before roll
		armor: 5, // 0-100, % damage reduction
		piercing: 0, // 0-100, % subtracted from target's armor before damage calc
		bow: {
			damage: 25,
			range: 8, // tiles
			interval: 2000, // ms base interval (at agility 50)
			arrowSpeed: 600, // arrow projectile speed (not affected by agility)
		},
		sword: {
			damage: 55,
			range: 30, // pixels
			interval: 1000, // ms base interval
		},
		hitboxWidth: 13,
		hitboxHeight: 10,
		hitboxOffsetX: 43,
		hitboxOffsetY: 50,
		attackHitboxWidth: 15,
		attackHitboxHeight: 23,
		attackHitboxOffsetX: 42,
		attackHitboxOffsetY: 38,
		// Sprint/Energy system
		energy: {
			max: 100, // Maximum energy
			drainRate: 25, // Energy drained per second while sprinting
			regenRate: 15, // Energy regenerated per second when not sprinting
			sprintThreshold: 20, // Minimum energy % to start sprinting
			speedMultiplier: 1.5, // Speed multiplier while sprinting (1.5 = +50%)
		},
	},
	arrow: {
		spawnOffset: 40, // pixels from hero center
		hitboxWidth: 16,
		hitboxHeight: 8,
		hitboxOffsetX: 8,
		hitboxOffsetY: 12,
	},
	orc: {
		health: 50,
		speed: 80,
		speedPerWave: 5, // Additional speed per wave
		damage: 10,
		attackCooldown: 1000,
		pathRecalcInterval: 2000,
		knockbackForce: 150,
		knockbackDuration: 250, // ms
		attackRange: 25, // pixels - distance to trigger attack
		damageRange: 30, // pixels - distance for damage to apply
		dodge: 0, // 0-100, base % chance to avoid attack (scales with wave)
		dodgePerWave: 1, // % dodge added per wave
		accuracy: 0, // 0-100, % subtracted from hero's dodge
		armor: 0, // 0-100, base % damage reduction (scales with wave)
		armorPerWave: 2, // % armor added per wave
		hitboxWidth: 8,
		hitboxHeight: 8,
		hitboxOffsetX: 46,
		hitboxOffsetY: 52,
		attackHitboxWidth: 15,
		attackHitboxHeight: 23,
		attackHitboxOffsetX: 42,
		attackHitboxOffsetY: 38,
		// Level scaling (per level beyond 1)
		levelHpMultiplier: 0.1, // +10% HP per level
		levelDamageMultiplier: 0.1, // +10% damage per level
		levelSpeedMultiplier: 0.1, // +10% speed per level
		levelDropReduction: 2, // -2% drop chance per level
		minDropChance: 1, // minimum 1% drop chance
	},
	waves: {
		initialSpawnInterval: 1000,
		orcsPerWave: 5,
		difficultyMultiplier: 1.4,
		waveDuration: 30000,
	},
	sprites: {
		frameWidth: 100,
		frameHeight: 100,
	},
	loot: {
		hitboxSize: 32,
		maxBagsInventory: 9, // Max bags hero can hold
		maxBagsOnField: 32, // Max bags on battlefield before drops stop
	},
} as const;

export type GameConfigType = typeof GAME_CONFIG;
