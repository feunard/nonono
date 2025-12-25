import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../src/stores/gameStore";

describe("gameStore", () => {
	beforeEach(() => {
		useGameStore.getState().reset();
	});

	afterEach(() => {
		useGameStore.getState().reset();
	});

	describe("initial state", () => {
		it("should have default health values", () => {
			const state = useGameStore.getState();
			expect(state.health).toBe(100);
			expect(state.maxHealth).toBe(100);
		});

		it("should start at wave 1", () => {
			expect(useGameStore.getState().wave).toBe(1);
		});

		it("should start with 0 kills", () => {
			expect(useGameStore.getState().kills).toBe(0);
		});

		it("should start with 0 orcs alive", () => {
			expect(useGameStore.getState().orcsAlive).toBe(0);
		});

		it("should start with 0 elapsed time", () => {
			expect(useGameStore.getState().elapsedTime).toBe(0);
		});

		it("should not be paused initially", () => {
			expect(useGameStore.getState().isPaused).toBe(false);
		});

		it("should not be game over initially", () => {
			expect(useGameStore.getState().isGameOver).toBe(false);
			expect(useGameStore.getState().gameOverStats).toBe(null);
		});
	});

	describe("updateHealth", () => {
		it("should update health and maxHealth", () => {
			useGameStore.getState().updateHealth(50, 100);
			const state = useGameStore.getState();
			expect(state.health).toBe(50);
			expect(state.maxHealth).toBe(100);
		});

		it("should handle full health", () => {
			useGameStore.getState().updateHealth(100, 100);
			expect(useGameStore.getState().health).toBe(100);
		});

		it("should handle zero health", () => {
			useGameStore.getState().updateHealth(0, 100);
			expect(useGameStore.getState().health).toBe(0);
		});
	});

	describe("updateWave", () => {
		it("should update wave number", () => {
			useGameStore.getState().updateWave(5);
			expect(useGameStore.getState().wave).toBe(5);
		});
	});

	describe("updateKills", () => {
		it("should update kill count", () => {
			useGameStore.getState().updateKills(10);
			expect(useGameStore.getState().kills).toBe(10);
		});

		it("should handle large kill counts", () => {
			useGameStore.getState().updateKills(9999);
			expect(useGameStore.getState().kills).toBe(9999);
		});
	});

	describe("updateOrcsAlive", () => {
		it("should update orcs alive count", () => {
			useGameStore.getState().updateOrcsAlive(15);
			expect(useGameStore.getState().orcsAlive).toBe(15);
		});
	});

	describe("updateTime", () => {
		it("should update elapsed time", () => {
			useGameStore.getState().updateTime(120);
			expect(useGameStore.getState().elapsedTime).toBe(120);
		});
	});

	describe("setPaused", () => {
		it("should pause the game", () => {
			useGameStore.getState().setPaused(true);
			expect(useGameStore.getState().isPaused).toBe(true);
		});

		it("should unpause the game", () => {
			useGameStore.getState().setPaused(true);
			useGameStore.getState().setPaused(false);
			expect(useGameStore.getState().isPaused).toBe(false);
		});
	});

	describe("setGameOver", () => {
		it("should set game over state with stats", () => {
			const stats = { survivalTime: 300, kills: 50, wave: 5 };
			useGameStore.getState().setGameOver(stats);

			const state = useGameStore.getState();
			expect(state.isGameOver).toBe(true);
			expect(state.gameOverStats).toEqual(stats);
		});
	});

	describe("cooldowns", () => {
		it("should trigger arrow cooldown", () => {
			const before = Date.now();
			useGameStore.getState().triggerArrowCooldown(500);
			const state = useGameStore.getState();

			expect(state.arrowCooldown.duration).toBe(500);
			expect(state.arrowCooldown.lastUsed).toBeGreaterThanOrEqual(before);
		});

		it("should trigger melee cooldown", () => {
			const before = Date.now();
			useGameStore.getState().triggerMeleeCooldown(1000);
			const state = useGameStore.getState();

			expect(state.meleeCooldown.duration).toBe(1000);
			expect(state.meleeCooldown.lastUsed).toBeGreaterThanOrEqual(before);
		});
	});

	describe("reset", () => {
		it("should reset all state to initial values", () => {
			// Modify all state
			useGameStore.getState().updateHealth(25, 50);
			useGameStore.getState().updateWave(10);
			useGameStore.getState().updateKills(100);
			useGameStore.getState().updateOrcsAlive(20);
			useGameStore.getState().updateTime(600);
			useGameStore.getState().setPaused(true);
			useGameStore.getState().setGameOver({ survivalTime: 600, kills: 100, wave: 10 });

			// Reset
			useGameStore.getState().reset();

			// Verify reset
			const state = useGameStore.getState();
			expect(state.health).toBe(100);
			expect(state.maxHealth).toBe(100);
			expect(state.wave).toBe(1);
			expect(state.kills).toBe(0);
			expect(state.orcsAlive).toBe(0);
			expect(state.elapsedTime).toBe(0);
			expect(state.isPaused).toBe(false);
			expect(state.isGameOver).toBe(false);
			expect(state.gameOverStats).toBe(null);
		});
	});

	describe("bag inventory", () => {
		it("should start with 0 bags", () => {
			expect(useGameStore.getState().bagCount).toBe(0);
		});

		it("should add bags with addBag()", () => {
			useGameStore.getState().addBag();
			expect(useGameStore.getState().bagCount).toBe(1);

			useGameStore.getState().addBag();
			expect(useGameStore.getState().bagCount).toBe(2);
		});

		it("should remove bags with consumeBag()", () => {
			useGameStore.getState().addBag();
			useGameStore.getState().addBag();
			useGameStore.getState().addBag();
			expect(useGameStore.getState().bagCount).toBe(3);

			useGameStore.getState().consumeBag();
			expect(useGameStore.getState().bagCount).toBe(2);
		});

		it("should not go below 0 when consuming bags", () => {
			expect(useGameStore.getState().bagCount).toBe(0);

			useGameStore.getState().consumeBag();
			expect(useGameStore.getState().bagCount).toBe(0);

			useGameStore.getState().consumeBag();
			expect(useGameStore.getState().bagCount).toBe(0);
		});

		it("should handle multiple add/consume cycles", () => {
			useGameStore.getState().addBag();
			useGameStore.getState().addBag();
			useGameStore.getState().consumeBag();
			useGameStore.getState().addBag();
			useGameStore.getState().addBag();
			useGameStore.getState().consumeBag();
			useGameStore.getState().consumeBag();

			expect(useGameStore.getState().bagCount).toBe(1);
		});

		it("should reset bagCount on game reset", () => {
			useGameStore.getState().addBag();
			useGameStore.getState().addBag();
			useGameStore.getState().addBag();
			expect(useGameStore.getState().bagCount).toBe(3);

			useGameStore.getState().reset();
			expect(useGameStore.getState().bagCount).toBe(0);
		});
	});
});
