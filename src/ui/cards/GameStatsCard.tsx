import { Clock, Skull, Swords, Users } from "lucide-react";
import { Card } from "../primitives/Card";
import { Stat, StatDivider } from "../primitives/Stat";

type GameStatsCardProps = {
	wave: number;
	kills: number;
	orcsAlive: number;
	elapsedTime: number;
};

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function GameStatsCard({
	wave,
	kills,
	orcsAlive,
	elapsedTime,
}: GameStatsCardProps) {
	return (
		<Card className="px-4 py-3">
			<div className="flex items-center gap-4">
				<Stat icon={<Swords className="w-4 h-4" />} label="Wave" value={wave} />
				<StatDivider />
				<Stat
					icon={<Users className="w-4 h-4" />}
					label="Orcs"
					value={orcsAlive}
				/>
				<StatDivider />
				<Stat
					icon={<Skull className="w-4 h-4" />}
					label="Kills"
					value={kills}
				/>
				<StatDivider />
				<Stat
					icon={<Clock className="w-4 h-4" />}
					label="Time"
					value={formatTime(elapsedTime)}
				/>
			</div>
		</Card>
	);
}
