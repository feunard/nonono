/**
 * Store Index
 *
 * Re-exports all stores for convenient access.
 *
 * Store Structure:
 * - gameStore: Core game state (screen, pause, game over, wave, kills, time)
 * - heroStore: Hero state (health, energy, position, bonuses, cooldowns)
 * - uiStore: UI state (debug mode, overlays, logs, zoom)
 * - inventoryStore: Inventory state (powers, bags, loot selection)
 */

export type {
	AppScreen,
	GameOverStats,
	GameState,
	Position,
} from "./gameStore";
// Game Store - Core game state
export { gameStore, useGameStore } from "./gameStore";
export type { BonusStats } from "./heroStore";
// Hero Store - Hero-related state
export { heroStore, useHeroStore } from "./heroStore";
// Inventory Store - Powers and loot
export { inventoryStore, useInventoryStore } from "./inventoryStore";
export type { LogEntry } from "./uiStore";
// UI Store - UI-related state
export { uiStore, useUIStore } from "./uiStore";
