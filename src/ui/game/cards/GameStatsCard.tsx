import { Clock, Skull, Swords, Users } from "lucide-react";
import { GAME_CONFIG } from "../../../config/GameConfig";
import { Card } from "../../shared/primitives/Card";
import { Stat, StatDivider } from "../../shared/primitives/Stat";
import { Tooltip } from "../../shared/primitives/Tooltip";

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

function getWaveScalingInfo(wave: number) {
	const { orc } = GAME_CONFIG;
	const levelBonus = wave - 1;

	const hpBonus = Math.round(levelBonus * orc.levelHpMultiplier * 100);
	const damageBonus = Math.round(levelBonus * orc.levelDamageMultiplier * 100);
	const speedBonus = Math.round(levelBonus * orc.levelSpeedMultiplier * 100);
	const flatSpeed = levelBonus * orc.speedPerWave;
	const dodgeBonus = levelBonus * orc.dodgePerWave;
	const armorBonus = levelBonus * orc.armorPerWave;

	return {
		hpBonus,
		damageBonus,
		speedBonus,
		flatSpeed,
		dodgeBonus,
		armorBonus,
	};
}

function WaveTooltipContent({ wave }: { wave: number }) {
	const scaling = getWaveScalingInfo(wave);

	if (wave === 1) {
		return <span className="text-neutral-400">Base enemy stats</span>;
	}

	return (
		<div className="flex flex-col gap-0.5 text-neutral-300">
			<span className="text-neutral-400 font-medium mb-1">Enemy Scaling</span>
			<span>HP: +{scaling.hpBonus}%</span>
			<span>Damage: +{scaling.damageBonus}%</span>
			<span>
				Speed: +{scaling.speedBonus}% +{scaling.flatSpeed}
			</span>
			<span>Dodge: +{scaling.dodgeBonus}%</span>
			<span>Armor: +{scaling.armorBonus}%</span>
		</div>
	);
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
				<Tooltip content={<WaveTooltipContent wave={wave} />} position="bottom">
					<Stat
						icon={<Swords className="w-4 h-4" />}
						label="Wave"
						value={wave}
					/>
				</Tooltip>
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
