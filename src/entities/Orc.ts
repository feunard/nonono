import Phaser from "phaser";
import { debugState, GAME_CONFIG } from "../config/GameConfig";
import { gameStore } from "../stores/gameStore";
import type { EffectsManager } from "../systems/EffectsManager";
import type { PathfindingManager } from "../systems/PathfindingManager";
import type { Hero } from "./Hero";

export class Orc extends Phaser.Physics.Arcade.Sprite {
	public level: number; // Orc level (equals wave number)
	public health: number;
	public maxHealth: number;
	public damage: number;
	public armor: number; // 0-100, % damage reduction
	public dodge: number; // 0-100, % chance to avoid attack
	public accuracy: number; // 0-100, flat points to reduce hero's dodge
	private speed: number;
	private target: Hero | null = null;
	private lastAttackTime: number = 0;
	private isDead: boolean = false;
	private isAttacking: boolean = false;
	private debugGraphics?: Phaser.GameObjects.Graphics;

	// Pathfinding
	private pathfindingManager: PathfindingManager;
	private currentPath: { x: number; y: number }[] | null = null;
	private pathIndex: number = 0;
	// Random offset to stagger pathfinding calculations across orcs
	private lastPathCalcTime: number =
		-Math.random() * GAME_CONFIG.orc.pathRecalcInterval;
	private isCalculatingPath: boolean = false;

	// Stuck detection
	private lastPosition: { x: number; y: number } = { x: 0, y: 0 };
	private stuckCounter: number = 0;

	// Knockback state
	private isKnockedBack: boolean = false;

	// Effects
	private effectsManager: EffectsManager;

	public static readonly ATTACK_HITBOX = {
		width: GAME_CONFIG.orc.attackHitboxWidth,
		height: GAME_CONFIG.orc.attackHitboxHeight,
		offsetX: GAME_CONFIG.orc.attackHitboxOffsetX,
		offsetY: GAME_CONFIG.orc.attackHitboxOffsetY,
	};

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		pathfindingManager: PathfindingManager,
		collisionLayer: Phaser.Tilemaps.TilemapLayer,
		effectsManager: EffectsManager,
		wave: number,
	) {
		super(scene, x, y, "orc-idle");

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.pathfindingManager = pathfindingManager;
		this.effectsManager = effectsManager;

		// Level = wave number
		this.level = wave;

		// Calculate level multiplier: 1 + (level - 1) * multiplier
		// Level 1 = 1.0x, Level 2 = 1.1x, Level 3 = 1.2x, etc.
		const hpMultiplier =
			1 + (this.level - 1) * GAME_CONFIG.orc.levelHpMultiplier;
		const damageMultiplier =
			1 + (this.level - 1) * GAME_CONFIG.orc.levelDamageMultiplier;
		const speedMultiplier =
			1 + (this.level - 1) * GAME_CONFIG.orc.levelSpeedMultiplier;

		// Apply level-based scaling
		this.maxHealth = Math.floor(GAME_CONFIG.orc.health * hpMultiplier);
		this.health = this.maxHealth;
		this.damage = Math.floor(GAME_CONFIG.orc.damage * damageMultiplier);

		// Armor and dodge still scale additively with wave (existing system)
		this.armor = Math.min(
			GAME_CONFIG.orc.armor + (wave - 1) * GAME_CONFIG.orc.armorPerWave,
			100,
		);
		this.dodge = Math.min(
			GAME_CONFIG.orc.dodge + (wave - 1) * GAME_CONFIG.orc.dodgePerWave,
			100,
		);
		// Accuracy is fixed per config
		this.accuracy = GAME_CONFIG.orc.accuracy;
		// Speed: combine level multiplier with per-wave additive bonus
		const baseSpeed =
			GAME_CONFIG.orc.speed + (wave - 1) * GAME_CONFIG.orc.speedPerWave;
		this.speed = Math.floor(baseSpeed * speedMultiplier);

		this.setScale(1);
		// Map collision hitbox (smaller to avoid corner clipping)
		this.setSize(8, 8);
		this.setOffset(46, 52);

		this.play("orc-walk");

		this.on("animationcomplete", this.onAnimationComplete, this);

		// Add collision with tiles
		scene.physics.add.collider(this, collisionLayer);

		// Debug graphics for attack hitbox (always create for runtime toggle)
		this.debugGraphics = scene.add.graphics();
		this.debugGraphics.setDepth(1000);
	}

	private drawDebugHitboxes(): void {
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
		const attackBox = Orc.ATTACK_HITBOX;
		const attackX = this.x - attackBox.width / 2;
		const attackY = this.y - attackBox.height / 2;
		this.debugGraphics.lineStyle(1, 0xff00ff, 1);
		this.debugGraphics.strokeRect(
			attackX,
			attackY,
			attackBox.width,
			attackBox.height,
		);

		// Map collision hitbox (blue)
		const body = this.body as Phaser.Physics.Arcade.Body;
		if (body) {
			this.debugGraphics.lineStyle(1, 0x0000ff, 1);
			this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height);
		}
	}

	private onAnimationComplete(animation: Phaser.Animations.Animation): void {
		if (animation.key === "orc-attack") {
			this.isAttacking = false;
		} else if (animation.key === "orc-death") {
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

		const distanceToHero = Phaser.Math.Distance.Between(
			this.x,
			this.y,
			this.target.x,
			this.target.y,
		);

		if (distanceToHero < GAME_CONFIG.orc.attackRange) {
			this.attack();
			return;
		}

		if (this.isAttacking) {
			this.setVelocity(0, 0);
			return;
		}

		// Recalculate path periodically
		const currentTime = this.scene.time.now;
		if (
			currentTime - this.lastPathCalcTime >
				GAME_CONFIG.orc.pathRecalcInterval &&
			!this.isCalculatingPath
		) {
			this.calculatePathToTarget();
		}

		this.moveAlongPath();

		// Stuck detection: if orc hasn't moved but should be moving
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

	private calculatePathToTarget(): void {
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

	private moveAlongPath(): void {
		if (!this.target) return;

		const { tileSize } = GAME_CONFIG.map;
		const speed = this.speed;

		// Wait for path calculation to complete before moving
		if (this.isCalculatingPath) {
			this.setVelocity(0, 0);
			if (this.anims.currentAnim?.key !== "orc-idle") {
				this.play("orc-idle");
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

			if (this.anims.currentAnim?.key !== "orc-walk") {
				this.play("orc-walk");
			}
		} else {
			// No path available - recalculate and wait
			if (!this.isCalculatingPath) {
				this.calculatePathToTarget();
			}
			this.setVelocity(0, 0);
			if (this.anims.currentAnim?.key !== "orc-idle") {
				this.play("orc-idle");
			}
		}
	}

	private attack(): void {
		if (this.isDead || !this.target) return;

		this.setVelocity(0, 0);

		const currentTime = this.scene.time.now;
		if (currentTime - this.lastAttackTime < GAME_CONFIG.orc.attackCooldown) {
			if (!this.isAttacking && this.anims.currentAnim?.key !== "orc-idle") {
				this.play("orc-idle");
			}
			return;
		}

		this.lastAttackTime = currentTime;
		this.isAttacking = true;
		this.play("orc-attack");

		this.scene.time.delayedCall(300, () => {
			if (this.target?.isAlive() && !this.isDead && this.active) {
				const distance = Phaser.Math.Distance.Between(
					this.x,
					this.y,
					this.target.x,
					this.target.y,
				);
				if (distance < GAME_CONFIG.orc.damageRange) {
					// Pass orc's accuracy to reduce hero's dodge, orc has no piercing
					this.target.takeDamage(this.damage, this, this.accuracy, 0);
				}
			}
		});
	}

	private showDamageText(
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

	private showMissText(): void {
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

		// Calculate effective dodge (orc dodge - attacker accuracy, clamped 0-100)
		const effectiveDodge = Math.max(0, this.dodge - attackerAccuracy);

		// Roll for dodge
		if (effectiveDodge > 0 && Math.random() * 100 < effectiveDodge) {
			// Dodged! Show "Miss" text
			this.showMissText();
			return;
		}

		// Calculate effective armor (orc armor - attacker piercing, clamped 0-100)
		// If ignoreArmor is true (armor pen proc), effective armor is 0
		const effectiveArmor = ignoreArmor
			? 0
			: Math.max(0, this.armor - attackerPiercing);

		// Apply armor reduction (armor is % damage reduction)
		const finalDamage = Math.floor(amount * (1 - effectiveArmor / 100));

		this.health -= finalDamage;

		// Combat log (WoW style) - include orc level
		if (ignoreArmor && isCritical) {
			gameStore.addLog(
				`You crit Orc L${this.level} for ${finalDamage}! (ARMOR PEN)`,
			);
		} else if (ignoreArmor) {
			gameStore.addLog(
				`You hit Orc L${this.level} for ${finalDamage}. (ARMOR PEN)`,
			);
		} else if (isCritical) {
			gameStore.addLog(`You crit Orc L${this.level} for ${finalDamage}!`);
		} else {
			gameStore.addLog(`You hit Orc L${this.level} for ${finalDamage}.`);
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

	private die(): void {
		this.isDead = true;
		this.setVelocity(0, 0);
		if (this.body?.enable) {
			this.body.enable = false;
		}
		this.play("orc-death");
		this.scene.events.emit("orcKilled", this);

		// Combat log (WoW style) - include orc level
		gameStore.addLog(`Orc L${this.level} dies.`);

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
