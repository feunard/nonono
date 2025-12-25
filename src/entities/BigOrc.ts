import { GAME_CONFIG } from "../config/GameConfig";
import type { EffectsManager } from "../systems/EffectsManager";
import type { PathfindingManager } from "../systems/PathfindingManager";
import { Foe, type FoeConfig } from "./Foe";

/**
 * BigOrc configuration.
 * Larger, tankier variant with 1.5x scale, +50% HP, and +25% damage.
 * Uses the same sprites as Orc, just scaled up.
 */
const BIG_ORC_CONFIG: FoeConfig = {
	spriteKey: "orc-idle",
	animations: {
		idle: "orc-idle",
		walk: "orc-walk",
		attack: "orc-attack",
		death: "orc-death",
	},
	scale: 1.5,
	bodySize: {
		width: GAME_CONFIG.orc.hitboxWidth,
		height: GAME_CONFIG.orc.hitboxHeight,
	},
	bodyOffset: {
		x: GAME_CONFIG.orc.hitboxOffsetX,
		y: GAME_CONFIG.orc.hitboxOffsetY,
	},
	baseHealth: GAME_CONFIG.orc.health,
	baseDamage: GAME_CONFIG.orc.damage,
	baseSpeed: GAME_CONFIG.orc.speed,
	baseArmor: GAME_CONFIG.orc.armor,
	baseDodge: GAME_CONFIG.orc.dodge,
	baseAccuracy: GAME_CONFIG.orc.accuracy,
	// BigOrc stat multipliers
	healthMultiplier: 1.5, // +50% HP
	damageMultiplier: 1.25, // +25% damage
	typeName: "BigOrc",
};

/**
 * BigOrc enemy.
 * A larger, tankier variant of the standard Orc.
 * - 1.5x visual scale
 * - +50% health
 * - +25% damage
 * - Same speed as regular Orc
 */
export class BigOrc extends Foe {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		pathfindingManager: PathfindingManager,
		collisionLayer: Phaser.Tilemaps.TilemapLayer,
		effectsManager: EffectsManager,
		wave: number,
	) {
		super(
			scene,
			x,
			y,
			pathfindingManager,
			collisionLayer,
			effectsManager,
			wave,
			BIG_ORC_CONFIG,
		);
	}
}
