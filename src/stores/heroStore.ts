/**
 * Hero Store
 *
 * Manages hero-related state:
 * - Health and max health
 * - Energy and sprint state
 * - Position (for minimap)
 * - Bonus stats from powers
 * - Attack cooldowns (arrow and melee)
 */

import { create } from "zustand";
import type { BonusStat } from "../config/PowersConfig";

type CooldownState = {
	lastUsed: number;
	duration: number;
};

type Position = { x: number; y: number };

export type BonusStats = {
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

type HeroState = {
	health: number;
	maxHealth: number;
	energy: number;
	isSprinting: boolean;
	heroPosition: Position;
	bonusStats: BonusStats;
	arrowCooldown: CooldownState;
	meleeCooldown: CooldownState;
};

type HeroActions = {
	updateHealth: (health: number, maxHealth: number) => void;
	updateEnergy: (energy: number) => void;
	setIsSprinting: (isSprinting: boolean) => void;
	updateHeroPosition: (position: Position) => void;
	addBonus: (stat: BonusStat, value: number) => void;
	triggerArrowCooldown: (duration: number) => void;
	triggerMeleeCooldown: (duration: number) => void;
	reset: () => void;
};

const initialState: HeroState = {
	health: 100,
	maxHealth: 100,
	energy: 100,
	isSprinting: false,
	heroPosition: { x: 0, y: 0 },
	bonusStats: { ...initialBonusStats },
	arrowCooldown: { lastUsed: 0, duration: 0 },
	meleeCooldown: { lastUsed: 0, duration: 0 },
};

export const useHeroStore = create<HeroState & HeroActions>((set) => ({
	...initialState,

	updateHealth: (health, maxHealth) => set({ health, maxHealth }),

	updateEnergy: (energy) => set({ energy: Math.max(0, Math.min(100, energy)) }),

	setIsSprinting: (isSprinting) => set({ isSprinting }),

	updateHeroPosition: (position) => set({ heroPosition: position }),

	addBonus: (stat, value) =>
		set((state) => ({
			bonusStats: {
				...state.bonusStats,
				[stat]: state.bonusStats[stat] + value,
			},
		})),

	triggerArrowCooldown: (duration) =>
		set({ arrowCooldown: { lastUsed: Date.now(), duration } }),

	triggerMeleeCooldown: (duration) =>
		set({ meleeCooldown: { lastUsed: Date.now(), duration } }),

	reset: () => set({ ...initialState }),
}));

// For use outside React components (e.g., in Phaser)
export const heroStore = {
	getState: useHeroStore.getState,
	updateHealth: (health: number, maxHealth: number) =>
		useHeroStore.getState().updateHealth(health, maxHealth),
	updateEnergy: (energy: number) =>
		useHeroStore.getState().updateEnergy(energy),
	setIsSprinting: (isSprinting: boolean) =>
		useHeroStore.getState().setIsSprinting(isSprinting),
	updateHeroPosition: (position: Position) =>
		useHeroStore.getState().updateHeroPosition(position),
	addBonus: (stat: BonusStat, value: number) =>
		useHeroStore.getState().addBonus(stat, value),
	triggerArrowCooldown: (duration: number) =>
		useHeroStore.getState().triggerArrowCooldown(duration),
	triggerMeleeCooldown: (duration: number) =>
		useHeroStore.getState().triggerMeleeCooldown(duration),
	reset: () => useHeroStore.getState().reset(),
};

export type { Position };
