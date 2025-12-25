import Phaser from "phaser";
import type { Arrow } from "../entities/Arrow";
import type { Foe } from "../entities/Foe";
import type { Hero } from "../entities/Hero";

export class CombatSystem {
	private scene: Phaser.Scene;
	private hero: Hero;
	private foes: Phaser.Physics.Arcade.Group;
	public killCount: number = 0;

	constructor(
		scene: Phaser.Scene,
		hero: Hero,
		foes: Phaser.Physics.Arcade.Group,
	) {
		this.scene = scene;
		this.hero = hero;
		this.foes = foes;

		this.setupCollisions();

		this.scene.events.on("foeKilled", this.onFoeKilled, this);
	}

	private setupCollisions(): void {
		this.scene.physics.add.overlap(
			this.hero.arrows,
			this.foes,
			this.onArrowHitFoe as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
			undefined,
			this,
		);
	}

	private onArrowHitFoe(
		arrow: Phaser.GameObjects.GameObject,
		foe: Phaser.GameObjects.GameObject,
	): void {
		const arrowSprite = arrow as Arrow;
		const foeSprite = foe as Foe;

		if (!foeSprite.isAlive()) return;

		// Check if this arrow has already hit this foe (for pierce/bounce)
		const foeId = foeSprite.body?.gameObject?.name
			? Number.parseInt(foeSprite.body.gameObject.name, 10)
			: ((foeSprite as unknown as { __id?: number }).__id ?? 0);

		// Use a unique identifier - fallback to object reference hash
		const enemyId = foeId || this.getObjectId(foeSprite);

		if (arrowSprite.hasHitEnemy(enemyId)) {
			return; // Already hit this enemy, skip
		}

		// Mark this enemy as hit
		arrowSprite.markEnemyHit(enemyId);

		// Deal damage
		foeSprite.takeDamage(
			arrowSprite.damage,
			arrowSprite.isCritical,
			arrowSprite.accuracy,
			arrowSprite.piercing,
			arrowSprite.ignoreArmor,
		);

		// Apply lifesteal
		this.hero.applyLifesteal(arrowSprite.damage);

		// Handle explosive: deal AoE damage to nearby enemies
		if (arrowSprite.explosiveRadius > 0) {
			this.handleExplosion(
				arrowSprite.x,
				arrowSprite.y,
				arrowSprite.explosiveRadius,
				Math.floor(arrowSprite.damage * 0.5), // 50% damage for splash
				arrowSprite.accuracy,
				arrowSprite.piercing,
				foeSprite, // Exclude the directly hit foe
			);
		}

		// Handle pierce: if arrow can pierce, continue through
		if (arrowSprite.pierceRemaining > 0) {
			arrowSprite.pierceRemaining--;
			return; // Arrow continues, don't destroy
		}

		// Handle ricochet: if arrow can bounce, find next target
		if (arrowSprite.bounceRemaining > 0) {
			const nextTarget = this.findNearestUnhitFoe(arrowSprite, foeSprite);
			if (nextTarget) {
				arrowSprite.bounceRemaining--;
				arrowSprite.redirectTo(nextTarget.x, nextTarget.y);
				return; // Arrow bounces to next target, don't destroy
			}
		}

		// No more pierce or bounce - destroy arrow
		arrowSprite.destroy();
	}

	/**
	 * Generate a unique ID for an object (used for tracking hit enemies)
	 */
	private objectIdMap = new WeakMap<object, number>();
	private nextObjectId = 1;

	private getObjectId(obj: object): number {
		let id = this.objectIdMap.get(obj);
		if (id === undefined) {
			id = this.nextObjectId++;
			this.objectIdMap.set(obj, id);
		}
		return id;
	}

	/**
	 * Find the nearest foe that hasn't been hit by this arrow yet
	 */
	private findNearestUnhitFoe(arrow: Arrow, excludeFoe: Foe): Foe | null {
		let nearest: Foe | null = null;
		let nearestDistance = Infinity;

		const excludeId = this.getObjectId(excludeFoe);

		this.foes.getChildren().forEach((gameObj) => {
			const foe = gameObj as Foe;
			if (!foe.active || !foe.isAlive()) return;

			const foeId = this.getObjectId(foe);

			// Skip if this arrow already hit this foe
			if (arrow.hasHitEnemy(foeId)) return;

			// Skip the foe we just hit
			if (foeId === excludeId) return;

			const distance = Phaser.Math.Distance.Between(
				arrow.x,
				arrow.y,
				foe.x,
				foe.y,
			);

			if (distance < nearestDistance) {
				nearestDistance = distance;
				nearest = foe;
			}
		});

		// Only bounce if target is within reasonable range (e.g., 200 pixels)
		const maxBounceRange = 200;
		if (nearest && nearestDistance <= maxBounceRange) {
			return nearest;
		}

		return null;
	}

	/**
	 * Handle explosive arrow AoE damage
	 */
	private handleExplosion(
		x: number,
		y: number,
		radius: number,
		damage: number,
		accuracy: number,
		piercing: number,
		excludeFoe: Foe,
	): void {
		const excludeId = this.getObjectId(excludeFoe);
		let totalSplashDamage = 0;

		this.foes.getChildren().forEach((gameObj) => {
			const foe = gameObj as Foe;
			if (!foe.active || !foe.isAlive()) return;

			const foeId = this.getObjectId(foe);
			if (foeId === excludeId) return; // Skip the directly hit foe

			const distance = Phaser.Math.Distance.Between(x, y, foe.x, foe.y);
			if (distance <= radius) {
				foe.takeDamage(damage, false, accuracy, piercing);
				totalSplashDamage += damage;
			}
		});

		// Apply lifesteal for splash damage
		if (totalSplashDamage > 0) {
			this.hero.applyLifesteal(totalSplashDamage);
		}
	}

	private onFoeKilled(): void {
		this.killCount++;
		this.scene.events.emit("killCountUpdated", this.killCount);
	}

	public getKillCount(): number {
		return this.killCount;
	}

	public destroy(): void {
		this.scene.events.off("foeKilled", this.onFoeKilled, this);
	}
}
