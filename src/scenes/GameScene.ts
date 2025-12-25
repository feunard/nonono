import Phaser from "phaser";
import { CHAT_MESSAGES } from "../config/ChatMessages";
import { debugState, GAME_CONFIG } from "../config/GameConfig";
import { CURRENT_MAP } from "../config/MapConfig";
import { Hero } from "../entities/Hero";
import { Loot } from "../entities/Loot";
import type { Orc } from "../entities/Orc";
import { gameStore } from "../stores/gameStore";
import { heroStore } from "../stores/heroStore";
import { inventoryStore } from "../stores/inventoryStore";
import { uiStore } from "../stores/uiStore";
import { CombatSystem } from "../systems/CombatSystem";
import { calculateDropChance } from "../systems/calculations";
import { EffectsManager } from "../systems/EffectsManager";
import { LogSystem } from "../systems/LogSystem";
import { createMapSystem, type MapSystem } from "../systems/MapSystem";
import { PathfindingManager } from "../systems/PathfindingManager";
import { WaveManager } from "../systems/WaveManager";

// Zoom levels: index 0 = max zoom out, index 2 = max zoom in
const ZOOM_LEVELS = [2, 3, 4];

export class GameScene extends Phaser.Scene {
	private hero!: Hero;
	private waveManager!: WaveManager;
	private combatSystem!: CombatSystem;
	private pathfindingManager!: PathfindingManager;
	private effectsManager!: EffectsManager;
	private mapSystem!: MapSystem;
	private collisionGrid!: number[][];
	private collisionLayer!: Phaser.Tilemaps.TilemapLayer;
	private startTime: number = 0;
	private isPaused: boolean = false;
	private pausedAt: number = 0;
	private totalPausedTime: number = 0;
	private loots!: Phaser.Physics.Arcade.Group;
	private zoomIndex: number = 2;

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.startTime = Date.now();
		this.isPaused = false;
		this.pausedAt = 0;
		this.totalPausedTime = 0;

		// Reset logging system for new game
		LogSystem.reset();

		// Ensure physics and time are running (may be paused from previous game over)
		this.physics.resume();
		this.time.paused = false;

		this.createMap();
		this.createHero();
		this.setupSystems();
		this.setupCamera();
		this.setupEvents();
		this.setupPauseControl();
		this.setupUIUpdates();

		if (GAME_CONFIG.debug.showFPS) {
			this.createFPSDisplay();
		}

		// Log game start (no seed since we use config-based maps now)
		LogSystem.logGameStart();

		// Show game start chat bubble after a short delay
		this.time.delayedCall(500, () => {
			this.hero.showChatBubble(CHAT_MESSAGES.gameStart, { force: true });
		});

		// Signal to React that the game is ready
		gameStore.setGameReady();
	}

	shutdown(): void {
		// Clean up event listeners
		this.events.off("heroKilled", this.onGameOver, this);
		this.events.off("orcKilled", this.onOrcKilled, this);

		// Clean up systems
		if (this.waveManager) {
			this.waveManager.destroy();
		}
		if (this.combatSystem) {
			this.combatSystem.destroy();
		}
		if (this.effectsManager) {
			this.effectsManager.destroy();
		}
		if (this.mapSystem) {
			this.mapSystem.destroy();
		}
	}

	private setupPauseControl(): void {
		this.input.keyboard
			?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
			.on("down", () => {
				this.togglePause();
			});

		this.input.keyboard
			?.addKey(Phaser.Input.Keyboard.KeyCodes.X)
			.on("down", () => {
				this.toggleDebug();
			});

		this.input.keyboard
			?.addKey(Phaser.Input.Keyboard.KeyCodes.O)
			.on("down", () => {
				this.hero.showChatBubble(CHAT_MESSAGES.orcKill, { force: true });
			});

		// Debug: "I" key opens power cheat overlay (only in debug mode)
		this.input.keyboard
			?.addKey(Phaser.Input.Keyboard.KeyCodes.I)
			.on("down", () => {
				if (GAME_CONFIG.debug.showHitboxes || debugState.showHitboxes) {
					this.openDebugPowerOverlay();
				}
			});

		// Debug: "U" key kills all orcs (only in debug mode)
		this.input.keyboard
			?.addKey(Phaser.Input.Keyboard.KeyCodes.U)
			.on("down", () => {
				if (GAME_CONFIG.debug.showHitboxes || debugState.showHitboxes) {
					this.killAllOrcs();
				}
			});

		// Debug: "P" key spawns a loot bag (only in debug mode)
		this.input.keyboard
			?.addKey(Phaser.Input.Keyboard.KeyCodes.P)
			.on("down", () => {
				if (GAME_CONFIG.debug.showHitboxes || debugState.showHitboxes) {
					this.spawnDebugLoot();
				}
			});
	}

	private spawnDebugLoot(): void {
		// Random angle around the player
		const angle = Math.random() * Math.PI * 2;
		const radius = 100;
		const x = this.hero.x + Math.cos(angle) * radius;
		const y = this.hero.y + Math.sin(angle) * radius;

		const loot = new Loot(this, x, y);
		this.loots.add(loot);
	}

	private killAllOrcs(): void {
		// Toggle spawn pause state
		uiStore.toggleSpawnPaused();

		// Kill all current orcs - use slice() to copy array since destroy modifies it
		const orcs = this.waveManager.orcs.getChildren().slice();
		for (const orc of orcs) {
			(orc as Phaser.Physics.Arcade.Sprite).destroy();
		}
	}

	private toggleDebug(): void {
		debugState.showHitboxes = !debugState.showHitboxes;
		uiStore.toggleDebugMode();
	}

	private togglePause(): void {
		this.isPaused = !this.isPaused;

		if (this.isPaused) {
			this.pausedAt = Date.now();
			this.physics.pause();
			this.time.paused = true;
			this.pauseAllAnimations();
		} else {
			this.totalPausedTime += Date.now() - this.pausedAt;
			this.physics.resume();
			this.time.paused = false;
			this.resumeAllAnimations();
		}

		gameStore.setPaused(this.isPaused);
	}

	private pauseAllAnimations(): void {
		// Pause hero animation
		if (this.hero?.anims) {
			this.hero.anims.pause();
		}

		// Pause all orc animations
		this.waveManager.orcs.getChildren().forEach((orc) => {
			const sprite = orc as Phaser.Physics.Arcade.Sprite;
			if (sprite.anims) {
				sprite.anims.pause();
			}
		});
	}

	private resumeAllAnimations(): void {
		// Resume hero animation
		if (this.hero?.anims) {
			this.hero.anims.resume();
		}

		// Resume all orc animations
		this.waveManager.orcs.getChildren().forEach((orc) => {
			const sprite = orc as Phaser.Physics.Arcade.Sprite;
			if (sprite.anims) {
				sprite.anims.resume();
			}
		});
	}

	private setupUIUpdates(): void {
		// Update UI store every 100ms with batch update to minimize React re-renders
		this.time.addEvent({
			delay: 100,
			callback: () => {
				// Collect orc positions for minimap
				const orcPositions = this.waveManager.orcs.getChildren().map((orc) => {
					const sprite = orc as Phaser.Physics.Arcade.Sprite;
					return { x: sprite.x, y: sprite.y };
				});

				gameStore.batchUpdateUI({
					health: this.hero.health,
					maxHealth: this.hero.maxHealth,
					wave: this.waveManager.getCurrentWave(),
					kills: this.combatSystem.getKillCount(),
					orcsAlive: this.waveManager.getOrcCount(),
					elapsedTime: this.getElapsedTime(),
					fps: Math.round(this.game.loop.actualFps),
					heroPosition: { x: this.hero.x, y: this.hero.y },
					orcPositions,
				});
			},
			loop: true,
		});
	}

	private createFPSDisplay(): void {
		const fpsText = this.add.text(10, 10, "", {
			fontSize: "14px",
			color: "#00ff00",
			backgroundColor: "#000000",
			padding: { x: 4, y: 4 },
		});
		fpsText.setScrollFactor(0);
		fpsText.setDepth(1000);

		this.time.addEvent({
			delay: 100,
			callback: () => {
				fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
			},
			loop: true,
		});
	}

	private createMap(): void {
		// Create map system using current map from MapConfig
		const { mapSystem, collisionGrid, collisionLayer } = createMapSystem(
			this,
			CURRENT_MAP,
		);

		this.mapSystem = mapSystem;
		this.collisionGrid = collisionGrid;
		this.collisionLayer = collisionLayer;

		// Set physics world bounds based on map size
		const mapWidth = mapSystem.getWidthInPixels();
		const mapHeight = mapSystem.getHeightInPixels();
		this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

		// Initialize pathfinding with collision grid
		this.pathfindingManager = new PathfindingManager(this.collisionGrid);
	}

	private createHero(): void {
		// Get map dimensions from map system
		const mapConfig = this.mapSystem.getMapConfig();
		const centerX = (mapConfig.width * mapConfig.tileSize) / 2;
		const centerY = (mapConfig.height * mapConfig.tileSize) / 2;

		this.hero = new Hero(this, centerX, centerY);

		// Add collision between hero and collision tiles
		this.physics.add.collider(this.hero, this.collisionLayer);

		// Add collision between arrows and collision tiles (destroy arrow on hit)
		this.physics.add.collider(
			this.hero.arrows,
			this.collisionLayer,
			(arrow) => {
				(arrow as Phaser.Physics.Arcade.Sprite).destroy();
			},
		);
	}

	private setupSystems(): void {
		// Initialize effects manager first (other systems may use it)
		this.effectsManager = new EffectsManager(this);

		this.waveManager = new WaveManager(
			this,
			this.hero,
			this.pathfindingManager,
			this.collisionLayer,
			this.effectsManager,
		);
		this.combatSystem = new CombatSystem(
			this,
			this.hero,
			this.waveManager.orcs,
		);

		// Give hero access to orcs group for homing arrows
		this.hero.setOrcsGroup(this.waveManager.orcs);

		// Setup loot group and collision
		this.loots = this.physics.add.group({
			classType: Loot,
		});
		this.physics.add.overlap(
			this.hero,
			this.loots,
			this.onLootPickup as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
			undefined,
			this,
		);
	}

	private setupCamera(): void {
		const mapConfig = this.mapSystem.getMapConfig();
		this.zoomIndex = 2; // Start at max zoom (index 2 = zoom level 4)
		const targetZoom = ZOOM_LEVELS[this.zoomIndex];

		this.cameras.main.setZoom(targetZoom);
		this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);
		this.cameras.main.setBounds(
			0,
			0,
			mapConfig.width * mapConfig.tileSize,
			mapConfig.height * mapConfig.tileSize,
		);

		// Scroll wheel zoom control
		this.input.on("wheel", this.handleZoom, this);
	}

	private handleZoom(
		_pointer: Phaser.Input.Pointer,
		_gameObjects: Phaser.GameObjects.GameObject[],
		_deltaX: number,
		deltaY: number,
	): void {
		if (this.isPaused) return;

		// Scroll up (negative deltaY) = zoom in, scroll down = zoom out
		if (deltaY < 0 && this.zoomIndex < ZOOM_LEVELS.length - 1) {
			this.zoomIndex++;
		} else if (deltaY > 0 && this.zoomIndex > 0) {
			this.zoomIndex--;
		} else {
			return;
		}

		// Sync to store and apply zoom
		uiStore.setZoomLevel(this.zoomIndex);
		this.applyZoom();
	}

	private applyZoom(): void {
		this.cameras.main.zoomEffect.reset();
		this.cameras.main.zoomTo(ZOOM_LEVELS[this.zoomIndex], 150, "Sine.easeOut");
	}

	private checkZoomFromStore(): void {
		const storeZoom = uiStore.getState().zoomLevel;
		if (storeZoom !== this.zoomIndex) {
			this.zoomIndex = storeZoom;
			this.applyZoom();
		}
	}

	private setupEvents(): void {
		this.events.on("heroKilled", this.onGameOver, this);
		this.events.on("orcKilled", this.onOrcKilled, this);
	}

	private onOrcKilled(orc: Phaser.Physics.Arcade.Sprite): void {
		this.hero.showChatBubble(CHAT_MESSAGES.orcKill);
		this.effectsManager.deathPoof(orc.x, orc.y);
		// Cast to Orc to get level and ID for drop chance calculation and logging
		const orcEntity = orc as Orc;

		// Log orc kill event (we don't have specific kill info here, logged in combat)
		LogSystem.logOrcKill(
			orcEntity.orcId,
			orcEntity.level,
			"unknown", // Kill source tracked separately in combat
			0,
			false,
		);

		this.trySpawnLoot(orc.x, orc.y, orcEntity.level, orcEntity.orcId);
	}

	private getTotalLuck(): number {
		return GAME_CONFIG.hero.luck + heroStore.getState().bonusStats.luck;
	}

	private trySpawnLoot(
		x: number,
		y: number,
		orcLevel: number,
		orcId: number,
	): void {
		// Check if max bags on field reached
		if (this.loots.getLength() >= GAME_CONFIG.loot.maxBagsOnField) return;

		// Calculate drop chance: 10% base + luck% - orcLevel * 2%, minimum 1%
		const totalLuck = this.getTotalLuck();
		const dropChance = calculateDropChance(
			totalLuck,
			orcLevel,
			GAME_CONFIG.orc.levelDropReduction,
			GAME_CONFIG.orc.minDropChance,
		);

		// Check drop chance
		if (Math.random() * 100 >= dropChance) return;

		const loot = new Loot(this, x, y);
		this.loots.add(loot);

		// Log loot drop event
		LogSystem.logLootDrop(x, y, orcId, orcLevel);
	}

	private onLootPickup(
		_hero: Phaser.GameObjects.GameObject,
		loot: Phaser.GameObjects.GameObject,
	): void {
		// Check if hero's bag inventory is full
		if (
			inventoryStore.getState().bagCount >= GAME_CONFIG.loot.maxBagsInventory
		) {
			return; // Don't pick up, leave bag on ground
		}

		const lootSprite = loot as Loot;

		// Log loot pickup event
		LogSystem.logLootPickup(lootSprite.x, lootSprite.y);

		// Destroy the loot sprite
		lootSprite.destroy();

		// Add to bag inventory - no pause, player opens bag when ready
		inventoryStore.addBag();
	}

	private openDebugPowerOverlay(): void {
		// Pause the game
		this.isPaused = true;
		this.pausedAt = Date.now();
		this.physics.pause();
		this.time.paused = true;
		this.pauseAllAnimations();

		// Show debug power overlay
		uiStore.showDebugPowerOverlay();
	}

	public closeDebugPowerOverlay(): void {
		// Hide UI
		uiStore.hideDebugPowerOverlay();

		// Resume game
		this.totalPausedTime += Date.now() - this.pausedAt;
		this.isPaused = false;
		this.physics.resume();
		this.time.paused = false;
		this.resumeAllAnimations();
	}

	private onGameOver(): void {
		const survivalTime = this.getElapsedTime();
		const kills = this.combatSystem.getKillCount();
		const wave = this.waveManager.getCurrentWave();
		const heroState = heroStore.getState();
		const inventoryState = inventoryStore.getState();

		// Log hero death
		LogSystem.logHeroDeath(
			undefined, // We don't track killer orc ID currently
			undefined,
			this.hero.health,
			this.hero.maxHealth,
			kills,
			wave,
			survivalTime,
			heroState.bonusStats,
			inventoryState.collectedPowers.length,
		);

		this.physics.pause();
		this.time.paused = true;
		this.pauseAllAnimations();

		gameStore.setGameOver({ survivalTime, kills, wave });
	}

	update(_time: number, delta: number): void {
		// Process pending pathfinding calculations
		this.pathfindingManager.update();

		// Check if zoom was changed from UI
		this.checkZoomFromStore();

		// Skip game updates when paused
		if (this.isPaused) return;

		if (this.hero?.active) {
			this.hero.update(this.waveManager.orcs, delta);
		}
	}

	public getElapsedTime(): number {
		const currentPause = this.isPaused ? Date.now() - this.pausedAt : 0;
		const realTime =
			Date.now() - this.startTime - this.totalPausedTime - currentPause;
		return Math.floor(realTime / 1000);
	}

	public getWaveManager(): WaveManager {
		return this.waveManager;
	}

	public getCombatSystem(): CombatSystem {
		return this.combatSystem;
	}

	public getHero(): Hero {
		return this.hero;
	}

	public getEffectsManager(): EffectsManager {
		return this.effectsManager;
	}

	public resume(): void {
		if (this.isPaused) {
			this.togglePause();
		}
	}
}
