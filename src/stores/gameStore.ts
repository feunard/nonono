/**
 * Game Store
 *
 * Manages core game state:
 * - App screen routing (menu, playing, editor)
 * - Game readiness
 * - Pause and game over states
 * - Game stats (wave, kills, orcs, time, fps)
 * - Orc positions (for minimap)
 */

import { create } from "zustand";

type GameOverStats = {
	survivalTime: number;
	kills: number;
	wave: number;
};

// App-level state for screen routing (separate from in-game state)
export type AppScreen = "menu" | "playing" | "editor";

type Position = { x: number; y: number };

type GameState = {
	appScreen: AppScreen;
	isGameReady: boolean;
	isPaused: boolean;
	isGameOver: boolean;
	gameOverStats: GameOverStats | null;
	wave: number;
	kills: number;
	orcsAlive: number;
	elapsedTime: number;
	fps: number;
	orcPositions: Position[];
};

type UIBatchUpdate = {
	health: number;
	maxHealth: number;
	wave: number;
	kills: number;
	orcsAlive: number;
	elapsedTime: number;
	fps: number;
	heroPosition: Position;
	orcPositions: Position[];
};

type GameActions = {
	startGame: () => void;
	openEditor: () => void;
	goToMenu: () => void;
	setGameReady: () => void;
	setPaused: (isPaused: boolean) => void;
	setGameOver: (stats: GameOverStats) => void;
	updateWave: (wave: number) => void;
	updateKills: (kills: number) => void;
	updateOrcsAlive: (orcsAlive: number) => void;
	updateTime: (elapsedTime: number) => void;
	updateFPS: (fps: number) => void;
	updateOrcPositions: (positions: Position[]) => void;
	batchUpdateUI: (updates: UIBatchUpdate) => void;
	reset: () => void;
};

const initialState: GameState = {
	appScreen: "menu",
	isGameReady: false,
	isPaused: false,
	isGameOver: false,
	gameOverStats: null,
	wave: 1,
	kills: 0,
	orcsAlive: 0,
	elapsedTime: 0,
	fps: 0,
	orcPositions: [],
};

// Import other stores for batch update and reset coordination
import { heroStore } from "./heroStore";
import { inventoryStore } from "./inventoryStore";
import { uiStore } from "./uiStore";

export const useGameStore = create<GameState & GameActions>((set) => ({
	...initialState,

	startGame: () => set({ appScreen: "playing" }),

	openEditor: () => set({ appScreen: "editor" }),

	goToMenu: () => set({ appScreen: "menu" }),

	setGameReady: () => set({ isGameReady: true }),

	setPaused: (isPaused) => set({ isPaused }),

	setGameOver: (stats) =>
		set({
			isGameOver: true,
			gameOverStats: stats,
		}),

	updateWave: (wave) => set({ wave }),

	updateKills: (kills) => set({ kills }),

	updateOrcsAlive: (orcsAlive) => set({ orcsAlive }),

	updateTime: (elapsedTime) => set({ elapsedTime }),

	updateFPS: (fps) => set({ fps }),

	updateOrcPositions: (positions) => set({ orcPositions: positions }),

	// Batch update UI stats in a single set() call to minimize React re-renders
	// This also updates hero store for health/energy/position
	batchUpdateUI: (updates) => {
		// Update hero store
		heroStore.updateHealth(updates.health, updates.maxHealth);
		heroStore.updateHeroPosition(updates.heroPosition);

		// Update game store
		set({
			wave: updates.wave,
			kills: updates.kills,
			orcsAlive: updates.orcsAlive,
			elapsedTime: updates.elapsedTime,
			fps: updates.fps,
			orcPositions: updates.orcPositions,
		});
	},

	reset: () => {
		// Reset all stores
		heroStore.reset();
		inventoryStore.reset();
		uiStore.reset();

		set((state) => ({
			...initialState,
			// Preserve these flags across restarts
			isGameReady: state.isGameReady,
		}));
	},
}));

// For use outside React components (e.g., in Phaser)
export const gameStore = {
	getState: useGameStore.getState,
	startGame: () => useGameStore.getState().startGame(),
	openEditor: () => useGameStore.getState().openEditor(),
	goToMenu: () => useGameStore.getState().goToMenu(),
	setGameReady: () => useGameStore.getState().setGameReady(),
	setPaused: (isPaused: boolean) => useGameStore.getState().setPaused(isPaused),
	setGameOver: (stats: GameOverStats) =>
		useGameStore.getState().setGameOver(stats),
	updateWave: (wave: number) => useGameStore.getState().updateWave(wave),
	updateKills: (kills: number) => useGameStore.getState().updateKills(kills),
	updateOrcsAlive: (orcsAlive: number) =>
		useGameStore.getState().updateOrcsAlive(orcsAlive),
	updateTime: (elapsedTime: number) =>
		useGameStore.getState().updateTime(elapsedTime),
	updateFPS: (fps: number) => useGameStore.getState().updateFPS(fps),
	updateOrcPositions: (positions: Position[]) =>
		useGameStore.getState().updateOrcPositions(positions),
	batchUpdateUI: (updates: UIBatchUpdate) =>
		useGameStore.getState().batchUpdateUI(updates),
	reset: () => useGameStore.getState().reset(),
};

export type { GameState, GameOverStats, Position };
