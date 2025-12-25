import { fbm, seedNoise, simplex2D } from "./SimplexNoise";

/**
 * Tile types for the generated map.
 */
export enum TileType {
	Grass = 0, // Walkable - light colors
	Forest = 1, // Walkable - darker green-ish gray
	Water = 2, // Collision - water/river
	Rock = 3, // Collision - stone/mountain
	Path = 4, // Walkable - cleared path
}

/**
 * Biome configuration for map generation.
 */
export type BiomeConfig = {
	// Noise scales (lower = larger features)
	elevationScale: number;
	moistureScale: number;
	detailScale: number;

	// Thresholds
	waterLevel: number; // Below this elevation = water
	rockLevel: number; // Above this elevation = rock
	forestMoisture: number; // Above this moisture + mid elevation = forest

	// River settings
	riverCount: number;
	riverWidth: number;

	// Forest clustering (cellular automata)
	forestIterations: number;
	forestBirthLimit: number;
	forestDeathLimit: number;

	// Safe zone around spawn
	spawnSafeRadius: number;

	// Path settings
	pathCount: number;
	pathWidth: number;
};

const DEFAULT_CONFIG: BiomeConfig = {
	elevationScale: 0.02,
	moistureScale: 0.015,
	detailScale: 0.1,

	waterLevel: -0.3,
	rockLevel: 0.6,
	forestMoisture: 0.2,

	riverCount: 2,
	riverWidth: 2,

	forestIterations: 3,
	forestBirthLimit: 4,
	forestDeathLimit: 3,

	spawnSafeRadius: 8,

	pathCount: 4,
	pathWidth: 2,
};

/**
 * Procedural map generator using noise, cellular automata, and pathfinding.
 */
export class MapGenerator {
	private width: number;
	private height: number;
	private config: BiomeConfig;
	private tiles: TileType[][];
	private elevation: number[][];
	private moisture: number[][];

	constructor(
		width: number,
		height: number,
		seed?: number,
		config?: Partial<BiomeConfig>,
	) {
		this.width = width;
		this.height = height;
		this.config = { ...DEFAULT_CONFIG, ...config };

		// Initialize arrays
		this.tiles = [];
		this.elevation = [];
		this.moisture = [];

		for (let y = 0; y < height; y++) {
			this.tiles[y] = [];
			this.elevation[y] = [];
			this.moisture[y] = [];
			for (let x = 0; x < width; x++) {
				this.tiles[y][x] = TileType.Grass;
				this.elevation[y][x] = 0;
				this.moisture[y][x] = 0;
			}
		}

		// Seed the noise generator
		if (seed !== undefined) {
			seedNoise(seed);
		}
	}

	/**
	 * Generate the complete map.
	 */
	public generate(): TileType[][] {
		// Step 1: Generate base terrain using noise
		this.generateBaseTerrain();

		// Step 2: Apply cellular automata for forest clustering
		this.clusterForests();

		// Step 3: Generate rivers
		this.generateRivers();

		// Step 4: Generate paths from spawn to edges
		this.generatePaths();

		// Step 5: Clear spawn area
		this.clearSpawnArea();

		// Step 6: Ensure map edges are accessible
		this.cleanupEdges();

		return this.tiles;
	}

	/**
	 * Generate base terrain using Perlin noise.
	 */
	private generateBaseTerrain(): void {
		const { elevationScale, moistureScale, detailScale } = this.config;
		const { waterLevel, rockLevel, forestMoisture } = this.config;

		const centerX = this.width / 2;
		const centerY = this.height / 2;
		const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				// Generate elevation with multiple octaves
				const baseElevation = fbm(x * elevationScale, y * elevationScale, 4);

				// Add detail noise
				const detail = simplex2D(x * detailScale, y * detailScale) * 0.1;

				// Apply island gradient (lower at edges)
				const distFromCenter = Math.sqrt(
					(x - centerX) ** 2 + (y - centerY) ** 2,
				);
				const edgeFalloff = 1 - (distFromCenter / maxDist) ** 2 * 0.5;

				this.elevation[y][x] = (baseElevation + detail) * edgeFalloff;

				// Generate moisture
				this.moisture[y][x] = fbm(
					(x + 1000) * moistureScale,
					(y + 1000) * moistureScale,
					3,
				);

				// Determine tile type based on elevation and moisture
				const elev = this.elevation[y][x];
				const moist = this.moisture[y][x];

				if (elev < waterLevel) {
					this.tiles[y][x] = TileType.Water;
				} else if (elev > rockLevel) {
					this.tiles[y][x] = TileType.Rock;
				} else if (moist > forestMoisture && elev > waterLevel + 0.1) {
					this.tiles[y][x] = TileType.Forest;
				} else {
					this.tiles[y][x] = TileType.Grass;
				}
			}
		}
	}

	/**
	 * Apply cellular automata to cluster forests into more natural shapes.
	 */
	private clusterForests(): void {
		const { forestIterations, forestBirthLimit, forestDeathLimit } =
			this.config;

		for (let iter = 0; iter < forestIterations; iter++) {
			const newTiles: TileType[][] = [];

			for (let y = 0; y < this.height; y++) {
				newTiles[y] = [...this.tiles[y]];
			}

			for (let y = 1; y < this.height - 1; y++) {
				for (let x = 1; x < this.width - 1; x++) {
					// Only process grass and forest tiles
					if (
						this.tiles[y][x] === TileType.Water ||
						this.tiles[y][x] === TileType.Rock
					) {
						continue;
					}

					// Count forest neighbors
					let forestCount = 0;
					for (let dy = -1; dy <= 1; dy++) {
						for (let dx = -1; dx <= 1; dx++) {
							if (dx === 0 && dy === 0) continue;
							if (this.tiles[y + dy][x + dx] === TileType.Forest) {
								forestCount++;
							}
						}
					}

					// Apply cellular automata rules
					if (this.tiles[y][x] === TileType.Forest) {
						// Forest dies if too few neighbors
						if (forestCount < forestDeathLimit) {
							newTiles[y][x] = TileType.Grass;
						}
					} else if (this.tiles[y][x] === TileType.Grass) {
						// Grass becomes forest if enough neighbors
						if (forestCount >= forestBirthLimit) {
							newTiles[y][x] = TileType.Forest;
						}
					}
				}
			}

			this.tiles = newTiles;
		}
	}

	/**
	 * Generate rivers flowing from high to low elevation.
	 */
	private generateRivers(): void {
		const { riverCount, riverWidth } = this.config;

		for (let i = 0; i < riverCount; i++) {
			// Start from a random edge
			const edge = Math.floor(Math.random() * 4);
			let startX: number;
			let startY: number;

			switch (edge) {
				case 0: // Top
					startX = Math.floor(Math.random() * this.width);
					startY = 0;
					break;
				case 1: // Right
					startX = this.width - 1;
					startY = Math.floor(Math.random() * this.height);
					break;
				case 2: // Bottom
					startX = Math.floor(Math.random() * this.width);
					startY = this.height - 1;
					break;
				default: // Left
					startX = 0;
					startY = Math.floor(Math.random() * this.height);
			}

			// Flow river using gradient descent with some randomness
			this.flowRiver(startX, startY, riverWidth);
		}
	}

	/**
	 * Flow a river from start point following lower elevation.
	 */
	private flowRiver(startX: number, startY: number, width: number): void {
		let x = startX;
		let y = startY;
		const visited = new Set<string>();
		const maxSteps = this.width + this.height;

		for (let step = 0; step < maxSteps; step++) {
			const key = `${x},${y}`;
			if (visited.has(key)) break;
			visited.add(key);

			// Carve river at current position
			this.carveCircle(x, y, width, TileType.Water);

			// Find lowest neighbor with some randomness
			let lowestElev = this.elevation[y]?.[x] ?? 0;
			let nextX = x;
			let nextY = y;
			let foundLower = false;

			// Check neighbors in random order
			const directions = [
				[0, -1],
				[0, 1],
				[-1, 0],
				[1, 0],
				[-1, -1],
				[1, -1],
				[-1, 1],
				[1, 1],
			];
			this.shuffleArray(directions);

			for (const [dx, dy] of directions) {
				const nx = x + dx;
				const ny = y + dy;

				if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;

				const elev = this.elevation[ny][nx];
				// Add randomness to make rivers less straight
				const randomFactor = (Math.random() - 0.5) * 0.2;

				if (elev + randomFactor < lowestElev) {
					lowestElev = elev;
					nextX = nx;
					nextY = ny;
					foundLower = true;
				}
			}

			// If no lower neighbor, add some drift
			if (!foundLower) {
				const drift = directions[Math.floor(Math.random() * 4)];
				nextX = Math.max(0, Math.min(this.width - 1, x + drift[0]));
				nextY = Math.max(0, Math.min(this.height - 1, y + drift[1]));
			}

			x = nextX;
			y = nextY;

			// Stop if we hit the edge
			if (x <= 0 || x >= this.width - 1 || y <= 0 || y >= this.height - 1) {
				this.carveCircle(x, y, width, TileType.Water);
				break;
			}
		}
	}

	/**
	 * Generate paths from spawn to map edges for accessibility.
	 */
	private generatePaths(): void {
		const { pathCount, pathWidth } = this.config;
		const centerX = Math.floor(this.width / 2);
		const centerY = Math.floor(this.height / 2);

		// Generate paths in cardinal directions
		const targets = [
			{ x: centerX, y: 0 }, // North
			{ x: this.width - 1, y: centerY }, // East
			{ x: centerX, y: this.height - 1 }, // South
			{ x: 0, y: centerY }, // West
		];

		for (let i = 0; i < Math.min(pathCount, targets.length); i++) {
			this.carvePath(centerX, centerY, targets[i].x, targets[i].y, pathWidth);
		}
	}

	/**
	 * Carve a winding path between two points.
	 */
	private carvePath(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		width: number,
	): void {
		let x = startX;
		let y = startY;

		while (x !== endX || y !== endY) {
			// Carve at current position
			this.carveCircle(x, y, width, TileType.Path);

			// Move toward target with some randomness
			const dx = endX - x;
			const dy = endY - y;

			// Bias toward target but allow wandering
			if (Math.random() < 0.7) {
				// Move toward target
				if (Math.abs(dx) > Math.abs(dy)) {
					x += Math.sign(dx);
				} else if (dy !== 0) {
					y += Math.sign(dy);
				}
			} else {
				// Random perpendicular movement
				if (Math.abs(dx) > Math.abs(dy)) {
					y += Math.random() < 0.5 ? -1 : 1;
				} else {
					x += Math.random() < 0.5 ? -1 : 1;
				}
			}

			// Clamp to bounds
			x = Math.max(0, Math.min(this.width - 1, x));
			y = Math.max(0, Math.min(this.height - 1, y));
		}

		// Carve at end position
		this.carveCircle(endX, endY, width, TileType.Path);
	}

	/**
	 * Carve a circular area with the specified tile type.
	 */
	private carveCircle(
		cx: number,
		cy: number,
		radius: number,
		tile: TileType,
	): void {
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				if (dx * dx + dy * dy <= radius * radius) {
					const x = cx + dx;
					const y = cy + dy;
					if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
						this.tiles[y][x] = tile;
					}
				}
			}
		}
	}

	/**
	 * Clear the spawn area to ensure player can move.
	 */
	private clearSpawnArea(): void {
		const centerX = Math.floor(this.width / 2);
		const centerY = Math.floor(this.height / 2);
		const { spawnSafeRadius } = this.config;

		for (let dy = -spawnSafeRadius; dy <= spawnSafeRadius; dy++) {
			for (let dx = -spawnSafeRadius; dx <= spawnSafeRadius; dx++) {
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist <= spawnSafeRadius) {
					const x = centerX + dx;
					const y = centerY + dy;
					if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
						// Gradual transition - center is always grass, edges might be forest
						if (dist <= spawnSafeRadius * 0.5) {
							this.tiles[y][x] = TileType.Grass;
						} else if (
							this.tiles[y][x] === TileType.Water ||
							this.tiles[y][x] === TileType.Rock
						) {
							this.tiles[y][x] = TileType.Grass;
						}
					}
				}
			}
		}
	}

	/**
	 * Clean up edges to ensure the map boundary is consistent.
	 */
	private cleanupEdges(): void {
		// Make sure there's walkable space along edges
		for (let x = 0; x < this.width; x++) {
			if (this.tiles[0][x] === TileType.Water) {
				this.tiles[0][x] = TileType.Rock; // Replace edge water with rock
			}
			if (this.tiles[this.height - 1][x] === TileType.Water) {
				this.tiles[this.height - 1][x] = TileType.Rock;
			}
		}
		for (let y = 0; y < this.height; y++) {
			if (this.tiles[y][0] === TileType.Water) {
				this.tiles[y][0] = TileType.Rock;
			}
			if (this.tiles[y][this.width - 1] === TileType.Water) {
				this.tiles[y][this.width - 1] = TileType.Rock;
			}
		}
	}

	/**
	 * Get the collision grid (0 = walkable, 1 = collision).
	 */
	public getCollisionGrid(): number[][] {
		const grid: number[][] = [];

		for (let y = 0; y < this.height; y++) {
			grid[y] = [];
			for (let x = 0; x < this.width; x++) {
				const tile = this.tiles[y][x];
				// Water and Rock are collision tiles
				grid[y][x] = tile === TileType.Water || tile === TileType.Rock ? 1 : 0;
			}
		}

		return grid;
	}

	/**
	 * Get raw tile data.
	 */
	public getTiles(): TileType[][] {
		return this.tiles;
	}

	/**
	 * Get elevation data.
	 */
	public getElevation(): number[][] {
		return this.elevation;
	}

	/**
	 * Get moisture data.
	 */
	public getMoisture(): number[][] {
		return this.moisture;
	}

	/**
	 * Shuffle array in place.
	 */
	private shuffleArray<T>(array: T[]): void {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
}
