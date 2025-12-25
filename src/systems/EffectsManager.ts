import Phaser from "phaser";

/**
 * Manages all particle effects in the game.
 * Uses Phaser's built-in particle system for GPU-accelerated performance.
 */
export class EffectsManager {
	private scene: Phaser.Scene;

	// Emitters for different effects
	private hitEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private deathEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private criticalEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private knockbackEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private meleeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private footstepEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private heroDamageEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private spawnEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private dodgeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	private healEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

	// Trail emitters are created per-arrow
	private trailEmitters: Map<
		Phaser.GameObjects.GameObject,
		Phaser.GameObjects.Particles.ParticleEmitter
	> = new Map();

	constructor(scene: Phaser.Scene) {
		this.scene = scene;

		// Create all emitters
		this.hitEmitter = this.createHitEmitter();
		this.deathEmitter = this.createDeathEmitter();
		this.criticalEmitter = this.createCriticalEmitter();
		this.knockbackEmitter = this.createKnockbackEmitter();
		this.meleeEmitter = this.createMeleeEmitter();
		this.footstepEmitter = this.createFootstepEmitter();
		this.heroDamageEmitter = this.createHeroDamageEmitter();
		this.spawnEmitter = this.createSpawnEmitter();
		this.dodgeEmitter = this.createDodgeEmitter();
		this.healEmitter = this.createHealEmitter();
	}

	/**
	 * Hit splatter - burst of particles when orc takes damage
	 */
	private createHitEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 50, max: 150 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.5, end: 0 },
			lifespan: { min: 200, max: 400 },
			gravityY: 300,
			tint: 0xcccccc, // Light gray for B&W theme
			emitting: false,
		});
	}

	/**
	 * Death poof - larger cloud when orc dies
	 */
	private createDeathEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 30, max: 100 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.8, end: 0 },
			alpha: { start: 0.8, end: 0 },
			lifespan: { min: 400, max: 700 },
			gravityY: -50, // Rise slightly
			tint: 0xffffff,
			emitting: false,
		});
	}

	/**
	 * Critical hit sparkle - bright white stars
	 */
	private createCriticalEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 100, max: 200 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.6, end: 0 },
			alpha: { start: 1, end: 0 },
			lifespan: { min: 300, max: 500 },
			tint: 0xffffff,
			emitting: false,
		});
	}

	/**
	 * Knockback dust - small puff when orc is pushed back
	 */
	private createKnockbackEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 20, max: 60 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.4, end: 0 },
			alpha: { start: 0.6, end: 0 },
			lifespan: { min: 150, max: 300 },
			tint: 0xaaaaaa,
			emitting: false,
		});
	}

	/**
	 * Melee slash - arc of particles for sword attack
	 */
	private createMeleeEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 80, max: 150 },
			scale: { start: 0.4, end: 0 },
			alpha: { start: 1, end: 0 },
			lifespan: { min: 150, max: 250 },
			tint: 0xffffff,
			emitting: false,
		});
	}

	/**
	 * Footstep dust - tiny puffs when hero runs
	 */
	private createFootstepEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 10, max: 30 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.2, end: 0 },
			alpha: { start: 0.4, end: 0 },
			lifespan: { min: 100, max: 200 },
			gravityY: 50,
			tint: 0x999999,
			emitting: false,
		});
	}

	/**
	 * Hero damage - inward flash when hero takes hit
	 */
	private createHeroDamageEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 50, max: 100 },
			scale: { start: 0.5, end: 0 },
			alpha: { start: 0.8, end: 0 },
			lifespan: { min: 200, max: 350 },
			tint: 0xffffff,
			emitting: false,
		});
	}

	/**
	 * Spawn smoke - rising wisps when orc spawns
	 */
	private createSpawnEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 20, max: 50 },
			angle: { min: 250, max: 290 }, // Upward
			scale: { start: 0.5, end: 0 },
			alpha: { start: 0.5, end: 0 },
			lifespan: { min: 400, max: 600 },
			tint: 0x666666, // Dark gray
			emitting: false,
		});
	}

	/**
	 * Dodge effect - swift blur when hero dodges an attack
	 */
	private createDodgeEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 80, max: 150 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.4, end: 0 },
			alpha: { start: 0.7, end: 0 },
			lifespan: { min: 200, max: 350 },
			tint: 0xffffff,
			emitting: false,
		});
	}

	/**
	 * Heal effect - rising particles when hero heals
	 */
	private createHealEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
		return this.scene.add.particles(0, 0, "particle", {
			speed: { min: 30, max: 80 },
			angle: { min: 250, max: 290 }, // Upward
			scale: { start: 0.4, end: 0 },
			alpha: { start: 0.8, end: 0 },
			lifespan: { min: 300, max: 500 },
			tint: 0xffffff, // White for B&W theme
			emitting: false,
		});
	}

	// ========== PUBLIC EFFECT METHODS ==========

	/**
	 * Play hit splatter effect at position
	 */
	public hitSplatter(x: number, y: number): void {
		this.hitEmitter.setPosition(x, y);
		this.hitEmitter.explode(8);
	}

	/**
	 * Play death poof effect at position
	 */
	public deathPoof(x: number, y: number): void {
		this.deathEmitter.setPosition(x, y);
		this.deathEmitter.explode(15);
	}

	/**
	 * Play critical hit sparkle effect at position
	 */
	public criticalSparkle(x: number, y: number): void {
		this.criticalEmitter.setPosition(x, y);
		this.criticalEmitter.explode(12);
	}

	/**
	 * Play knockback dust effect at position
	 */
	public knockbackDust(x: number, y: number): void {
		this.knockbackEmitter.setPosition(x, y);
		this.knockbackEmitter.explode(5);
	}

	/**
	 * Play melee slash effect in a direction
	 */
	public meleeSlash(x: number, y: number, facingLeft: boolean): void {
		// Create arc in the direction hero is facing
		const baseAngle = facingLeft ? 180 : 0;

		// Emit particles manually with directional angles
		for (let i = 0; i < 8; i++) {
			const angle = baseAngle - 45 + Math.random() * 90;
			const offsetX = Math.cos(Phaser.Math.DegToRad(angle)) * 10;
			const offsetY = Math.sin(Phaser.Math.DegToRad(angle)) * 10;

			this.meleeEmitter.setPosition(x + offsetX, y + offsetY);
			this.meleeEmitter.explode(1);
		}
	}

	/**
	 * Play footstep dust effect at position
	 */
	public footstepDust(x: number, y: number): void {
		this.footstepEmitter.setPosition(x, y + 10); // At feet level
		this.footstepEmitter.explode(2);
	}

	/**
	 * Play hero damage flash effect (particles burst outward from hero)
	 */
	public heroDamageFlash(x: number, y: number): void {
		this.heroDamageEmitter.setPosition(x, y);
		this.heroDamageEmitter.explode(10);
	}

	/**
	 * Play spawn smoke effect at position
	 */
	public spawnSmoke(x: number, y: number): void {
		this.spawnEmitter.setPosition(x, y);
		this.spawnEmitter.explode(8);
	}

	/**
	 * Play dodge effect at position - swift blur when hero evades
	 */
	public showDodge(x: number, y: number): void {
		this.dodgeEmitter.setPosition(x, y);
		this.dodgeEmitter.explode(10);
	}

	/**
	 * Play heal effect at position - rising particles when hero heals
	 */
	public showHeal(x: number, y: number, _amount?: number): void {
		this.healEmitter.setPosition(x, y);
		this.healEmitter.explode(8);
	}

	/**
	 * Create and start an arrow trail emitter
	 */
	public startArrowTrail(arrow: Phaser.GameObjects.GameObject): void {
		const emitter = this.scene.add.particles(0, 0, "particle", {
			speed: { min: 5, max: 20 },
			angle: { min: 0, max: 360 },
			scale: { start: 0.3, end: 0 },
			alpha: { start: 0.5, end: 0 },
			lifespan: { min: 100, max: 200 },
			frequency: 20, // Emit every 20ms
			tint: 0xcccccc,
			follow: arrow as Phaser.GameObjects.Sprite,
		});

		this.trailEmitters.set(arrow, emitter);
	}

	/**
	 * Stop and cleanup an arrow trail emitter
	 */
	public stopArrowTrail(arrow: Phaser.GameObjects.GameObject): void {
		const emitter = this.trailEmitters.get(arrow);
		if (emitter) {
			emitter.stop();
			this.trailEmitters.delete(arrow);
			// Destroy after particles fade out, with safety check
			this.scene.time.delayedCall(300, () => {
				if (emitter.active) {
					emitter.destroy();
				}
			});
		}
	}

	/**
	 * Clean up all effects
	 */
	public destroy(): void {
		this.hitEmitter.destroy();
		this.deathEmitter.destroy();
		this.criticalEmitter.destroy();
		this.knockbackEmitter.destroy();
		this.meleeEmitter.destroy();
		this.footstepEmitter.destroy();
		this.heroDamageEmitter.destroy();
		this.spawnEmitter.destroy();
		this.dodgeEmitter.destroy();
		this.healEmitter.destroy();

		// Clean up any remaining trail emitters
		for (const emitter of this.trailEmitters.values()) {
			emitter.destroy();
		}
		this.trailEmitters.clear();
	}
}
