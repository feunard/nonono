import Phaser from "phaser";
// Arrow
import arrow from "../assets/arrow.png";
import heroMelee from "../assets/hero/Soldier-Attack01.png";
import heroAttack from "../assets/hero/Soldier-Attack03.png";
import heroDeath from "../assets/hero/Soldier-Death.png";
import heroHurt from "../assets/hero/Soldier-Hurt.png";
// Hero sprites
import heroIdle from "../assets/hero/Soldier-Idle.png";
import heroWalk from "../assets/hero/Soldier-Walk.png";
// Loot
import loot from "../assets/loot.png";
import orcAttack from "../assets/orc/Orc-Attack01.png";
import orcDeath from "../assets/orc/Orc-Death.png";
import orcHurt from "../assets/orc/Orc-Hurt.png";
// Orc sprites
import orcIdle from "../assets/orc/Orc-Idle.png";
import orcWalk from "../assets/orc/Orc-Walk.png";
import { GAME_CONFIG } from "../config/GameConfig";

export class BootScene extends Phaser.Scene {
	constructor() {
		super({ key: "BootScene" });
	}

	preload(): void {
		const { frameWidth, frameHeight } = GAME_CONFIG.sprites;

		// Hero sprites
		this.load.spritesheet("hero-idle", heroIdle, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("hero-walk", heroWalk, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("hero-attack", heroAttack, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("hero-melee", heroMelee, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("hero-death", heroDeath, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("hero-hurt", heroHurt, {
			frameWidth,
			frameHeight,
		});

		// Arrow
		this.load.image("arrow", arrow);

		// Loot
		this.load.image("loot", loot);

		// Orc sprites
		this.load.spritesheet("orc-idle", orcIdle, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("orc-walk", orcWalk, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("orc-attack", orcAttack, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("orc-death", orcDeath, {
			frameWidth,
			frameHeight,
		});
		this.load.spritesheet("orc-hurt", orcHurt, {
			frameWidth,
			frameHeight,
		});

		// Loading bar
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		const progressBar = this.add.graphics();
		const progressBox = this.add.graphics();
		progressBox.fillStyle(0x222222, 0.8);
		progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

		const loadingText = this.add.text(
			width / 2,
			height / 2 - 50,
			"Loading...",
			{
				fontSize: "20px",
				color: "#ffffff",
			},
		);
		loadingText.setOrigin(0.5, 0.5);

		this.load.on("progress", (value: number) => {
			progressBar.clear();
			progressBar.fillStyle(0x4a9f4a, 1);
			progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
		});

		this.load.on("complete", () => {
			progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
		});
	}

	create(): void {
		this.createParticleTexture();
		this.createAnimations();
		this.scene.start("GameScene");
	}

	private createParticleTexture(): void {
		// Create a small white circle texture for particles (8x8)
		const graphics = this.add.graphics();
		graphics.fillStyle(0xffffff, 1);
		graphics.fillCircle(4, 4, 4);
		graphics.generateTexture("particle", 8, 8);
		graphics.destroy();
	}

	private createAnimations(): void {
		// Hero animations
		this.anims.create({
			key: "hero-idle",
			frames: this.anims.generateFrameNumbers("hero-idle", {
				start: 0,
				end: 5,
			}),
			frameRate: 8,
			repeat: -1,
		});

		this.anims.create({
			key: "hero-walk",
			frames: this.anims.generateFrameNumbers("hero-walk", {
				start: 0,
				end: 7,
			}),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "hero-attack",
			frames: this.anims.generateFrameNumbers("hero-attack", {
				start: 0,
				end: 5,
			}),
			frameRate: 12,
			repeat: 0,
		});

		this.anims.create({
			key: "hero-melee",
			frames: this.anims.generateFrameNumbers("hero-melee", {
				start: 0,
				end: 5,
			}),
			frameRate: 12,
			repeat: 0,
		});

		this.anims.create({
			key: "hero-death",
			frames: this.anims.generateFrameNumbers("hero-death", {
				start: 0,
				end: 3,
			}),
			frameRate: 8,
			repeat: 0,
		});

		this.anims.create({
			key: "hero-hurt",
			frames: this.anims.generateFrameNumbers("hero-hurt", {
				start: 0,
				end: 1,
			}),
			frameRate: 8,
			repeat: 0,
		});

		// Orc animations
		this.anims.create({
			key: "orc-idle",
			frames: this.anims.generateFrameNumbers("orc-idle", { start: 0, end: 5 }),
			frameRate: 8,
			repeat: -1,
		});

		this.anims.create({
			key: "orc-walk",
			frames: this.anims.generateFrameNumbers("orc-walk", { start: 0, end: 7 }),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "orc-attack",
			frames: this.anims.generateFrameNumbers("orc-attack", {
				start: 0,
				end: 5,
			}),
			frameRate: 12,
			repeat: 0,
		});

		this.anims.create({
			key: "orc-death",
			frames: this.anims.generateFrameNumbers("orc-death", {
				start: 0,
				end: 3,
			}),
			frameRate: 8,
			repeat: 0,
		});

		this.anims.create({
			key: "orc-hurt",
			frames: this.anims.generateFrameNumbers("orc-hurt", { start: 0, end: 1 }),
			frameRate: 8,
			repeat: 0,
		});
	}
}
