import Phaser from "phaser";
import { GAME_CONFIG } from "../config/GameConfig";
import { getMapConfig } from "../config/MapConfig";
import type { Hero } from "../entities/Hero";
import { Orc } from "../entities/Orc";
import { uiStore } from "../stores/uiStore";
import type { EffectsManager } from "./EffectsManager";
import { LogSystem } from "./LogSystem";
import type { PathfindingManager } from "./PathfindingManager";

export class WaveManager {
	private scene: Phaser.Scene;
	private hero: Hero;
	private pathfindingManager: PathfindingManager;
	private collisionLayer: Phaser.Tilemaps.TilemapLayer;
	private effectsManager: EffectsManager;
	public orcs: Phaser.Physics.Arcade.Group;
	private currentWave: number = 0;
	private orcsToSpawn: number = 0;
	private spawnTimer: Phaser.Time.TimerEvent | null = null;
	private waveTimer: Phaser.Time.TimerEvent | null = null;
	private spawnInterval: number;

	constructor(
		scene: Phaser.Scene,
		hero: Hero,
		pathfindingManager: PathfindingManager,
		collisionLayer: Phaser.Tilemaps.TilemapLayer,
		effectsManager: EffectsManager,
	) {
		this.scene = scene;
		this.hero = hero;
		this.pathfindingManager = pathfindingManager;
		this.collisionLayer = collisionLayer;
		this.effectsManager = effectsManager;
		this.spawnInterval = GAME_CONFIG.waves.initialSpawnInterval;

		this.orcs = scene.physics.add.group({
			classType: Orc,
			runChildUpdate: true,
		});

		this.startNextWave();
	}

	private startNextWave(): void {
		this.currentWave++;
		const baseOrcs = GAME_CONFIG.waves.orcsPerWave;
		const multiplier =
			GAME_CONFIG.waves.difficultyMultiplier ** (this.currentWave - 1);
		this.orcsToSpawn = Math.floor(baseOrcs * multiplier);

		this.spawnInterval = Math.max(
			1000,
			GAME_CONFIG.waves.initialSpawnInterval - this.currentWave * 500,
		);

		this.scene.events.emit("waveStarted", this.currentWave);

		// Log wave start event
		LogSystem.logWaveStart(this.currentWave, this.orcsToSpawn);

		this.spawnTimer = this.scene.time.addEvent({
			delay: this.spawnInterval,
			callback: this.spawnOrc,
			callbackScope: this,
			repeat: this.orcsToSpawn - 1,
		});

		this.waveTimer = this.scene.time.addEvent({
			delay: GAME_CONFIG.waves.waveDuration,
			callback: this.startNextWave,
			callbackScope: this,
		});
	}

	private spawnOrc(): void {
		// Skip spawning if debug spawn pause is active
		if (uiStore.getState().isSpawnPaused) {
			return;
		}

		const mapConfig = getMapConfig();
		const { tileSize } = mapConfig;
		const mapWidth = mapConfig.width * tileSize;
		const mapHeight = mapConfig.height * tileSize;

		// Try to find a valid spawn position (not on a collision tile)
		let x: number;
		let y: number;
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

		const orc = new Orc(
			this.scene,
			x,
			y,
			this.pathfindingManager,
			this.collisionLayer,
			this.effectsManager,
			this.currentWave,
		);
		orc.setTarget(this.hero);
		this.orcs.add(orc);

		// Log orc spawn event
		LogSystem.logOrcSpawn(
			orc.orcId,
			orc.level,
			orc.health,
			orc.maxHealth,
			orc.damage,
			orc.armor,
			orc.dodge,
			0, // Speed is private, we can't access it - not critical for logging
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

	public getOrcCount(): number {
		return this.orcs.countActive(true);
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
