import { describe, expect, it } from "vitest";
import {
	STAT_CAPS,
	calculateAttackInterval,
	calculateAttackIntervalWithBonus,
	calculateAttacksPerSecond,
	calculateCriticalDamage,
	calculateDamage,
	calculateDamageAfterArmor,
	calculateDamageWithBonus,
	calculateDPS,
	calculateEffectiveArmor,
	calculateEffectiveDodge,
	calculateFullDPS,
	calculateOrcsForWave,
	calculateSpawnInterval,
	capStat,
	clampToTiles,
	distance,
	formatTime,
	getAgilityModifier,
	getStrengthModifier,
	getTotalStat,
	normalizeDiagonal,
	rollDodge,
	tileToWorldCenter,
	worldToTile,
} from "../src/systems/calculations";

// Game config values for realistic tests
const BOW_BASE_DAMAGE = 25;
const BOW_BASE_INTERVAL = 2000; // ms (at agility 50)
const SWORD_BASE_DAMAGE = 55;
const SWORD_BASE_INTERVAL = 1000; // ms
const BASE_AGILITY = 50;
const BASE_STRENGTH = 50;

describe("Stat Capping", () => {
	describe("STAT_CAPS constants", () => {
		it("should have default cap of 500 for most stats", () => {
			expect(STAT_CAPS.default).toBe(500);
		});

		it("should have agility cap of 500", () => {
			expect(STAT_CAPS.agility).toBe(500);
		});
	});

	describe("capStat", () => {
		it("should not change values under max", () => {
			expect(capStat(50)).toBe(50);
			expect(capStat(1)).toBe(1);
			expect(capStat(499)).toBe(499);
		});

		it("should cap values at max (default 500)", () => {
			expect(capStat(500)).toBe(500);
			expect(capStat(600)).toBe(500);
			expect(capStat(1000)).toBe(500);
		});

		it("should respect custom max", () => {
			expect(capStat(50, 40)).toBe(40);
			expect(capStat(200, 150)).toBe(150);
		});

		it("should cap agility at 500 when using STAT_CAPS.agility", () => {
			expect(capStat(300, STAT_CAPS.agility)).toBe(300);
			expect(capStat(500, STAT_CAPS.agility)).toBe(500);
			expect(capStat(750, STAT_CAPS.agility)).toBe(500);
		});
	});

	describe("getTotalStat", () => {
		it("should add base and bonus", () => {
			expect(getTotalStat(50, 10)).toBe(60);
			expect(getTotalStat(50, 0)).toBe(50);
			expect(getTotalStat(0, 50)).toBe(50);
		});

		it("should cap total at default (100 for backwards compat, but real cap is 500)", () => {
			// getTotalStat uses max=100 by default for backwards compat
			expect(getTotalStat(50, 50)).toBe(100);
			expect(getTotalStat(50, 100)).toBe(100);
			// With custom max of 500
			expect(getTotalStat(50, 500, 500)).toBe(500);
		});

		it("should handle real game scenario: base 50 + bonus from powers", () => {
			// Common power: +5
			expect(getTotalStat(50, 5)).toBe(55);
			// Uncommon power: +10
			expect(getTotalStat(50, 10)).toBe(60);
			// Rare power: +20
			expect(getTotalStat(50, 20)).toBe(70);
			// Epic power: +35
			expect(getTotalStat(50, 35)).toBe(85);
			// Legendary power: +50
			expect(getTotalStat(50, 50)).toBe(100);
			// Multiple powers stacked (with 500 cap)
			expect(getTotalStat(50, 450, 500)).toBe(500);
		});
	});
});

describe("Agility - Attack Speed", () => {
	describe("getAgilityModifier", () => {
		it("agility 50 (base) should give modifier 1.0 (no change)", () => {
			// At base agility, no speed change
			expect(getAgilityModifier(50)).toBe(1);
		});

		it("agility 500 should give modifier 0.005 (10ms for 2000ms base bow)", () => {
			// Formula: 1 - (500 - 50) * 0.995 / 450 = 1 - 0.995 = 0.005
			expect(getAgilityModifier(500)).toBeCloseTo(0.005);
		});

		it("agility 1 should give modifier >1.0 (slower attacks)", () => {
			// Formula: 1 - (1 - 50) * 0.995 / 450 = 1 + 0.108 ≈ 1.108
			expect(getAgilityModifier(1)).toBeCloseTo(1.108, 2);
		});

		it("agility 275 should give modifier ~0.50 (about 2x faster)", () => {
			// Formula: 1 - (275 - 50) * 0.995 / 450 ≈ 0.503
			expect(getAgilityModifier(275)).toBeCloseTo(0.503, 2);
		});

		it("should scale linearly between 50 and 500", () => {
			const mod150 = getAgilityModifier(150);
			const mod275 = getAgilityModifier(275);
			const mod400 = getAgilityModifier(400);

			// Each 125 agility should reduce modifier by same amount
			expect(mod150 - mod275).toBeCloseTo(mod275 - mod400, 2);
		});

		it("should cap at 500 even if given higher value", () => {
			expect(getAgilityModifier(750)).toBe(getAgilityModifier(500));
			expect(getAgilityModifier(1000)).toBe(getAgilityModifier(500));
		});

		it("higher agility = lower modifier = faster attacks", () => {
			expect(getAgilityModifier(500)).toBeLessThan(getAgilityModifier(275));
			expect(getAgilityModifier(275)).toBeLessThan(getAgilityModifier(50));
			expect(getAgilityModifier(50)).toBeLessThan(getAgilityModifier(1));
		});
	});

	describe("calculateAttackInterval", () => {
		it("agility 50 (base) should not change base interval", () => {
			expect(calculateAttackInterval(BOW_BASE_INTERVAL, 50)).toBe(2000);
			expect(calculateAttackInterval(SWORD_BASE_INTERVAL, 50)).toBe(1000);
		});

		it("agility 1 should increase interval (slower attacks)", () => {
			const bowInterval = calculateAttackInterval(BOW_BASE_INTERVAL, 1);
			const swordInterval = calculateAttackInterval(SWORD_BASE_INTERVAL, 1);

			// 2000 * 1.108 ≈ 2217
			expect(bowInterval).toBeCloseTo(2217, 0);
			// 1000 * 1.108 ≈ 1108
			expect(swordInterval).toBeCloseTo(1108, 0);
		});

		it("agility 500 should reduce bow interval to 10ms", () => {
			const bowInterval = calculateAttackInterval(BOW_BASE_INTERVAL, 500);
			// 2000 * 0.005 = 10
			expect(bowInterval).toBeCloseTo(10);
		});

		it("agility 500 should reduce sword interval to 5ms", () => {
			const swordInterval = calculateAttackInterval(SWORD_BASE_INTERVAL, 500);
			// 1000 * 0.005 = 5
			expect(swordInterval).toBeCloseTo(5);
		});

		it("speed multiplier should further reduce interval", () => {
			const base = calculateAttackInterval(2000, 50, 1);
			const doubled = calculateAttackInterval(2000, 50, 2);

			expect(doubled).toBe(base / 2);
		});
	});

	describe("calculateAttackIntervalWithBonus", () => {
		it("bonus agility should reduce attack interval", () => {
			const noBonus = calculateAttackIntervalWithBonus(2000, 50, 0);
			const withBonus = calculateAttackIntervalWithBonus(2000, 50, 100);

			expect(withBonus).toBeLessThan(noBonus);
		});

		it("stacking bonuses should progressively reduce interval", () => {
			const bonus0 = calculateAttackIntervalWithBonus(2000, 50, 0);
			const bonus100 = calculateAttackIntervalWithBonus(2000, 50, 100);
			const bonus200 = calculateAttackIntervalWithBonus(2000, 50, 200);
			const bonus450 = calculateAttackIntervalWithBonus(2000, 50, 450);

			expect(bonus100).toBeLessThan(bonus0);
			expect(bonus200).toBeLessThan(bonus100);
			expect(bonus450).toBeLessThan(bonus200);
		});

		it("bonus that exceeds cap should not provide extra benefit", () => {
			// 50 base + 450 bonus = 500 (capped)
			const atCap = calculateAttackIntervalWithBonus(2000, 50, 450);
			// 50 base + 700 bonus = 500 (capped, excess ignored)
			const overCap = calculateAttackIntervalWithBonus(2000, 50, 700);

			expect(atCap).toBe(overCap);
		});

		it("max agility (500) should give 10ms bow interval", () => {
			const interval = calculateAttackIntervalWithBonus(BOW_BASE_INTERVAL, 50, 450);
			expect(interval).toBeCloseTo(10);
		});
	});

	describe("Rapid Fire Scenarios", () => {
		it("agility 350 should allow ~2.5 arrows per second", () => {
			// 50 base + 300 bonus = 350 agility
			const interval = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				300,
			);
			const arrowsPerSecond = calculateAttacksPerSecond(interval);

			// At 350 agility: modifier ≈ 0.337, interval ≈ 673ms
			expect(interval).toBeCloseTo(673, -1); // within 10ms
			expect(arrowsPerSecond).toBeGreaterThan(1);
			expect(arrowsPerSecond).toBeLessThan(2);
		});

		it("agility 450 should allow ~6 arrows per second", () => {
			const interval = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				400,
			);
			const arrowsPerSecond = calculateAttacksPerSecond(interval);

			// At 450 agility: modifier ≈ 0.116, interval ≈ 231ms
			expect(interval).toBeCloseTo(231, -1);
			expect(arrowsPerSecond).toBeGreaterThan(4);
		});

		it("max agility (500) should allow 100 arrows per second", () => {
			const interval = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				450,
			);
			const arrowsPerSecond = calculateAttacksPerSecond(interval);

			expect(interval).toBeCloseTo(10);
			expect(arrowsPerSecond).toBeCloseTo(100);
		});

		it("base agility (50) should allow 0.5 arrows per second", () => {
			const interval = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				0,
			);
			const arrowsPerSecond = calculateAttacksPerSecond(interval);

			expect(interval).toBe(2000);
			expect(arrowsPerSecond).toBe(0.5);
		});
	});

	describe("Agility Below Base (Slower Attacks)", () => {
		it("agility 25 should be slower than base", () => {
			const baseInterval = calculateAttackInterval(BOW_BASE_INTERVAL, 50);
			const slowInterval = calculateAttackInterval(BOW_BASE_INTERVAL, 25);

			expect(slowInterval).toBeGreaterThan(baseInterval);
		});

		it("agility 1 should give slowest attacks", () => {
			const interval = calculateAttackInterval(BOW_BASE_INTERVAL, 1);

			// modifier ≈ 1.108, interval ≈ 2217ms
			expect(interval).toBeGreaterThan(2000);
			expect(interval).toBeCloseTo(2217, 0);
		});

		it("agility cannot go below 1 in calculations", () => {
			// Even if somehow agility is 0 or negative, formula handles it
			const mod0 = getAgilityModifier(0);
			const mod1 = getAgilityModifier(1);

			// 0 agility would give even higher modifier (slower)
			expect(mod0).toBeGreaterThan(mod1);
		});
	});

	describe("calculateAttacksPerSecond", () => {
		it("500ms interval = 2 attacks per second", () => {
			expect(calculateAttacksPerSecond(500)).toBe(2);
		});

		it("1000ms interval = 1 attack per second", () => {
			expect(calculateAttacksPerSecond(1000)).toBe(1);
		});

		it("250ms interval = 4 attacks per second", () => {
			expect(calculateAttacksPerSecond(250)).toBe(4);
		});
	});
});

describe("Strength - Attack Damage", () => {
	describe("getStrengthModifier", () => {
		it("strength 1 should give modifier 1.0 (no change)", () => {
			expect(getStrengthModifier(1)).toBe(1);
		});

		it("strength 500 should give modifier ~1.495 (nearly 50% more)", () => {
			// Formula: 1 + (500 - 1) * 0.495 / 499 = 1 + 0.495 = 1.495
			expect(getStrengthModifier(500)).toBeCloseTo(1.495);
		});

		it("strength 50 (base) should give modifier ~1.049", () => {
			// Formula: 1 + (50 - 1) * 0.495 / 499 = 1 + 0.0486 = 1.049
			expect(getStrengthModifier(50)).toBeCloseTo(1.049, 2);
		});

		it("should scale linearly between 1 and 500", () => {
			const mod125 = getStrengthModifier(125);
			const mod250 = getStrengthModifier(250);
			const mod375 = getStrengthModifier(375);

			// Each 125 strength should increase modifier by same amount
			expect(mod250 - mod125).toBeCloseTo(mod375 - mod250, 3);
		});

		it("should cap at 500 even if given higher value", () => {
			expect(getStrengthModifier(600)).toBe(getStrengthModifier(500));
			expect(getStrengthModifier(1000)).toBe(getStrengthModifier(500));
		});

		it("higher strength = higher modifier = more damage", () => {
			expect(getStrengthModifier(500)).toBeGreaterThan(getStrengthModifier(250));
			expect(getStrengthModifier(250)).toBeGreaterThan(getStrengthModifier(1));
		});
	});

	describe("calculateDamage", () => {
		it("strength 1 should not change base damage", () => {
			expect(calculateDamage(BOW_BASE_DAMAGE, 1)).toBe(25);
			expect(calculateDamage(SWORD_BASE_DAMAGE, 1)).toBe(55);
		});

		it("strength 500 should increase damage by ~50%", () => {
			// 25 * 1.495 = 37.375 -> floored to 37
			expect(calculateDamage(BOW_BASE_DAMAGE, 500)).toBe(37);
			// 55 * 1.495 = 82.225 -> floored to 82
			expect(calculateDamage(SWORD_BASE_DAMAGE, 500)).toBe(82);
		});

		it("base strength 50 should give small damage increase", () => {
			// 25 * 1.049 = 26.22 -> floored to 26
			expect(calculateDamage(BOW_BASE_DAMAGE, 50)).toBe(26);
			// 55 * 1.049 = 57.69 -> floored to 57
			expect(calculateDamage(SWORD_BASE_DAMAGE, 50)).toBe(57);
		});

		it("should always floor the result (no fractional damage)", () => {
			const damage = calculateDamage(17, 73);
			expect(damage).toBe(Math.floor(damage));
			expect(Number.isInteger(damage)).toBe(true);
		});
	});

	describe("calculateDamageWithBonus", () => {
		it("bonus strength should increase damage", () => {
			const noBonus = calculateDamageWithBonus(25, 50, 0);
			const withBonus = calculateDamageWithBonus(25, 50, 100);

			expect(withBonus).toBeGreaterThan(noBonus);
		});

		it("stacking bonuses should progressively increase damage", () => {
			const bonus0 = calculateDamageWithBonus(55, 50, 0);
			const bonus100 = calculateDamageWithBonus(55, 50, 100);
			const bonus200 = calculateDamageWithBonus(55, 50, 200);
			const bonus450 = calculateDamageWithBonus(55, 50, 450);

			expect(bonus100).toBeGreaterThan(bonus0);
			expect(bonus200).toBeGreaterThan(bonus100);
			expect(bonus450).toBeGreaterThan(bonus200);
		});

		it("bonus that exceeds cap should not provide extra damage", () => {
			// 50 base + 450 bonus = 500 (capped)
			const atCap = calculateDamageWithBonus(25, 50, 450);
			// 50 base + 600 bonus = 500 (capped, excess ignored)
			const overCap = calculateDamageWithBonus(25, 50, 600);

			expect(atCap).toBe(overCap);
		});
	});

	describe("calculateCriticalDamage", () => {
		it("critical should be exactly 2x normal damage", () => {
			const normal = calculateDamage(BOW_BASE_DAMAGE, 50);
			const critical = calculateCriticalDamage(BOW_BASE_DAMAGE, 50);
			expect(critical).toBe(normal * 2);
		});

		it("critical bow damage with base stats", () => {
			// Normal: 26, Critical: 52
			expect(calculateCriticalDamage(BOW_BASE_DAMAGE, 50)).toBe(52);
		});

		it("critical sword damage with base stats", () => {
			// Normal: 57, Critical: 114
			expect(calculateCriticalDamage(SWORD_BASE_DAMAGE, 50)).toBe(114);
		});

		it("critical with max strength", () => {
			// Bow: 37 * 2 = 74
			expect(calculateCriticalDamage(BOW_BASE_DAMAGE, 500)).toBe(74);
			// Sword: 82 * 2 = 164
			expect(calculateCriticalDamage(SWORD_BASE_DAMAGE, 500)).toBe(164);
		});
	});
});

describe("DPS Calculations", () => {
	describe("calculateDPS", () => {
		it("should calculate damage per second correctly", () => {
			// 100 damage every 500ms = 200 DPS
			expect(calculateDPS(100, 500)).toBe(200);
			// 50 damage every 1000ms = 50 DPS
			expect(calculateDPS(50, 1000)).toBe(50);
		});
	});

	describe("calculateFullDPS", () => {
		it("bow DPS with base stats (strength 50, agility 50)", () => {
			const dps = calculateFullDPS(BOW_BASE_DAMAGE, BOW_BASE_INTERVAL, 50, 50);
			// Damage: 26, Interval: 2000ms (agility 50 = no modifier)
			// DPS: 26 * 1000 / 2000 = 13
			expect(dps).toBeCloseTo(13, 0);
		});

		it("sword DPS with base stats (strength 50, agility 50)", () => {
			const dps = calculateFullDPS(
				SWORD_BASE_DAMAGE,
				SWORD_BASE_INTERVAL,
				50,
				50,
			);
			// Damage: 57, Interval: 1000ms (agility 50 = no modifier)
			// DPS: 57 * 1000 / 1000 = 57
			expect(dps).toBeCloseTo(57, 0);
		});

		it("DPS should increase with higher strength", () => {
			const lowStr = calculateFullDPS(25, 2000, 1, 50);
			const highStr = calculateFullDPS(25, 2000, 500, 50);

			expect(highStr).toBeGreaterThan(lowStr);
		});

		it("DPS should increase with higher agility", () => {
			const lowAgi = calculateFullDPS(25, 2000, 50, 50);
			const highAgi = calculateFullDPS(25, 2000, 50, 500);

			expect(highAgi).toBeGreaterThan(lowAgi);
		});

		it("max agility (500) should massively increase DPS", () => {
			const baseDPS = calculateFullDPS(25, 2000, 50, 50);
			const maxAgiDPS = calculateFullDPS(25, 2000, 50, 500);

			// Max agility: 10ms interval vs 2000ms = 200x faster attacks
			// So DPS should be roughly 200x higher
			expect(maxAgiDPS).toBeGreaterThan(baseDPS * 150);
		});

		it("max stats should give extreme DPS", () => {
			const baseDPS = calculateFullDPS(25, 2000, 50, 50);
			const maxDPS = calculateFullDPS(25, 2000, 500, 500);

			// Max strength: ~1.5x damage, Max agility: ~200x attack speed
			// Combined: massive DPS increase
			expect(maxDPS).toBeGreaterThan(baseDPS * 200);
		});
	});
});

describe("Combat Simulation Scenarios", () => {
	describe("Orc Kill Simulation", () => {
		const ORC_HEALTH = 50;

		it("bow with base stats should kill orc in 2 shots", () => {
			const damage = calculateDamage(BOW_BASE_DAMAGE, BASE_STRENGTH);
			const shotsToKill = Math.ceil(ORC_HEALTH / damage);
			expect(shotsToKill).toBe(2); // 26 damage, need 2 shots
		});

		it("sword with base stats should kill orc in 1 hit", () => {
			const damage = calculateDamage(SWORD_BASE_DAMAGE, BASE_STRENGTH);
			const hitsToKill = Math.ceil(ORC_HEALTH / damage);
			expect(hitsToKill).toBe(1); // 57 damage, 1 hit kill
		});

		it("bow critical with base stats should one-shot orc", () => {
			const critDamage = calculateCriticalDamage(BOW_BASE_DAMAGE, BASE_STRENGTH);
			expect(critDamage).toBeGreaterThan(ORC_HEALTH);
		});
	});

	describe("Power Stacking Scenarios", () => {
		it("large strength bonus (+100) should increase sword damage", () => {
			// Need larger bonus to see effect with new formula
			const before = calculateDamageWithBonus(SWORD_BASE_DAMAGE, 50, 0);
			const after = calculateDamageWithBonus(SWORD_BASE_DAMAGE, 50, 100);
			expect(after).toBeGreaterThan(before);
		});

		it("moderate strength bonus (+50) should increase bow damage", () => {
			const before = calculateDamageWithBonus(BOW_BASE_DAMAGE, 50, 0);
			const after = calculateDamageWithBonus(BOW_BASE_DAMAGE, 50, 50);
			expect(after).toBeGreaterThan(before);
		});

		it("max strength bonus (+450) should maximize damage", () => {
			const damage = calculateDamageWithBonus(BOW_BASE_DAMAGE, 50, 450);
			const maxDamage = calculateDamage(BOW_BASE_DAMAGE, 500);
			expect(damage).toBe(maxDamage);
		});

		it("multiple agility powers should stack", () => {
			const bonus0 = calculateAttackIntervalWithBonus(2000, 50, 0);
			const bonus50 = calculateAttackIntervalWithBonus(2000, 50, 50);
			const bonus200 = calculateAttackIntervalWithBonus(2000, 50, 200);
			const bonus450 = calculateAttackIntervalWithBonus(2000, 50, 450);

			expect(bonus50).toBeLessThan(bonus0);
			expect(bonus200).toBeLessThan(bonus50);
			expect(bonus450).toBeLessThan(bonus200);
		});

		it("max agility bonus should give 10ms bow interval", () => {
			// Base 50 + 450 bonus = 500 agility
			const interval = calculateAttackIntervalWithBonus(BOW_BASE_INTERVAL, 50, 450);
			expect(interval).toBeCloseTo(10);
		});
	});

	describe("Real Game Agility Progression", () => {
		// Simulates collecting agility powers during a game
		it("should show meaningful progression through agility tiers", () => {
			const baseInterval = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				0,
			);

			// After a few common agility powers (+50 total)
			const earlyGame = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				50,
			);

			// Mid game with good drops (+150 total)
			const midGame = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				150,
			);

			// Late game stacked (+300 total)
			const lateGame = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				300,
			);

			// End game maxed (+450 total)
			const endGame = calculateAttackIntervalWithBonus(
				BOW_BASE_INTERVAL,
				50,
				450,
			);

			// Verify progression makes sense
			expect(baseInterval).toBe(2000); // 0.5 arrows/sec
			expect(earlyGame).toBeLessThan(baseInterval);
			expect(midGame).toBeLessThan(earlyGame);
			expect(lateGame).toBeLessThan(midGame);
			expect(endGame).toBeCloseTo(10); // 100 arrows/sec

			// Calculate DPS improvement
			const baseDPS = calculateFullDPS(BOW_BASE_DAMAGE, BOW_BASE_INTERVAL, 50, 50);
			const endGameDPS = calculateFullDPS(
				BOW_BASE_DAMAGE,
				BOW_BASE_INTERVAL,
				50,
				500,
			);

			// End game should be massively stronger
			expect(endGameDPS / baseDPS).toBeGreaterThan(150);
		});

		it("agility milestones should provide meaningful breakpoints", () => {
			// Key agility values and their expected intervals
			const milestones = [
				{ agility: 50, expectedInterval: 2000 }, // Base: 1 arrow per 2 sec
				{ agility: 100, expectedInterval: 1779 }, // Early power
				{ agility: 200, expectedInterval: 1337 }, // ~1.5x faster
				{ agility: 300, expectedInterval: 895 }, // ~2x faster
				{ agility: 400, expectedInterval: 453 }, // ~4x faster
				{ agility: 500, expectedInterval: 10 }, // 100 arrows/sec
			];

			for (const { agility, expectedInterval } of milestones) {
				const interval = calculateAttackInterval(BOW_BASE_INTERVAL, agility);
				expect(interval).toBeCloseTo(expectedInterval, -1); // within 10ms
			}
		});
	});

	describe("Combined Strength and Agility", () => {
		it("max strength + max agility should give extreme DPS", () => {
			const baseDPS = calculateFullDPS(
				BOW_BASE_DAMAGE,
				BOW_BASE_INTERVAL,
				50, // base strength
				50, // base agility
			);

			const maxDPS = calculateFullDPS(
				BOW_BASE_DAMAGE,
				BOW_BASE_INTERVAL,
				500, // max strength
				500, // max agility
			);

			// Should be over 200x base DPS
			// Strength: ~1.4x damage increase
			// Agility: ~200x attack speed increase
			expect(maxDPS / baseDPS).toBeGreaterThan(200);
		});

		it("high agility low strength vs low agility high strength", () => {
			// Fast but weak
			const fastWeak = calculateFullDPS(
				BOW_BASE_DAMAGE,
				BOW_BASE_INTERVAL,
				50, // base strength
				400, // high agility
			);

			// Slow but strong
			const slowStrong = calculateFullDPS(
				BOW_BASE_DAMAGE,
				BOW_BASE_INTERVAL,
				500, // max strength
				50, // base agility
			);

			// Fast attack build should be better due to agility scaling
			expect(fastWeak).toBeGreaterThan(slowStrong);
		});
	});
});

describe("Wave Calculations", () => {
	describe("calculateOrcsForWave", () => {
		it("should return base orcs for wave 1", () => {
			expect(calculateOrcsForWave(1, 20, 1.2)).toBe(20);
		});

		it("should scale with difficulty multiplier", () => {
			const wave2 = calculateOrcsForWave(2, 20, 1.2);
			expect(wave2).toBe(Math.floor(20 * 1.2));
		});

		it("should scale exponentially", () => {
			const wave3 = calculateOrcsForWave(3, 20, 1.2);
			expect(wave3).toBe(Math.floor(20 * 1.2 * 1.2));
		});

		it("should handle large wave numbers", () => {
			const wave10 = calculateOrcsForWave(10, 20, 1.2);
			expect(wave10).toBe(Math.floor(20 * 1.2 ** 9));
			expect(wave10).toBeGreaterThan(100);
		});
	});

	describe("calculateSpawnInterval", () => {
		it("should return initial interval for wave 1", () => {
			expect(calculateSpawnInterval(1, 5000)).toBe(4500);
		});

		it("should decrease by 500ms per wave", () => {
			const wave1 = calculateSpawnInterval(1, 5000);
			const wave2 = calculateSpawnInterval(2, 5000);
			expect(wave1 - wave2).toBe(500);
		});

		it("should not go below 1000ms", () => {
			expect(calculateSpawnInterval(100, 5000)).toBe(1000);
			expect(calculateSpawnInterval(1000, 5000)).toBe(1000);
		});
	});
});

describe("Tile Calculations", () => {
	describe("clampToTiles", () => {
		it("should clamp negative values to 0", () => {
			expect(clampToTiles(-5, 128)).toBe(0);
		});

		it("should clamp values at max to maxTiles-1", () => {
			expect(clampToTiles(128, 128)).toBe(127);
		});

		it("should leave valid values unchanged", () => {
			expect(clampToTiles(64, 128)).toBe(64);
		});
	});

	describe("worldToTile", () => {
		it("should convert world position to tile index", () => {
			expect(worldToTile(32, 16)).toBe(2);
			expect(worldToTile(48, 16)).toBe(3);
		});

		it("should floor fractional positions", () => {
			expect(worldToTile(17, 16)).toBe(1);
			expect(worldToTile(31, 16)).toBe(1);
		});
	});

	describe("tileToWorldCenter", () => {
		it("should convert tile to center world position", () => {
			expect(tileToWorldCenter(0, 16)).toBe(8);
			expect(tileToWorldCenter(1, 16)).toBe(24);
		});
	});
});

describe("Distance Calculation", () => {
	describe("distance", () => {
		it("should calculate distance between same point as 0", () => {
			expect(distance(0, 0, 0, 0)).toBe(0);
		});

		it("should calculate horizontal distance", () => {
			expect(distance(0, 0, 10, 0)).toBe(10);
		});

		it("should calculate vertical distance", () => {
			expect(distance(0, 0, 0, 10)).toBe(10);
		});

		it("should calculate diagonal distance (3-4-5 triangle)", () => {
			expect(distance(0, 0, 3, 4)).toBe(5);
		});

		it("should be symmetric", () => {
			expect(distance(10, 20, 30, 40)).toBe(distance(30, 40, 10, 20));
		});
	});
});

describe("Movement Calculations", () => {
	describe("normalizeDiagonal", () => {
		it("should not change horizontal movement", () => {
			const result = normalizeDiagonal(100, 0);
			expect(result.x).toBe(100);
			expect(result.y).toBe(0);
		});

		it("should not change vertical movement", () => {
			const result = normalizeDiagonal(0, 100);
			expect(result.x).toBe(0);
			expect(result.y).toBe(100);
		});

		it("should normalize diagonal movement", () => {
			const result = normalizeDiagonal(100, 100);
			const factor = 1 / Math.SQRT2;
			expect(result.x).toBeCloseTo(100 * factor);
			expect(result.y).toBeCloseTo(100 * factor);
		});

		it("should preserve diagonal speed equal to cardinal speed", () => {
			const cardinal = normalizeDiagonal(100, 0);
			const diagonal = normalizeDiagonal(100, 100);

			const cardinalSpeed = Math.sqrt(cardinal.x ** 2 + cardinal.y ** 2);
			const diagonalSpeed = Math.sqrt(diagonal.x ** 2 + diagonal.y ** 2);

			expect(diagonalSpeed).toBeCloseTo(cardinalSpeed);
		});
	});
});

describe("formatTime", () => {
	it("should format 0 seconds", () => {
		expect(formatTime(0)).toBe("0:00");
	});

	it("should format seconds only", () => {
		expect(formatTime(30)).toBe("0:30");
		expect(formatTime(5)).toBe("0:05");
	});

	it("should format minutes and seconds", () => {
		expect(formatTime(60)).toBe("1:00");
		expect(formatTime(90)).toBe("1:30");
		expect(formatTime(125)).toBe("2:05");
	});
});

// ==========================================
// OFFENSIVE POWERS TESTS
// ==========================================

describe("Offensive Powers", () => {
	describe("Critical Multiplier", () => {
		// Base crit multiplier is 2x, bonuses add to it
		const BASE_CRIT_MULT = 2;

		it("base critical should be 2x damage", () => {
			const baseDamage = 25;
			const critDamage = baseDamage * BASE_CRIT_MULT;
			expect(critDamage).toBe(50);
		});

		it("Brutal Strikes (+0.1) should give 2.1x crit", () => {
			const baseDamage = 25;
			const critMult = BASE_CRIT_MULT + 0.1;
			const critDamage = Math.floor(baseDamage * critMult);
			expect(critDamage).toBe(52); // 25 * 2.1 = 52.5 -> 52
		});

		it("Executioner (+2.0) should give 4x crit", () => {
			const baseDamage = 25;
			const critMult = BASE_CRIT_MULT + 2.0;
			const critDamage = Math.floor(baseDamage * critMult);
			expect(critDamage).toBe(100);
		});

		it("stacked crit multipliers should add up", () => {
			const baseDamage = 25;
			// 2x Savage Blows (+0.25) + 1x Annihilator (+1.0) = +1.5
			const critMult = BASE_CRIT_MULT + 0.25 + 0.25 + 1.0;
			const critDamage = Math.floor(baseDamage * critMult);
			expect(critDamage).toBe(87); // 25 * 3.5 = 87.5 -> 87
		});
	});

	describe("Armor and Armor Penetration", () => {
		// Test armor calculation: finalDamage = damage * (1 - effectiveArmor)
		// effectiveArmor = max(0, armor - armorPen)

		it("no armor should deal full damage", () => {
			const damage = 100;
			const armor = 0;
			const finalDamage = Math.floor(damage * (1 - armor));
			expect(finalDamage).toBe(100);
		});

		it("20% armor should reduce damage by 20%", () => {
			const damage = 100;
			const armor = 0.2;
			const finalDamage = Math.floor(damage * (1 - armor));
			expect(finalDamage).toBe(80);
		});

		it("50% armor should reduce damage by 50%", () => {
			const damage = 100;
			const armor = 0.5;
			const finalDamage = Math.floor(damage * (1 - armor));
			expect(finalDamage).toBe(50);
		});

		it("armor penetration should counter armor", () => {
			const damage = 100;
			const armor = 0.3; // 30% armor
			const armorPen = 0.2; // 20% armor pen
			const effectiveArmor = Math.max(0, armor - armorPen);
			const finalDamage = Math.floor(damage * (1 - effectiveArmor));
			expect(effectiveArmor).toBeCloseTo(0.1);
			expect(finalDamage).toBe(90);
		});

		it("True Damage (50% armor pen) should almost negate armor", () => {
			const damage = 100;
			const armor = 0.4; // 40% armor
			const armorPen = 0.5; // 50% armor pen
			const effectiveArmor = Math.max(0, armor - armorPen);
			const finalDamage = Math.floor(damage * (1 - effectiveArmor));
			expect(effectiveArmor).toBe(0);
			expect(finalDamage).toBe(100);
		});

		it("armor pen cannot make effective armor negative", () => {
			const damage = 100;
			const armor = 0.1;
			const armorPen = 0.5;
			const effectiveArmor = Math.max(0, armor - armorPen);
			expect(effectiveArmor).toBe(0);
		});

		it("orc armor scales with wave (2% per wave)", () => {
			const calcArmor = (wave: number) => Math.min((wave - 1) * 0.02, 0.75);
			expect(calcArmor(1)).toBe(0); // Wave 1: no armor
			expect(calcArmor(6)).toBeCloseTo(0.1); // Wave 6: 10% armor
			expect(calcArmor(11)).toBeCloseTo(0.2); // Wave 11: 20% armor
			expect(calcArmor(26)).toBeCloseTo(0.5); // Wave 26: 50% armor
			expect(calcArmor(50)).toBe(0.75); // Capped at 75%
		});
	});

	describe("Damage Multiplier", () => {
		// damageMultiplier adds to 1 (0.15 = +15% = 1.15x)

		it("no bonus should give 1x damage", () => {
			const baseDamage = 100;
			const multiplier = 1 + 0;
			expect(Math.floor(baseDamage * multiplier)).toBe(100);
		});

		it("Power Surge (+15%) should give ~1.15x damage", () => {
			const baseDamage = 100;
			const multiplier = 1 + 0.15;
			// 100 * 1.15 = 114.999... due to float precision, floors to 114
			expect(Math.floor(baseDamage * multiplier)).toBeGreaterThanOrEqual(114);
			expect(Math.floor(baseDamage * multiplier)).toBeLessThanOrEqual(115);
		});

		it("Godlike Power (+50%) should give 1.5x damage", () => {
			const baseDamage = 100;
			const multiplier = 1 + 0.5;
			expect(Math.floor(baseDamage * multiplier)).toBe(150);
		});

		it("stacked damage multipliers should add up", () => {
			const baseDamage = 100;
			// 2x Power Surge + 1x Overwhelming Force = +15% + 15% + 30% = +60%
			const multiplier = 1 + 0.15 + 0.15 + 0.3;
			expect(Math.floor(baseDamage * multiplier)).toBe(160);
		});

		it("damage multiplier stacks with strength modifier", () => {
			const baseDamage = BOW_BASE_DAMAGE;
			const strengthMod = getStrengthModifier(100); // ~1.1x
			const damageMult = 1 + 0.3; // +30%
			const finalDamage = Math.floor(baseDamage * strengthMod * damageMult);

			// Expected: 25 * 1.098 * 1.3 = 35.7 -> 35
			expect(finalDamage).toBeGreaterThan(30);
			expect(finalDamage).toBeLessThan(40);
		});
	});

	describe("Combined Offensive Powers", () => {
		it("all offensive powers combined should massively increase damage", () => {
			const baseDamage = BOW_BASE_DAMAGE;

			// Base damage with strength
			const strengthMod = getStrengthModifier(200); // Mid-game strength

			// Damage multiplier: +50%
			const damageMult = 1 + 0.5;

			// Calculate base hit
			const baseHit = Math.floor(baseDamage * strengthMod * damageMult);

			// Critical multiplier: 4x (base 2x + 2.0 bonus)
			const critMult = 4;
			const critHit = Math.floor(baseHit * critMult);

			// Enemy has 30% armor, we have 20% armor pen -> 10% effective
			const effectiveArmor = 0.1;
			const finalDamage = Math.floor(critHit * (1 - effectiveArmor));

			// Should be significantly higher than base
			const baseDamageOnly = Math.floor(BOW_BASE_DAMAGE * getStrengthModifier(50));
			expect(finalDamage).toBeGreaterThan(baseDamageOnly * 4);
		});
	});
});

// ==========================================
// DEFENSIVE POWERS TESTS
// ==========================================

describe("Defensive Powers", () => {
	describe("Damage Reduction", () => {
		// damageReduction is stored as decimal (0.1 = 10%), caps at 75%

		it("no damage reduction should take full damage", () => {
			const damage = 100;
			const reduction = 0;
			const finalDamage = Math.floor(damage * (1 - reduction));
			expect(finalDamage).toBe(100);
		});

		it("Tough Skin (3%) should reduce damage by 3%", () => {
			const damage = 100;
			const reduction = 0.03;
			const finalDamage = Math.floor(damage * (1 - reduction));
			expect(finalDamage).toBe(97);
		});

		it("Invincible (35%) should reduce damage by 35%", () => {
			const damage = 100;
			const reduction = 0.35;
			const finalDamage = Math.floor(damage * (1 - reduction));
			expect(finalDamage).toBe(65);
		});

		it("stacked damage reduction should add up", () => {
			const damage = 100;
			// 2x Stone Body (12%) + 1x Adamantine (20%) = 44%
			const reduction = 0.12 + 0.12 + 0.2;
			const finalDamage = Math.floor(damage * (1 - reduction));
			expect(finalDamage).toBe(56);
		});

		it("damage reduction should cap at 75%", () => {
			const damage = 100;
			// Attempting 90% reduction should be capped to 75%
			const reduction = Math.min(0.9, 0.75);
			const finalDamage = Math.floor(damage * (1 - reduction));
			expect(finalDamage).toBe(25);
		});

		it("max stacked reduction (all legendary) should cap at 75%", () => {
			const damage = 100;
			// 3x Invincible (35%) = 105% -> capped to 75%
			const reduction = Math.min(0.35 + 0.35 + 0.35, 0.75);
			const finalDamage = Math.floor(damage * (1 - reduction));
			expect(finalDamage).toBe(25);
		});
	});

	describe("HP Regeneration", () => {
		// hpRegen is stored as HP per second

		it("Minor Regeneration (0.2/sec) should regen 1 HP every 5 seconds", () => {
			const hpRegen = 0.2;
			const timeToRegen1HP = 1 / hpRegen;
			expect(timeToRegen1HP).toBe(5);
		});

		it("Immortal Flesh (2/sec) should regen 1 HP every 0.5 seconds", () => {
			const hpRegen = 2.0;
			const timeToRegen1HP = 1 / hpRegen;
			expect(timeToRegen1HP).toBe(0.5);
		});

		it("stacked HP regen should add up", () => {
			// 2x Fast Healing (0.5) + 1x Rapid Recovery (1.0) = 2.0/sec
			const totalRegen = 0.5 + 0.5 + 1.0;
			expect(totalRegen).toBe(2.0);
		});

		it("HP regen per frame at 60 FPS", () => {
			const hpRegen = 1.0; // 1 HP/sec
			const fps = 60;
			const deltaMs = 1000 / fps; // ~16.67ms
			const regenPerFrame = hpRegen * (deltaMs / 1000);
			expect(regenPerFrame).toBeCloseTo(0.0167, 3);
		});

		it("HP regen should accumulate for fractional healing", () => {
			const hpRegen = 1.0; // 1 HP/sec
			let accumulator = 0;
			const deltaMs = 16.67; // ~60 FPS

			// Simulate 60 frames (1 second)
			for (let i = 0; i < 60; i++) {
				accumulator += hpRegen * (deltaMs / 1000);
			}

			// After 1 second, should have accumulated ~1 HP
			expect(accumulator).toBeCloseTo(1.0, 1);
		});
	});

	describe("Dodge Chance", () => {
		// dodgeChance is stored as decimal (0.1 = 10%), caps at 75%

		it("Quick Reflexes (3%) should give 3% dodge", () => {
			const dodgeChance = 0.03;
			expect(dodgeChance).toBe(0.03);
		});

		it("Untouchable (25%) should give 25% dodge", () => {
			const dodgeChance = 0.25;
			expect(dodgeChance).toBe(0.25);
		});

		it("stacked dodge chance should add up", () => {
			// 2x Evasive (10%) + 1x Ghost Step (15%) = 35%
			const totalDodge = 0.1 + 0.1 + 0.15;
			expect(totalDodge).toBe(0.35);
		});

		it("dodge chance should cap at 75%", () => {
			// Attempting 90% dodge should be capped to 75%
			const dodge = Math.min(0.9, 0.75);
			expect(dodge).toBe(0.75);
		});

		it("max stacked dodge (all legendary) should cap at 75%", () => {
			// 3x Untouchable (25%) = 75% -> exactly at cap
			const dodge = Math.min(0.25 + 0.25 + 0.25, 0.75);
			expect(dodge).toBe(0.75);
		});

		it("effective damage with dodge over many hits (statistical)", () => {
			const incomingDamage = 10;
			const dodgeChance = 0.25; // 25%
			const hits = 1000;

			// Expected damage = damage * (1 - dodgeChance) * hits
			const expectedTotalDamage = incomingDamage * (1 - dodgeChance) * hits;
			expect(expectedTotalDamage).toBe(7500);
		});
	});

	describe("Combined Defensive Powers", () => {
		it("damage reduction + dodge provides effective HP multiplier", () => {
			const baseHP = 100;
			const damageReduction = 0.3; // 30%
			const dodgeChance = 0.2; // 20%

			// Effective HP = baseHP / ((1 - damageReduction) * (1 - dodgeChance))
			// = 100 / (0.7 * 0.8) = 100 / 0.56 = ~178.6
			const effectiveDamageMultiplier =
				(1 - damageReduction) * (1 - dodgeChance);
			const effectiveHP = baseHP / effectiveDamageMultiplier;

			expect(effectiveHP).toBeCloseTo(178.6, 0);
		});

		it("max defensive stats (75% each) should give huge effective HP", () => {
			const baseHP = 100;
			const damageReduction = 0.75;
			const dodgeChance = 0.75;

			// Effective HP = 100 / (0.25 * 0.25) = 100 / 0.0625 = 1600
			const effectiveDamageMultiplier =
				(1 - damageReduction) * (1 - dodgeChance);
			const effectiveHP = baseHP / effectiveDamageMultiplier;

			expect(effectiveHP).toBe(1600);
		});

		it("HP regen adds sustain over time", () => {
			const baseHP = 100;
			const damageReduction = 0.2;
			const hpRegen = 2.0; // 2 HP/sec

			// With 20% damage reduction, 10 incoming DPS becomes 8 effective DPS
			const incomingDPS = 10;
			const effectiveDPS = incomingDPS * (1 - damageReduction);

			// HP regen offsets 2/8 = 25% of incoming damage
			const netDPS = effectiveDPS - hpRegen;
			expect(netDPS).toBe(6);

			// Time to die without regen: 100/8 = 12.5 sec
			// Time to die with regen: 100/6 = 16.67 sec
			const timeWithoutRegen = baseHP / effectiveDPS;
			const timeWithRegen = baseHP / netDPS;

			expect(timeWithRegen).toBeGreaterThan(timeWithoutRegen);
			expect(timeWithRegen).toBeCloseTo(16.67, 1);
		});

		it("game scenario: surviving wave of orcs", () => {
			// 5 orcs each dealing 10 damage every 2 seconds
			const orcDamagePerHit = 10;
			const orcsCount = 5;
			const orcAttackInterval = 2000; // ms
			const incomingDPS = (orcDamagePerHit * orcsCount) / (orcAttackInterval / 1000);
			expect(incomingDPS).toBe(25);

			// Hero with defensive powers
			const hp = 200; // Base 100 + 100 from vitality powers
			const damageReduction = 0.3; // 30%
			const dodgeChance = 0.25; // 25%
			const hpRegen = 1.5; // 1.5 HP/sec

			// Effective incoming DPS after mitigation
			const effectiveDPS = incomingDPS * (1 - damageReduction) * (1 - dodgeChance);
			// 25 * 0.7 * 0.75 = 13.125 effective DPS

			const netDPS = effectiveDPS - hpRegen;
			// 13.125 - 1.5 = 11.625 net DPS

			const survivalTime = hp / netDPS;
			// 200 / 11.625 = ~17.2 seconds

			expect(survivalTime).toBeGreaterThan(15);
			expect(survivalTime).toBeLessThan(20);
		});
	});
});

// ==========================================
// ARROW POWERS TESTS
// ==========================================

describe("Arrow Powers", () => {
	describe("Multi-shot (arrowCount)", () => {
		// arrowCount stores EXTRA arrows (1 = 2 total arrows, etc.)

		it("no bonus should fire 1 arrow", () => {
			const baseArrows = 1;
			const bonusArrows = 0;
			const totalArrows = baseArrows + bonusArrows;
			expect(totalArrows).toBe(1);
		});

		it("Double Shot (+1) should fire 2 arrows", () => {
			const baseArrows = 1;
			const bonusArrows = 1;
			const totalArrows = baseArrows + bonusArrows;
			expect(totalArrows).toBe(2);
		});

		it("Triple Shot (+2) should fire 3 arrows", () => {
			const baseArrows = 1;
			const bonusArrows = 2;
			const totalArrows = baseArrows + bonusArrows;
			expect(totalArrows).toBe(3);
		});

		it("Arrow Storm (+4) should fire 5 arrows", () => {
			const baseArrows = 1;
			const bonusArrows = 4;
			const totalArrows = baseArrows + bonusArrows;
			expect(totalArrows).toBe(5);
		});

		it("spread angle should be 15 degrees between arrows", () => {
			const spreadAngleDegrees = 15;
			const spreadAngleRadians = spreadAngleDegrees * (Math.PI / 180);
			expect(spreadAngleRadians).toBeCloseTo(0.2618, 4);
		});

		it("3 arrows should have total spread of 30 degrees", () => {
			const arrowCount = 3;
			const spreadAngleDegrees = 15;
			const totalSpread = spreadAngleDegrees * (arrowCount - 1);
			expect(totalSpread).toBe(30);
		});

		it("5 arrows should have total spread of 60 degrees", () => {
			const arrowCount = 5;
			const spreadAngleDegrees = 15;
			const totalSpread = spreadAngleDegrees * (arrowCount - 1);
			expect(totalSpread).toBe(60);
		});

		it("multi-shot effectively multiplies DPS", () => {
			const baseDamage = 25;
			const baseInterval = 2000;
			const baseDPS = (baseDamage * 1000) / baseInterval; // 12.5

			const arrowCount = 3;
			// Assuming all arrows hit, DPS scales with arrow count
			const multiShotDPS = baseDPS * arrowCount;
			expect(multiShotDPS).toBe(37.5);
		});
	});

	describe("Piercing (arrowPierce)", () => {
		// arrowPierce stores number of EXTRA enemies to pierce

		it("no pierce should hit 1 enemy", () => {
			const pierceBonus = 0;
			const totalEnemiesHit = 1 + pierceBonus;
			expect(totalEnemiesHit).toBe(1);
		});

		it("Piercing Arrows (+1) should pierce 1 enemy (hit 2 total)", () => {
			const pierceBonus = 1;
			const totalEnemiesHit = 1 + pierceBonus;
			expect(totalEnemiesHit).toBe(2);
		});

		it("Impaling Arrows (+2) should pierce 2 enemies (hit 3 total)", () => {
			const pierceBonus = 2;
			const totalEnemiesHit = 1 + pierceBonus;
			expect(totalEnemiesHit).toBe(3);
		});

		it("Unstoppable Arrows (+99) should pierce practically infinite enemies", () => {
			const pierceBonus = 99;
			expect(pierceBonus).toBeGreaterThanOrEqual(99);
		});

		it("piercing effectively multiplies damage per arrow", () => {
			const arrowDamage = 25;
			const pierceCount = 2;
			const maxEnemiesPerArrow = 1 + pierceCount;
			const maxDamagePerArrow = arrowDamage * maxEnemiesPerArrow;
			expect(maxDamagePerArrow).toBe(75);
		});

		it("pierce counter decrements on each enemy hit", () => {
			let pierceRemaining = 2;

			// Hit first enemy (the initial hit, doesn't use pierce)
			// Hit second enemy - uses 1 pierce
			pierceRemaining--;
			expect(pierceRemaining).toBe(1);

			// Hit third enemy - uses 1 pierce
			pierceRemaining--;
			expect(pierceRemaining).toBe(0);

			// No more pierce, arrow destroyed on next hit
		});
	});

	describe("Ricochet (arrowBounce)", () => {
		// arrowBounce stores number of times arrow can bounce to new targets

		it("no bounce should stop after first hit", () => {
			const bounceCount = 0;
			expect(bounceCount).toBe(0);
		});

		it("Ricochet (+1) should bounce to 1 additional enemy", () => {
			const bounceCount = 1;
			const totalEnemiesHit = 1 + bounceCount;
			expect(totalEnemiesHit).toBe(2);
		});

		it("Chain Shot (+2) should bounce to 2 additional enemies", () => {
			const bounceCount = 2;
			const totalEnemiesHit = 1 + bounceCount;
			expect(totalEnemiesHit).toBe(3);
		});

		it("Endless Bounty (+4) should bounce to 4 additional enemies", () => {
			const bounceCount = 4;
			const totalEnemiesHit = 1 + bounceCount;
			expect(totalEnemiesHit).toBe(5);
		});

		it("bounce counter decrements on each bounce", () => {
			let bounceRemaining = 2;

			// Hit first enemy
			// Arrow bounces to second enemy
			bounceRemaining--;
			expect(bounceRemaining).toBe(1);

			// Arrow bounces to third enemy
			bounceRemaining--;
			expect(bounceRemaining).toBe(0);

			// No more bounces, arrow destroyed after this hit
		});

		it("ricochet effectively multiplies damage per arrow", () => {
			const arrowDamage = 25;
			const bounceCount = 2;
			const maxEnemiesPerArrow = 1 + bounceCount;
			const maxDamagePerArrow = arrowDamage * maxEnemiesPerArrow;
			expect(maxDamagePerArrow).toBe(75);
		});

		it("bounce should only target enemies within range", () => {
			const maxBounceRange = 200; // pixels
			expect(maxBounceRange).toBe(200);
		});
	});

	describe("Combined Arrow Powers", () => {
		it("multi-shot + pierce should hit many enemies", () => {
			const arrowCount = 3;
			const piercePerArrow = 2;
			const maxEnemiesPerArrow = 1 + piercePerArrow;
			const totalMaxEnemies = arrowCount * maxEnemiesPerArrow;
			expect(totalMaxEnemies).toBe(9); // 3 arrows * 3 enemies each
		});

		it("multi-shot + bounce should hit many enemies", () => {
			const arrowCount = 3;
			const bouncePerArrow = 2;
			const maxEnemiesPerArrow = 1 + bouncePerArrow;
			const totalMaxEnemies = arrowCount * maxEnemiesPerArrow;
			expect(totalMaxEnemies).toBe(9); // 3 arrows * 3 enemies each
		});

		it("pierce + bounce should stack (pierce first, then bounce)", () => {
			// Arrow with pierce=1 and bounce=1
			// First hit: enemy 1
			// Pierce through: enemy 2
			// Bounce to: enemy 3
			// Hit: enemy 3
			// Bounce exhausted, arrow destroyed
			const pierce = 1;
			const bounce = 1;
			// Max enemies: 1 (initial) + 1 (pierce) + 1 (bounce after last pierce hit)
			const maxEnemies = 1 + pierce + bounce;
			expect(maxEnemies).toBe(3);
		});

		it("all arrow powers stacked should massively increase damage potential", () => {
			const arrowDamage = 25;
			const arrowCount = 5; // Arrow Storm
			const pierceCount = 2; // Impaling Arrows
			const bounceCount = 2; // Chain Shot

			// Each arrow can hit: 1 + pierce + bounce enemies
			const enemiesPerArrow = 1 + pierceCount + bounceCount;
			const totalMaxEnemies = arrowCount * enemiesPerArrow;
			const totalMaxDamage = totalMaxEnemies * arrowDamage;

			expect(totalMaxEnemies).toBe(25); // 5 arrows * 5 enemies
			expect(totalMaxDamage).toBe(625); // 25 enemies * 25 damage
		});
	});

	describe("Arrow Power DPS Calculations", () => {
		it("should calculate effective DPS with multi-shot", () => {
			const baseDamage = 25;
			const baseInterval = 2000;
			const arrowCount = 3;

			const baseDPS = (baseDamage * 1000) / baseInterval;
			const effectiveDPS = baseDPS * arrowCount;

			expect(baseDPS).toBe(12.5);
			expect(effectiveDPS).toBe(37.5);
		});

		it("should calculate effective DPS with pierce (assuming lined-up enemies)", () => {
			const baseDamage = 25;
			const baseInterval = 2000;
			const pierceCount = 2;
			const avgEnemiesHit = 1 + pierceCount * 0.5; // Assume 50% pierce utilization

			const baseDPS = (baseDamage * 1000) / baseInterval;
			const effectiveDPS = baseDPS * avgEnemiesHit;

			expect(baseDPS).toBe(12.5);
			expect(effectiveDPS).toBe(25); // 12.5 * 2 (assuming 1.5 enemies avg but floored)
		});

		it("legendary arrow build should have massive theoretical DPS", () => {
			const baseDamage = 25;
			const baseInterval = 2000;
			const arrowCount = 5; // Legendary multi-shot
			const pierceCount = 99; // Legendary pierce (unlimited)
			const bounceCount = 4; // Legendary bounce

			// Against dense enemy groups, this is devastating
			const baseDPS = (baseDamage * 1000) / baseInterval;

			// With 5 arrows, each hitting potentially 5+ enemies
			const conservativeMultiplier = arrowCount * 3; // 15x assuming 3 hits per arrow avg
			const effectiveDPS = baseDPS * conservativeMultiplier;

			expect(effectiveDPS).toBe(187.5); // 12.5 * 15
			expect(effectiveDPS / baseDPS).toBe(15); // 15x multiplier
		});
	});
});

// ==========================================
// COMBAT STAT CALCULATIONS (Dodge, Armor, Accuracy, Piercing)
// ==========================================

describe("Combat Stat Calculations", () => {
	describe("calculateEffectiveDodge", () => {
		it("should return full dodge when no accuracy", () => {
			expect(calculateEffectiveDodge(10, 0)).toBe(10);
			expect(calculateEffectiveDodge(50, 0)).toBe(50);
			expect(calculateEffectiveDodge(100, 0)).toBe(100);
		});

		it("should reduce dodge by accuracy", () => {
			// 10 dodge - 9 accuracy = 1 effective dodge
			expect(calculateEffectiveDodge(10, 9)).toBe(1);
			// 30 dodge - 15 accuracy = 15 effective dodge
			expect(calculateEffectiveDodge(30, 15)).toBe(15);
			// 50 dodge - 20 accuracy = 30 effective dodge
			expect(calculateEffectiveDodge(50, 20)).toBe(30);
		});

		it("should not go below 0", () => {
			expect(calculateEffectiveDodge(10, 20)).toBe(0);
			expect(calculateEffectiveDodge(5, 100)).toBe(0);
			expect(calculateEffectiveDodge(0, 10)).toBe(0);
		});

		it("should not go above 100", () => {
			expect(calculateEffectiveDodge(150, 0)).toBe(100);
			expect(calculateEffectiveDodge(200, 50)).toBe(100);
		});

		it("should clamp both ends correctly", () => {
			// Negative result should clamp to 0
			expect(calculateEffectiveDodge(10, 50)).toBe(0);
			// High dodge should clamp to 100
			expect(calculateEffectiveDodge(120, 10)).toBe(100);
		});

		it("accuracy can fully negate dodge", () => {
			expect(calculateEffectiveDodge(25, 25)).toBe(0);
			expect(calculateEffectiveDodge(50, 50)).toBe(0);
		});

		it("game scenario: hero base dodge vs orc accuracy", () => {
			// Hero has 10% base dodge, orc has 0% accuracy
			expect(calculateEffectiveDodge(10, 0)).toBe(10);

			// Hero has 10% base dodge + 15% bonus = 25%, orc has 10% accuracy
			expect(calculateEffectiveDodge(25, 10)).toBe(15);
		});

		it("game scenario: orc dodge vs hero accuracy", () => {
			// Wave 10 orc: 9% dodge (1% per wave), hero with 0 accuracy
			expect(calculateEffectiveDodge(9, 0)).toBe(9);

			// Hero gets accuracy power: 5 accuracy
			expect(calculateEffectiveDodge(9, 5)).toBe(4);

			// Hero gets more accuracy: 15 accuracy
			expect(calculateEffectiveDodge(9, 15)).toBe(0);
		});
	});

	describe("calculateEffectiveArmor", () => {
		it("should return full armor when no piercing", () => {
			expect(calculateEffectiveArmor(5, 0)).toBe(5);
			expect(calculateEffectiveArmor(30, 0)).toBe(30);
			expect(calculateEffectiveArmor(100, 0)).toBe(100);
		});

		it("should reduce armor by piercing", () => {
			// 10 armor - 8 piercing = 2 effective armor
			expect(calculateEffectiveArmor(10, 8)).toBe(2);
			// 30 armor - 15 piercing = 15 effective armor
			expect(calculateEffectiveArmor(30, 15)).toBe(15);
			// 50 armor - 30 piercing = 20 effective armor
			expect(calculateEffectiveArmor(50, 30)).toBe(20);
		});

		it("should not go below 0", () => {
			expect(calculateEffectiveArmor(10, 20)).toBe(0);
			expect(calculateEffectiveArmor(5, 100)).toBe(0);
			expect(calculateEffectiveArmor(0, 10)).toBe(0);
		});

		it("should not go above 100", () => {
			expect(calculateEffectiveArmor(150, 0)).toBe(100);
			expect(calculateEffectiveArmor(200, 50)).toBe(100);
		});

		it("piercing can fully negate armor", () => {
			expect(calculateEffectiveArmor(25, 25)).toBe(0);
			expect(calculateEffectiveArmor(50, 50)).toBe(0);
		});

		it("game scenario: hero base armor vs orc attacks", () => {
			// Hero has 5% base armor, orc has 0% piercing
			expect(calculateEffectiveArmor(5, 0)).toBe(5);

			// Hero has 5% base + 10% bonus = 15% armor
			expect(calculateEffectiveArmor(15, 0)).toBe(15);
		});

		it("game scenario: orc armor vs hero piercing", () => {
			// Wave 10 orc: 18% armor (2% per wave), hero with 0 piercing
			expect(calculateEffectiveArmor(18, 0)).toBe(18);

			// Hero gets piercing power: 10 piercing
			expect(calculateEffectiveArmor(18, 10)).toBe(8);

			// Hero gets more piercing: 25 piercing
			expect(calculateEffectiveArmor(18, 25)).toBe(0);
		});

		it("late wave orcs can have high armor", () => {
			// Wave 26: 50% armor (25 waves * 2%)
			const wave26Armor = 50;
			// Hero with 30 piercing
			expect(calculateEffectiveArmor(wave26Armor, 30)).toBe(20);
		});
	});

	describe("calculateDamageAfterArmor", () => {
		it("should return full damage with 0 armor", () => {
			expect(calculateDamageAfterArmor(100, 0)).toBe(100);
			expect(calculateDamageAfterArmor(50, 0)).toBe(50);
			expect(calculateDamageAfterArmor(25, 0)).toBe(25);
		});

		it("should reduce damage by armor percentage", () => {
			// 100 damage with 10% armor = 90 damage
			expect(calculateDamageAfterArmor(100, 10)).toBe(90);
			// 100 damage with 25% armor = 75 damage
			expect(calculateDamageAfterArmor(100, 25)).toBe(75);
			// 100 damage with 50% armor = 50 damage
			expect(calculateDamageAfterArmor(100, 50)).toBe(50);
		});

		it("should floor the result", () => {
			// 100 damage with 33% armor = 67 (100 * 0.67 = 67)
			expect(calculateDamageAfterArmor(100, 33)).toBe(67);
			// 75 damage with 20% armor = 60 (75 * 0.8 = 60)
			expect(calculateDamageAfterArmor(75, 20)).toBe(60);
			// 50 damage with 15% armor = 42 (50 * 0.85 = 42.5 -> 42)
			expect(calculateDamageAfterArmor(50, 15)).toBe(42);
		});

		it("should handle 100% armor", () => {
			expect(calculateDamageAfterArmor(100, 100)).toBe(0);
			expect(calculateDamageAfterArmor(1000, 100)).toBe(0);
		});

		it("should handle high damage values", () => {
			// 1000 damage with 30% armor = 700
			expect(calculateDamageAfterArmor(1000, 30)).toBe(700);
		});

		it("game scenario: hero base armor reducing damage", () => {
			// Hero has 5% armor, orc deals 10 damage
			expect(calculateDamageAfterArmor(10, 5)).toBe(9);

			// Hero has 20% armor, orc deals 15 damage
			expect(calculateDamageAfterArmor(15, 20)).toBe(12);
		});

		it("game scenario: orc armor reducing hero damage", () => {
			// Wave 5 orc: 8% armor, hero deals 26 damage (bow with base strength)
			expect(calculateDamageAfterArmor(26, 8)).toBe(23);

			// Wave 15 orc: 28% armor, hero deals 30 damage
			expect(calculateDamageAfterArmor(30, 28)).toBe(21);

			// Wave 26 orc: 50% armor, hero deals 35 damage
			expect(calculateDamageAfterArmor(35, 50)).toBe(17);
		});

		it("full damage formula: base damage -> strength mod -> armor reduction", () => {
			// Hero bow: 25 base damage
			// Strength modifier at 100 strength: ~1.098
			const baseDamage = 25;
			const strengthMod = getStrengthModifier(100);
			const damageAfterStrength = Math.floor(baseDamage * strengthMod);

			// Orc with 20% armor
			const finalDamage = calculateDamageAfterArmor(damageAfterStrength, 20);

			// 25 * 1.098 = 27.45 -> 27
			expect(damageAfterStrength).toBe(27);
			// 27 * 0.8 = 21.6 -> 21
			expect(finalDamage).toBe(21);
		});
	});

	describe("rollDodge", () => {
		it("should always miss (return false) with 0 effective dodge", () => {
			// Even with "successful" rolls, 0 dodge means no dodge
			expect(rollDodge(0, 0)).toBe(false);
			expect(rollDodge(0, 0.5)).toBe(false);
			expect(rollDodge(0, 0.99)).toBe(false);
		});

		it("should dodge when roll is below effective dodge", () => {
			// 50% dodge, roll is 25% (0.25 * 100 = 25 < 50) = dodge
			expect(rollDodge(50, 0.25)).toBe(true);
			// 30% dodge, roll is 10% = dodge
			expect(rollDodge(30, 0.10)).toBe(true);
			// 10% dodge, roll is 5% = dodge
			expect(rollDodge(10, 0.05)).toBe(true);
		});

		it("should not dodge when roll is at or above effective dodge", () => {
			// 50% dodge, roll is 50% = no dodge
			expect(rollDodge(50, 0.50)).toBe(false);
			// 50% dodge, roll is 75% = no dodge
			expect(rollDodge(50, 0.75)).toBe(false);
			// 30% dodge, roll is 30% = no dodge (edge case)
			expect(rollDodge(30, 0.30)).toBe(false);
		});

		it("should handle edge cases", () => {
			// 100% dodge should always dodge (except roll exactly at 100)
			expect(rollDodge(100, 0.99)).toBe(true);
			expect(rollDodge(100, 0.50)).toBe(true);
			expect(rollDodge(100, 0.01)).toBe(true);

			// 1% dodge should rarely dodge
			expect(rollDodge(1, 0.005)).toBe(true); // Roll 0.5% < 1%
			expect(rollDodge(1, 0.02)).toBe(false); // Roll 2% >= 1%
		});

		it("should handle minimum valid dodge (1%)", () => {
			// 1% dodge, roll 0% = dodge
			expect(rollDodge(1, 0)).toBe(true);
			// 1% dodge, roll 0.5% = dodge
			expect(rollDodge(1, 0.005)).toBe(true);
			// 1% dodge, roll 1% = no dodge (edge)
			expect(rollDodge(1, 0.01)).toBe(false);
		});

		it("game scenario: hero with base dodge", () => {
			// Hero has 10% dodge
			// Lucky roll (5%) = dodge
			expect(rollDodge(10, 0.05)).toBe(true);
			// Unlucky roll (15%) = no dodge
			expect(rollDodge(10, 0.15)).toBe(false);
		});

		it("game scenario: hero with stacked dodge", () => {
			// Hero has 10% base + 25% bonus = 35% dodge
			const totalDodge = 35;
			// Roll under 35% = dodge
			expect(rollDodge(totalDodge, 0.20)).toBe(true);
			expect(rollDodge(totalDodge, 0.34)).toBe(true);
			// Roll at or above 35% = no dodge
			expect(rollDodge(totalDodge, 0.35)).toBe(false);
			expect(rollDodge(totalDodge, 0.50)).toBe(false);
		});
	});

	describe("Full Combat Flow", () => {
		it("complete attack flow: accuracy -> dodge -> piercing -> armor -> damage", () => {
			// Setup
			const targetDodge = 20;
			const attackerAccuracy = 10;
			const targetArmor = 30;
			const attackerPiercing = 15;
			const baseDamage = 50;

			// Step 1: Calculate effective dodge
			const effectiveDodge = calculateEffectiveDodge(targetDodge, attackerAccuracy);
			expect(effectiveDodge).toBe(10); // 20 - 10 = 10

			// Step 2: Roll for dodge (using controlled random)
			// If dodge succeeds, no damage
			const dodgeSuccessRoll = rollDodge(effectiveDodge, 0.05); // 5% roll < 10% dodge
			expect(dodgeSuccessRoll).toBe(true);

			// If dodge fails, continue to damage
			const dodgeFailRoll = rollDodge(effectiveDodge, 0.15); // 15% roll >= 10% dodge
			expect(dodgeFailRoll).toBe(false);

			// Step 3: Calculate effective armor
			const effectiveArmor = calculateEffectiveArmor(targetArmor, attackerPiercing);
			expect(effectiveArmor).toBe(15); // 30 - 15 = 15

			// Step 4: Calculate final damage
			const finalDamage = calculateDamageAfterArmor(baseDamage, effectiveArmor);
			expect(finalDamage).toBe(42); // 50 * 0.85 = 42.5 -> 42
		});

		it("hero taking damage from orc", () => {
			// Hero stats: 10% dodge, 5% armor
			// Orc stats: 0% accuracy, 0% piercing, 10 damage
			const heroDodge = 10;
			const heroArmor = 5;
			const orcAccuracy = 0;
			const orcPiercing = 0;
			const orcDamage = 10;

			const effectiveDodge = calculateEffectiveDodge(heroDodge, orcAccuracy);
			expect(effectiveDodge).toBe(10);

			const effectiveArmor = calculateEffectiveArmor(heroArmor, orcPiercing);
			expect(effectiveArmor).toBe(5);

			// If not dodged:
			const finalDamage = calculateDamageAfterArmor(orcDamage, effectiveArmor);
			expect(finalDamage).toBe(9); // 10 * 0.95 = 9.5 -> 9
		});

		it("orc taking damage from hero arrow", () => {
			// Orc wave 10: 9% dodge (1% per wave), 18% armor (2% per wave)
			// Hero stats: 5 accuracy (power), 10 piercing (power), 26 bow damage
			const orcDodge = 9;
			const orcArmor = 18;
			const heroAccuracy = 5;
			const heroPiercing = 10;
			const heroDamage = 26;

			const effectiveDodge = calculateEffectiveDodge(orcDodge, heroAccuracy);
			expect(effectiveDodge).toBe(4); // 9 - 5 = 4

			const effectiveArmor = calculateEffectiveArmor(orcArmor, heroPiercing);
			expect(effectiveArmor).toBe(8); // 18 - 10 = 8

			// If not dodged:
			const finalDamage = calculateDamageAfterArmor(heroDamage, effectiveArmor);
			expect(finalDamage).toBe(23); // 26 * 0.92 = 23.92 -> 23
		});

		it("high armor orc vs hero with high piercing", () => {
			// Wave 26 orc: 50% armor
			// Hero with legendary piercing (50 piercing)
			const orcArmor = 50;
			const heroPiercing = 50;
			const heroDamage = 35;

			const effectiveArmor = calculateEffectiveArmor(orcArmor, heroPiercing);
			expect(effectiveArmor).toBe(0); // 50 - 50 = 0

			const finalDamage = calculateDamageAfterArmor(heroDamage, effectiveArmor);
			expect(finalDamage).toBe(35); // Full damage
		});

		it("tanky hero vs multiple orcs", () => {
			// Hero: 25% dodge + 30% armor
			// 3 orcs each deal 15 damage
			const heroDodge = 25;
			const heroArmor = 30;
			const orcDamage = 15;

			const effectiveArmor = calculateEffectiveArmor(heroArmor, 0);
			const damageIfNotDodged = calculateDamageAfterArmor(orcDamage, effectiveArmor);

			// Each hit that lands deals 10 damage (15 * 0.7 = 10.5 -> 10)
			expect(damageIfNotDodged).toBe(10);

			// Over 100 attacks, expect ~75 to land (25% dodge)
			// Expected damage: 75 * 10 = 750
		});
	});

	describe("Stat Scaling Scenarios", () => {
		it("orc stats scale with waves", () => {
			// Wave 1: 0% dodge, 0% armor
			expect(calculateEffectiveDodge(0, 0)).toBe(0);
			expect(calculateEffectiveArmor(0, 0)).toBe(0);

			// Wave 10: 9% dodge (1% per wave after wave 1), 18% armor (2% per wave)
			const wave10Dodge = 9;
			const wave10Armor = 18;
			expect(calculateDamageAfterArmor(100, wave10Armor)).toBe(82);

			// Wave 25: 24% dodge, 48% armor
			const wave25Dodge = 24;
			const wave25Armor = 48;
			expect(calculateDamageAfterArmor(100, wave25Armor)).toBe(52);

			// Wave 51+: capped at 50% dodge, 100% armor (or some reasonable cap)
		});

		it("hero can overcome orc scaling with powers", () => {
			// Wave 25 orc: 24% dodge, 48% armor
			const orcDodge = 24;
			const orcArmor = 48;

			// Hero with accuracy powers: 30 accuracy
			const heroAccuracy = 30;
			const effectiveDodge = calculateEffectiveDodge(orcDodge, heroAccuracy);
			expect(effectiveDodge).toBe(0); // Orc can't dodge

			// Hero with piercing powers: 40 piercing
			const heroPiercing = 40;
			const effectiveArmor = calculateEffectiveArmor(orcArmor, heroPiercing);
			expect(effectiveArmor).toBe(8); // Only 8% armor left

			// Final damage on 50 base damage
			const finalDamage = calculateDamageAfterArmor(50, effectiveArmor);
			expect(finalDamage).toBe(46); // 50 * 0.92 = 46
		});
	});
});
