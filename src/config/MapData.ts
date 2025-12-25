/**
 * MapData - JSON-serializable map data format
 *
 * This module defines the shared data model for maps used by both
 * the game (MapConfig/MapSystem) and the map editor.
 */

import type { MapSize } from "../stores/editorStore";

/**
 * MapData is the JSON-serializable format for map files.
 * This is what gets saved to/loaded from .json files.
 */
export type MapData = {
	id: string;
	name: string;
	width: number; // in tiles (32, 64, or 128)
	height: number; // in tiles (32, 64, or 128)
	tileSize: number; // typically 16
	tilemap: number[][]; // 2D array of tile IDs (0 = empty, 1 = wall)
};

/**
 * Validation error with detailed message
 */
export class MapValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MapValidationError";
	}
}

/**
 * Type guard to check if a value is a valid map size
 */
function isValidMapSize(value: number): value is MapSize {
	return value === 32 || value === 64 || value === 128;
}

/**
 * Validate and parse raw data into a MapData object.
 * Throws MapValidationError if validation fails.
 *
 * @param data - Unknown data to validate (typically parsed JSON)
 * @returns Validated MapData object
 * @throws MapValidationError if validation fails
 */
export function validateMapData(data: unknown): MapData {
	if (typeof data !== "object" || data === null) {
		throw new MapValidationError("Map data must be an object");
	}

	const obj = data as Record<string, unknown>;

	// Validate id
	if (typeof obj.id !== "string" || obj.id.trim() === "") {
		throw new MapValidationError("Map must have a non-empty string 'id'");
	}

	// Validate name
	if (typeof obj.name !== "string" || obj.name.trim() === "") {
		throw new MapValidationError("Map must have a non-empty string 'name'");
	}

	// Validate width
	if (typeof obj.width !== "number" || !isValidMapSize(obj.width)) {
		throw new MapValidationError("Map 'width' must be 32, 64, or 128");
	}

	// Validate height
	if (typeof obj.height !== "number" || !isValidMapSize(obj.height)) {
		throw new MapValidationError("Map 'height' must be 32, 64, or 128");
	}

	// Validate tileSize
	if (typeof obj.tileSize !== "number" || obj.tileSize <= 0) {
		throw new MapValidationError("Map must have a positive 'tileSize'");
	}

	// Validate tilemap
	if (!Array.isArray(obj.tilemap)) {
		throw new MapValidationError("Map must have a 'tilemap' array");
	}

	const tilemap = obj.tilemap as unknown[][];

	// Check tilemap dimensions match width/height
	if (tilemap.length !== obj.height) {
		throw new MapValidationError(
			`Tilemap has ${tilemap.length} rows but height is ${obj.height}`,
		);
	}

	for (let y = 0; y < tilemap.length; y++) {
		const row = tilemap[y];
		if (!Array.isArray(row)) {
			throw new MapValidationError(`Tilemap row ${y} must be an array`);
		}
		if (row.length !== obj.width) {
			throw new MapValidationError(
				`Tilemap row ${y} has ${row.length} columns but width is ${obj.width}`,
			);
		}
		for (let x = 0; x < row.length; x++) {
			const tile = row[x];
			if (typeof tile !== "number" || !Number.isInteger(tile) || tile < 0) {
				throw new MapValidationError(
					`Invalid tile at (${x}, ${y}): must be a non-negative integer`,
				);
			}
		}
	}

	// Return validated MapData
	return {
		id: obj.id,
		name: obj.name,
		width: obj.width,
		height: obj.height,
		tileSize: obj.tileSize,
		tilemap: tilemap as number[][],
	};
}

/**
 * Create a MapData object from editor state.
 *
 * @param id - Unique identifier for the map
 * @param name - Display name for the map
 * @param tiles - 2D array of tile IDs from the editor
 * @param width - Width in tiles
 * @param height - Height in tiles
 * @param tileSize - Size of each tile in pixels (default 16)
 * @returns MapData object ready for JSON serialization
 */
export function createMapData(
	id: string,
	name: string,
	tiles: number[][],
	width: number,
	height: number,
	tileSize = 16,
): MapData {
	return {
		id,
		name,
		width,
		height,
		tileSize,
		tilemap: tiles,
	};
}

/**
 * Generate a unique map ID from a name.
 * Converts to lowercase, replaces spaces with hyphens, removes special chars.
 */
export function generateMapId(name: string): string {
	const base = name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");

	// Add timestamp suffix for uniqueness
	const timestamp = Date.now().toString(36);
	return `${base}-${timestamp}`;
}
