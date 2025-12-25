/**
 * Editor Store
 *
 * Manages map editor state:
 * - Tile data and map dimensions
 * - Selected tile and tool
 * - Zoom and grid visibility
 * - Undo/redo history
 * - Hover position for status bar
 */

import { create } from "zustand";
import { getAvailableMaps, getMapConfig } from "../config/MapConfig";
import { createMapData, generateMapId, type MapData } from "../config/MapData";

const MAX_HISTORY = 50;

export type TileId = 0 | 1 | 2;

export type MapSize = 32 | 64 | 128;

export const MAP_SIZES: MapSize[] = [32, 64, 128];

export const TILES = [
	{
		id: 0 as const,
		name: "Empty",
		color: "transparent",
		collide: false,
		hardCollide: false,
	},
	{
		id: 1 as const,
		name: "Wall",
		color: "#444444",
		collide: true,
		hardCollide: false,
	},
	{
		id: 2 as const,
		name: "Hard Wall",
		color: "#000000",
		collide: true,
		hardCollide: true,
	},
] as const;

type Position = { x: number; y: number };

type EditorState = {
	// Map data
	width: MapSize;
	height: MapSize;
	tiles: number[][];

	// Editor settings
	selectedTile: TileId;
	tool: "paint" | "erase";
	showGrid: boolean;
	zoom: number;

	// UI state
	hoverPosition: Position | null;
	importError: string | null;
	isReady: boolean;

	// File handle for File System Access API
	fileHandle: FileSystemFileHandle | null;
	fileName: string | null;
	mapId: string | null;
	hasUnsavedChanges: boolean;

	// History for undo/redo
	history: number[][][];
	future: number[][][];
};

type EditorActions = {
	// Tile operations
	setTile: (x: number, y: number, tileId: number) => void;
	setTiles: (tiles: number[][]) => void;
	selectTile: (tileId: TileId) => void;
	setTool: (tool: "paint" | "erase") => void;

	// Map operations
	setMapSize: (size: MapSize) => void;
	clearMap: () => void;
	importMap: (mapData: MapData) => void;
	loadMap: (mapId: string) => void;
	exportMap: (mapName?: string) => void;

	// File System Access API operations
	openFile: () => Promise<void>;
	saveFile: () => Promise<void>;
	saveFileAs: () => Promise<void>;
	markUnsaved: () => void;

	// View operations
	toggleGrid: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	setZoom: (zoom: number) => void;

	// UI state
	setHover: (position: Position | null) => void;
	setImportError: (error: string | null) => void;
	clearImportError: () => void;
	setReady: () => void;

	// History
	saveToHistory: () => void;
	undo: () => void;
	redo: () => void;

	// Reset
	reset: () => void;
};

function createEmptyTiles(width: number, height: number): number[][] {
	return Array.from({ length: height }, () => Array(width).fill(0));
}

function cloneTiles(tiles: number[][]): number[][] {
	return tiles.map((row) => [...row]);
}

const initialState: EditorState = {
	width: 32,
	height: 32,
	tiles: createEmptyTiles(32, 32),
	selectedTile: 1,
	tool: "paint",
	showGrid: true,
	zoom: 1,
	hoverPosition: null,
	importError: null,
	isReady: false,
	fileHandle: null,
	fileName: null,
	mapId: null,
	hasUnsavedChanges: false,
	history: [],
	future: [],
};

// Check if File System Access API is supported
function isFileSystemAccessSupported(): boolean {
	return "showOpenFilePicker" in window && "showSaveFilePicker" in window;
}

// Create map data JSON from current state
function createMapJson(state: EditorState): string {
	const name = state.fileName?.replace(/\.json$/, "") || "Untitled Map";
	// Use preserved ID if available, otherwise generate new one
	const id = state.mapId || generateMapId(name);
	const mapData = createMapData(
		id,
		name,
		state.tiles,
		state.width,
		state.height,
		16,
	);
	return JSON.stringify(mapData, null, 2);
}

export const useEditorStore = create<EditorState & EditorActions>(
	(set, get) => ({
		...initialState,

		setTile: (x, y, tileId) => {
			const state = get();
			if (x < 0 || x >= state.width || y < 0 || y >= state.height) return;
			if (state.tiles[y][x] === tileId) return;

			const newTiles = state.tiles.map((row, rowY) =>
				rowY === y
					? row.map((tile, colX) => (colX === x ? tileId : tile))
					: row,
			);
			set({ tiles: newTiles, hasUnsavedChanges: true });
		},

		setTiles: (tiles) => set({ tiles }),

		selectTile: (tileId) => set({ selectedTile: tileId }),

		setTool: (tool) => set({ tool }),

		setMapSize: (size) => {
			get().saveToHistory();
			set({
				width: size,
				height: size,
				tiles: createEmptyTiles(size, size),
			});
		},

		clearMap: () => {
			get().saveToHistory();
			const state = get();
			set({ tiles: createEmptyTiles(state.width, state.height) });
		},

		importMap: (mapData) => {
			const width = (
				[32, 64, 128].includes(mapData.width) ? mapData.width : 64
			) as MapSize;
			const height = (
				[32, 64, 128].includes(mapData.height) ? mapData.height : 64
			) as MapSize;
			set({
				width,
				height,
				tiles: mapData.tilemap,
				importError: null,
				history: [],
				future: [],
			});
		},

		loadMap: (mapId) => {
			try {
				const mapData = getMapConfig(mapId);
				get().importMap(mapData);
			} catch {
				set({ importError: `Failed to load map: ${mapId}` });
			}
		},

		exportMap: (mapName) => {
			const state = get();
			const name = mapName?.trim() || "Untitled Map";
			const id = generateMapId(name);
			const mapData = createMapData(
				id,
				name,
				state.tiles,
				state.width,
				state.height,
				16,
			);

			const json = JSON.stringify(mapData, null, 2);
			const blob = new Blob([json], { type: "application/json" });
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `${id}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		},

		openFile: async () => {
			if (!isFileSystemAccessSupported()) {
				set({
					importError: "File System Access API not supported in this browser",
				});
				return;
			}

			try {
				const [fileHandle] = await window.showOpenFilePicker({
					types: [
						{
							description: "JSON Map Files",
							accept: { "application/json": [".json"] },
						},
					],
					multiple: false,
				});

				const file = await fileHandle.getFile();
				const content = await file.text();
				const data = JSON.parse(content);

				// Basic validation
				if (!data.tilemap || !data.width || !data.height) {
					set({ importError: "Invalid map format" });
					return;
				}

				get().importMap(data);
				set({
					fileHandle,
					fileName: file.name,
					mapId: data.id || null,
					hasUnsavedChanges: false,
				});
			} catch (error) {
				// User cancelled the picker or other error
				if (error instanceof Error && error.name !== "AbortError") {
					set({ importError: `Failed to open file: ${error.message}` });
				}
			}
		},

		saveFile: async () => {
			const state = get();

			// If no file handle, use Save As
			if (!state.fileHandle) {
				return get().saveFileAs();
			}

			if (!isFileSystemAccessSupported()) {
				set({ importError: "File System Access API not supported" });
				return;
			}

			try {
				const writable = await state.fileHandle.createWritable();
				await writable.write(createMapJson(state));
				await writable.close();
				set({ hasUnsavedChanges: false });
			} catch (error) {
				if (error instanceof Error && error.name !== "AbortError") {
					set({ importError: `Failed to save file: ${error.message}` });
				}
			}
		},

		saveFileAs: async () => {
			if (!isFileSystemAccessSupported()) {
				// Fallback to download
				get().exportMap();
				return;
			}

			const state = get();
			const suggestedName = state.fileName || "map.json";

			try {
				const fileHandle = await window.showSaveFilePicker({
					suggestedName,
					types: [
						{
							description: "JSON Map Files",
							accept: { "application/json": [".json"] },
						},
					],
				});

				const writable = await fileHandle.createWritable();
				await writable.write(createMapJson(state));
				await writable.close();

				set({
					fileHandle,
					fileName: fileHandle.name,
					hasUnsavedChanges: false,
				});
			} catch (error) {
				if (error instanceof Error && error.name !== "AbortError") {
					set({ importError: `Failed to save file: ${error.message}` });
				}
			}
		},

		markUnsaved: () => set({ hasUnsavedChanges: true }),

		toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

		zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 0.25, 3) })),

		zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 0.25, 0.5) })),

		setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),

		setHover: (position) => set({ hoverPosition: position }),

		setImportError: (error) => set({ importError: error }),

		clearImportError: () => set({ importError: null }),

		setReady: () => set({ isReady: true }),

		saveToHistory: () => {
			const state = get();
			const newHistory = [...state.history, cloneTiles(state.tiles)];
			if (newHistory.length > MAX_HISTORY) {
				newHistory.shift();
			}
			set({ history: newHistory, future: [] });
		},

		undo: () => {
			const state = get();
			if (state.history.length === 0) return;

			const newHistory = [...state.history];
			const previousTiles = newHistory.pop();
			if (previousTiles) {
				set({
					history: newHistory,
					future: [cloneTiles(state.tiles), ...state.future],
					tiles: previousTiles,
				});
			}
		},

		redo: () => {
			const state = get();
			if (state.future.length === 0) return;

			const newFuture = [...state.future];
			const nextTiles = newFuture.shift();
			if (nextTiles) {
				set({
					future: newFuture,
					history: [...state.history, cloneTiles(state.tiles)],
					tiles: nextTiles,
				});
			}
		},

		reset: () => set(initialState),
	}),
);

// For use outside React components (e.g., in Phaser)
export const editorStore = {
	getState: useEditorStore.getState,
	subscribe: useEditorStore.subscribe,
	setTile: (x: number, y: number, tileId: number) =>
		useEditorStore.getState().setTile(x, y, tileId),
	setTiles: (tiles: number[][]) => useEditorStore.getState().setTiles(tiles),
	selectTile: (tileId: TileId) => useEditorStore.getState().selectTile(tileId),
	setTool: (tool: "paint" | "erase") => useEditorStore.getState().setTool(tool),
	setMapSize: (size: MapSize) => useEditorStore.getState().setMapSize(size),
	clearMap: () => useEditorStore.getState().clearMap(),
	importMap: (mapData: MapData) => useEditorStore.getState().importMap(mapData),
	loadMap: (mapId: string) => useEditorStore.getState().loadMap(mapId),
	exportMap: (mapName?: string) => useEditorStore.getState().exportMap(mapName),
	openFile: () => useEditorStore.getState().openFile(),
	saveFile: () => useEditorStore.getState().saveFile(),
	saveFileAs: () => useEditorStore.getState().saveFileAs(),
	markUnsaved: () => useEditorStore.getState().markUnsaved(),
	toggleGrid: () => useEditorStore.getState().toggleGrid(),
	zoomIn: () => useEditorStore.getState().zoomIn(),
	zoomOut: () => useEditorStore.getState().zoomOut(),
	setZoom: (zoom: number) => useEditorStore.getState().setZoom(zoom),
	setHover: (position: Position | null) =>
		useEditorStore.getState().setHover(position),
	setImportError: (error: string | null) =>
		useEditorStore.getState().setImportError(error),
	clearImportError: () => useEditorStore.getState().clearImportError(),
	setReady: () => useEditorStore.getState().setReady(),
	saveToHistory: () => useEditorStore.getState().saveToHistory(),
	undo: () => useEditorStore.getState().undo(),
	redo: () => useEditorStore.getState().redo(),
	reset: () => useEditorStore.getState().reset(),
	getAvailableMaps,
};
