import { X } from "lucide-react";
import { useState } from "react";
import type { Power } from "../../../config/PowersConfig";
import {
	countPowerStacks,
	POWERS,
	RANK_COLORS,
} from "../../../config/PowersConfig";
import { useGameStore } from "../../../stores/gameStore";
import { Button } from "../../primitives/Button";
import { Card, CardHeader, CardTitle } from "../../primitives/Card";
import { Kbd } from "../../primitives/Kbd";
import { Overlay } from "../../primitives/Overlay";
import { Tooltip } from "../../primitives/Tooltip";

type DebugPowerDialogProps = {
	onSelect: (power: Power) => void;
	onClose: () => void;
};

// Tab categories
type TabId = "core" | "offensive" | "defensive" | "arrow" | "sword";

const TABS: { id: TabId; label: string }[] = [
	{ id: "core", label: "Core" },
	{ id: "offensive", label: "Offensive" },
	{ id: "defensive", label: "Defensive" },
	{ id: "arrow", label: "Arrow" },
	{ id: "sword", label: "Sword" },
];

// Stats grouped by tab
const STATS_BY_TAB: Record<TabId, string[]> = {
	core: [
		"strength",
		"agility",
		"critical",
		"luck",
		"health",
		"moveSpeed",
		"bowRange",
	],
	offensive: ["critMultiplier", "piercing", "accuracy", "damageMultiplier"],
	defensive: ["dodge", "armor", "hpRegen", "lifesteal"],
	arrow: [
		"arrowCount",
		"arrowPierce",
		"arrowBounce",
		"arrowHoming",
		"arrowExplosive",
	],
	sword: [
		"swordCleave",
		"swordAttackSpeed",
		"riposteChance",
		"executeThreshold",
		"vorpalChance",
	],
};

const STAT_LABELS: Record<string, string> = {
	strength: "STR",
	agility: "AGI",
	critical: "CRT",
	luck: "LCK",
	health: "HP",
	moveSpeed: "SPD",
	bowRange: "RNG",
	// Offensive powers
	critMultiplier: "CRIT DMG",
	piercing: "PIERCING",
	accuracy: "ACCURACY",
	damageMultiplier: "DMG MULT",
	// Defensive powers
	dodge: "DODGE",
	armor: "ARMOR",
	hpRegen: "HP REGEN",
	lifesteal: "LIFESTEAL",
	// Arrow powers
	arrowCount: "MULTI-SHOT",
	arrowPierce: "PIERCE",
	arrowBounce: "RICOCHET",
	arrowHoming: "HOMING",
	arrowExplosive: "EXPLOSIVE",
	// Sword powers
	swordCleave: "CLEAVE",
	swordAttackSpeed: "BLADE DANCE",
	riposteChance: "RIPOSTE",
	executeThreshold: "EXECUTE",
	vorpalChance: "VORPAL",
};

// Short rank labels
const RANK_SHORT: Record<string, string> = {
	common: "C",
	uncommon: "U",
	rare: "R",
	epic: "E",
	legendary: "L",
};

function PowerRow({
	power,
	currentStacks,
	onSelect,
}: {
	power: Power;
	currentStacks: number;
	onSelect: () => void;
}) {
	const rankColor = RANK_COLORS[power.rank];
	const isMaxed = currentStacks >= power.maxStack;
	const remaining = power.maxStack - currentStacks;

	return (
		<Tooltip
			content={
				<>
					<div className="font-bold text-white">{power.name}</div>
					<div className="text-neutral-400">{power.description}</div>
				</>
			}
		>
			<button
				type="button"
				onClick={onSelect}
				disabled={isMaxed}
				className={`flex items-center gap-2 px-2 py-1 rounded transition-colors text-left w-full ${
					isMaxed ? "opacity-40 cursor-not-allowed" : "hover:bg-neutral-800"
				}`}
			>
				<span
					className={`${rankColor} text-[10px] font-bold w-3 shrink-0`}
					title={power.rank}
				>
					{RANK_SHORT[power.rank]}
				</span>
				<span
					className={`text-xs truncate ${isMaxed ? "text-neutral-500" : "text-white"}`}
				>
					{power.name}
				</span>
				<span className="text-neutral-600 text-[10px] shrink-0">
					{currentStacks}/{power.maxStack}
				</span>
				<span className="text-neutral-500 text-xs ml-auto shrink-0">
					{isMaxed ? "MAX" : `+${remaining}`}
				</span>
			</button>
		</Tooltip>
	);
}

export function DebugPowerDialog({ onSelect, onClose }: DebugPowerDialogProps) {
	const [activeTab, setActiveTab] = useState<TabId>("core");
	const collectedPowers = useGameStore((state) => state.collectedPowers);

	// Get stats for current tab and group powers
	const currentStats = STATS_BY_TAB[activeTab];
	const powersByStat = currentStats.map((stat) => ({
		stat,
		label: STAT_LABELS[stat],
		powers: POWERS.filter((p) => p.effect.stat === stat),
	}));

	return (
		<Overlay onClick={onClose}>
			<Card
				className="w-[700px] max-h-[80vh] overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<CardHeader className="flex flex-row items-center justify-between border-b border-neutral-700 pb-2 pt-2 px-3">
					<div className="flex items-center gap-3">
						<CardTitle className="text-sm">Debug: Powers</CardTitle>
						<span className="text-neutral-500 text-xs">
							Click to add (cheat)
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="w-4 h-4" />
						</Button>
						<Kbd className="px-1.5 py-0.5 text-[10px]">Esc</Kbd>
					</div>
				</CardHeader>

				{/* Tab Bar */}
				<div className="flex border-b border-neutral-700 px-2">
					{TABS.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={`px-3 py-2 text-xs font-medium transition-colors relative ${
								activeTab === tab.id
									? "text-white"
									: "text-neutral-500 hover:text-neutral-300"
							}`}
						>
							{tab.label}
							{activeTab === tab.id && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
							)}
						</button>
					))}
				</div>

				<div className="overflow-y-auto p-2 h-[500px] scrollbar-hidden">
					<div className="grid grid-cols-2 gap-x-4 gap-y-2">
						{powersByStat.map(({ stat, label, powers }) => (
							<div key={stat}>
								<div className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-neutral-800 rounded mb-1">
									{label}
								</div>
								<div>
									{powers.map((power) => (
										<PowerRow
											key={power.id}
											power={power}
											currentStacks={countPowerStacks(
												power.id,
												collectedPowers,
											)}
											onSelect={() => onSelect(power)}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</Card>
		</Overlay>
	);
}
