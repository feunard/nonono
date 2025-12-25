import Phaser from "phaser";
import { useCallback, useEffect, useRef, useState } from "react";
import { getRandomAvailablePowers, type Power } from "./config/PowersConfig";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { gameStore, useGameStore } from "./stores/gameStore";
import { heroStore, useHeroStore } from "./stores/heroStore";
import { inventoryStore, useInventoryStore } from "./stores/inventoryStore";
import { useUIStore } from "./stores/uiStore";
import { LogSystem } from "./systems/LogSystem";
import { MapEditor } from "./ui/editor/MapEditor";
import { GameUI } from "./ui/game/GameUI";
import { LoadingScreen } from "./ui/game/LoadingScreen";
import { LaunchScreen } from "./ui/game/screens/LaunchScreen";

export function App() {
	const gameRef = useRef<Phaser.Game | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const { appScreen, isGameReady, isPaused, isGameOver } = useGameStore();
	const { isLootSelection, lootPowers, bagCount, collectedPowers } =
		useInventoryStore();
	const { bonusStats } = useHeroStore();
	const { isDebugPowerOverlay } = useUIStore();

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
		// Apply the selected power to bonus stats (both inventory and hero)
		inventoryStore.applyPower(power);
		heroStore.addBonus(power.effect.stat, power.effect.value);
		// Consume one bag
		inventoryStore.consumeBag();

		// Check if more bags remain - read fresh state after consumeBag
		const state = inventoryStore.getState();
		if (state.bagCount > 0) {
			// Generate new powers using fresh collectedPowers state and show dialog again
			const powers = getRandomAvailablePowers(
				3,
				state.collectedPowers,
				heroStore.getState().bonusStats,
			);
			inventoryStore.showLootSelection(powers);
		} else {
			// No more bags - hide the loot selection UI
			inventoryStore.hideLootSelection();
		}
	}, []);

	const handleLootCancel = useCallback(() => {
		// Just hide the dialog - don't consume the bag
		// Player can return later and open bags with E key
		inventoryStore.hideLootSelection();
	}, []);

	const handleOpenBag = useCallback(() => {
		if (bagCount > 0) {
			// Generate 3 random powers (filtered by prerequisites) and show selection
			const powers = getRandomAvailablePowers(3, collectedPowers, bonusStats);
			inventoryStore.showLootSelection(powers);
		}
	}, [bagCount, collectedPowers, bonusStats]);

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
		inventoryStore.applyPower(power);
		heroStore.addBonus(power.effect.stat, power.effect.value);
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
				if (e.code === "Digit1" && lootPowers.length >= 1) {
					handleLootSelect(lootPowers[0]);
					return;
				}
				if (e.code === "Digit2" && lootPowers.length >= 2) {
					handleLootSelect(lootPowers[1]);
					return;
				}
				if (e.code === "Digit3" && lootPowers.length >= 3) {
					handleLootSelect(lootPowers[2]);
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
