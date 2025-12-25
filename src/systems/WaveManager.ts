import Phaser from "phaser";
import { CHAT_MESSAGES } from "../config/ChatMessages";
import { GAME_CONFIG } from "../config/GameConfig";
import { getMapConfig } from "../config/MapConfig";
import { BigOrc } from "../entities/BigOrc";
import { Foe } from "../entities/Foe";
import type { Hero } from "../entities/Hero";
import { Orc } from "../entities/Orc";
import { uiStore } from "../stores/uiStore";
import type { EffectsManager } from "./EffectsManager";
import { LogSystem } from "./LogSystem";
import type { MapSystem } from "./MapSystem";
import type { PathfindingManager } from "./PathfindingManager";

/** Types of foes that can be spawned */
export type FoeType = "orc" | "bigOrc";

export class WaveManager {
	private scene: Phaser.Scene;
	private hero: Hero;
	private pathfindingManager: PathfindingManager;
	private collisionLayer: Phaser.Tilemaps.TilemapLayer;
	private effectsManager: EffectsManager;
	private mapSystem: MapSystem | null;
	private foeSpawnPositions: { x: number; y: number }[] = [];
	public foes: Phaser.Physics.Arcade.Group;
	private currentWave: number = 0;
	private foesToSpawn: number = 0;
	private spawnTimer: Phaser.Time.TimerEvent | null = null;
	private waveTimer: Phaser.Time.TimerEvent | null = null;
	private spawnInterval: number;

	constructor(
		scene: Phaser.Scene,
		hero: Hero,
		pathfindingManager: PathfindingManager,
		collisionLayer: Phaser.Tilemaps.TilemapLayer,
		effectsManager: EffectsManager,
		mapSystem?: MapSystem,
	) {
		this.scene = scene;
		this.hero = hero;
		this.pathfindingManager = pathfindingManager;
		this.collisionLayer = collisionLayer;
		this.effectsManager = effectsManager;
		this.mapSystem = mapSystem || null;
		this.spawnInterval = GAME_CONFIG.waves.initialSpawnInterval;

		// Get foe spawn positions from map system if available
		if (this.mapSystem) {
			this.foeSpawnPositions = this.mapSystem.getFoeSpawnPositions();
		}

		this.foes = scene.physics.add.group({
			classType: Foe,
			runChildUpdate: true,
		});

		this.startNextWave();
	}

	private startNextWave(): void {
		this.currentWave++;
		const baseFoes = GAME_CONFIG.waves.orcsPerWave;
		const multiplier =
			GAME_CONFIG.waves.difficultyMultiplier ** (this.currentWave - 1);
		this.foesToSpawn = Math.floor(baseFoes * multiplier);

		this.spawnInterval = Math.max(
			1000,
			GAME_CONFIG.waves.initialSpawnInterval - this.currentWave * 500,
		);

		this.scene.events.emit("waveStarted", this.currentWave);

		// Log wave start event
		LogSystem.logWaveStart(this.currentWave, this.foesToSpawn);

		// Show chat bubble for wave 2+ (wave 1 is covered by gameStart messages)
		if (this.currentWave >= 2) {
			this.hero.showChatBubble(CHAT_MESSAGES.waveStart);
		}

		this.spawnTimer = this.scene.time.addEvent({
			delay: this.spawnInterval,
			callback: this.spawnFoe,
			callbackScope: this,
			repeat: this.foesToSpawn - 1,
		});

		this.waveTimer = this.scene.time.addEvent({
			delay: GAME_CONFIG.waves.waveDuration,
			callback: this.startNextWave,
			callbackScope: this,
		});
	}

	/**
	 * Determines which foe type to spawn based on wave and randomness.
	 * BigOrcs have a chance to spawn starting from wave 2.
	 */
	private selectFoeType(): FoeType {
		// No BigOrcs in wave 1
		if (this.currentWave < 2) {
			return "orc";
		}

		// 15% chance for BigOrc starting wave 2, increasing by 5% per wave
		const bigOrcChance = 15 + (this.currentWave - 2) * 5;
		const clampedChance = Math.min(bigOrcChance, 40); // Cap at 40%

		if (Math.random() * 100 < clampedChance) {
			return "bigOrc";
		}

		return "orc";
	}

	private spawnFoe(): void {
		// Skip spawning if debug spawn pause is active
		if (uiStore.getState().isSpawnPaused) {
			return;
		}

		let x: number;
		let y: number;

		// Use foe spawn positions if available, otherwise fall back to edge spawning
		if (this.foeSpawnPositions.length > 0) {
			// Randomly select one of the foe spawn positions
			const spawnIndex = Phaser.Math.Between(
				0,
				this.foeSpawnPositions.length - 1,
			);
			const spawnPos = this.foeSpawnPositions[spawnIndex];
			x = spawnPos.x;
			y = spawnPos.y;
		} else {
			// Fallback: spawn at map edges
			const mapConfig = getMapConfig();
			const { tileSize } = mapConfig;
			const mapWidth = mapConfig.width * tileSize;
			const mapHeight = mapConfig.height * tileSize;

			// Try to find a valid spawn position (not on a collision tile)
			let attempts = 0;
			const maxAttempts = 20;

			do {
				const edge = Phaser.Math.Between(0, 3);

				switch (edge) {
					case 0: // Top
						x = Phaser.Math.Between(tileSize * 2, mapWidth - tileSize * 2);
						y = tileSize * 2;
						break;
					case 1: // Right
						x = mapWidth - tileSize * 2;
						y = Phaser.Math.Between(tileSize * 2, mapHeight - tileSize * 2);
						break;
					case 2: // Bottom
						x = Phaser.Math.Between(tileSize * 2, mapWidth - tileSize * 2);
						y = mapHeight - tileSize * 2;
						break;
					default: // Left
						x = tileSize * 2;
						y = Phaser.Math.Between(tileSize * 2, mapHeight - tileSize * 2);
						break;
				}

				attempts++;
			} while (this.isCollisionTile(x, y) && attempts < maxAttempts);
		}

		// Determine foe type and create the appropriate class
		const foeType = this.selectFoeType();
		let foe: Foe;

		switch (foeType) {
			case "bigOrc":
				foe = new BigOrc(
					this.scene,
					x,
					y,
					this.pathfindingManager,
					this.collisionLayer,
					this.effectsManager,
					this.currentWave,
				);
				break;
			default:
				foe = new Orc(
					this.scene,
					x,
					y,
					this.pathfindingManager,
					this.collisionLayer,
					this.effectsManager,
					this.currentWave,
				);
				break;
		}

		foe.setTarget(this.hero);
		this.foes.add(foe);

		// Log foe spawn event
		LogSystem.logFoeSpawn(
			foe.foeId,
			foe.typeName,
			foe.level,
			foe.health,
			foe.maxHealth,
			foe.damage,
			foe.armor,
			foe.dodge,
			0, // Speed is protected, we can't access it - not critical for logging
			x,
			y,
		);

		// Spawn smoke effect
		this.effectsManager.spawnSmoke(x, y);
	}

	private isCollisionTile(x: number, y: number): boolean {
		const { tileSize } = GAME_CONFIG.map;
		const tileX = Math.floor(x / tileSize);
		const tileY = Math.floor(y / tileSize);
		const tile = this.collisionLayer.getTileAt(tileX, tileY);
		return tile !== null && tile.index === 1;
	}

	public getCurrentWave(): number {
		return this.currentWave;
	}

	public getFoeCount(): number {
		return this.foes.countActive(true);
	}

	/**
	 * @deprecated Use getFoeCount() instead
	 */
	public getOrcCount(): number {
		return this.getFoeCount();
	}

	public destroy(): void {
		if (this.spawnTimer) {
			this.spawnTimer.destroy();
		}
		if (this.waveTimer) {
			this.waveTimer.destroy();
		}
	}
}
