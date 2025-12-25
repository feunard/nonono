import Phaser from "phaser";
import { getRandomMessageFromArray } from "../config/ChatMessages";
import { debugState, GAME_CONFIG } from "../config/GameConfig";
import { gameStore } from "../stores/gameStore";
import {
	calculateAgilityDodge,
	getAgilityModifier,
	getStrengthModifier,
	STAT_CAPS,
} from "../systems/calculations";
import type { EffectsManager } from "../systems/EffectsManager";
import { Arrow } from "./Arrow";

// Cached bonus stats type for performance
type CachedBonusStats = ReturnType<typeof gameStore.getState>["bonusStats"];

export class Hero extends Phaser.Physics.Arcade.Sprite {
	public health: number;
	private _lastBonusHealth: number = 0;
	private regenAccumulator: number = 0; // Tracks partial HP regen
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private wasd!: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	private zqsd!: {
		Z: Phaser.Input.Keyboard.Key;
		Q: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	private shiftKey!: Phaser.Input.Keyboard.Key;
	private energy: number = GAME_CONFIG.hero.energy.max;
	private isSprinting: boolean = false;
	private lastAutoAttackTime: number = 0;
	private lastMeleeTime: number = 0;
	private isDead: boolean = false;
	private isAttacking: boolean = false;
	public arrows: Phaser.Physics.Arcade.Group;
	public attackSpeed: number = 1; // multiplier, upgradeable
	public meleeSpeed: number = 1; // multiplier, upgradeable
	private debugGraphics?: Phaser.GameObjects.Graphics;
	private isCatchphraseActive: boolean = false;
	private footstepCounter: number = 0;
	// Cached bonus stats - refreshed once per frame to avoid repeated store access
	private cachedBonusStats: CachedBonusStats = gameStore.getState().bonusStats;
	public static readonly ATTACK_HITBOX = {
		width: GAME_CONFIG.hero.attackHitboxWidth,
		height: GAME_CONFIG.hero.attackHitboxHeight,
		offsetX: GAME_CONFIG.hero.attackHitboxOffsetX,
		offsetY: GAME_CONFIG.hero.attackHitboxOffsetY,
	};

	// Get total stat including bonus (uses cached bonusStats for performance)
	private getTotalAgility(): number {
		return GAME_CONFIG.hero.agility + this.cachedBonusStats.agility;
	}

	private getTotalStrength(): number {
		return GAME_CONFIG.hero.strength + this.cachedBonusStats.strength;
	}

	private getTotalCritical(): number {
		return GAME_CONFIG.hero.critical + this.cachedBonusStats.critical;
	}

	private getTotalMoveSpeed(): number {
		return GAME_CONFIG.hero.moveSpeed + this.cachedBonusStats.moveSpeed;
	}

	public getTotalBowRange(): number {
		return GAME_CONFIG.hero.bow.range + this.cachedBonusStats.bowRange;
	}

	// Get critical multiplier (base 2x + bonus)
	public getCritMultiplier(): number {
		return 2 + this.cachedBonusStats.critMultiplier;
	}

	// Get total piercing (flat points that reduce target's armor)
	public getPiercing(): number {
		return GAME_CONFIG.hero.piercing + this.cachedBonusStats.piercing;
	}

	// Get total accuracy (flat points that reduce target's dodge)
	public getAccuracy(): number {
		return GAME_CONFIG.hero.accuracy + this.cachedBonusStats.accuracy;
	}

	// Get damage multiplier (1 + bonus, e.g., 0.15 bonus = 1.15x)
	public getDamageMultiplier(): number {
		return 1 + this.cachedBonusStats.damageMultiplier;
	}

	// Get total armor (base + bonus, capped at 100)
	public getArmor(): number {
		return Math.min(GAME_CONFIG.hero.armor + this.cachedBonusStats.armor, 100);
	}

	// Get HP regen per second
	public getHpRegen(): number {
		return this.cachedBonusStats.hpRegen;
	}

	// Get total dodge (base + bonus + agility bonus, capped at 100)
	// Agility bonus: each point above 100 grants 0.1% dodge
	public getDodge(): number {
		const baseDodge = GAME_CONFIG.hero.dodge + this.cachedBonusStats.dodge;
		const agilityDodge = calculateAgilityDodge(this.getTotalAgility());
		return Math.min(baseDodge + agilityDodge, 100);
	}

	// Arrow power getters
	public getArrowCount(): number {
		// Returns total arrows to fire (1 base + bonus)
		return 1 + this.cachedBonusStats.arrowCount;
	}

	public getArrowPierce(): number {
		return this.cachedBonusStats.arrowPierce;
	}

	public getArrowBounce(): number {
		return this.cachedBonusStats.arrowBounce;
	}

	// On-Hit power getters
	public getLifesteal(): number {
		return this.cachedBonusStats.lifesteal;
	}

	// Sword power getters
	public hasCleave(): boolean {
		return this.cachedBonusStats.swordCleave > 0;
	}

	public getSwordAttackSpeed(): number {
		return this.cachedBonusStats.swordAttackSpeed;
	}

	public getRiposteChance(): number {
		return this.cachedBonusStats.riposteChance;
	}

	public getExecuteThreshold(): number {
		return this.cachedBonusStats.executeThreshold;
	}

	public getVorpalChance(): number {
		return this.cachedBonusStats.vorpalChance;
	}

	// Get armor penetration chance based on Strength
	// Formula: (strength - 100) * 0.1% = 0.001 per point above 100
	// Example: 200 STR = 10% armor pen chance
	public getArmorPenChance(): number {
		const strength = this.getTotalStrength();
		if (strength <= 100) return 0;
		return (strength - 100) * 0.001; // 0.1% per point = 0.001
	}

	// Roll for armor penetration
	public rollArmorPen(): boolean {
		const chance = this.getArmorPenChance();
		return chance > 0 && Math.random() < chance;
	}

	// Advanced arrow power getters
	public getArrowHoming(): number {
		return this.cachedBonusStats.arrowHoming;
	}

	public getArrowExplosive(): number {
		return this.cachedBonusStats.arrowExplosive;
	}

	// Heal the hero (used for lifesteal, on-kill heal, etc.)
	public heal(amount: number): void {
		if (amount <= 0 || this.isDead) return;
		const healAmount = Math.floor(amount);
		this.health = Math.min(this.health + healAmount, this.maxHealth);

		// Show heal effect
		this.getEffectsManager()?.showHeal(this.x, this.y, healAmount);
	}

	// Apply lifesteal based on damage dealt
	public applyLifesteal(damageDealt: number): void {
		const lifesteal = this.getLifesteal();
		if (lifesteal <= 0) return;

		const healAmount = damageDealt * lifesteal;
		if (healAmount >= 1) {
			this.heal(healAmount);
		}
	}

	// Max health including bonus
	public get maxHealth(): number {
		return GAME_CONFIG.hero.health + this.cachedBonusStats.health;
	}

	// Check and apply bonus health increases
	private checkBonusHealthChange(): void {
		const currentBonusHealth = this.cachedBonusStats.health;
		if (currentBonusHealth > this._lastBonusHealth) {
			const healthGain = currentBonusHealth - this._lastBonusHealth;
			this.health = Math.min(this.health + healthGain, this.maxHealth);
			this._lastBonusHealth = currentBonusHealth;
		}
	}

	// Get agility modifier using the centralized calculation
	private getHeroAgilityModifier(): number {
		const agility = Math.min(this.getTotalAgility(), STAT_CAPS.agility);
		return getAgilityModifier(agility);
	}

	// Get strength modifier using the centralized calculation
	private getHeroStrengthModifier(): number {
		const strength = Math.min(this.getTotalStrength(), STAT_CAPS.default);
		return getStrengthModifier(strength);
	}

	// Check if attack is a critical hit (0-100% chance, deals x2 damage)
	private rollCritical(): boolean {
		const critical = Math.min(this.getTotalCritical(), 100);
		return Math.random() * 100 < critical;
	}

	// Get effects manager from scene (may not exist during initialization)
	private getEffectsManager(): EffectsManager | null {
		const gameScene = this.scene as {
			getEffectsManager?: () => EffectsManager;
		};
		return gameScene.getEffectsManager?.() ?? null;
	}

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, "hero-idle");

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.health = GAME_CONFIG.hero.health;

		this.setScale(1);
		this.setCollideWorldBounds(true);
		// Map collision hitbox (square at feet)
		this.setSize(GAME_CONFIG.hero.hitboxWidth, GAME_CONFIG.hero.hitboxHeight);
		this.setOffset(
			GAME_CONFIG.hero.hitboxOffsetX,
			GAME_CONFIG.hero.hitboxOffsetY,
		);

		this.setupInput();
		this.play("hero-idle");

		this.arrows = scene.physics.add.group({
			classType: Arrow,
			runChildUpdate: true,
		});

		this.on("animationcomplete", this.onAnimationComplete, this);

		// Debug graphics for attack hitbox (always create for runtime toggle)
		this.debugGraphics = scene.add.graphics();
		this.debugGraphics.setDepth(1000);
	}

	private drawDebugHitboxes(): void {
		if (!this.debugGraphics) return;

		this.debugGraphics.clear();

		if (!debugState.showHitboxes) return;

		// Arrow range circle (red)
		const arrowRange = this.getTotalBowRange() * GAME_CONFIG.map.tileSize;
		this.debugGraphics.lineStyle(1, 0xff0000, 0.5);
		this.debugGraphics.strokeCircle(this.x, this.y, arrowRange);

		// Sword range circle (cyan)
		this.debugGraphics.lineStyle(1, 0x00ffff, 0.5);
		this.debugGraphics.strokeCircle(
			this.x,
			this.y,
			GAME_CONFIG.hero.sword.range,
		);

		// Attack hitbox (pink)
		const attackBox = Hero.ATTACK_HITBOX;
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
		if (animation.key === "hero-attack" || animation.key === "hero-melee") {
			this.isAttacking = false;
		}
	}

	private setupInput(): void {
		if (!this.scene.input.keyboard) return;

		this.cursors = this.scene.input.keyboard.createCursorKeys();
		this.wasd = {
			W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
		};
		this.zqsd = {
			Z: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
			Q: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
			S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
			D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
		};
		this.shiftKey = this.scene.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SHIFT,
		);
	}

	update(orcs?: Phaser.Physics.Arcade.Group, delta?: number): void {
		if (this.isDead) return;

		// Refresh cached bonus stats once per frame
		this.cachedBonusStats = gameStore.getState().bonusStats;

		this.checkBonusHealthChange();
		this.handleHpRegen(delta);
		this.handleSprint(delta);
		this.handleMovement();

		// Compute orc distances once per frame (avoid duplicate iteration)
		const orcData = this.computeOrcDistances(orcs);

		// Melee requires animation lock, but bow can fire freely
		if (!this.isAttacking) {
			this.handleMeleeAttack(orcData);
		}
		// Bow attacks are independent of animation (allows rapid fire)
		this.handleAutoAttack(orcData);
		this.drawDebugHitboxes();
	}

	// Cache structure for orc distance computation
	private computeOrcDistances(orcs?: Phaser.Physics.Arcade.Group): {
		nearestOrc: Phaser.Physics.Arcade.Sprite | null;
		nearestDistance: number;
		nearestMeleeOrc: Phaser.Physics.Arcade.Sprite | null;
		nearestMeleeDistance: number;
		orcsInMeleeRange: Phaser.Physics.Arcade.Sprite[];
	} {
		const result = {
			nearestOrc: null as Phaser.Physics.Arcade.Sprite | null,
			nearestDistance: Infinity,
			nearestMeleeOrc: null as Phaser.Physics.Arcade.Sprite | null,
			nearestMeleeDistance: Infinity,
			orcsInMeleeRange: [] as Phaser.Physics.Arcade.Sprite[],
		};

		if (!orcs) return result;

		const meleeRange = GAME_CONFIG.hero.sword.range;

		orcs.getChildren().forEach((orc) => {
			const orcSprite = orc as Phaser.Physics.Arcade.Sprite;
			if (!orcSprite.active) return;

			const distance = Phaser.Math.Distance.Between(
				this.x,
				this.y,
				orcSprite.x,
				orcSprite.y,
			);

			if (distance < result.nearestDistance) {
				result.nearestDistance = distance;
				result.nearestOrc = orcSprite;
			}

			if (distance <= meleeRange) {
				result.orcsInMeleeRange.push(orcSprite);
				if (distance < result.nearestMeleeDistance) {
					result.nearestMeleeDistance = distance;
					result.nearestMeleeOrc = orcSprite;
				}
			}
		});

		return result;
	}

	// Handle HP regeneration
	private handleHpRegen(delta?: number): void {
		const hpRegen = this.getHpRegen();
		if (hpRegen <= 0 || this.health >= this.maxHealth) return;

		// Default to 16.67ms (~60fps) if delta not provided
		const dt = delta ?? 16.67;
		const secondsFraction = dt / 1000;

		// Accumulate partial HP
		this.regenAccumulator += hpRegen * secondsFraction;

		// Apply whole HP when accumulated
		if (this.regenAccumulator >= 1) {
			const hpToAdd = Math.floor(this.regenAccumulator);
			this.health = Math.min(this.health + hpToAdd, this.maxHealth);
			this.regenAccumulator -= hpToAdd;
		}
	}

	// Handle sprint energy drain/regen
	private handleSprint(delta?: number): void {
		const config = GAME_CONFIG.hero.energy;
		const dt = delta ?? 16.67;
		const secondsFraction = dt / 1000;

		const wantsSprint = this.shiftKey?.isDown ?? false;
		const isMoving = this.body?.velocity.x !== 0 || this.body?.velocity.y !== 0;

		// Check if we can sprint
		const energyPercent = (this.energy / config.max) * 100;
		const canStartSprint = energyPercent >= config.sprintThreshold;
		const canContinueSprint = this.energy > 0;

		// Determine if we should be sprinting
		if (
			wantsSprint &&
			isMoving &&
			(this.isSprinting ? canContinueSprint : canStartSprint)
		) {
			// Drain energy while sprinting
			this.energy = Math.max(
				0,
				this.energy - config.drainRate * secondsFraction,
			);

			if (!this.isSprinting) {
				this.isSprinting = true;
				gameStore.setIsSprinting(true);
			}

			// Stop sprinting if energy depleted
			if (this.energy <= 0) {
				this.isSprinting = false;
				gameStore.setIsSprinting(false);
			}
		} else {
			// Regenerate energy when not sprinting
			if (this.energy < config.max) {
				this.energy = Math.min(
					config.max,
					this.energy + config.regenRate * secondsFraction,
				);
			}

			if (this.isSprinting) {
				this.isSprinting = false;
				gameStore.setIsSprinting(false);
			}
		}

		// Update store with current energy
		gameStore.updateEnergy(this.energy);
	}

	private handleMeleeAttack(orcData: {
		nearestMeleeOrc: Phaser.Physics.Arcade.Sprite | null;
		orcsInMeleeRange: Phaser.Physics.Arcade.Sprite[];
	}): boolean {
		if (!orcData.nearestMeleeOrc) return false;

		const currentTime = this.scene.time.now;
		const swordInterval =
			(GAME_CONFIG.hero.sword.interval * this.getHeroAgilityModifier()) /
			this.meleeSpeed /
			(1 + this.getSwordAttackSpeed());

		if (currentTime - this.lastMeleeTime < swordInterval) return false;

		this.lastMeleeTime = currentTime;
		// If cleave is enabled, hit all orcs in range
		if (this.hasCleave() && orcData.orcsInMeleeRange.length > 0) {
			this.meleeAtMultiple(orcData.orcsInMeleeRange, orcData.nearestMeleeOrc);
		} else {
			this.meleeAt(orcData.nearestMeleeOrc);
		}
		return true;
	}

	private meleeAt(target: Phaser.Physics.Arcade.Sprite): void {
		if (this.isDead) return;

		this.isAttacking = true;
		this.play("hero-melee");

		// Trigger cooldown UI
		const swordCooldown =
			(GAME_CONFIG.hero.sword.interval * this.getHeroAgilityModifier()) /
			this.meleeSpeed /
			(1 + this.getSwordAttackSpeed());
		gameStore.triggerMeleeCooldown(swordCooldown);

		const facingLeft = target.x < this.x;
		if (facingLeft) {
			this.setFlipX(true);
		} else {
			this.setFlipX(false);
		}

		// Melee slash effect
		this.getEffectsManager()?.meleeSlash(this.x, this.y, facingLeft);

		// Deal damage after animation delay
		this.scene.time.delayedCall(250, () => {
			if (!this.isDead && target.active) {
				const orc = target as unknown as {
					takeDamage: (
						amount: number,
						isCritical?: boolean,
						attackerAccuracy?: number,
						attackerPiercing?: number,
						ignoreArmor?: boolean,
					) => void;
					health?: number;
				};
				if (orc.takeDamage) {
					// Check vorpal (instant kill chance)
					const vorpalChance = this.getVorpalChance();
					if (vorpalChance > 0 && Math.random() < vorpalChance) {
						orc.takeDamage(99999, true, 100, 100, true); // Instant kill
						this.applyLifesteal(99999);
						return;
					}

					// Check execute (kill low HP enemies)
					const executeThreshold = this.getExecuteThreshold();
					if (
						executeThreshold > 0 &&
						orc.health !== undefined &&
						orc.health / GAME_CONFIG.orc.health < executeThreshold
					) {
						orc.takeDamage(99999, true, 100, 100, true); // Instant kill
						this.applyLifesteal(99999);
						return;
					}

					const isCritical = this.rollCritical();
					const isArmorPen = this.rollArmorPen();
					const baseDamage = Math.floor(
						GAME_CONFIG.hero.sword.damage *
							this.getHeroStrengthModifier() *
							this.getDamageMultiplier(),
					);
					const critMult = isCritical ? this.getCritMultiplier() : 1;
					const finalDamage = Math.floor(baseDamage * critMult);
					orc.takeDamage(
						finalDamage,
						isCritical,
						this.getAccuracy(),
						this.getPiercing(),
						isArmorPen,
					);
					// Apply lifesteal
					this.applyLifesteal(finalDamage);
				}
			}
		});
	}

	/**
	 * Cleave attack - hit multiple targets at once
	 */
	private meleeAtMultiple(
		targets: Phaser.Physics.Arcade.Sprite[],
		primary: Phaser.Physics.Arcade.Sprite,
	): void {
		if (this.isDead) return;

		this.isAttacking = true;
		this.play("hero-melee");

		// Trigger cooldown UI
		const swordCooldown =
			(GAME_CONFIG.hero.sword.interval * this.getHeroAgilityModifier()) /
			this.meleeSpeed /
			(1 + this.getSwordAttackSpeed());
		gameStore.triggerMeleeCooldown(swordCooldown);

		const facingLeft = primary.x < this.x;
		if (facingLeft) {
			this.setFlipX(true);
		} else {
			this.setFlipX(false);
		}

		// Melee slash effect
		this.getEffectsManager()?.meleeSlash(this.x, this.y, facingLeft);

		// Deal damage after animation delay to all targets
		this.scene.time.delayedCall(250, () => {
			if (this.isDead) return;

			let totalDamageDealt = 0;
			const vorpalChance = this.getVorpalChance();
			const executeThreshold = this.getExecuteThreshold();

			for (const target of targets) {
				if (!target.active) continue;

				const orc = target as unknown as {
					takeDamage: (
						amount: number,
						isCritical?: boolean,
						attackerAccuracy?: number,
						attackerPiercing?: number,
						ignoreArmor?: boolean,
					) => void;
					health?: number;
				};
				if (orc.takeDamage) {
					// Check vorpal (instant kill chance)
					if (vorpalChance > 0 && Math.random() < vorpalChance) {
						orc.takeDamage(99999, true, 100, 100, true);
						totalDamageDealt += 99999;
						continue;
					}

					// Check execute (kill low HP enemies)
					if (
						executeThreshold > 0 &&
						orc.health !== undefined &&
						orc.health / GAME_CONFIG.orc.health < executeThreshold
					) {
						orc.takeDamage(99999, true, 100, 100, true);
						totalDamageDealt += 99999;
						continue;
					}

					const isCritical = this.rollCritical();
					const isArmorPen = this.rollArmorPen();
					const baseDamage = Math.floor(
						GAME_CONFIG.hero.sword.damage *
							this.getHeroStrengthModifier() *
							this.getDamageMultiplier(),
					);
					const critMult = isCritical ? this.getCritMultiplier() : 1;
					const finalDamage = Math.floor(baseDamage * critMult);
					orc.takeDamage(
						finalDamage,
						isCritical,
						this.getAccuracy(),
						this.getPiercing(),
						isArmorPen,
					);
					totalDamageDealt += finalDamage;
				}
			}

			// Apply lifesteal for total damage dealt
			if (totalDamageDealt > 0) {
				this.applyLifesteal(totalDamageDealt);
			}
		});
	}

	private handleAutoAttack(orcData: {
		nearestOrc: Phaser.Physics.Arcade.Sprite | null;
		nearestDistance: number;
	}): boolean {
		if (!orcData.nearestOrc) return false;

		const currentTime = this.scene.time.now;
		const bowInterval =
			(GAME_CONFIG.hero.bow.interval * this.getHeroAgilityModifier()) /
			this.attackSpeed;

		if (currentTime - this.lastAutoAttackTime < bowInterval) return false;

		const maxRange = this.getTotalBowRange() * GAME_CONFIG.map.tileSize;
		// Don't shoot if in melee range
		if (
			orcData.nearestDistance <= maxRange &&
			orcData.nearestDistance > GAME_CONFIG.hero.sword.range
		) {
			this.lastAutoAttackTime = currentTime;
			this.shootAt(orcData.nearestOrc.x, orcData.nearestOrc.y);
			return true;
		}
		return false;
	}

	private lastBowAnimTime: number = 0;

	// Store orcs reference for arrow homing
	private _orcsGroup: Phaser.Physics.Arcade.Group | null = null;

	public setOrcsGroup(orcs: Phaser.Physics.Arcade.Group): void {
		this._orcsGroup = orcs;
	}

	private shootAt(targetX: number, targetY: number): void {
		if (this.isDead) return;

		const bowInterval =
			(GAME_CONFIG.hero.bow.interval * this.getHeroAgilityModifier()) /
			this.attackSpeed;

		// Only play animation if interval > 200ms (not rapid fire)
		// or if enough time passed since last animation
		const currentTime = this.scene.time.now;
		const minAnimInterval = 200; // Don't spam animations faster than this
		if (
			bowInterval >= minAnimInterval ||
			currentTime - this.lastBowAnimTime >= minAnimInterval
		) {
			this.lastBowAnimTime = currentTime;
			if (!this.isAttacking) {
				this.isAttacking = true;
				this.play("hero-attack");
			}
		}

		// Trigger cooldown UI
		gameStore.triggerArrowCooldown(bowInterval);

		const baseAngle = Phaser.Math.Angle.Between(
			this.x,
			this.y,
			targetX,
			targetY,
		);

		if (targetX < this.x) {
			this.setFlipX(true);
		} else {
			this.setFlipX(false);
		}

		// Get arrow power stats
		const arrowCount = this.getArrowCount();
		const arrowPierce = this.getArrowPierce();
		const arrowBounce = this.getArrowBounce();
		const arrowHoming = this.getArrowHoming();
		const arrowExplosive = this.getArrowExplosive();

		// Calculate spread angles for multi-shot
		const spreadAngle = 15 * (Math.PI / 180); // 15 degrees in radians
		const angles: number[] = [];

		if (arrowCount === 1) {
			angles.push(baseAngle);
		} else {
			// Distribute arrows evenly around the base angle
			const totalSpread = spreadAngle * (arrowCount - 1);
			const startAngle = baseAngle - totalSpread / 2;
			for (let i = 0; i < arrowCount; i++) {
				angles.push(startAngle + spreadAngle * i);
			}
		}

		// Fire all arrows
		for (const angle of angles) {
			const isCritical = this.rollCritical();
			const isArmorPen = this.rollArmorPen();
			const baseDamage = Math.floor(
				GAME_CONFIG.hero.bow.damage *
					this.getHeroStrengthModifier() *
					this.getDamageMultiplier(),
			);
			const critMult = isCritical ? this.getCritMultiplier() : 1;
			const arrowDamage = Math.floor(baseDamage * critMult);
			const arrow = new Arrow(
				this.scene,
				this.x,
				this.y,
				angle,
				arrowDamage,
				isCritical,
				this.getEffectsManager() ?? undefined,
				this.getAccuracy(),
				this.getPiercing(),
				arrowPierce,
				arrowBounce,
				arrowHoming,
				arrowExplosive,
				this._orcsGroup ?? undefined,
				isArmorPen,
			);
			this.arrows.add(arrow);
		}
	}

	public upgradeAttackSpeed(amount: number): void {
		this.attackSpeed += amount;
	}

	private handleMovement(): void {
		const baseSpeed = this.getTotalMoveSpeed();
		const sprintMultiplier = this.isSprinting
			? GAME_CONFIG.hero.energy.speedMultiplier
			: 1;
		const speed = baseSpeed * sprintMultiplier;
		let velocityX = 0;
		let velocityY = 0;

		if (this.cursors.left.isDown || this.wasd.A.isDown || this.zqsd.Q.isDown) {
			velocityX = -speed;
			if (!this.isAttacking) this.setFlipX(true);
		} else if (
			this.cursors.right.isDown ||
			this.wasd.D.isDown ||
			this.zqsd.D.isDown
		) {
			velocityX = speed;
			if (!this.isAttacking) this.setFlipX(false);
		}

		if (this.cursors.up.isDown || this.wasd.W.isDown || this.zqsd.Z.isDown) {
			velocityY = -speed;
		} else if (
			this.cursors.down.isDown ||
			this.wasd.S.isDown ||
			this.zqsd.S.isDown
		) {
			velocityY = speed;
		}

		// Normalize diagonal movement to prevent faster speed
		if (velocityX !== 0 && velocityY !== 0) {
			const factor = 1 / Math.SQRT2;
			velocityX *= factor;
			velocityY *= factor;
		}

		this.setVelocity(velocityX, velocityY);

		// Footstep dust effect when moving
		if (velocityX !== 0 || velocityY !== 0) {
			this.footstepCounter++;
			if (this.footstepCounter >= 10) {
				this.footstepCounter = 0;
				this.getEffectsManager()?.footstepDust(this.x, this.y);
			}
		}

		if (!this.isAttacking) {
			if (velocityX !== 0 || velocityY !== 0) {
				if (this.anims.currentAnim?.key !== "hero-walk") {
					this.play("hero-walk");
				}
			} else {
				if (this.anims.currentAnim?.key !== "hero-idle") {
					this.play("hero-idle");
				}
			}
		}
	}

	public takeDamage(
		amount: number,
		attacker?: Phaser.Physics.Arcade.Sprite,
		attackerAccuracy = 0, // Flat points that reduce hero's effective dodge
		attackerPiercing = 0, // Flat points that reduce hero's effective armor
	): void {
		if (this.isDead) return;

		// Calculate effective dodge (hero dodge - attacker accuracy, clamped 0-100)
		const effectiveDodge = Math.max(0, this.getDodge() - attackerAccuracy);

		// Roll for dodge
		if (effectiveDodge > 0 && Math.random() * 100 < effectiveDodge) {
			// Dodged! Show "Miss" text
			this.showMissText();
			this.getEffectsManager()?.showDodge(this.x, this.y);

			// Riposte: counter attack on successful dodge
			const riposteChance = this.getRiposteChance();
			if (
				riposteChance > 0 &&
				attacker &&
				attacker.active &&
				Math.random() < riposteChance
			) {
				const orc = attacker as unknown as {
					takeDamage: (
						amount: number,
						isCritical?: boolean,
						attackerAccuracy?: number,
						attackerPiercing?: number,
					) => void;
				};
				if (orc.takeDamage) {
					// Riposte deals base sword damage
					const baseDamage = Math.floor(
						GAME_CONFIG.hero.sword.damage *
							this.getHeroStrengthModifier() *
							this.getDamageMultiplier(),
					);
					orc.takeDamage(
						baseDamage,
						false,
						this.getAccuracy(),
						this.getPiercing(),
					);
					this.applyLifesteal(baseDamage);
				}
			}
			return;
		}

		// Calculate effective armor (hero armor - attacker piercing, clamped 0-100)
		const effectiveArmor = Math.max(0, this.getArmor() - attackerPiercing);

		// Apply armor reduction (armor is % damage reduction)
		const finalDamage = Math.floor(amount * (1 - effectiveArmor / 100));

		this.health -= finalDamage;

		// Hero damage flash effect
		this.getEffectsManager()?.heroDamageFlash(this.x, this.y);

		this.setTint(0xff0000);
		this.scene.time.delayedCall(100, () => {
			if (this.active) {
				this.clearTint();
			}
		});

		if (this.health <= 0) {
			this.health = 0;
			this.die();
		}
	}

	private die(): void {
		this.isDead = true;
		this.setVelocity(0, 0);
		this.play("hero-death");

		this.once("animationcomplete", () => {
			this.scene.events.emit("heroKilled");
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

	public isAlive(): boolean {
		return !this.isDead;
	}

	public getTilePosition(): { x: number; y: number } {
		return {
			x: Math.floor(this.x / GAME_CONFIG.map.tileSize),
			y: Math.floor(this.y / GAME_CONFIG.map.tileSize),
		};
	}

	public showChatBubble(
		messages: readonly string[],
		options: { force?: boolean; duration?: number } = {},
	): void {
		const { force = false, duration = 2000 } = options;

		// Ignore if one is already showing
		if (this.isCatchphraseActive) return;

		// 15% chance to show (unless forced)
		if (!force && Math.random() > 0.15) return;

		this.isCatchphraseActive = true;

		const phrase = getRandomMessageFromArray(messages);

		// Create text first to measure it
		const text = this.scene.add.text(0, 0, phrase, {
			fontSize: "9px",
			fontFamily: "Wotfard, sans-serif",
			color: "#000000",
		});
		const textWidth = text.width;
		const textHeight = text.height;
		const paddingX = 6;
		const paddingY = 4;
		const tickHeight = 5;

		// Create bubble graphics
		const bubble = this.scene.add.graphics();
		const bubbleWidth = textWidth + paddingX * 2;
		const bubbleHeight = textHeight + paddingY * 2;

		const drawBubble = (x: number, y: number) => {
			bubble.clear();
			const bubbleX = x - bubbleWidth / 2;
			const bubbleY = y - 20 - bubbleHeight;
			const radius = 3;

			// White fill for rectangle and tick
			bubble.fillStyle(0xffffff, 1);
			bubble.fillRoundedRect(
				bubbleX,
				bubbleY,
				bubbleWidth,
				bubbleHeight,
				radius,
			);
			bubble.fillTriangle(
				x - 4,
				bubbleY + bubbleHeight - 1,
				x + 4,
				bubbleY + bubbleHeight - 1,
				x,
				bubbleY + bubbleHeight + tickHeight,
			);

			// Draw border as continuous path
			bubble.lineStyle(1, 0x000000, 1);
			bubble.beginPath();
			// Start at top-left after corner
			bubble.moveTo(bubbleX + radius, bubbleY);
			// Top edge
			bubble.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
			// Top-right corner
			bubble.arc(
				bubbleX + bubbleWidth - radius,
				bubbleY + radius,
				radius,
				-Math.PI / 2,
				0,
				false,
			);
			// Right edge
			bubble.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
			// Bottom-right corner
			bubble.arc(
				bubbleX + bubbleWidth - radius,
				bubbleY + bubbleHeight - radius,
				radius,
				0,
				Math.PI / 2,
				false,
			);
			// Bottom edge (right of tick)
			bubble.lineTo(x + 4, bubbleY + bubbleHeight);
			// Tick right edge
			bubble.lineTo(x, bubbleY + bubbleHeight + tickHeight);
			// Tick left edge
			bubble.lineTo(x - 4, bubbleY + bubbleHeight);
			// Bottom edge (left of tick)
			bubble.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
			// Bottom-left corner
			bubble.arc(
				bubbleX + radius,
				bubbleY + bubbleHeight - radius,
				radius,
				Math.PI / 2,
				Math.PI,
				false,
			);
			// Left edge
			bubble.lineTo(bubbleX, bubbleY + radius);
			// Top-left corner
			bubble.arc(
				bubbleX + radius,
				bubbleY + radius,
				radius,
				Math.PI,
				-Math.PI / 2,
				false,
			);
			bubble.closePath();
			bubble.strokePath();
		};

		drawBubble(this.x, this.y);
		bubble.setDepth(999);

		// Position text
		text.setOrigin(0.5, 0.5);
		text.setPosition(this.x, this.y - 20 - bubbleHeight / 2);
		text.setDepth(1000);

		// Follow hero position
		const updatePosition = () => {
			if (bubble.active) {
				drawBubble(this.x, this.y);
				text.setPosition(this.x, this.y - 20 - bubbleHeight / 2);
			}
		};
		this.scene.events.on("update", updatePosition);

		// Fade out (start fading 75% through duration)
		const fadeDelay = Math.max(0, duration - 500);
		this.scene.tweens.add({
			targets: text,
			alpha: 0,
			delay: fadeDelay,
			duration: 500,
		});

		// Clean up after animation
		this.scene.time.delayedCall(duration, () => {
			if (this.active) {
				this.scene.events.off("update", updatePosition);
				if (bubble.active) bubble.destroy();
				if (text.active) text.destroy();
				this.isCatchphraseActive = false;
			}
		});
	}
}
