import { Lock, X } from "lucide-react";
import { useState } from "react";
import type { Power } from "../../../../config/PowersConfig";
import {
	checkPrerequisites,
	countPowerStacks,
	getStatDisplayName,
	POWERS,
	RANK_COLORS,
} from "../../../../config/PowersConfig";
import { type BonusStats, useHeroStore } from "../../../../stores/heroStore";
import { useInventoryStore } from "../../../../stores/inventoryStore";
import { Button } from "../../../shared/primitives/Button";
import { Card, CardHeader, CardTitle } from "../../../shared/primitives/Card";
import { Kbd } from "../../../shared/primitives/Kbd";
import { Overlay } from "../../../shared/primitives/Overlay";
import { Tooltip } from "../../../shared/primitives/Tooltip";

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
	bonusStats,
	collectedPowers,
	onSelect,
}: {
	power: Power;
	currentStacks: number;
	bonusStats: BonusStats;
	collectedPowers: Power[];
	onSelect: () => void;
}) {
	const rankColor = RANK_COLORS[power.rank];
	const isMaxed = currentStacks >= power.maxStack;
	const prereqResult = checkPrerequisites(power, bonusStats, collectedPowers);
	const isLocked = !prereqResult.met;
	const isDisabled = isMaxed || isLocked;

	// Build tooltip content
	const tooltipContent = (
		<>
			<div className="font-bold text-white">{power.name}</div>
			<div className="text-neutral-400">{power.description}</div>
			{isLocked && prereqResult.missingStats.length > 0 && (
				<div className="text-neutral-500 mt-1 text-xs">
					<span className="text-neutral-400">Requires: </span>
					{prereqResult.missingStats.map((m) => (
						<span key={m.stat}>
							{m.required}+ {getStatDisplayName(m.stat)} ({m.current})
						</span>
					))}
				</div>
			)}
			{isLocked && prereqResult.missingPowers.length > 0 && (
				<div className="text-neutral-500 mt-1 text-xs">
					<span className="text-neutral-400">Requires: </span>
					{prereqResult.missingPowers.map((m) => `"${m.powerName}"`).join(", ")}
				</div>
			)}
		</>
	);

	// Determine status indicator
	let statusIndicator: React.ReactNode;
	if (isLocked) {
		statusIndicator = <Lock className="w-3 h-3 text-neutral-600" />;
	} else if (isMaxed) {
		statusIndicator = (
			<span className="text-neutral-500 text-[10px] font-bold">MAX</span>
		);
	} else {
		statusIndicator = (
			<span className="text-neutral-500 text-[10px]">
				{currentStacks}/{power.maxStack}
			</span>
		);
	}

	return (
		<Tooltip content={tooltipContent}>
			<button
				type="button"
				onClick={onSelect}
				disabled={isDisabled}
				className={`flex items-center gap-2 px-2 py-1 rounded transition-colors text-left w-full ${
					isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-neutral-800"
				}`}
			>
				<span
					className={`${rankColor} text-[10px] font-bold w-3 shrink-0`}
					title={power.rank}
				>
					{RANK_SHORT[power.rank]}
				</span>
				<span
					className={`text-xs truncate flex-1 ${isDisabled ? "text-neutral-500" : "text-white"}`}
				>
					{power.name}
				</span>
				<span className="shrink-0">{statusIndicator}</span>
			</button>
		</Tooltip>
	);
}

export function DebugPowerDialog({ onSelect, onClose }: DebugPowerDialogProps) {
	const [activeTab, setActiveTab] = useState<TabId>("core");
	const collectedPowers = useInventoryStore((state) => state.collectedPowers);
	const bonusStats = useHeroStore((state) => state.bonusStats);

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
											bonusStats={bonusStats}
											collectedPowers={collectedPowers}
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
