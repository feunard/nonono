import { Activity } from "lucide-react";
import { Card } from "../../shared/primitives/Card";
import { IconBox } from "../../shared/primitives/IconBox";

type FPSCardProps = {
	fps: number;
};

export function FPSCard({ fps }: FPSCardProps) {
	return (
		<Card className="px-3 py-2">
			<div className="flex items-center gap-2">
				<IconBox size="sm">
					<Activity className="w-3.5 h-3.5" />
				</IconBox>
				<div className="flex items-baseline gap-1">
					<span className="text-sm font-bold tabular-nums text-white">
						{fps}
					</span>
					<span className="text-[10px] font-medium text-neutral-500 uppercase">
						FPS
					</span>
				</div>
			</div>
		</Card>
	);
}
