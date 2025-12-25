import Phaser from "phaser";
import { debugState, GAME_CONFIG } from "../config/GameConfig";
import type { EffectsManager } from "../systems/EffectsManager";

// How often to recalculate homing target (in ms)
const HOMING_UPDATE_INTERVAL = 100;

export class Arrow extends Phaser.Physics.Arcade.Sprite {
	public damage: number;
	public isCritical: boolean;
	public accuracy: number; // Flat points that reduce target's effective dodge
	public piercing: number; // Flat points that reduce target's effective armor
	public ignoreArmor: boolean; // Armor penetration proc - ignores target's armor entirely
	// Arrow power properties
	public pierceRemaining: number; // How many more enemies this arrow can pierce
	public bounceRemaining: number; // How many more times this arrow can bounce
	public hitEnemies: Set<number>; // Track which enemies this arrow has hit (by object ID)
	public homingStrength: number; // How strongly arrows track targets (0 = off, 1 = gentle, 2+ = strong)
	public explosiveRadius: number; // Explosion radius in pixels (0 = off)
	private startX: number;
	private startY: number;
	private maxDistance: number;
	private velocityX: number;
	private velocityY: number;
	private debugGraphics?: Phaser.GameObjects.Graphics;
	private effectsManager: EffectsManager | null = null;
	private orcsGroup: Phaser.Physics.Arcade.Group | null = null;
	// Cached homing target to avoid O(n) lookup every frame
	private cachedHomingTarget: Phaser.Physics.Arcade.Sprite | null = null;
	private lastHomingUpdate: number = 0;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		angle: number,
		damage?: number,
		isCritical?: boolean,
		effectsManager?: EffectsManager,
		accuracy?: number,
		piercing?: number,
		pierceCount?: number,
		bounceCount?: number,
		homingStrength?: number,
		explosiveRadius?: number,
		orcsGroup?: Phaser.Physics.Arcade.Group,
		ignoreArmor?: boolean,
	) {
		// Spawn arrow in front of hero
		const spawnX = x + Math.cos(angle) * GAME_CONFIG.arrow.spawnOffset;
		const spawnY = y + Math.sin(angle) * GAME_CONFIG.arrow.spawnOffset;

		super(scene, spawnX, spawnY, "arrow");

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.damage = damage ?? GAME_CONFIG.hero.bow.damage;
		this.isCritical = isCritical ?? false;
		this.accuracy = accuracy ?? 0;
		this.piercing = piercing ?? 0;
		this.ignoreArmor = ignoreArmor ?? false;
		this.pierceRemaining = pierceCount ?? 0;
		this.bounceRemaining = bounceCount ?? 0;
		this.homingStrength = homingStrength ?? 0;
		this.explosiveRadius = explosiveRadius ?? 0;
		this.hitEnemies = new Set();
		this.orcsGroup = orcsGroup ?? null;
		this.startX = spawnX;
		this.startY = spawnY;
		this.maxDistance = GAME_CONFIG.hero.bow.range * GAME_CONFIG.map.tileSize;

		// Rotate arrow to match direction
		this.setRotation(angle);

		const speed = GAME_CONFIG.hero.bow.arrowSpeed;
		this.velocityX = Math.cos(angle) * speed;
		this.velocityY = Math.sin(angle) * speed;

		if (this.body) {
			const body = this.body as Phaser.Physics.Arcade.Body;
			body.setSize(
				GAME_CONFIG.arrow.hitboxWidth,
				GAME_CONFIG.arrow.hitboxHeight,
			);
			body.setOffset(
				GAME_CONFIG.arrow.hitboxOffsetX,
				GAME_CONFIG.arrow.hitboxOffsetY,
			);
			body.setAllowGravity(false);
		}

		// Debug graphics for hitbox
		this.debugGraphics = scene.add.graphics();
		this.debugGraphics.setDepth(1000);

		// Start arrow trail effect
		this.effectsManager = effectsManager ?? null;
		if (this.effectsManager) {
			this.effectsManager.startArrowTrail(this);
		}
	}

	preUpdate(time: number, delta: number): void {
		super.preUpdate(time, delta);

		// Don't move when game is paused
		if (this.scene.physics.world.isPaused) {
			return;
		}

		// Homing: adjust velocity toward nearest target
		if (this.homingStrength > 0 && this.orcsGroup) {
			// Only recalculate nearest target periodically to reduce O(n) lookups
			if (
				time - this.lastHomingUpdate > HOMING_UPDATE_INTERVAL ||
				(this.cachedHomingTarget && !this.cachedHomingTarget.active)
			) {
				this.cachedHomingTarget = this.findNearestOrc();
				this.lastHomingUpdate = time;
			}

			if (this.cachedHomingTarget?.active) {
				const targetAngle = Phaser.Math.Angle.Between(
					this.x,
					this.y,
					this.cachedHomingTarget.x,
					this.cachedHomingTarget.y,
				);
				const currentAngle = Math.atan2(this.velocityY, this.velocityX);
				// Interpolate angle based on homing strength
				const turnRate = this.homingStrength * 0.03 * (delta / 16.67); // Adjust for 60fps baseline
				const newAngle = Phaser.Math.Angle.RotateTo(
					currentAngle,
					targetAngle,
					turnRate,
				);
				const speed = Math.sqrt(
					this.velocityX * this.velocityX + this.velocityY * this.velocityY,
				);
				this.velocityX = Math.cos(newAngle) * speed;
				this.velocityY = Math.sin(newAngle) * speed;
				this.setRotation(newAngle);
			}
		}

		// Move arrow manually
		this.x += this.velocityX * (delta / 1000);
		this.y += this.velocityY * (delta / 1000);

		this.drawDebugHitboxes();

		const distance = Phaser.Math.Distance.Between(
			this.startX,
			this.startY,
			this.x,
			this.y,
		);

		if (distance > this.maxDistance) {
			this.destroy();
			return;
		}

		if (
			this.x < 0 ||
			this.y < 0 ||
			this.x > GAME_CONFIG.map.widthInTiles * GAME_CONFIG.map.tileSize ||
			this.y > GAME_CONFIG.map.heightInTiles * GAME_CONFIG.map.tileSize
		) {
			this.destroy();
		}
	}

	private drawDebugHitboxes(): void {
		if (!this.debugGraphics) return;

		this.debugGraphics.clear();

		if (!debugState.showHitboxes) return;

		// Collision hitbox (blue)
		const body = this.body as Phaser.Physics.Arcade.Body;
		if (body) {
			this.debugGraphics.lineStyle(1, 0x0000ff, 1);
			this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
		}
	}

	/**
	 * Redirect the arrow toward a new target (for ricochet).
	 * Resets the distance counter so it can travel full range again.
	 */
	public redirectTo(targetX: number, targetY: number): void {
		const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
		const speed = GAME_CONFIG.hero.bow.arrowSpeed;

		this.velocityX = Math.cos(angle) * speed;
		this.velocityY = Math.sin(angle) * speed;
		this.setRotation(angle);

		// Reset start position for distance tracking
		this.startX = this.x;
		this.startY = this.y;
	}

	/**
	 * Check if this arrow has already hit the given enemy.
	 */
	public hasHitEnemy(enemyId: number): boolean {
		return this.hitEnemies.has(enemyId);
	}

	/**
	 * Mark an enemy as hit by this arrow.
	 */
	public markEnemyHit(enemyId: number): void {
		this.hitEnemies.add(enemyId);
	}

	/**
	 * Find the nearest living orc for homing arrows.
	 */
	private findNearestOrc(): Phaser.Physics.Arcade.Sprite | null {
		if (!this.orcsGroup) return null;

		let nearest: Phaser.Physics.Arcade.Sprite | null = null;
		let nearestDistance = Infinity;

		this.orcsGroup.getChildren().forEach((gameObj) => {
			const orc = gameObj as Phaser.Physics.Arcade.Sprite & {
				isAlive?: () => boolean;
			};
			if (!orc.active) return;
			if (orc.isAlive && !orc.isAlive()) return;

			const distance = Phaser.Math.Distance.Between(
				this.x,
				this.y,
				orc.x,
				orc.y,
			);

			if (distance < nearestDistance) {
				nearestDistance = distance;
				nearest = orc;
			}
		});

		return nearest;
	}

	destroy(fromScene?: boolean): void {
		if (this.debugGraphics) {
			this.debugGraphics.destroy();
		}
		// Stop arrow trail effect
		if (this.effectsManager) {
			this.effectsManager.stopArrowTrail(this);
		}
		super.destroy(fromScene);
	}
}
