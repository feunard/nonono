/**
 * Pure calculation functions extracted for testability.
 * These mirror the calculations in Hero.ts and WaveManager.ts.
 */

/** Stat caps - both max at 500 */
export const STAT_CAPS = {
	default: 500,
	agility: 500,
};

/**
 * Cap a stat value to the valid range (max 100).
 */
export function capStat(
	value: number,
	max: number = STAT_CAPS.default,
): number {
	return Math.min(value, max);
}

/**
 * Calculate total stat value (base + bonus), capped at max.
 */
export function getTotalStat(base: number, bonus: number, max = 100): number {
	return capStat(base + bonus, max);
}

/**
 * Calculate agility modifier for attack speed.
 * agility 50 (base) = 1.0x interval (no change, 2000ms bow)
 * agility 500 = 0.005x interval (10ms bow)
 * agility < 50 = >1.0x interval (slower attacks)
 * Formula: 1 - (agility - 50) * 0.995 / 450
 */
export function getAgilityModifier(agility: number): number {
	const capped = capStat(agility, STAT_CAPS.agility);
	return 1 - ((capped - 50) * 0.995) / 450;
}

/**
 * Calculate strength modifier for damage.
 * strength 1 = 1x damage, strength 500 = 1.495x damage (~50% more)
 * Formula: 1 + (strength - 1) * 0.495 / 499
 */
export function getStrengthModifier(strength: number): number {
	const capped = capStat(strength);
	return 1 + ((capped - 1) * 0.495) / 499;
}

/**
 * Calculate final damage with strength modifier (floored to integer).
 */
export function calculateDamage(baseDamage: number, strength: number): number {
	return Math.floor(baseDamage * getStrengthModifier(strength));
}

/**
 * Calculate damage with base + bonus strength.
 */
export function calculateDamageWithBonus(
	baseDamage: number,
	baseStrength: number,
	bonusStrength: number,
): number {
	const totalStrength = getTotalStat(
		baseStrength,
		bonusStrength,
		STAT_CAPS.default,
	);
	return calculateDamage(baseDamage, totalStrength);
}

/**
 * Calculate critical hit damage (2x normal damage).
 */
export function calculateCriticalDamage(
	baseDamage: number,
	strength: number,
): number {
	return calculateDamage(baseDamage, strength) * 2;
}

/**
 * Calculate attack interval with agility modifier.
 * Higher agility = lower interval = faster attacks.
 */
export function calculateAttackInterval(
	baseInterval: number,
	agility: number,
	speedMultiplier = 1,
): number {
	return (baseInterval * getAgilityModifier(agility)) / speedMultiplier;
}

/**
 * Calculate attack interval with base + bonus agility.
 */
export function calculateAttackIntervalWithBonus(
	baseInterval: number,
	baseAgility: number,
	bonusAgility: number,
	speedMultiplier = 1,
): number {
	const totalAgility = getTotalStat(
		baseAgility,
		bonusAgility,
		STAT_CAPS.agility,
	);
	return calculateAttackInterval(baseInterval, totalAgility, speedMultiplier);
}

/**
 * Calculate attacks per second based on interval.
 */
export function calculateAttacksPerSecond(intervalMs: number): number {
	return 1000 / intervalMs;
}

/**
 * Calculate DPS (damage per second).
 */
export function calculateDPS(damage: number, intervalMs: number): number {
	return (damage * 1000) / intervalMs;
}

/**
 * Calculate DPS with full stat modifiers.
 */
export function calculateFullDPS(
	baseDamage: number,
	baseInterval: number,
	strength: number,
	agility: number,
	speedMultiplier = 1,
): number {
	const damage = calculateDamage(baseDamage, strength);
	const interval = calculateAttackInterval(
		baseInterval,
		agility,
		speedMultiplier,
	);
	return calculateDPS(damage, interval);
}

/**
 * Calculate orcs to spawn for a given wave.
 */
export function calculateOrcsForWave(
	wave: number,
	baseOrcs: number,
	difficultyMultiplier: number,
): number {
	return Math.floor(baseOrcs * difficultyMultiplier ** (wave - 1));
}

/**
 * Calculate spawn interval for a given wave.
 * Decreases by 500ms per wave, minimum 1000ms.
 */
export function calculateSpawnInterval(
	wave: number,
	initialInterval: number,
): number {
	return Math.max(1000, initialInterval - wave * 500);
}

/**
 * Clamp a value to tile boundaries.
 */
export function clampToTiles(value: number, maxTiles: number): number {
	return Math.max(0, Math.min(value, maxTiles - 1));
}

/**
 * Convert world position to tile position.
 */
export function worldToTile(worldPos: number, tileSize: number): number {
	return Math.floor(worldPos / tileSize);
}

/**
 * Convert tile position to world center position.
 */
export function tileToWorldCenter(tilePos: number, tileSize: number): number {
	return tilePos * tileSize + tileSize / 2;
}

/**
 * Calculate distance between two points.
 */
export function distance(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalize diagonal movement to prevent faster diagonal speed.
 */
export function normalizeDiagonal(
	velocityX: number,
	velocityY: number,
): { x: number; y: number } {
	if (velocityX !== 0 && velocityY !== 0) {
		const factor = 1 / Math.SQRT2;
		return { x: velocityX * factor, y: velocityY * factor };
	}
	return { x: velocityX, y: velocityY };
}

/**
 * Format time in seconds to MM:SS format.
 */
export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ==========================================
// COMBAT STAT CALCULATIONS
// ==========================================

/**
 * Calculate effective dodge after attacker's accuracy is applied.
 * effectiveDodge = targetDodge - attackerAccuracy, clamped to 0-100
 */
export function calculateEffectiveDodge(
	targetDodge: number,
	attackerAccuracy: number,
): number {
	return Math.max(0, Math.min(100, targetDodge - attackerAccuracy));
}

/**
 * Calculate effective armor after attacker's piercing is applied.
 * effectiveArmor = targetArmor - attackerPiercing, clamped to 0-100
 */
export function calculateEffectiveArmor(
	targetArmor: number,
	attackerPiercing: number,
): number {
	return Math.max(0, Math.min(100, targetArmor - attackerPiercing));
}

/**
 * Calculate final damage after armor reduction.
 * Armor is a percentage reduction (0-100).
 * finalDamage = floor(baseDamage * (1 - effectiveArmor / 100))
 */
export function calculateDamageAfterArmor(
	baseDamage: number,
	effectiveArmor: number,
): number {
	return Math.floor(baseDamage * (1 - effectiveArmor / 100));
}

/**
 * Roll for dodge based on effective dodge percentage.
 * Returns true if the attack was dodged.
 * @param effectiveDodge - Dodge chance as 0-100 percentage
 * @param randomValue - Optional random value for testing (0-1)
 */
export function rollDodge(
	effectiveDodge: number,
	randomValue?: number,
): boolean {
	const roll =
		randomValue !== undefined ? randomValue * 100 : Math.random() * 100;
	return effectiveDodge > 0 && roll < effectiveDodge;
}

/**
 * Calculate dodge chance bonus from Agility.
 * Each point of Agility above 100 grants 0.1% dodge chance.
 * Formula: dodgeChance = max(0, (agility - 100) * 0.1)
 * @param agility - Total agility value
 * @returns Dodge chance as 0-100 percentage
 */
export function calculateAgilityDodge(agility: number): number {
	if (agility <= 100) return 0;
	return (agility - 100) * 0.1;
}

/**
 * Calculate drop chance based on luck and orc level.
 * Formula: dropChance = max(minDropChance, 10 + luck - orcLevel * levelReduction)
 * @param luck - Total luck value
 * @param orcLevel - Level of the orc
 * @param levelReduction - Drop reduction per orc level (default 2)
 * @param minDropChance - Minimum drop chance (default 1)
 * @returns Drop chance as 0-100 percentage
 */
export function calculateDropChance(
	luck: number,
	orcLevel: number,
	levelReduction = 2,
	minDropChance = 1,
): number {
	const baseDropChance = 10; // 10% base
	const luckBonus = luck; // Each luck point = 1% drop chance
	const levelPenalty = orcLevel * levelReduction;
	return Math.max(minDropChance, baseDropChance + luckBonus - levelPenalty);
}
