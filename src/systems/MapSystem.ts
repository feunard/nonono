import type Phaser from "phaser";
import {
	CURRENT_MAP,
	getMapConfig,
	getTileType,
	type MapConfig,
} from "../config/MapConfig";

/**
 * MapSystem handles loading, rendering, and collision for tile-based maps.
 * Maps are defined in MapConfig and rendered using Phaser tilemaps.
 */
export class MapSystem {
	private scene: Phaser.Scene;
	private mapConfig: MapConfig;
	private graphics: Phaser.GameObjects.Graphics | null = null;
	private mapImage: Phaser.GameObjects.Image | null = null;
	private collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
	private tilemap: Phaser.Tilemaps.Tilemap | null = null;

	constructor(scene: Phaser.Scene, mapId: string = CURRENT_MAP) {
		this.scene = scene;
		this.mapConfig = getMapConfig(mapId);
	}

	/**
	 * Get the width of the map in pixels.
	 */
	public getWidthInPixels(): number {
		return this.mapConfig.width * this.mapConfig.tileSize;
	}

	/**
	 * Get the height of the map in pixels.
	 */
	public getHeightInPixels(): number {
		return this.mapConfig.height * this.mapConfig.tileSize;
	}

	/**
	 * Get the map configuration.
	 */
	public getMapConfig(): MapConfig {
		return this.mapConfig;
	}

	/**
	 * Get the collision grid for pathfinding.
	 * Returns a 2D array where 0 = walkable, 1 = collision.
	 */
	public getCollisionGrid(): number[][] {
		const { width, height, tilemap } = this.mapConfig;
		const grid: number[][] = [];

		for (let y = 0; y < height; y++) {
			grid[y] = [];
			for (let x = 0; x < width; x++) {
				const tileId = tilemap[y][x];
				const tileType = getTileType(tileId);
				grid[y][x] = tileType.collide ? 1 : 0;
			}
		}

		return grid;
	}

	/**
	 * Get the collision layer for physics.
	 */
	public getCollisionLayer(): Phaser.Tilemaps.TilemapLayer | null {
		return this.collisionLayer;
	}

	/**
	 * Initialize and render the map.
	 */
	public create(): void {
		this.renderMap();
		this.createCollisionTilemap();
	}

	/**
	 * Render the map to a static texture.
	 */
	private renderMap(): void {
		const { width, height, tileSize, tilemap } = this.mapConfig;
		const mapWidth = width * tileSize;
		const mapHeight = height * tileSize;

		this.graphics = this.scene.add.graphics();

		// Draw background (white for empty tiles)
		this.graphics.fillStyle(0xffffff, 1);
		this.graphics.fillRect(0, 0, mapWidth, mapHeight);

		// Draw tiles
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tileId = tilemap[y][x];
				const tileType = getTileType(tileId);

				// Only render tiles that have a color (skip empty/passable tiles)
				if (tileType.color) {
					const color = Number.parseInt(tileType.color.replace("#", ""), 16);
					this.graphics.fillStyle(color, 1);
					this.graphics.fillRect(
						x * tileSize,
						y * tileSize,
						tileSize,
						tileSize,
					);
				}

				// Add subtle grid lines for all tiles
				this.graphics.lineStyle(0.5, 0x000000, 0.05);
				this.graphics.strokeRect(
					x * tileSize,
					y * tileSize,
					tileSize,
					tileSize,
				);
			}
		}

		// Convert Graphics to a static texture for optimal performance
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
		this.graphics = null;
	}

	/**
	 * Create a tilemap for physics collisions.
	 */
	private createCollisionTilemap(): void {
		const { width, height, tileSize, tilemap } = this.mapConfig;

		// Create tilemap
		this.tilemap = this.scene.make.tilemap({
			tileWidth: tileSize,
			tileHeight: tileSize,
			width,
			height,
		});

		// Create a simple 2-tile texture (0 = walkable, 1 = collision)
		const tileTexture = this.scene.textures.createCanvas(
			"map-tiles",
			tileSize * 2,
			tileSize,
		);
		if (tileTexture) {
			const ctx = tileTexture.getContext();
			// Tile 0: transparent (walkable)
			ctx.clearRect(0, 0, tileSize, tileSize);
			// Tile 1: filled (collision) - invisible since we render separately
			ctx.fillStyle = "rgba(0,0,0,0)";
			ctx.fillRect(tileSize, 0, tileSize, tileSize);
			tileTexture.refresh();
		}

		const tileset = this.tilemap.addTilesetImage(
			"map-tiles",
			"map-tiles",
			tileSize,
			tileSize,
			0,
			0,
		);
		if (!tileset) {
			throw new Error("Failed to create tileset");
		}

		const layer = this.tilemap.createBlankLayer("collision", tileset, 0, 0);
		if (!layer) {
			throw new Error("Failed to create collision layer");
		}

		// Fill the layer with collision data from tilemap
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tileId = tilemap[y][x];
				const tileType = getTileType(tileId);
				// Use 1 for collision tiles, 0 for walkable
				layer.putTileAt(tileType.collide ? 1 : 0, x, y);
			}
		}

		// Enable collision for tile index 1
		layer.setCollision(1);

		// Make the layer invisible (we render separately)
		layer.setVisible(false);

		this.collisionLayer = layer;
	}

	/**
	 * Destroy the map system and clean up resources.
	 */
	public destroy(): void {
		if (this.mapImage) {
			this.mapImage.destroy();
			this.mapImage = null;
		}
		if (this.graphics?.active) {
			this.graphics.destroy();
			this.graphics = null;
		}
		if (this.collisionLayer) {
			this.collisionLayer.destroy();
			this.collisionLayer = null;
		}
		if (this.tilemap) {
			this.tilemap.destroy();
			this.tilemap = null;
		}
	}
}

/**
 * Helper function to create a MapSystem and initialize it.
 */
export function createMapSystem(
	scene: Phaser.Scene,
	mapId?: string,
): {
	mapSystem: MapSystem;
	collisionGrid: number[][];
	collisionLayer: Phaser.Tilemaps.TilemapLayer;
} {
	const mapSystem = new MapSystem(scene, mapId);
	mapSystem.create();

	const collisionGrid = mapSystem.getCollisionGrid();
	const collisionLayer = mapSystem.getCollisionLayer();

	if (!collisionLayer) {
		throw new Error("Failed to create collision layer");
	}

	return {
		mapSystem,
		collisionGrid,
		collisionLayer,
	};
}
