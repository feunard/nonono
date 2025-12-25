import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock window.location before importing
Object.defineProperty(window, "location", {
	value: { search: "" },
	writable: true,
});

// Import after mocking
const { PathfindingManager } = await import("../src/systems/PathfindingManager");

describe("PathfindingManager", () => {
	let pathfinder: InstanceType<typeof PathfindingManager>;
	let grid: number[][];

	beforeEach(() => {
		// Create a simple 10x10 grid (0 = walkable, 1 = wall)
		grid = Array.from({ length: 10 }, () => Array(10).fill(0));
		pathfinder = new PathfindingManager(grid);
	});

	describe("constructor", () => {
		it("should create a pathfinding manager with a grid", () => {
			expect(pathfinder).toBeDefined();
		});

		it("should accept an empty grid", () => {
			const emptyGrid: number[][] = [];
			const pf = new PathfindingManager(emptyGrid);
			expect(pf).toBeDefined();
		});
	});

	describe("findPath", () => {
		it("should find a path on open grid", async () => {
			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				pathfinder.findPath(0, 0, 5, 5, resolve);
			});

			expect(result).not.toBeNull();
			expect(result).toBeInstanceOf(Array);
			expect(result!.length).toBeGreaterThan(0);
		});

		it("should return path starting from start position", async () => {
			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				pathfinder.findPath(0, 0, 5, 5, resolve);
			});

			expect(result).not.toBeNull();
			expect(result![0]).toEqual({ x: 0, y: 0 });
		});

		it("should return path ending at target position", async () => {
			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				pathfinder.findPath(0, 0, 5, 5, resolve);
			});

			expect(result).not.toBeNull();
			const lastPoint = result![result!.length - 1];
			expect(lastPoint).toEqual({ x: 5, y: 5 });
		});

		it("should return null when path is blocked", async () => {
			// Create a wall blocking the path
			for (let i = 0; i < 10; i++) {
				grid[5][i] = 1; // Horizontal wall
			}
			const blockedPathfinder = new PathfindingManager(grid);

			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				blockedPathfinder.findPath(0, 0, 0, 9, resolve);
			});

			expect(result).toBeNull();
		});

		it("should find path around obstacles", async () => {
			// Create a partial wall
			for (let i = 0; i < 8; i++) {
				grid[5][i] = 1;
			}
			const partialPathfinder = new PathfindingManager(grid);

			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				partialPathfinder.findPath(0, 0, 0, 9, resolve);
			});

			expect(result).not.toBeNull();
			expect(result!.length).toBeGreaterThan(10); // Longer path due to obstacle
		});

		it("should clamp out-of-bounds start coordinates", async () => {
			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				// Negative coords should be clamped to 0
				pathfinder.findPath(-5, -5, 5, 5, resolve);
			});

			expect(result).not.toBeNull();
			expect(result![0]).toEqual({ x: 0, y: 0 });
		});

		it("should handle coordinates at grid boundaries", async () => {
			// Test that pathfinding works for corner-to-corner
			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				pathfinder.findPath(0, 0, 9, 9, resolve);
			});

			expect(result).not.toBeNull();
			const lastPoint = result![result!.length - 1];
			expect(lastPoint.x).toBe(9);
			expect(lastPoint.y).toBe(9);
		});

		it("should use only cardinal directions (no diagonals)", async () => {
			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				pathfinder.findPath(0, 0, 3, 3, resolve);
			});

			expect(result).not.toBeNull();

			// Check that each step is only 1 tile in one direction
			for (let i = 1; i < result!.length; i++) {
				const prev = result![i - 1];
				const curr = result![i];
				const dx = Math.abs(curr.x - prev.x);
				const dy = Math.abs(curr.y - prev.y);

				// Either horizontal or vertical, not diagonal
				expect(dx + dy).toBe(1);
			}
		});
	});

	describe("setTileWalkable", () => {
		it("should mark tile as unwalkable", async () => {
			// Set tile at (5,5) as unwalkable
			pathfinder.setTileWalkable(5, 5, false);

			// Path should avoid this tile
			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				pathfinder.findPath(4, 5, 6, 5, resolve);
			});

			expect(result).not.toBeNull();
			// Path should go around, not through (5,5)
			const containsBlocked = result!.some((p) => p.x === 5 && p.y === 5);
			expect(containsBlocked).toBe(false);
		});

		it("should mark tile as walkable", async () => {
			// First block, then unblock
			grid[5][5] = 1;
			const pf = new PathfindingManager(grid);
			pf.setTileWalkable(5, 5, true);

			const result = await new Promise<{ x: number; y: number }[] | null>((resolve) => {
				pf.findPath(5, 4, 5, 6, resolve);
			});

			expect(result).not.toBeNull();
			// Should be able to go through (5,5) now
			const containsTile = result!.some((p) => p.x === 5 && p.y === 5);
			expect(containsTile).toBe(true);
		});

		it("should handle out-of-bounds gracefully", () => {
			// Should not throw
			expect(() => pathfinder.setTileWalkable(-1, -1, false)).not.toThrow();
			expect(() => pathfinder.setTileWalkable(1000, 1000, false)).not.toThrow();
		});
	});

	describe("update", () => {
		it("should call calculate without error", () => {
			expect(() => pathfinder.update()).not.toThrow();
		});
	});
});
