import { describe, expect, it } from "vitest";

// Mock window.location before importing GameConfig
Object.defineProperty(window, "location", {
	value: { search: "" },
	writable: true,
});

const { GAME_CONFIG } = await import("../src/config/GameConfig");

describe("GameConfig", () => {
	describe("map configuration", () => {
		it("should have valid map dimensions", () => {
			expect(GAME_CONFIG.map.widthInTiles).toBeGreaterThan(0);
			expect(GAME_CONFIG.map.heightInTiles).toBeGreaterThan(0);
			expect(GAME_CONFIG.map.tileSize).toBeGreaterThan(0);
		});

		it("should have power-of-2 friendly tile size", () => {
			expect([8, 16, 32, 64]).toContain(GAME_CONFIG.map.tileSize);
		});
	});

	describe("hero configuration", () => {
		it("should have positive health", () => {
			expect(GAME_CONFIG.hero.health).toBeGreaterThan(0);
		});

		it("should have positive move speed", () => {
			expect(GAME_CONFIG.hero.moveSpeed).toBeGreaterThan(0);
		});

		it("should have agility in valid range (1-100)", () => {
			expect(GAME_CONFIG.hero.agility).toBeGreaterThanOrEqual(1);
			expect(GAME_CONFIG.hero.agility).toBeLessThanOrEqual(100);
		});

		it("should have strength in valid range (1-100)", () => {
			expect(GAME_CONFIG.hero.strength).toBeGreaterThanOrEqual(1);
			expect(GAME_CONFIG.hero.strength).toBeLessThanOrEqual(100);
		});

		it("should have critical chance in valid range (0-100)", () => {
			expect(GAME_CONFIG.hero.critical).toBeGreaterThanOrEqual(0);
			expect(GAME_CONFIG.hero.critical).toBeLessThanOrEqual(100);
		});

		describe("bow configuration", () => {
			it("should have positive damage", () => {
				expect(GAME_CONFIG.hero.bow.damage).toBeGreaterThan(0);
			});

			it("should have positive range in tiles", () => {
				expect(GAME_CONFIG.hero.bow.range).toBeGreaterThan(0);
			});

			it("should have positive attack interval", () => {
				expect(GAME_CONFIG.hero.bow.interval).toBeGreaterThan(0);
			});

			it("should have positive arrow speed", () => {
				expect(GAME_CONFIG.hero.bow.arrowSpeed).toBeGreaterThan(0);
			});
		});

		describe("sword configuration", () => {
			it("should have positive damage", () => {
				expect(GAME_CONFIG.hero.sword.damage).toBeGreaterThan(0);
			});

			it("should have positive range in pixels", () => {
				expect(GAME_CONFIG.hero.sword.range).toBeGreaterThan(0);
			});

			it("should have positive attack interval", () => {
				expect(GAME_CONFIG.hero.sword.interval).toBeGreaterThan(0);
			});

			it("should have higher damage than bow (melee risk/reward)", () => {
				expect(GAME_CONFIG.hero.sword.damage).toBeGreaterThan(
					GAME_CONFIG.hero.bow.damage,
				);
			});
		});

		describe("hitbox configuration", () => {
			it("should have positive hitbox dimensions", () => {
				expect(GAME_CONFIG.hero.hitboxWidth).toBeGreaterThan(0);
				expect(GAME_CONFIG.hero.hitboxHeight).toBeGreaterThan(0);
			});

			it("should have positive attack hitbox dimensions", () => {
				expect(GAME_CONFIG.hero.attackHitboxWidth).toBeGreaterThan(0);
				expect(GAME_CONFIG.hero.attackHitboxHeight).toBeGreaterThan(0);
			});
		});
	});

	describe("orc configuration", () => {
		it("should have positive health", () => {
			expect(GAME_CONFIG.orc.health).toBeGreaterThan(0);
		});

		it("should have positive speed", () => {
			expect(GAME_CONFIG.orc.speed).toBeGreaterThan(0);
		});

		it("should be slower than hero", () => {
			expect(GAME_CONFIG.orc.speed).toBeLessThan(GAME_CONFIG.hero.moveSpeed);
		});

		it("should have positive damage", () => {
			expect(GAME_CONFIG.orc.damage).toBeGreaterThan(0);
		});

		it("should have positive attack cooldown", () => {
			expect(GAME_CONFIG.orc.attackCooldown).toBeGreaterThan(0);
		});

		it("should have positive knockback values", () => {
			expect(GAME_CONFIG.orc.knockbackForce).toBeGreaterThan(0);
			expect(GAME_CONFIG.orc.knockbackDuration).toBeGreaterThan(0);
		});

		it("should have attack range less than or equal to damage range", () => {
			expect(GAME_CONFIG.orc.attackRange).toBeLessThanOrEqual(
				GAME_CONFIG.orc.damageRange,
			);
		});
	});

	describe("wave configuration", () => {
		it("should have positive spawn interval", () => {
			expect(GAME_CONFIG.waves.initialSpawnInterval).toBeGreaterThan(0);
		});

		it("should have positive orcs per wave", () => {
			expect(GAME_CONFIG.waves.orcsPerWave).toBeGreaterThan(0);
		});

		it("should have difficulty multiplier greater than 1", () => {
			expect(GAME_CONFIG.waves.difficultyMultiplier).toBeGreaterThan(1);
		});

		it("should have positive wave duration", () => {
			expect(GAME_CONFIG.waves.waveDuration).toBeGreaterThan(0);
		});
	});

	describe("sprite configuration", () => {
		it("should have positive frame dimensions", () => {
			expect(GAME_CONFIG.sprites.frameWidth).toBeGreaterThan(0);
			expect(GAME_CONFIG.sprites.frameHeight).toBeGreaterThan(0);
		});

		it("should have square frames", () => {
			expect(GAME_CONFIG.sprites.frameWidth).toBe(
				GAME_CONFIG.sprites.frameHeight,
			);
		});
	});

	describe("loot configuration", () => {
		it("should have positive hitbox size", () => {
			expect(GAME_CONFIG.loot.hitboxSize).toBeGreaterThan(0);
		});

		it("should have max bags inventory between 1 and 99", () => {
			expect(GAME_CONFIG.loot.maxBagsInventory).toBeGreaterThanOrEqual(1);
			expect(GAME_CONFIG.loot.maxBagsInventory).toBeLessThanOrEqual(99);
		});

		it("should have max bags on field between 1 and 999", () => {
			expect(GAME_CONFIG.loot.maxBagsOnField).toBeGreaterThanOrEqual(1);
			expect(GAME_CONFIG.loot.maxBagsOnField).toBeLessThanOrEqual(999);
		});

		it("should have max bags on field greater than max inventory", () => {
			expect(GAME_CONFIG.loot.maxBagsOnField).toBeGreaterThan(
				GAME_CONFIG.loot.maxBagsInventory,
			);
		});
	});
});
