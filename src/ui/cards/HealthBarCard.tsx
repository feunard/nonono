import { Heart } from "lucide-react";
import { Card } from "../primitives/Card";
import { IconBox } from "../primitives/IconBox";

type HealthBarCardProps = {
	health: number;
	maxHealth: number;
};

export function HealthBarCard({ health, maxHealth }: HealthBarCardProps) {
	const percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
	const isCritical = percentage <= 25;

	return (
		<Card className="px-4 py-3">
			<div className="flex items-center gap-3">
				<IconBox size="sm" className={isCritical ? "animate-pulse" : ""}>
					<Heart className="w-4 h-4" fill="currentColor" />
				</IconBox>

				<div className="flex-1">
					<div className="flex justify-between items-center gap-6 mb-1.5">
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

					<div className="h-2.5 bg-black rounded-sm border border-neutral-800 overflow-hidden">
						<div
							className={`h-full transition-all duration-300 rounded-sm ${
								isCritical
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
