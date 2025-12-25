import { create } from "zustand";
import type { BonusStat, Power } from "../config/PowersConfig";

type GameOverStats = {
	survivalTime: number;
	kills: number;
	wave: number;
};

// App-level state for screen routing (separate from in-game state)
export type AppScreen = "menu" | "playing";

type LogEntry = {
	id: number;
	message: string;
	timestamp: number;
};

type CooldownState = {
	lastUsed: number;
	duration: number;
};

type BonusStats = {
	strength: number;
	agility: number;
	critical: number;
	luck: number;
	health: number;
	moveSpeed: number;
	bowRange: number;
	// Offensive powers
	critMultiplier: number; // Adds to base 2x crit (0.1 = +10% = 2.1x total)
	piercing: number; // Flat points subtracted from target's armor before damage calc
	accuracy: number; // Flat points subtracted from target's dodge before roll
	damageMultiplier: number; // % bonus to all damage (0.15 = +15%)
	// Defensive powers
	dodge: number; // Flat points added to base dodge (caps at 100)
	armor: number; // Flat points added to base armor (caps at 100)
	hpRegen: number; // HP regenerated per second
	// Arrow powers
	arrowCount: number; // Extra arrows per shot (1 = double shot, 2 = triple, etc.)
	arrowPierce: number; // Number of extra enemies arrows can pierce (1 = pierce 1 enemy)
	arrowBounce: number; // Number of times arrows can bounce to new targets
	// On-Hit powers
	lifesteal: number; // % of damage dealt healed (0.05 = 5%)
	// Sword powers
	swordCleave: number; // 0 = off, 1+ = hit all enemies in range
	swordAttackSpeed: number; // % bonus sword attack speed (0.1 = +10%)
	riposteChance: number; // % chance to counter attack when dodging (0.5 = 50%)
	executeThreshold: number; // Kill enemies below this % HP (0.1 = 10%)
	vorpalChance: number; // % chance to instant kill on hit (0.01 = 1%)
	// Advanced arrow powers
	arrowHoming: number; // Arrows track targets (0 = off, 1+ = strength)
	arrowExplosive: number; // Explosion radius in pixels (0 = off)
};

// Check URL param for initial debug state
const urlDebugMode =
	new URLSearchParams(window.location.search).get("debug") === "true";

type GameState = {
	appScreen: AppScreen; // Which screen is currently displayed
	isGameReady: boolean; // True when Phaser has fully loaded and GameScene is ready
	health: number;
	maxHealth: number;
	wave: number;
	kills: number;
	orcsAlive: number;
	elapsedTime: number;
	fps: number;
	isPaused: boolean;
	isGameOver: boolean;
	gameOverStats: GameOverStats | null;
	arrowCooldown: CooldownState;
	meleeCooldown: CooldownState;
	isLootSelection: boolean;
	lootPowers: Power[];
	bonusStats: BonusStats;
	collectedPowers: Power[];
	isDebugPowerOverlay: boolean;
	isDebugMode: boolean;
	logs: LogEntry[];
	logIdCounter: number;
	zoomLevel: number;
	bagCount: number; // Number of unopened loot bags in inventory
	isSpawnPaused: boolean; // Debug: whether orc spawning is paused
	energy: number; // Current energy (0-100)
	isSprinting: boolean; // Whether sprint is currently active
	heroPosition: Position; // Hero position for minimap
	orcPositions: Position[]; // Orc positions for minimap
};

type Position = { x: number; y: number };

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
	startGame: () => void; // Transition from menu to playing
	setGameReady: () => void;
	updateHealth: (health: number, maxHealth: number) => void;
	updateWave: (wave: number) => void;
	updateKills: (kills: number) => void;
	updateOrcsAlive: (orcsAlive: number) => void;
	updateTime: (elapsedTime: number) => void;
	updateFPS: (fps: number) => void;
	batchUpdateUI: (updates: UIBatchUpdate) => void;
	setPaused: (isPaused: boolean) => void;
	setGameOver: (stats: GameOverStats) => void;
	triggerArrowCooldown: (duration: number) => void;
	triggerMeleeCooldown: (duration: number) => void;
	showLootSelection: (powers: Power[]) => void;
	hideLootSelection: () => void;
	applyPower: (power: Power) => void;
	addBonus: (stat: BonusStat, value: number) => void;
	showDebugPowerOverlay: () => void;
	hideDebugPowerOverlay: () => void;
	toggleDebugMode: () => void;
	addLog: (message: string) => void;
	setZoomLevel: (level: number) => void;
	addBag: () => void;
	consumeBag: () => void;
	toggleSpawnPaused: () => void;
	updateEnergy: (energy: number) => void;
	setIsSprinting: (isSprinting: boolean) => void;
	reset: () => void;
};

const initialBonusStats: BonusStats = {
	strength: 0,
	agility: 0,
	critical: 0,
	luck: 0,
	health: 0,
	moveSpeed: 0,
	bowRange: 0,
	// Offensive powers
	critMultiplier: 0,
	piercing: 0,
	accuracy: 0,
	damageMultiplier: 0,
	// Defensive powers
	dodge: 0,
	armor: 0,
	hpRegen: 0,
	// Arrow powers
	arrowCount: 0,
	arrowPierce: 0,
	arrowBounce: 0,
	// On-Hit powers
	lifesteal: 0,
	// Sword powers
	swordCleave: 0,
	swordAttackSpeed: 0,
	riposteChance: 0,
	executeThreshold: 0,
	vorpalChance: 0,
	// Advanced arrow powers
	arrowHoming: 0,
	arrowExplosive: 0,
};

const MAX_LOGS = 1000;

const initialState: GameState = {
	appScreen: "menu",
	isGameReady: false,
	health: 100,
	maxHealth: 100,
	wave: 1,
	kills: 0,
	orcsAlive: 0,
	elapsedTime: 0,
	fps: 0,
	isPaused: false,
	isGameOver: false,
	gameOverStats: null,
	arrowCooldown: { lastUsed: 0, duration: 0 },
	meleeCooldown: { lastUsed: 0, duration: 0 },
	isLootSelection: false,
	lootPowers: [],
	bonusStats: { ...initialBonusStats },
	collectedPowers: [],
	isDebugPowerOverlay: false,
	isDebugMode: urlDebugMode,
	logs: [],
	logIdCounter: 0,
	zoomLevel: 2,
	bagCount: 0,
	isSpawnPaused: false,
	energy: 100,
	isSprinting: false,
	heroPosition: { x: 0, y: 0 },
	orcPositions: [],
};

export const useGameStore = create<GameState & GameActions>((set) => ({
	...initialState,

	startGame: () => set({ appScreen: "playing" }),

	setGameReady: () => set({ isGameReady: true }),

	updateHealth: (health, maxHealth) => set({ health, maxHealth }),

	updateWave: (wave) => set({ wave }),

	updateKills: (kills) => set({ kills }),

	updateOrcsAlive: (orcsAlive) => set({ orcsAlive }),

	updateTime: (elapsedTime) => set({ elapsedTime }),

	updateFPS: (fps) => set({ fps }),

	// Batch update UI stats in a single set() call to minimize React re-renders
	batchUpdateUI: (updates) =>
		set({
			health: updates.health,
			maxHealth: updates.maxHealth,
			wave: updates.wave,
			kills: updates.kills,
			orcsAlive: updates.orcsAlive,
			elapsedTime: updates.elapsedTime,
			fps: updates.fps,
			heroPosition: updates.heroPosition,
			orcPositions: updates.orcPositions,
		}),

	setPaused: (isPaused) => set({ isPaused }),

	setGameOver: (stats) =>
		set({
			isGameOver: true,
			gameOverStats: stats,
		}),

	triggerArrowCooldown: (duration) =>
		set({ arrowCooldown: { lastUsed: Date.now(), duration } }),

	triggerMeleeCooldown: (duration) =>
		set({ meleeCooldown: { lastUsed: Date.now(), duration } }),

	showLootSelection: (powers) =>
		set({ isLootSelection: true, lootPowers: powers }),

	hideLootSelection: () => set({ isLootSelection: false, lootPowers: [] }),

	applyPower: (power) =>
		set((state) => ({
			bonusStats: {
				...state.bonusStats,
				[power.effect.stat]:
					state.bonusStats[power.effect.stat] + power.effect.value,
			},
			collectedPowers: [...state.collectedPowers, power],
		})),

	addBonus: (stat, value) =>
		set((state) => ({
			bonusStats: {
				...state.bonusStats,
				[stat]: state.bonusStats[stat] + value,
			},
		})),

	showDebugPowerOverlay: () => set({ isDebugPowerOverlay: true }),

	hideDebugPowerOverlay: () => set({ isDebugPowerOverlay: false }),

	toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),

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

	addBag: () => set((state) => ({ bagCount: state.bagCount + 1 })),

	consumeBag: () =>
		set((state) => ({ bagCount: Math.max(0, state.bagCount - 1) })),

	toggleSpawnPaused: () =>
		set((state) => ({ isSpawnPaused: !state.isSpawnPaused })),

	updateEnergy: (energy) => set({ energy: Math.max(0, Math.min(100, energy)) }),

	setIsSprinting: (isSprinting) => set({ isSprinting }),

	reset: () =>
		set((state) => ({
			...initialState,
			// Preserve these flags across restarts
			isGameReady: state.isGameReady,
			isDebugMode: state.isDebugMode,
		})),
}));

// For use outside React components (e.g., in Phaser)
export const gameStore = {
	getState: useGameStore.getState,
	startGame: () => useGameStore.getState().startGame(),
	setGameReady: () => useGameStore.getState().setGameReady(),
	updateHealth: (health: number, maxHealth: number) =>
		useGameStore.getState().updateHealth(health, maxHealth),
	updateWave: (wave: number) => useGameStore.getState().updateWave(wave),
	updateKills: (kills: number) => useGameStore.getState().updateKills(kills),
	updateOrcsAlive: (orcsAlive: number) =>
		useGameStore.getState().updateOrcsAlive(orcsAlive),
	updateTime: (elapsedTime: number) =>
		useGameStore.getState().updateTime(elapsedTime),
	updateFPS: (fps: number) => useGameStore.getState().updateFPS(fps),
	batchUpdateUI: (updates: UIBatchUpdate) =>
		useGameStore.getState().batchUpdateUI(updates),
	setPaused: (isPaused: boolean) => useGameStore.getState().setPaused(isPaused),
	setGameOver: (stats: GameOverStats) =>
		useGameStore.getState().setGameOver(stats),
	triggerArrowCooldown: (duration: number) =>
		useGameStore.getState().triggerArrowCooldown(duration),
	triggerMeleeCooldown: (duration: number) =>
		useGameStore.getState().triggerMeleeCooldown(duration),
	showLootSelection: (powers: Power[]) =>
		useGameStore.getState().showLootSelection(powers),
	hideLootSelection: () => useGameStore.getState().hideLootSelection(),
	applyPower: (power: Power) => useGameStore.getState().applyPower(power),
	addBonus: (stat: BonusStat, value: number) =>
		useGameStore.getState().addBonus(stat, value),
	showDebugPowerOverlay: () => useGameStore.getState().showDebugPowerOverlay(),
	hideDebugPowerOverlay: () => useGameStore.getState().hideDebugPowerOverlay(),
	toggleDebugMode: () => useGameStore.getState().toggleDebugMode(),
	addLog: (message: string) => useGameStore.getState().addLog(message),
	setZoomLevel: (level: number) => useGameStore.getState().setZoomLevel(level),
	addBag: () => useGameStore.getState().addBag(),
	consumeBag: () => useGameStore.getState().consumeBag(),
	toggleSpawnPaused: () => useGameStore.getState().toggleSpawnPaused(),
	updateEnergy: (energy: number) =>
		useGameStore.getState().updateEnergy(energy),
	setIsSprinting: (isSprinting: boolean) =>
		useGameStore.getState().setIsSprinting(isSprinting),
	reset: () => useGameStore.getState().reset(),
};

export type { GameState, BonusStats, LogEntry, Position };
