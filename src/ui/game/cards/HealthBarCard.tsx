import { Heart, Zap } from "lucide-react";
import { GAME_CONFIG } from "../../config/GameConfig";
import { Card } from "../primitives/Card";
import { IconBox } from "../primitives/IconBox";
import { Kbd } from "../primitives/Kbd";

type HealthBarCardProps = {
	health: number;
	maxHealth: number;
	energy: number;
	isSprinting: boolean;
};

export function HealthBarCard({
	health,
	maxHealth,
	energy,
	isSprinting,
}: HealthBarCardProps) {
	const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
	const isCritical = healthPercent <= 25;

	const maxEnergy = GAME_CONFIG.hero.energy.max;
	const energyPercent = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));
	const isEnergyLow = energyPercent < GAME_CONFIG.hero.energy.sprintThreshold;

	return (
		<Card className="px-4 py-3">
			<div className="flex items-center gap-3">
				<div className="flex flex-col gap-1.5">
					<IconBox size="sm" className={isCritical ? "animate-pulse" : ""}>
						<Heart className="w-4 h-4" fill="currentColor" />
					</IconBox>
					<IconBox size="sm" className={isSprinting ? "animate-pulse" : ""}>
						<Zap className="w-3 h-3" fill="currentColor" />
					</IconBox>
				</div>

				<div className="w-48">
					{/* Health bar */}
					<div className="flex justify-between items-center gap-6 mb-1">
						<span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
							Health
						</span>
						<div className="flex items-baseline gap-0.5">
							<span className="text-base font-bold tabular-nums text-white">
								{health}
							</span>
							<span className="text-neutral-500 text-xs font-medium">
								/{maxHealth}
							</span>
						</div>
					</div>
					<div className="h-2.5 bg-black rounded-sm border border-neutral-800 overflow-hidden mb-2">
						<div
							className={`h-full transition-all duration-300 rounded-sm ${
								isCritical
									? "bg-gradient-to-r from-neutral-400 to-white animate-pulse"
									: "bg-gradient-to-r from-neutral-500 to-white"
							}`}
							style={{ width: `${healthPercent}%` }}
						/>
					</div>

					{/* Energy bar */}
					<div className="flex justify-between items-center gap-6 mb-1">
						<div className="flex items-center gap-1.5">
							<span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
								Energy
							</span>
							<Kbd className="px-1 py-0 text-[8px]">Shift</Kbd>
						</div>
						<span className="text-xs font-bold tabular-nums text-neutral-400">
							{Math.floor(energy)}%
						</span>
					</div>
					<div className="h-1.5 bg-black rounded-sm border border-neutral-800 overflow-hidden">
						<div
							className={`h-full rounded-sm ${
								isEnergyLow
									? "bg-neutral-600"
									: isSprinting
										? "bg-gradient-to-r from-neutral-400 to-white animate-pulse"
										: "bg-gradient-to-r from-neutral-600 to-neutral-400"
							}`}
							style={{ width: `${energyPercent}%` }}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
