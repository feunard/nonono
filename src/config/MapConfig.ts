/**
 * Map Configuration
 * Defines tile types and map definitions for the game.
 * Maps are loaded from JSON files in src/assets/maps/
 */

import arenaMaze from "../assets/maps/arena-maze.json";
import arenaPillars from "../assets/maps/arena-pillars.json";
import arenaSimple from "../assets/maps/arena-simple.json";
import { type MapData, validateMapData } from "./MapData";

export type TileType = {
	id: number;
	collide: boolean;
	hardCollide: boolean; // Blocks arrows (line of sight blocking)
	color?: string; // for rendering (hex color)
};

/**
 * Tile type definitions.
 * Tile 0 = empty/passable (no render)
 * Tile 1 = wall (collide: true, dark grey) - blocks movement but not arrows
 * Tile 2 = hard wall (collide: true, hardCollide: true, black) - blocks movement and arrows
 */
export const TILE_TYPES: Record<number, TileType> = {
	0: { id: 0, collide: false, hardCollide: false }, // Empty/passable - no render
	1: { id: 1, collide: true, hardCollide: false, color: "#444444" }, // Dark grey wall - blocks movement
	2: { id: 2, collide: true, hardCollide: true, color: "#000000" }, // Black hard wall - blocks movement + arrows
};

/**
 * MapConfig is the runtime format used by MapSystem.
 * It's identical to MapData but kept separate for clarity.
 */
export type MapConfig = MapData;

/**
 * Load and validate map JSON files.
 * Each map is validated to ensure it matches the expected schema.
 */
function loadMaps(): Record<string, MapConfig> {
	const maps: Record<string, MapConfig> = {};

	// Load each map and validate it
	const rawMaps = [arenaSimple, arenaMaze, arenaPillars];

	for (const rawMap of rawMaps) {
		try {
			const validatedMap = validateMapData(rawMap);
			maps[validatedMap.id] = validatedMap;
		} catch (error) {
			console.error("Failed to load map:", error);
		}
	}

	return maps;
}

/**
 * Available maps loaded from JSON files.
 */
export const MAPS: Record<string, MapConfig> = loadMaps();

/**
 * Currently active map ID (set when game starts).
 * Defaults to the first available map.
 */
let currentMapId: string = Object.keys(MAPS)[0] || "arena-simple";

/**
 * Get the current map ID.
 */
export function getCurrentMapId(): string {
	return currentMapId;
}

/**
 * Set the current map ID (called when game starts).
 */
export function setCurrentMapId(mapId: string): void {
	if (!MAPS[mapId]) {
		throw new Error(`Map not found: ${mapId}`);
	}
	currentMapId = mapId;
}

/**
 * Get list of all available map IDs.
 */
export function getAvailableMaps(): string[] {
	return Object.keys(MAPS);
}

/**
 * Get a random map ID from available maps.
 */
export function getRandomMapId(): string {
	const mapIds = getAvailableMaps();
	if (mapIds.length === 0) {
		throw new Error("No maps available");
	}
	const randomIndex = Math.floor(Math.random() * mapIds.length);
	return mapIds[randomIndex];
}

/**
 * Get a map configuration by ID.
 * If no mapId is provided, returns the current map.
 */
export function getMapConfig(mapId?: string): MapConfig {
	const id = mapId ?? currentMapId;
	const map = MAPS[id];
	if (!map) {
		throw new Error(`Map not found: ${id}`);
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

/**
 * Check if a world position has a hardCollide tile (blocks arrows).
 * @param worldX X position in pixels
 * @param worldY Y position in pixels
 * @param mapId Optional map ID (defaults to current map)
 * @returns true if the tile at this position blocks arrows
 */
export function isHardCollideAt(
	worldX: number,
	worldY: number,
	mapId?: string,
): boolean {
	const map = getMapConfig(mapId);
	const tileX = Math.floor(worldX / map.tileSize);
	const tileY = Math.floor(worldY / map.tileSize);

	// Out of bounds check
	if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
		return false;
	}

	const tileId = map.tilemap[tileY]?.[tileX] ?? 0;
	const tileType = getTileType(tileId);
	return tileType.hardCollide;
}
