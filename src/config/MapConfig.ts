/**
 * Map Configuration
 * Defines tile types and map definitions for the game.
 */

export type TileType = {
	id: number;
	collide: boolean;
	color?: string; // for rendering (hex color)
};

/**
 * Tile type definitions.
 * Tile 0 = empty/passable (no render)
 * Tile 1 = solid black wall (collide: true)
 */
export const TILE_TYPES: Record<number, TileType> = {
	0: { id: 0, collide: false }, // Empty/passable - no render
	1: { id: 1, collide: true, color: "#000000" }, // Black wall
};

export type MapConfig = {
	id: string;
	name: string;
	width: number; // in tiles
	height: number; // in tiles
	tileSize: number;
	tilemap: number[][]; // 2D array of tile IDs
};

/**
 * Helper function to create an empty tilemap filled with a single tile ID.
 */
function createEmptyTilemap(
	width: number,
	height: number,
	fillTile = 0,
): number[][] {
	const tilemap: number[][] = [];
	for (let y = 0; y < height; y++) {
		tilemap[y] = [];
		for (let x = 0; x < width; x++) {
			tilemap[y][x] = fillTile;
		}
	}
	return tilemap;
}

/**
 * Available maps.
 */
export const MAPS: Record<string, MapConfig> = {
	default: {
		id: "default",
		name: "Empty Arena",
		width: 64,
		height: 64,
		tileSize: 16,
		tilemap: createEmptyTilemap(64, 64, 0), // All empty/passable
	},
};

/**
 * Current map to load.
 */
export const CURRENT_MAP = "default";

/**
 * Get a map configuration by ID.
 */
export function getMapConfig(mapId: string = CURRENT_MAP): MapConfig {
	const map = MAPS[mapId];
	if (!map) {
		throw new Error(`Map not found: ${mapId}`);
	}
	return map;
}

/**
 * Get tile type info by tile ID.
 */
export function getTileType(tileId: number): TileType {
	const tileType = TILE_TYPES[tileId];
	if (!tileType) {
		// Default to empty/passable for unknown tiles
		return TILE_TYPES[0];
	}
	return tileType;
}
