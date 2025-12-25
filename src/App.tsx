import Phaser from "phaser";
import { useCallback, useEffect, useRef, useState } from "react";
import { getRandomPowers, type Power } from "./config/PowersConfig";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { gameStore, useGameStore } from "./stores/gameStore";
import { LogSystem } from "./systems/LogSystem";
import { MapEditor } from "./ui/editor/MapEditor";
import { GameUI } from "./ui/GameUI";
import { LoadingScreen } from "./ui/LoadingScreen";
import { LaunchScreen } from "./ui/screens/LaunchScreen";

export function App() {
	const gameRef = useRef<Phaser.Game | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const {
		appScreen,
		isGameReady,
		isPaused,
		isGameOver,
		isLootSelection,
		lootPowers,
		isDebugPowerOverlay,
		bagCount,
	} = useGameStore();

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	// Only initialize Phaser when transitioning to playing state
	useEffect(() => {
		if (
			appScreen !== "playing" ||
			gameRef.current ||
			dimensions.width === 0 ||
			dimensions.height === 0
		)
			return;

		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: dimensions.width,
			height: dimensions.height,
			parent: "game-container",
			backgroundColor: "#ffffff",
			physics: {
				default: "arcade",
				arcade: {
					gravity: { x: 0, y: 0 },
					debug: false,
				},
			},
			scene: [BootScene, GameScene],
			pixelArt: true,
			roundPixels: true,
			fps: {
				target: 60,
				forceSetTimeOut: true,
			},
		};

		gameRef.current = new Phaser.Game(config);

		return () => {
			gameRef.current?.destroy(true);
			gameRef.current = null;
		};
	}, [appScreen, dimensions]);

	const handleStartGame = useCallback(() => {
		gameStore.startGame();
	}, []);

	const handleOpenEditor = useCallback(() => {
		gameStore.openEditor();
	}, []);

	const handleBackToMenu = useCallback(() => {
		gameStore.goToMenu();
	}, []);

	const handleRestart = useCallback(() => {
		// Reset store state first (clears isGameOver, etc.)
		gameStore.reset();

		const game = gameRef.current;
		if (game) {
			const gameScene = game.scene.getScene("GameScene");
			if (gameScene) {
				game.scene.stop("GameScene");
				game.scene.start("GameScene");
			}
		}
	}, []);

	const handleResume = useCallback(() => {
		const game = gameRef.current;
		if (game) {
			const gameScene = game.scene.getScene("GameScene") as unknown as
				| { resume: () => void }
				| undefined;
			gameScene?.resume();
		}
	}, []);

	const handlePause = useCallback(() => {
		const game = gameRef.current;
		if (game) {
			const gameScene = game.scene.getScene("GameScene") as unknown as
				| { togglePause: () => void }
				| undefined;
			gameScene?.togglePause();
		}
	}, []);

	const handleLootSelect = useCallback((power: Power) => {
		// Log power pickup
		LogSystem.logPowerPickup(power);
		// Apply the selected power to bonus stats
		gameStore.applyPower(power);
		// Consume one bag
		gameStore.consumeBag();
		// Hide the loot selection UI (game continues running)
		gameStore.hideLootSelection();
	}, []);

	const handleLootCancel = useCallback(() => {
		// Consume one bag without gaining power
		gameStore.consumeBag();
		// Hide the loot selection UI
		gameStore.hideLootSelection();
	}, []);

	const handleOpenBag = useCallback(() => {
		if (bagCount > 0) {
			// Generate 3 random powers and show selection
			const powers = getRandomPowers(3);
			gameStore.showLootSelection(powers);
		}
	}, [bagCount]);

	const handleDebugPowerClose = useCallback(() => {
		const game = gameRef.current;
		if (game) {
			const gameScene = game.scene.getScene("GameScene") as unknown as
				| { closeDebugPowerOverlay: () => void }
				| undefined;
			gameScene?.closeDebugPowerOverlay();
		}
	}, []);

	const handleDebugPowerSelect = useCallback((power: Power) => {
		// Apply the selected power (cheat) - keep overlay open for more selections
		gameStore.applyPower(power);
	}, []);

	// Global keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if typing in an input
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			// Enter - Start game (when on menu) or Restart (when game over)
			if (e.key === "Enter") {
				if (appScreen === "menu") {
					handleStartGame();
					return;
				}
				if (isGameOver) {
					handleRestart();
					return;
				}
			}

			// Space - Resume (only when paused, not during overlays)
			if (
				e.key === " " &&
				isPaused &&
				!isGameOver &&
				!isLootSelection &&
				!isDebugPowerOverlay
			) {
				e.preventDefault();
				handleResume();
				return;
			}

			// E - Open bag (only when bag has items and no overlay is showing)
			if (
				(e.key === "e" || e.key === "E") &&
				!isGameOver &&
				!isLootSelection &&
				!isDebugPowerOverlay &&
				bagCount > 0
			) {
				handleOpenBag();
				return;
			}

			// 1, 2, 3 - Select loot power
			if (isLootSelection && lootPowers.length > 0) {
				const keyNum = Number.parseInt(e.key, 10);
				if (keyNum >= 1 && keyNum <= lootPowers.length) {
					handleLootSelect(lootPowers[keyNum - 1]);
					return;
				}
			}

			// Escape - Cancel loot selection or close debug power overlay
			if (e.key === "Escape") {
				if (isLootSelection) {
					handleLootCancel();
					return;
				}
				if (isDebugPowerOverlay) {
					handleDebugPowerClose();
					return;
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		appScreen,
		isPaused,
		isGameOver,
		isLootSelection,
		lootPowers,
		isDebugPowerOverlay,
		bagCount,
		handleStartGame,
		handleResume,
		handleDebugPowerClose,
		handleLootSelect,
		handleLootCancel,
		handleOpenBag,
		handleRestart,
	]);

	// Show launch screen when on menu
	if (appScreen === "menu") {
		return (
			<div className="relative w-screen h-screen overflow-hidden">
				<LaunchScreen
					onStartGame={handleStartGame}
					onOpenEditor={handleOpenEditor}
				/>
			</div>
		);
	}

	// Show map editor
	if (appScreen === "editor") {
		return (
			<div className="relative w-screen h-screen overflow-hidden">
				<MapEditor onBack={handleBackToMenu} />
			</div>
		);
	}

	// Show game when playing
	return (
		<div className="relative w-screen h-screen overflow-hidden">
			{/* Loading screen - shows until Phaser is ready */}
			<LoadingScreen isVisible={!isGameReady} />

			{/* Phaser game container - hidden until ready */}
			<div
				id="game-container"
				className={`absolute inset-0 z-0 transition-opacity duration-500 ${
					isGameReady ? "opacity-100" : "opacity-0"
				}`}
			/>

			{/* React UI overlay - only show when game is ready */}
			{isGameReady && (
				<div
					id="ui-overlay"
					className="absolute inset-0 z-10 pointer-events-none"
				>
					<GameUI
						onRestart={handleRestart}
						onResume={handleResume}
						onPause={handlePause}
						onLootSelect={handleLootSelect}
						onLootCancel={handleLootCancel}
						onOpenBag={handleOpenBag}
						onDebugPowerSelect={handleDebugPowerSelect}
						onDebugPowerClose={handleDebugPowerClose}
					/>
				</div>
			)}
		</div>
	);
}
