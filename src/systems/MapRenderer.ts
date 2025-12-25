import type Phaser from "phaser";
import { GAME_CONFIG } from "../config/GameConfig";
import { type BiomeConfig, MapGenerator, TileType } from "./MapGenerator";

/**
 * Color palette for the black & white theme.
 * Using different shades of gray for variety while maintaining the theme.
 */
const TILE_COLORS: Record<TileType, { base: number; variation: number }> = {
	[TileType.Grass]: { base: 0xffffff, variation: 0.05 }, // White with slight variation
	[TileType.Forest]: { base: 0xcccccc, variation: 0.08 }, // Light gray
	[TileType.Water]: { base: 0x222222, variation: 0.03 }, // Very dark gray (almost black)
	[TileType.Rock]: { base: 0x111111, variation: 0.02 }, // Near black
	[TileType.Path]: { base: 0xeeeeee, variation: 0.03 }, // Off-white
};

/**
 * Renders a procedurally generated map using Phaser graphics.
 * The map is rendered once to a static texture for optimal performance.
 */
export class MapRenderer {
	private scene: Phaser.Scene;
	private generator: MapGenerator;
	private graphics: Phaser.GameObjects.Graphics;
	private mapImage: Phaser.GameObjects.Image | null = null;
	private tileSize: number;

	constructor(scene: Phaser.Scene, generator: MapGenerator) {
		this.scene = scene;
		this.generator = generator;
		this.tileSize = GAME_CONFIG.map.tileSize;
		this.graphics = scene.add.graphics();
	}

	/**
	 * Render the map to the scene.
	 * Draws to a Graphics object once, then converts to a static texture for performance.
	 */
	public render(): void {
		const tiles = this.generator.getTiles();
		const elevation = this.generator.getElevation();
		const height = tiles.length;
		const width = tiles[0].length;
		const mapWidth = width * this.tileSize;
		const mapHeight = height * this.tileSize;

		this.graphics.clear();

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tileType = tiles[y][x];
				const elev = elevation[y][x];

				// Get base color and apply variation
				const colorConfig = TILE_COLORS[tileType];
				const color = this.applyVariation(
					colorConfig.base,
					colorConfig.variation,
					x,
					y,
					elev,
				);

				// Draw tile
				this.graphics.fillStyle(color, 1);
				this.graphics.fillRect(
					x * this.tileSize,
					y * this.tileSize,
					this.tileSize,
					this.tileSize,
				);

				// Add subtle grid lines for walkable tiles
				if (tileType !== TileType.Water && tileType !== TileType.Rock) {
					this.graphics.lineStyle(0.5, 0x000000, 0.05);
					this.graphics.strokeRect(
						x * this.tileSize,
						y * this.tileSize,
						this.tileSize,
						this.tileSize,
					);
				}

				// Add texture details for forests
				if (tileType === TileType.Forest) {
					this.drawForestDetail(x, y);
				}

				// Add ripple effect for water
				if (tileType === TileType.Water) {
					this.drawWaterDetail(x, y, elev);
				}

				// Add texture for rocks
				if (tileType === TileType.Rock) {
					this.drawRockDetail(x, y);
				}
			}
		}

		// Convert Graphics to a static texture for optimal performance
		// This avoids re-rendering 16,000+ draw calls every frame
		const textureKey = "map-texture";

		// Remove existing texture if it exists (for scene restart)
		if (this.scene.textures.exists(textureKey)) {
			this.scene.textures.remove(textureKey);
		}

		// Generate texture from graphics
		this.graphics.generateTexture(textureKey, mapWidth, mapHeight);

		// Create a static image from the texture
		this.mapImage = this.scene.add.image(0, 0, textureKey);
		this.mapImage.setOrigin(0, 0);
		this.mapImage.setDepth(-10);

		// Destroy the graphics object - no longer needed
		this.graphics.destroy();
	}

	/**
	 * Apply color variation based on position and elevation.
	 */
	private applyVariation(
		baseColor: number,
		variationAmount: number,
		x: number,
		y: number,
		elevation: number,
	): number {
		// Use position and elevation to create deterministic variation
		const hash = this.simpleHash(x, y);
		const variation = (hash - 0.5) * 2 * variationAmount;
		const elevationEffect = elevation * 0.05;

		// Extract RGB components
		const r = (baseColor >> 16) & 0xff;
		const g = (baseColor >> 8) & 0xff;
		const b = baseColor & 0xff;

		// Apply variation
		const factor = 1 + variation + elevationEffect;
		const newR = Math.max(0, Math.min(255, Math.floor(r * factor)));
		const newG = Math.max(0, Math.min(255, Math.floor(g * factor)));
		const newB = Math.max(0, Math.min(255, Math.floor(b * factor)));

		return (newR << 16) | (newG << 8) | newB;
	}

	/**
	 * Draw forest detail (small dots/texture).
	 */
	private drawForestDetail(x: number, y: number): void {
		const hash = this.simpleHash(x, y);

		// Add some scattered darker dots to represent trees/foliage
		if (hash > 0.6) {
			const dotX = x * this.tileSize + hash * this.tileSize * 0.8 + 1;
			const dotY = y * this.tileSize + (1 - hash) * this.tileSize * 0.8 + 1;
			const dotSize = 1 + hash;

			this.graphics.fillStyle(0x999999, 0.4);
			this.graphics.fillCircle(dotX, dotY, dotSize);
		}

		if (hash < 0.3) {
			const dotX = x * this.tileSize + (1 - hash) * this.tileSize * 0.7 + 2;
			const dotY = y * this.tileSize + hash * this.tileSize * 0.7 + 2;

			this.graphics.fillStyle(0xaaaaaa, 0.3);
			this.graphics.fillCircle(dotX, dotY, 1.5);
		}
	}

	/**
	 * Draw water detail (subtle ripple lines).
	 */
	private drawWaterDetail(x: number, y: number, _elevation: number): void {
		const hash = this.simpleHash(x, y);

		// Add horizontal wave lines
		if (hash > 0.7) {
			const lineY = y * this.tileSize + this.tileSize * 0.3 + hash * 4;

			this.graphics.lineStyle(0.5, 0x444444, 0.3);
			this.graphics.beginPath();
			this.graphics.moveTo(x * this.tileSize + 2, lineY);
			this.graphics.lineTo(x * this.tileSize + this.tileSize - 2, lineY);
			this.graphics.strokePath();
		}

		if (hash < 0.25) {
			const lineY = y * this.tileSize + this.tileSize * 0.6 + hash * 3;

			this.graphics.lineStyle(0.5, 0x333333, 0.2);
			this.graphics.beginPath();
			this.graphics.moveTo(x * this.tileSize + 3, lineY);
			this.graphics.lineTo(x * this.tileSize + this.tileSize - 3, lineY);
			this.graphics.strokePath();
		}
	}

	/**
	 * Draw rock detail (angular marks).
	 */
	private drawRockDetail(x: number, y: number): void {
		const hash = this.simpleHash(x, y);

		// Add angular crack lines
		if (hash > 0.65) {
			const startX = x * this.tileSize + hash * this.tileSize * 0.4 + 2;
			const startY = y * this.tileSize + 2;
			const endX = startX + (1 - hash) * 6;
			const endY = y * this.tileSize + this.tileSize - 4;

			this.graphics.lineStyle(0.5, 0x333333, 0.3);
			this.graphics.beginPath();
			this.graphics.moveTo(startX, startY);
			this.graphics.lineTo(endX, endY);
			this.graphics.strokePath();
		}
	}

	/**
	 * Simple deterministic hash for position-based randomness.
	 */
	private simpleHash(x: number, y: number): number {
		const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
		return h - Math.floor(h);
	}

	/**
	 * Create a tilemap for physics collisions.
	 */
	public createCollisionTilemap(): {
		tilemap: Phaser.Tilemaps.Tilemap;
		layer: Phaser.Tilemaps.TilemapLayer;
	} {
		const collisionGrid = this.generator.getCollisionGrid();
		const height = collisionGrid.length;
		const width = collisionGrid[0].length;

		// Create tilemap
		const tilemap = this.scene.make.tilemap({
			tileWidth: this.tileSize,
			tileHeight: this.tileSize,
			width,
			height,
		});

		// Create a simple 2-tile texture (0 = walkable, 1 = collision)
		const tileTexture = this.scene.textures.createCanvas("proc-tiles", 32, 16);
		if (tileTexture) {
			const ctx = tileTexture.getContext();
			// Tile 0: transparent (walkable)
			ctx.clearRect(0, 0, 16, 16);
			// Tile 1: filled (collision) - invisible since we render separately
			ctx.fillStyle = "rgba(0,0,0,0)";
			ctx.fillRect(16, 0, 16, 16);
			tileTexture.refresh();
		}

		const tileset = tilemap.addTilesetImage(
			"proc-tiles",
			"proc-tiles",
			16,
			16,
			0,
			0,
		);
		if (!tileset) {
			throw new Error("Failed to create tileset");
		}

		const layer = tilemap.createBlankLayer("collision", tileset, 0, 0);
		if (!layer) {
			throw new Error("Failed to create collision layer");
		}

		// Fill the layer with collision data
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				layer.putTileAt(collisionGrid[y][x], x, y);
			}
		}

		// Enable collision for tile index 1
		layer.setCollision(1);

		// Make the layer invisible (we render separately)
		layer.setVisible(false);

		return { tilemap, layer };
	}

	/**
	 * Destroy the renderer and clean up.
	 */
	public destroy(): void {
		if (this.mapImage) {
			this.mapImage.destroy();
		}
		// Graphics may already be destroyed after render()
		if (this.graphics?.active) {
			this.graphics.destroy();
		}
	}
}

/**
 * Helper function to create a complete procedural map.
 */
export function createProceduralMap(
	scene: Phaser.Scene,
	width: number,
	height: number,
	seed?: number,
	config?: Partial<BiomeConfig>,
): {
	generator: MapGenerator;
	renderer: MapRenderer;
	collisionGrid: number[][];
	tilemap: Phaser.Tilemaps.Tilemap;
	collisionLayer: Phaser.Tilemaps.TilemapLayer;
} {
	// Generate the map
	const generator = new MapGenerator(width, height, seed, config);
	generator.generate();

	// Create renderer and render
	const renderer = new MapRenderer(scene, generator);
	renderer.render();

	// Create collision tilemap
	const { tilemap, layer: collisionLayer } = renderer.createCollisionTilemap();

	// Get collision grid for pathfinding
	const collisionGrid = generator.getCollisionGrid();

	return {
		generator,
		renderer,
		collisionGrid,
		tilemap,
		collisionLayer,
	};
}
