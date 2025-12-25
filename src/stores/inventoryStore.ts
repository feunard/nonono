/**
 * Inventory Store
 *
 * Manages inventory-related state:
 * - Collected powers
 * - Loot bag count
 * - Loot selection dialog state
 */

import { create } from "zustand";
import type { Power } from "../config/PowersConfig";

type InventoryState = {
	collectedPowers: Power[];
	bagCount: number;
	isLootSelection: boolean;
	lootPowers: Power[];
};

type InventoryActions = {
	applyPower: (power: Power) => void;
	addBag: () => void;
	consumeBag: () => void;
	showLootSelection: (powers: Power[]) => void;
	hideLootSelection: () => void;
	reset: () => void;
};

const initialState: InventoryState = {
	collectedPowers: [],
	bagCount: 0,
	isLootSelection: false,
	lootPowers: [],
};

export const useInventoryStore = create<InventoryState & InventoryActions>(
	(set) => ({
		...initialState,

		applyPower: (power) =>
			set((state) => ({
				collectedPowers: [...state.collectedPowers, power],
			})),

		addBag: () => set((state) => ({ bagCount: state.bagCount + 1 })),

		consumeBag: () =>
			set((state) => ({ bagCount: Math.max(0, state.bagCount - 1) })),

		showLootSelection: (powers) =>
			set({ isLootSelection: true, lootPowers: powers }),

		hideLootSelection: () => set({ isLootSelection: false, lootPowers: [] }),

		reset: () => set({ ...initialState }),
	}),
);

// For use outside React components (e.g., in Phaser)
export const inventoryStore = {
	getState: useInventoryStore.getState,
	applyPower: (power: Power) => useInventoryStore.getState().applyPower(power),
	addBag: () => useInventoryStore.getState().addBag(),
	consumeBag: () => useInventoryStore.getState().consumeBag(),
	showLootSelection: (powers: Power[]) =>
		useInventoryStore.getState().showLootSelection(powers),
	hideLootSelection: () => useInventoryStore.getState().hideLootSelection(),
	reset: () => useInventoryStore.getState().reset(),
};
