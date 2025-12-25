import {
	Axe,
	Bomb,
	Clover,
	CopyPlus,
	Crosshair,
	Droplets,
	Flame,
	Footprints,
	Heart,
	HeartPulse,
	IterationCcw,
	Navigation,
	Shield,
	ShieldAlert,
	ShieldHalf,
	Skull,
	Slice,
	Sparkles,
	Sword,
	Swords,
	Target,
	Timer,
	Wind,
	Zap,
} from "lucide-react";
import { useMemo } from "react";
import {
	type BonusStat,
	type Power,
	RANK_RING_COLORS,
} from "../../config/PowersConfig";
import { useInventoryStore } from "../../stores/inventoryStore";
import { Card } from "../primitives/Card";
import { Tooltip } from "../primitives/Tooltip";

// Map stat types to lucide-react icon components
const STAT_ICONS: Record<
	BonusStat,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	strength: Sword,
	agility: Zap,
	critical: Sparkles,
	luck: Clover,
	health: Heart,
	moveSpeed: Footprints,
	bowRange: Target,
	// Offensive powers
	critMultiplier: Flame,
	piercing: Shield,
	accuracy: Crosshair,
	damageMultiplier: Swords,
	// Defensive powers
	dodge: Wind,
	armor: ShieldHalf,
	hpRegen: HeartPulse,
	// Arrow powers
	arrowCount: CopyPlus,
	arrowPierce: Crosshair,
	arrowBounce: IterationCcw,
	// On-Hit powers
	lifesteal: Droplets,
	// Sword powers
	swordCleave: Axe,
	swordAttackSpeed: Timer,
	riposteChance: ShieldAlert,
	executeThreshold: Skull,
	vorpalChance: Slice,
	// Advanced arrow powers
	arrowHoming: Navigation,
	arrowExplosive: Bomb,
};

type GroupedPower = {
	power: Power;
	count: number;
};

function groupPowers(powers: Power[]): GroupedPower[] {
	const grouped = new Map<string, GroupedPower>();

	for (const power of powers) {
		const existing = grouped.get(power.id);
		if (existing) {
			existing.count++;
		} else {
			grouped.set(power.id, { power, count: 1 });
		}
	}

	return Array.from(grouped.values());
}

// Hexagon clip-path for power orbs
const hexagonClipPath =
	"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function PowerOrb({ power, count }: GroupedPower) {
	const IconComponent = STAT_ICONS[power.effect.stat];
	const ringColor = RANK_RING_COLORS[power.rank];

	return (
		<Tooltip
			content={
				<>
					<div className="font-bold text-white">{power.name}</div>
					<div className="text-neutral-400">{power.description}</div>
					{count > 1 && (
						<div className="text-neutral-500 mt-0.5">×{count} stacked</div>
					)}
				</>
			}
		>
			<div className="relative">
				{/* Power hexagon with ring effect */}
				<div
					className={`w-8 h-9 ${ringColor.replace("ring-", "bg-")} flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
					style={{ clipPath: hexagonClipPath }}
				>
					{/* Inner hexagon */}
					<div
						className="w-7 h-8 bg-neutral-800 flex items-center justify-center"
						style={{ clipPath: hexagonClipPath }}
					>
						<IconComponent size={14} className="text-white" />
					</div>
				</div>
				{/* Count badge */}
				{count > 1 && (
					<div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow">
						{count > 9 ? "9+" : count}
					</div>
				)}
			</div>
		</Tooltip>
	);
}

export function PowersCard() {
	const collectedPowers = useInventoryStore((state) => state.collectedPowers);
	// Memoize grouped powers to avoid O(n) computation on every render
	const groupedPowers = useMemo(
		() => groupPowers(collectedPowers),
		[collectedPowers],
	);

	if (groupedPowers.length === 0) {
		return null; // Don't show card if no powers collected
	}

	return (
		<Card className="p-2 w-fit">
			<div className="flex flex-wrap gap-1.5 max-w-[180px]">
				{groupedPowers.map((gp) => (
					<PowerOrb key={gp.power.id} power={gp.power} count={gp.count} />
				))}
			</div>
		</Card>
	);
}
