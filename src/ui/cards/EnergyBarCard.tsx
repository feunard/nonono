import { Zap } from "lucide-react";
import { GAME_CONFIG } from "../../config/GameConfig";
import { Card } from "../primitives/Card";
import { IconBox } from "../primitives/IconBox";
import { Kbd } from "../primitives/Kbd";

type EnergyBarCardProps = {
	energy: number;
	isSprinting: boolean;
};

export function EnergyBarCard({ energy, isSprinting }: EnergyBarCardProps) {
	const maxEnergy = GAME_CONFIG.hero.energy.max;
	const percentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));
	const isLow = percentage < GAME_CONFIG.hero.energy.sprintThreshold;

	return (
		<Card className="px-4 py-3">
			<div className="flex items-center gap-3">
				<IconBox size="sm" className={isSprinting ? "animate-pulse" : ""}>
					<Zap className="w-4 h-4" fill="currentColor" />
				</IconBox>

				<div className="flex-1">
					<div className="flex justify-between items-center gap-6 mb-1.5">
						<div className="flex items-center gap-2">
							<span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
								Energy
							</span>
							<Kbd className="px-1 py-0.5 text-[8px]">Shift</Kbd>
						</div>
						<div className="flex items-baseline gap-0.5">
							<span className="text-base font-bold tabular-nums text-white">
								{Math.floor(energy)}
							</span>
							<span className="text-neutral-500 text-xs font-medium">
								/{maxEnergy}
							</span>
						</div>
					</div>

					<div className="h-2.5 bg-black rounded-sm border border-neutral-800 overflow-hidden">
						<div
							className={`h-full transition-all duration-150 rounded-sm ${
								isLow
									? "bg-gradient-to-r from-neutral-600 to-neutral-500"
									: isSprinting
										? "bg-gradient-to-r from-neutral-400 to-white animate-pulse"
										: "bg-gradient-to-r from-neutral-500 to-white"
							}`}
							style={{ width: `${percentage}%` }}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
