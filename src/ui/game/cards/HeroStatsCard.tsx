import {
	Clover,
	Crosshair,
	Footprints,
	Heart,
	Shield,
	Sparkles,
	Sword,
	Wind,
	Zap,
} from "lucide-react";
import { GAME_CONFIG } from "../../../config/GameConfig";
import { useHeroStore } from "../../../stores/heroStore";
import { calculateAgilityDodge } from "../../../systems/calculations";
import { Card } from "../../shared/primitives/Card";

type StatRowProps = {
	icon: React.ReactNode;
	label: string;
	base: number;
	bonus: number;
};

function StatRow({ icon, label, base, bonus }: StatRowProps) {
	return (
		<div className="flex items-center gap-2 text-xs">
			<span className="text-neutral-400">{icon}</span>
			<span className="text-neutral-400">{label}</span>
			<span className="text-white font-bold tabular-nums ml-auto">
				{base}
				{bonus > 0 && <span className="text-green-400"> +{bonus}</span>}
			</span>
		</div>
	);
}

export function HeroStatsCard() {
	const { hero } = GAME_CONFIG;
	const bonusStats = useHeroStore((state) => state.bonusStats);

	// Calculate total agility and agility-based dodge bonus
	const totalAgility = hero.agility + bonusStats.agility;
	const agilityDodge = calculateAgilityDodge(totalAgility);
	const totalDodgeBonus = bonusStats.dodge + agilityDodge;

	return (
		<Card className="px-3 py-2 w-fit self-end">
			<div className="flex flex-col gap-1">
				<StatRow
					icon={<Heart className="w-3 h-3" />}
					label="Health"
					base={hero.health}
					bonus={bonusStats.health}
				/>
				<StatRow
					icon={<Footprints className="w-3 h-3" />}
					label="Speed"
					base={hero.moveSpeed}
					bonus={bonusStats.moveSpeed}
				/>
				<StatRow
					icon={<Sparkles className="w-3 h-3" />}
					label="Agility"
					base={hero.agility}
					bonus={bonusStats.agility}
				/>
				<StatRow
					icon={<Sword className="w-3 h-3" />}
					label="Strength"
					base={hero.strength}
					bonus={bonusStats.strength}
				/>
				<StatRow
					icon={<Zap className="w-3 h-3" />}
					label="Critical"
					base={hero.critical}
					bonus={bonusStats.critical}
				/>
				<StatRow
					icon={<Clover className="w-3 h-3" />}
					label="Luck"
					base={hero.luck}
					bonus={bonusStats.luck}
				/>
				<StatRow
					icon={<Crosshair className="w-3 h-3" />}
					label="Range"
					base={hero.bow.range}
					bonus={bonusStats.bowRange}
				/>
				<StatRow
					icon={<Shield className="w-3 h-3" />}
					label="Armor"
					base={hero.armor}
					bonus={bonusStats.armor}
				/>
				<StatRow
					icon={<Wind className="w-3 h-3" />}
					label="Dodge"
					base={hero.dodge}
					bonus={totalDodgeBonus}
				/>
			</div>
		</Card>
	);
}
