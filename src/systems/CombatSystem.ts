import Phaser from "phaser";
import type { Arrow } from "../entities/Arrow";
import type { Hero } from "../entities/Hero";
import type { Orc } from "../entities/Orc";

export class CombatSystem {
	private scene: Phaser.Scene;
	private hero: Hero;
	private orcs: Phaser.Physics.Arcade.Group;
	public killCount: number = 0;

	constructor(
		scene: Phaser.Scene,
		hero: Hero,
		orcs: Phaser.Physics.Arcade.Group,
	) {
		this.scene = scene;
		this.hero = hero;
		this.orcs = orcs;

		this.setupCollisions();

		this.scene.events.on("orcKilled", this.onOrcKilled, this);
	}

	private setupCollisions(): void {
		this.scene.physics.add.overlap(
			this.hero.arrows,
			this.orcs,
			this.onArrowHitOrc as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
			undefined,
			this,
		);
	}

	private onArrowHitOrc(
		arrow: Phaser.GameObjects.GameObject,
		orc: Phaser.GameObjects.GameObject,
	): void {
		const arrowSprite = arrow as Arrow;
		const orcSprite = orc as Orc;

		if (!orcSprite.isAlive()) return;

		// Check if this arrow has already hit this orc (for pierce/bounce)
		const orcId = orcSprite.body?.gameObject?.name
			? Number.parseInt(orcSprite.body.gameObject.name, 10)
			: ((orcSprite as unknown as { __id?: number }).__id ?? 0);

		// Use a unique identifier - fallback to object reference hash
		const enemyId = orcId || this.getObjectId(orcSprite);

		if (arrowSprite.hasHitEnemy(enemyId)) {
			return; // Already hit this enemy, skip
		}

		// Mark this enemy as hit
		arrowSprite.markEnemyHit(enemyId);

		// Deal damage
		orcSprite.takeDamage(
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
				orcSprite, // Exclude the directly hit orc
			);
		}

		// Handle pierce: if arrow can pierce, continue through
		if (arrowSprite.pierceRemaining > 0) {
			arrowSprite.pierceRemaining--;
			return; // Arrow continues, don't destroy
		}

		// Handle ricochet: if arrow can bounce, find next target
		if (arrowSprite.bounceRemaining > 0) {
			const nextTarget = this.findNearestUnhitOrc(arrowSprite, orcSprite);
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
	 * Find the nearest orc that hasn't been hit by this arrow yet
	 */
	private findNearestUnhitOrc(arrow: Arrow, excludeOrc: Orc): Orc | null {
		let nearest: Orc | null = null;
		let nearestDistance = Infinity;

		const excludeId = this.getObjectId(excludeOrc);

		this.orcs.getChildren().forEach((gameObj) => {
			const orc = gameObj as Orc;
			if (!orc.active || !orc.isAlive()) return;

			const orcId = this.getObjectId(orc);

			// Skip if this arrow already hit this orc
			if (arrow.hasHitEnemy(orcId)) return;

			// Skip the orc we just hit
			if (orcId === excludeId) return;

			const distance = Phaser.Math.Distance.Between(
				arrow.x,
				arrow.y,
				orc.x,
				orc.y,
			);

			if (distance < nearestDistance) {
				nearestDistance = distance;
				nearest = orc;
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
		excludeOrc: Orc,
	): void {
		const excludeId = this.getObjectId(excludeOrc);
		let totalSplashDamage = 0;

		this.orcs.getChildren().forEach((gameObj) => {
			const orc = gameObj as Orc;
			if (!orc.active || !orc.isAlive()) return;

			const orcId = this.getObjectId(orc);
			if (orcId === excludeId) return; // Skip the directly hit orc

			const distance = Phaser.Math.Distance.Between(x, y, orc.x, orc.y);
			if (distance <= radius) {
				orc.takeDamage(damage, false, accuracy, piercing);
				totalSplashDamage += damage;
			}
		});

		// Apply lifesteal for splash damage
		if (totalSplashDamage > 0) {
			this.hero.applyLifesteal(totalSplashDamage);
		}
	}

	private onOrcKilled(): void {
		this.killCount++;
		this.scene.events.emit("killCountUpdated", this.killCount);
	}

	public getKillCount(): number {
		return this.killCount;
	}

	public destroy(): void {
		this.scene.events.off("orcKilled", this.onOrcKilled, this);
	}
}
