import Phaser from "phaser";
import { debugState, GAME_CONFIG } from "../config/GameConfig";
import { uiStore } from "../stores/uiStore";
import type { EffectsManager } from "../systems/EffectsManager";
import { LogSystem } from "../systems/LogSystem";
import type { PathfindingManager } from "../systems/PathfindingManager";
import type { Hero } from "./Hero";

/**
 * Configuration interface for foe types.
 * Each foe subclass provides its own config to customize appearance and stats.
 */
export interface FoeConfig {
	// Sprite configuration
	spriteKey: string; // e.g., "orc-idle"
	animations: {
		idle: string; // e.g., "orc-idle"
		walk: string; // e.g., "orc-walk"
		attack: string; // e.g., "orc-attack"
		death: string; // e.g., "orc-death"
	};

	// Visual
	scale: number; // e.g., 1 for Orc, 1.5 for BigOrc

	// Hitbox configuration
	bodySize: { width: number; height: number };
	bodyOffset: { x: number; y: number };

	// Base stats (before wave scaling)
	baseHealth: number;
	baseDamage: number;
	baseSpeed: number;
	baseArmor: number;
	baseDodge: number;
	baseAccuracy: number;

	// Stat multipliers (applied on top of base stats)
	healthMultiplier?: number; // e.g., 1.5 for BigOrc (optional, default 1)
	damageMultiplier?: number; // e.g., 1.25 for BigOrc (optional, default 1)

	// For logging/identification
	typeName: string; // e.g., "Orc", "BigOrc"
}

/**
 * Base class for all enemy types.
 * Handles common behavior: movement, pathfinding, combat, knockback, death.
 * Subclasses provide their FoeConfig to customize appearance and stats.
 */
export class Foe extends Phaser.Physics.Arcade.Sprite {
	public readonly foeId: number; // Unique ID for logging
	public readonly typeName: string; // Type name for logging
	public level: number; // Foe level (equals wave number)
	public health: number;
	public maxHealth: number;
	public damage: number;
	public armor: number; // 0-100, % damage reduction
	public dodge: number; // 0-100, % chance to avoid attack
	public accuracy: number; // 0-100, flat points to reduce hero's dodge
	protected speed: number;
	protected target: Hero | null = null;
	protected lastAttackTime: number = 0;
	protected isDead: boolean = false;
	protected isAttacking: boolean = false;
	protected debugGraphics?: Phaser.GameObjects.Graphics;

	// Animation keys (from config)
	protected readonly animIdle: string;
	protected readonly animWalk: string;
	protected readonly animAttack: string;
	protected readonly animDeath: string;

	// Pathfinding
	protected pathfindingManager: PathfindingManager;
	protected currentPath: { x: number; y: number }[] | null = null;
	protected pathIndex: number = 0;
	// Random offset to stagger pathfinding calculations across foes
	protected lastPathCalcTime: number =
		-Math.random() * GAME_CONFIG.orc.pathRecalcInterval;
	protected isCalculatingPath: boolean = false;

	// Stuck detection
	protected lastPosition: { x: number; y: number } = { x: 0, y: 0 };
	protected stuckCounter: number = 0;

	// Knockback state
	protected isKnockedBack: boolean = false;

	// Effects
	protected effectsManager: EffectsManager;

	// Attack hitbox (scaled based on foe scale)
	protected attackHitbox: {
		width: number;
		height: number;
		offsetX: number;
		offsetY: number;
	};

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		pathfindingManager: PathfindingManager,
		collisionLayer: Phaser.Tilemaps.TilemapLayer,
		effectsManager: EffectsManager,
		wave: number,
		config: FoeConfig,
	) {
		super(scene, x, y, config.spriteKey);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.pathfindingManager = pathfindingManager;
		this.effectsManager = effectsManager;

		// Store animation keys from config
		this.animIdle = config.animations.idle;
		this.animWalk = config.animations.walk;
		this.animAttack = config.animations.attack;
		this.animDeath = config.animations.death;

		// Store type name for logging
		this.typeName = config.typeName;

		// Assign unique ID for logging
		this.foeId = LogSystem.getNextFoeId();

		// Level = wave number
		this.level = wave;

		// Calculate level multiplier: 1 + (level - 1) * multiplier
		// Level 1 = 1.0x, Level 2 = 1.1x, Level 3 = 1.2x, etc.
		const hpLevelMultiplier =
			1 + (this.level - 1) * GAME_CONFIG.orc.levelHpMultiplier;
		const damageLevelMultiplier =
			1 + (this.level - 1) * GAME_CONFIG.orc.levelDamageMultiplier;
		const speedLevelMultiplier =
			1 + (this.level - 1) * GAME_CONFIG.orc.levelSpeedMultiplier;

		// Apply type-specific multipliers (e.g., BigOrc has 1.5x HP)
		const typeHpMultiplier = config.healthMultiplier ?? 1;
		const typeDamageMultiplier = config.damageMultiplier ?? 1;

		// Apply level-based scaling with type multipliers
		this.maxHealth = Math.floor(
			config.baseHealth * hpLevelMultiplier * typeHpMultiplier,
		);
		this.health = this.maxHealth;
		this.damage = Math.floor(
			config.baseDamage * damageLevelMultiplier * typeDamageMultiplier,
		);

		// Armor and dodge still scale additively with wave (existing system)
		this.armor = Math.min(
			config.baseArmor + (wave - 1) * GAME_CONFIG.orc.armorPerWave,
			100,
		);
		this.dodge = Math.min(
			config.baseDodge + (wave - 1) * GAME_CONFIG.orc.dodgePerWave,
			100,
		);
		// Accuracy is fixed per config
		this.accuracy = config.baseAccuracy;
		// Speed: combine level multiplier with per-wave additive bonus
		const baseSpeed =
			config.baseSpeed + (wave - 1) * GAME_CONFIG.orc.speedPerWave;
		this.speed = Math.floor(baseSpeed * speedLevelMultiplier);

		this.setScale(config.scale);

		// Map collision hitbox (scaled)
		this.setSize(config.bodySize.width, config.bodySize.height);
		this.setOffset(config.bodyOffset.x, config.bodyOffset.y);

		// Store attack hitbox (scaled)
		this.attackHitbox = {
			width: GAME_CONFIG.orc.attackHitboxWidth * config.scale,
			height: GAME_CONFIG.orc.attackHitboxHeight * config.scale,
			offsetX: GAME_CONFIG.orc.attackHitboxOffsetX * config.scale,
			offsetY: GAME_CONFIG.orc.attackHitboxOffsetY * config.scale,
		};

		this.play(this.animWalk);

		this.on("animationcomplete", this.onAnimationComplete, this);

		// Add collision with tiles
		scene.physics.add.collider(this, collisionLayer);

		// Debug graphics for attack hitbox (always create for runtime toggle)
		this.debugGraphics = scene.add.graphics();
		this.debugGraphics.setDepth(1000);
	}

	protected drawDebugHitboxes(): void {
		if (!this.debugGraphics) return;

		this.debugGraphics.clear();

		if (!debugState.showHitboxes) return;

		// Attack range circle (cyan)
		this.debugGraphics.lineStyle(1, 0x00ffff, 0.5);
		this.debugGraphics.strokeCircle(
			this.x,
			this.y,
			GAME_CONFIG.orc.attackRange,
		);

		// Attack hitbox (pink)
		const attackX = this.x - this.attackHitbox.width / 2;
		const attackY = this.y - this.attackHitbox.height / 2;
		this.debugGraphics.lineStyle(1, 0xff00ff, 1);
		this.debugGraphics.strokeRect(
			attackX,
			attackY,
			this.attackHitbox.width,
			this.attackHitbox.height,
		);

		// Map collision hitbox (blue)
		const body = this.body as Phaser.Physics.Arcade.Body;
		if (body) {
			this.debugGraphics.lineStyle(1, 0x0000ff, 1);
			this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
		}
	}

	protected onAnimationComplete(animation: Phaser.Animations.Animation): void {
		if (animation.key === this.animAttack) {
			this.isAttacking = false;
		} else if (animation.key === this.animDeath) {
			this.destroy();
		}
	}

	public setTarget(hero: Hero): void {
		this.target = hero;
		// Calculate path immediately when target is set
		this.calculatePathToTarget();
	}

	update(): void {
		if (this.isDead || !this.target || !this.active) return;

		this.drawDebugHitboxes();

		// Don't override velocity while being knocked back
		if (this.isKnockedBack) {
			return;
		}

		// Don't move while attack animation is playing
		if (this.isAttacking) {
			this.setVelocity(0, 0);
			return;
		}

		const distanceToHero = Phaser.Math.Distance.Between(
			this.x,
			this.y,
			this.target.x,
			this.target.y,
		);

		// Try to attack if in range and attack is ready (not on cooldown)
		const currentTime = this.scene.time.now;
		const canAttack =
			currentTime - this.lastAttackTime >= GAME_CONFIG.orc.attackCooldown;

		if (distanceToHero < GAME_CONFIG.orc.attackRange && canAttack) {
			this.attack();
			return;
		}

		// Keep chasing the hero (even if in attack range but on cooldown)

		// Recalculate path periodically
		if (
			currentTime - this.lastPathCalcTime >
				GAME_CONFIG.orc.pathRecalcInterval &&
			!this.isCalculatingPath
		) {
			this.calculatePathToTarget();
		}

		this.moveAlongPath();

		// Stuck detection: if foe hasn't moved but should be moving
		const movedDistance = Phaser.Math.Distance.Between(
			this.x,
			this.y,
			this.lastPosition.x,
			this.lastPosition.y,
		);

		if (movedDistance < 0.5 && this.currentPath) {
			this.stuckCounter++;
			// If stuck for too long, recalculate path and nudge
			if (this.stuckCounter > 30) {
				this.stuckCounter = 0;
				this.currentPath = null;
				this.calculatePathToTarget();
				// Small random nudge to unstick
				const nudgeAngle = Math.random() * Math.PI * 2;
				this.x += Math.cos(nudgeAngle) * 4;
				this.y += Math.sin(nudgeAngle) * 4;
			}
		} else {
			this.stuckCounter = 0;
		}

		this.lastPosition = { x: this.x, y: this.y };
	}

	protected calculatePathToTarget(): void {
		if (!this.target || this.isCalculatingPath) return;

		this.isCalculatingPath = true;
		this.lastPathCalcTime = this.scene.time.now;

		const { tileSize } = GAME_CONFIG.map;

		// Convert pixel positions to tile coordinates
		const startTileX = Math.floor(this.x / tileSize);
		const startTileY = Math.floor(this.y / tileSize);
		const endTileX = Math.floor(this.target.x / tileSize);
		const endTileY = Math.floor(this.target.y / tileSize);

		this.pathfindingManager.findPath(
			startTileX,
			startTileY,
			endTileX,
			endTileY,
			(path) => {
				this.isCalculatingPath = false;
				if (path && path.length > 1) {
					this.currentPath = path;
					this.pathIndex = 1; // Skip first tile (current position)
				} else {
					// No path found, clear path to trigger direct movement fallback
					this.currentPath = null;
				}
			},
		);
	}

	protected moveAlongPath(): void {
		if (!this.target) return;

		const { tileSize } = GAME_CONFIG.map;
		const speed = this.speed;

		// Wait for path calculation to complete before moving
		if (this.isCalculatingPath) {
			this.setVelocity(0, 0);
			if (this.anims.currentAnim?.key !== this.animIdle) {
				this.play(this.animIdle);
			}
			return;
		}

		// If we have a valid path, follow it
		if (this.currentPath && this.pathIndex < this.currentPath.length) {
			const targetTile = this.currentPath[this.pathIndex];
			// Target center of tile
			const targetX = targetTile.x * tileSize + tileSize / 2;
			const targetY = targetTile.y * tileSize + tileSize / 2;

			const distToWaypoint = Phaser.Math.Distance.Between(
				this.x,
				this.y,
				targetX,
				targetY,
			);

			// Move to next waypoint if close enough
			if (distToWaypoint < 8) {
				this.pathIndex++;
				// If we've reached the end of the path, recalculate
				if (this.pathIndex >= this.currentPath.length) {
					this.currentPath = null;
					this.calculatePathToTarget();
				}
				return;
			}

			// Move toward current waypoint
			const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
			this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

			// Face movement direction
			if (targetX < this.x) {
				this.setFlipX(true);
			} else {
				this.setFlipX(false);
			}

			if (this.anims.currentAnim?.key !== this.animWalk) {
				this.play(this.animWalk);
			}
		} else {
			// No path available - recalculate and wait
			if (!this.isCalculatingPath) {
				this.calculatePathToTarget();
			}
			this.setVelocity(0, 0);
			if (this.anims.currentAnim?.key !== this.animIdle) {
				this.play(this.animIdle);
			}
		}
	}

	protected attack(): void {
		if (this.isDead || !this.target) return;

		this.setVelocity(0, 0);
		this.lastAttackTime = this.scene.time.now;
		this.isAttacking = true;
		this.play(this.animAttack);

		this.scene.time.delayedCall(300, () => {
			if (this.target?.isAlive() && !this.isDead && this.active) {
				const distance = Phaser.Math.Distance.Between(
					this.x,
					this.y,
					this.target.x,
					this.target.y,
				);
				if (distance < GAME_CONFIG.orc.damageRange) {
					// Pass foe's accuracy to reduce hero's dodge, foe has no piercing
					this.target.takeDamage(this.damage, this, this.accuracy, 0);
				}
			}
		});
	}

	protected showDamageText(
		amount: number,
		isCritical: boolean,
		isArmorPen = false,
	): void {
		// Random X offset for variety
		const offsetX = (Math.random() - 0.5) * 20;

		// Build damage text label
		let label = `-${amount}`;
		if (isCritical && isArmorPen) {
			label = `CRIT! ARMOR PEN! -${amount}`;
		} else if (isCritical) {
			label = `CRIT! -${amount}`;
		} else if (isArmorPen) {
			label = `ARMOR PEN! -${amount}`;
		}

		// Armor pen gets special styling (cyan/teal color)
		const isSpecial = isCritical || isArmorPen;
		const damageText = this.scene.add.text(
			this.x + offsetX,
			this.y - 20,
			label,
			{
				fontSize: isSpecial ? "14px" : "10px",
				fontFamily: "Wotfard, sans-serif",
				color: isArmorPen ? "#00ffff" : isCritical ? "#ffffff" : "#ff0000",
				fontStyle: "bold",
				stroke: isArmorPen ? "#006666" : isCritical ? "#ff0000" : "#000000",
				strokeThickness: isSpecial ? 3 : 2,
			},
		);
		damageText.setOrigin(0.5, 0.5);
		damageText.setDepth(999);

		// Special hits have a scale pop effect
		if (isSpecial) {
			damageText.setScale(1.5);
			this.scene.tweens.add({
				targets: damageText,
				scale: 1,
				duration: 150,
				ease: "Back.out",
			});
		}

		// Fade up animation
		this.scene.tweens.add({
			targets: damageText,
			y: damageText.y - (isSpecial ? 40 : 30),
			alpha: 0,
			duration: isSpecial ? 800 : 600,
			ease: "Power2",
			onComplete: () => {
				damageText.destroy();
			},
		});
	}

	protected showMissText(): void {
		const missText = this.scene.add.text(this.x, this.y - 20, "Miss", {
			fontSize: "11px",
			fontFamily: "Wotfard, sans-serif",
			color: "#888888",
			fontStyle: "bold",
			stroke: "#000000",
			strokeThickness: 2,
		});
		missText.setOrigin(0.5, 0.5);
		missText.setDepth(999);

		// Fade up animation
		this.scene.tweens.add({
			targets: missText,
			y: missText.y - 25,
			alpha: 0,
			duration: 500,
			ease: "Power2",
			onComplete: () => {
				missText.destroy();
			},
		});
	}

	public takeDamage(
		amount: number,
		isCritical = false,
		attackerAccuracy = 0,
		attackerPiercing = 0,
		ignoreArmor = false,
	): void {
		if (this.isDead) return;

		// Calculate effective dodge (foe dodge - attacker accuracy, clamped 0-100)
		const effectiveDodge = Math.max(0, this.dodge - attackerAccuracy);

		// Roll for dodge
		if (effectiveDodge > 0 && Math.random() * 100 < effectiveDodge) {
			// Dodged! Show "Miss" text
			this.showMissText();
			return;
		}

		// Calculate effective armor (foe armor - attacker piercing, clamped 0-100)
		// If ignoreArmor is true (armor pen proc), effective armor is 0
		const effectiveArmor = ignoreArmor
			? 0
			: Math.max(0, this.armor - attackerPiercing);

		// Apply armor reduction (armor is % damage reduction)
		const finalDamage = Math.floor(amount * (1 - effectiveArmor / 100));

		this.health -= finalDamage;

		// Combat log (WoW style) - include foe type, level and ID
		if (ignoreArmor && isCritical) {
			uiStore.addLog(
				`You crit ${this.typeName} L${this.level} for ${finalDamage}! (ARMOR PEN)`,
			);
		} else if (ignoreArmor) {
			uiStore.addLog(
				`You hit ${this.typeName} L${this.level} for ${finalDamage}. (ARMOR PEN)`,
			);
		} else if (isCritical) {
			uiStore.addLog(
				`You crit ${this.typeName} L${this.level} #${this.foeId} for ${finalDamage}!`,
			);
		} else {
			uiStore.addLog(
				`You hit ${this.typeName} L${this.level} #${this.foeId} for ${finalDamage}.`,
			);
		}

		// Floating damage text
		this.showDamageText(finalDamage, isCritical, ignoreArmor);

		// Hit splatter effect
		this.effectsManager.hitSplatter(this.x, this.y);

		// Critical sparkle effect
		if (isCritical) {
			this.effectsManager.criticalSparkle(this.x, this.y);
		}

		// Red tint flash
		this.setTint(0xff0000);
		this.scene.time.delayedCall(100, () => {
			if (this.active) {
				this.clearTint();
			}
		});

		// Knockback away from hero
		if (this.target) {
			this.isKnockedBack = true;
			const angle = Phaser.Math.Angle.Between(
				this.target.x,
				this.target.y,
				this.x,
				this.y,
			);
			this.setVelocity(
				Math.cos(angle) * GAME_CONFIG.orc.knockbackForce,
				Math.sin(angle) * GAME_CONFIG.orc.knockbackForce,
			);

			// Knockback dust effect
			this.effectsManager.knockbackDust(this.x, this.y);

			// Clear path to recalculate after knockback
			this.currentPath = null;

			// End knockback state after duration
			this.scene.time.delayedCall(GAME_CONFIG.orc.knockbackDuration, () => {
				if (this.active && !this.isDead) {
					this.isKnockedBack = false;
					this.setVelocity(0, 0); // Stop before resuming movement
				}
			});
		}

		if (this.health <= 0) {
			this.die();
		}
	}

	protected die(): void {
		this.isDead = true;
		this.setVelocity(0, 0);
		if (this.body?.enable) {
			this.body.enable = false;
		}
		this.play(this.animDeath);
		this.scene.events.emit("foeKilled", this);

		// Combat log (WoW style) - include foe type, level and ID
		uiStore.addLog(`${this.typeName} L${this.level} #${this.foeId} dies.`);

		if (this.debugGraphics) {
			this.debugGraphics.destroy();
		}
	}

	public isAlive(): boolean {
		return !this.isDead;
	}

	destroy(fromScene?: boolean): void {
		if (this.debugGraphics) {
			this.debugGraphics.destroy();
			this.debugGraphics = undefined;
		}
		super.destroy(fromScene);
	}
}
