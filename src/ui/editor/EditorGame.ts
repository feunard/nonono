import Phaser from "phaser";
import { EditorScene } from "../../scenes/EditorScene";

export function createEditorGame(parent: HTMLElement): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		parent,
		width: parent.clientWidth,
		height: parent.clientHeight,
		backgroundColor: "#ffffff",
		scale: {
			mode: Phaser.Scale.RESIZE,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
		scene: [EditorScene],
		physics: {
			default: "arcade",
			arcade: {
				gravity: { x: 0, y: 0 },
				debug: false,
			},
		},
		input: {
			mouse: {
				preventDefaultWheel: true,
			},
		},
		render: {
			pixelArt: true,
			antialias: false,
		},
	};

	return new Phaser.Game(config);
}
