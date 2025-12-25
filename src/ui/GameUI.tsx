import type { Power } from "../config/PowersConfig";
import { useGameStore } from "../stores/gameStore";
import {
	BagCard,
	DebugHeroStatsCard,
	DebugHotkeysCard,
	EnergyBarCard,
	FPSCard,
	GameStatsCard,
	HealthBarCard,
	HeroStatsCard,
	LogsCard,
	MenuBarCard,
	PowersCard,
	ZoomControlCard,
} from "./cards";
import {
	DebugPowerDialog,
	GameOverDialog,
	LootSelectionDialog,
	PauseDialog,
} from "./dialogs";

type GameUIProps = {
	onRestart: () => void;
	onResume: () => void;
	onPause: () => void;
	onLootSelect: (power: Power) => void;
	onLootCancel: () => void;
	onOpenBag: () => void;
	onDebugPowerSelect: (power: Power) => void;
	onDebugPowerClose: () => void;
};

export function GameUI({
	onRestart,
	onResume,
	onPause,
	onLootSelect,
	onLootCancel,
	onOpenBag,
	onDebugPowerSelect,
	onDebugPowerClose,
}: GameUIProps) {
	const {
		health,
		maxHealth,
		wave,
		kills,
		orcsAlive,
		elapsedTime,
		fps,
		isPaused,
		isGameOver,
		gameOverStats,
		isLootSelection,
		lootPowers,
		isDebugPowerOverlay,
		isDebugMode,
		energy,
		isSprinting,
	} = useGameStore();

	return (
		<div className="relative w-screen h-screen">
			{/* HUD Overlay */}
			<div className="absolute top-6 left-6 pointer-events-auto flex gap-2 items-start">
				<div className="flex flex-col gap-2">
					<HealthBarCard health={health} maxHealth={maxHealth} />
					<EnergyBarCard energy={energy} isSprinting={isSprinting} />
					{isDebugMode && <DebugHotkeysCard />}
				</div>
				<FPSCard fps={fps} />
			</div>
			<div className="absolute top-6 right-6 pointer-events-auto flex flex-col gap-3 items-end">
				<GameStatsCard
					wave={wave}
					kills={kills}
					orcsAlive={orcsAlive}
					elapsedTime={elapsedTime}
				/>
				<div className="flex gap-2 items-start">
					<BagCard onOpen={onOpenBag} />
					<PowersCard />
					<HeroStatsCard />
				</div>
				{isDebugMode && <DebugHeroStatsCard />}
			</div>
			<div className="absolute bottom-6 right-6 pointer-events-auto flex flex-col gap-2 items-end">
				<ZoomControlCard />
				<MenuBarCard onPause={onPause} />
			</div>
			<div className="absolute bottom-6 left-6 pointer-events-auto">
				<LogsCard />
			</div>

			{/* Pause, Game Over, Loot Selection, and Debug Dialogs */}
			{isPaused && !isGameOver && !isLootSelection && !isDebugPowerOverlay && (
				<PauseDialog onResume={onResume} />
			)}
			{isGameOver && gameOverStats && (
				<GameOverDialog
					survivalTime={gameOverStats.survivalTime}
					kills={gameOverStats.kills}
					wave={gameOverStats.wave}
					onRestart={onRestart}
				/>
			)}
			{isLootSelection && lootPowers.length > 0 && (
				<LootSelectionDialog
					powers={lootPowers}
					onSelect={onLootSelect}
					onCancel={onLootCancel}
				/>
			)}
			{isDebugPowerOverlay && (
				<DebugPowerDialog
					onSelect={onDebugPowerSelect}
					onClose={onDebugPowerClose}
				/>
			)}
		</div>
	);
}
