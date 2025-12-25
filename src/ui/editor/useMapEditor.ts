import { useCallback, useReducer, useRef } from "react";
import {
	createMapData,
	generateMapId,
	type MapData,
	MapValidationError,
	validateMapData,
} from "../../config/MapData";

// Tile definitions
export const TILES = [
	{ id: 0, name: "Empty", color: "transparent", collide: false },
	{ id: 1, name: "Wall", color: "#000000", collide: true },
] as const;

export type TileId = (typeof TILES)[number]["id"];

export type MapSize = 32 | 64 | 128;

export const MAP_SIZES: MapSize[] = [32, 64, 128];

type EditorState = {
	width: MapSize;
	height: MapSize;
	tiles: number[][];
	selectedTile: TileId;
	showGrid: boolean;
	tool: "paint" | "erase";
	hoverPosition: { x: number; y: number } | null;
	zoom: number;
	importError: string | null;
};

type EditorAction =
	| { type: "SET_TILE"; x: number; y: number; tileId: number }
	| { type: "SELECT_TILE"; tileId: TileId }
	| { type: "SET_TOOL"; tool: "paint" | "erase" }
	| { type: "TOGGLE_GRID" }
	| { type: "SET_MAP_SIZE"; size: MapSize }
	| { type: "CLEAR_MAP" }
	| { type: "SET_HOVER"; position: { x: number; y: number } | null }
	| { type: "ZOOM_IN" }
	| { type: "ZOOM_OUT" }
	| { type: "SET_ZOOM"; zoom: number }
	| { type: "IMPORT_MAP"; mapData: MapData }
	| { type: "SET_IMPORT_ERROR"; error: string | null };

// Create an empty 2D array of tiles
function createEmptyTiles(width: number, height: number): number[][] {
	return Array.from({ length: height }, () => Array(width).fill(0));
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
	switch (action.type) {
		case "SET_TILE": {
			// Bounds check
			if (
				action.x < 0 ||
				action.x >= state.width ||
				action.y < 0 ||
				action.y >= state.height
			) {
				return state;
			}
			// Skip if tile is already the same
			if (state.tiles[action.y][action.x] === action.tileId) {
				return state;
			}
			// Create new tiles array with the updated tile
			const newTiles = state.tiles.map((row, y) =>
				y === action.y
					? row.map((tile, x) => (x === action.x ? action.tileId : tile))
					: row,
			);
			return { ...state, tiles: newTiles };
		}
		case "SELECT_TILE":
			return { ...state, selectedTile: action.tileId };
		case "SET_TOOL":
			return { ...state, tool: action.tool };
		case "TOGGLE_GRID":
			return { ...state, showGrid: !state.showGrid };
		case "SET_MAP_SIZE": {
			const newTiles = createEmptyTiles(action.size, action.size);
			return {
				...state,
				width: action.size,
				height: action.size,
				tiles: newTiles,
			};
		}
		case "CLEAR_MAP":
			return {
				...state,
				tiles: createEmptyTiles(state.width, state.height),
			};
		case "SET_HOVER":
			return { ...state, hoverPosition: action.position };
		case "ZOOM_IN":
			return { ...state, zoom: Math.min(state.zoom + 0.25, 3) };
		case "ZOOM_OUT":
			return { ...state, zoom: Math.max(state.zoom - 0.25, 0.5) };
		case "SET_ZOOM":
			return { ...state, zoom: Math.max(0.5, Math.min(3, action.zoom)) };
		case "IMPORT_MAP": {
			const { mapData } = action;
			// Ensure width and height are valid MapSize values
			const width = (
				[32, 64, 128].includes(mapData.width) ? mapData.width : 64
			) as MapSize;
			const height = (
				[32, 64, 128].includes(mapData.height) ? mapData.height : 64
			) as MapSize;
			return {
				...state,
				width,
				height,
				tiles: mapData.tilemap,
				importError: null,
			};
		}
		case "SET_IMPORT_ERROR":
			return { ...state, importError: action.error };
		default:
			return state;
	}
}

const initialState: EditorState = {
	width: 32,
	height: 32,
	tiles: createEmptyTiles(32, 32),
	selectedTile: 1,
	showGrid: true,
	tool: "paint",
	hoverPosition: null,
	zoom: 1,
	importError: null,
};

export function useMapEditor() {
	const [state, dispatch] = useReducer(editorReducer, initialState);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const setTile = useCallback((x: number, y: number, tileId: number) => {
		dispatch({ type: "SET_TILE", x, y, tileId });
	}, []);

	const paintTile = useCallback(
		(x: number, y: number) => {
			const tileId = state.tool === "erase" ? 0 : state.selectedTile;
			dispatch({ type: "SET_TILE", x, y, tileId });
		},
		[state.tool, state.selectedTile],
	);

	const selectTile = useCallback((tileId: TileId) => {
		dispatch({ type: "SELECT_TILE", tileId });
	}, []);

	const setTool = useCallback((tool: "paint" | "erase") => {
		dispatch({ type: "SET_TOOL", tool });
	}, []);

	const toggleGrid = useCallback(() => {
		dispatch({ type: "TOGGLE_GRID" });
	}, []);

	const setMapSize = useCallback((size: MapSize) => {
		dispatch({ type: "SET_MAP_SIZE", size });
	}, []);

	const clearMap = useCallback(() => {
		dispatch({ type: "CLEAR_MAP" });
	}, []);

	const setHover = useCallback((position: { x: number; y: number } | null) => {
		dispatch({ type: "SET_HOVER", position });
	}, []);

	const zoomIn = useCallback(() => {
		dispatch({ type: "ZOOM_IN" });
	}, []);

	const zoomOut = useCallback(() => {
		dispatch({ type: "ZOOM_OUT" });
	}, []);

	const setZoom = useCallback((zoom: number) => {
		dispatch({ type: "SET_ZOOM", zoom });
	}, []);

	const exportMap = useCallback(
		(mapName?: string) => {
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
		[state.tiles, state.width, state.height],
	);

	const importMap = useCallback((file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const data = JSON.parse(content);
				const validatedMap = validateMapData(data);
				dispatch({ type: "IMPORT_MAP", mapData: validatedMap });
			} catch (error) {
				if (error instanceof MapValidationError) {
					dispatch({ type: "SET_IMPORT_ERROR", error: error.message });
				} else if (error instanceof SyntaxError) {
					dispatch({
						type: "SET_IMPORT_ERROR",
						error: "Invalid JSON file",
					});
				} else {
					dispatch({
						type: "SET_IMPORT_ERROR",
						error: "Failed to import map",
					});
				}
			}
		};
		reader.onerror = () => {
			dispatch({ type: "SET_IMPORT_ERROR", error: "Failed to read file" });
		};
		reader.readAsText(file);
	}, []);

	const clearImportError = useCallback(() => {
		dispatch({ type: "SET_IMPORT_ERROR", error: null });
	}, []);

	const triggerImport = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				importMap(file);
			}
			// Reset input so same file can be selected again
			e.target.value = "";
		},
		[importMap],
	);

	return {
		...state,
		setTile,
		paintTile,
		selectTile,
		setTool,
		toggleGrid,
		setMapSize,
		clearMap,
		setHover,
		zoomIn,
		zoomOut,
		setZoom,
		exportMap,
		importMap,
		triggerImport,
		handleFileChange,
		clearImportError,
		fileInputRef,
	};
}

export type MapEditorState = ReturnType<typeof useMapEditor>;
