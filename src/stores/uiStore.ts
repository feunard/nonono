/**
 * UI Store
 *
 * Manages UI-related state:
 * - Debug mode and debug overlays
 * - Spawn paused state (debug feature)
 * - Combat logs
 * - Zoom level
 */

import { create } from "zustand";

type LogEntry = {
	id: number;
	message: string;
	timestamp: number;
};

// Check URL param for initial debug state
const urlDebugMode =
	new URLSearchParams(window.location.search).get("debug") === "true";

const MAX_LOGS = 1000;

type UIState = {
	isDebugMode: boolean;
	isDebugPowerOverlay: boolean;
	isSpawnPaused: boolean;
	logs: LogEntry[];
	logIdCounter: number;
	zoomLevel: number;
};

type UIActions = {
	toggleDebugMode: () => void;
	showDebugPowerOverlay: () => void;
	hideDebugPowerOverlay: () => void;
	toggleSpawnPaused: () => void;
	addLog: (message: string) => void;
	setZoomLevel: (level: number) => void;
	reset: () => void;
};

const initialState: UIState = {
	isDebugMode: urlDebugMode,
	isDebugPowerOverlay: false,
	isSpawnPaused: false,
	logs: [],
	logIdCounter: 0,
	zoomLevel: 2,
};

export const useUIStore = create<UIState & UIActions>((set) => ({
	...initialState,

	toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),

	showDebugPowerOverlay: () => set({ isDebugPowerOverlay: true }),

	hideDebugPowerOverlay: () => set({ isDebugPowerOverlay: false }),

	toggleSpawnPaused: () =>
		set((state) => ({ isSpawnPaused: !state.isSpawnPaused })),

	addLog: (message) =>
		set((state) => {
			const newLog: LogEntry = {
				id: state.logIdCounter,
				message,
				timestamp: Date.now(),
			};
			// Avoid double copy: slice first if at max, then append
			const newLogs =
				state.logs.length >= MAX_LOGS
					? [...state.logs.slice(1), newLog]
					: [...state.logs, newLog];
			return {
				logs: newLogs,
				logIdCounter: state.logIdCounter + 1,
			};
		}),

	setZoomLevel: (level) => set({ zoomLevel: level }),

	reset: () =>
		set((state) => ({
			...initialState,
			// Preserve debug mode across restarts
			isDebugMode: state.isDebugMode,
		})),
}));

// For use outside React components (e.g., in Phaser)
export const uiStore = {
	getState: useUIStore.getState,
	toggleDebugMode: () => useUIStore.getState().toggleDebugMode(),
	showDebugPowerOverlay: () => useUIStore.getState().showDebugPowerOverlay(),
	hideDebugPowerOverlay: () => useUIStore.getState().hideDebugPowerOverlay(),
	toggleSpawnPaused: () => useUIStore.getState().toggleSpawnPaused(),
	addLog: (message: string) => useUIStore.getState().addLog(message),
	setZoomLevel: (level: number) => useUIStore.getState().setZoomLevel(level),
	reset: () => useUIStore.getState().reset(),
};

export type { LogEntry };
