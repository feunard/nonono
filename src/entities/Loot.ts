import Phaser from "phaser";
import { debugState, GAME_CONFIG } from "../config/GameConfig";

export class Loot extends Phaser.Physics.Arcade.Sprite {
	private debugGraphics?: Phaser.GameObjects.Graphics;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, "loot");

		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Scale down sprite (divide by 4)
		this.setScale(0.25);

		// Small square hitbox
		const size = GAME_CONFIG.loot.hitboxSize;
		if (this.body) {
			const body = this.body as Phaser.Physics.Arcade.Body;
			body.setSize(size, size);
			body.setAllowGravity(false);
		}

		// Debug graphics for hitbox
		this.debugGraphics = scene.add.graphics();
		this.debugGraphics.setDepth(1000);

		// Add a subtle floating animation
		scene.tweens.add({
			targets: this,
			y: y - 4,
			duration: 800,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});
	}

	preUpdate(time: number, delta: number): void {
		super.preUpdate(time, delta);
		this.drawDebugHitboxes();
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

	destroy(fromScene?: boolean): void {
		if (this.debugGraphics) {
			this.debugGraphics.destroy();
		}
		super.destroy(fromScene);
	}
}
