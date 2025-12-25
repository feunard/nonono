import { Lock, Sparkles } from "lucide-react";
import type { Power } from "../../config/PowersConfig";
import {
	checkPrerequisites,
	getStatDisplayName,
	type PrerequisiteCheckResult,
	RANK_BORDER_COLORS,
	RANK_COLORS,
} from "../../config/PowersConfig";
import { useGameStore } from "../../stores/gameStore";
import { Button } from "../primitives/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../primitives/Card";
import { Kbd } from "../primitives/Kbd";
import { Tooltip } from "../primitives/Tooltip";

type LootSelectionDialogProps = {
	powers: Power[];
	onSelect: (power: Power) => void;
	onCancel: () => void;
};

function LockedTooltipContent({
	prereqResult,
}: {
	prereqResult: PrerequisiteCheckResult;
}) {
	return (
		<div className="text-xs">
			<div className="font-bold text-neutral-300 mb-1">Requires:</div>
			{prereqResult.missingStats.map((missing) => (
				<div key={missing.stat} className="text-neutral-400">
					{missing.required}+ {getStatDisplayName(missing.stat)}{" "}
					<span className="text-neutral-500">(current: {missing.current})</span>
				</div>
			))}
			{prereqResult.missingPowers.map((missing) => (
				<div key={missing.powerId} className="text-neutral-400">
					"{missing.powerName}"
				</div>
			))}
		</div>
	);
}

function PowerCard({
	power,
	onSelect,
	hotkeyIndex,
	isLocked,
	prereqResult,
}: {
	power: Power;
	onSelect: () => void;
	hotkeyIndex: number;
	isLocked: boolean;
	prereqResult: PrerequisiteCheckResult;
}) {
	const rankColor = RANK_COLORS[power.rank];
	const borderColor = RANK_BORDER_COLORS[power.rank];

	const cardContent = (
		<Card
			className={`w-40 h-56 flex flex-col items-center justify-center p-4 ${isLocked ? "border-neutral-700" : borderColor} relative ${isLocked ? "opacity-50" : ""}`}
		>
			<Kbd className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px]">
				{hotkeyIndex}
			</Kbd>
			{isLocked && (
				<div className="absolute top-2 left-2">
					<Lock className="w-4 h-4 text-neutral-500" />
				</div>
			)}
			<div
				className={`w-12 h-12 rounded-full bg-neutral-800 border ${isLocked ? "border-neutral-700" : borderColor} flex items-center justify-center mb-4`}
			>
				<Sparkles
					className={`w-6 h-6 ${isLocked ? "text-neutral-600" : rankColor}`}
				/>
			</div>
			<span
				className={`text-xs uppercase tracking-wider font-medium ${isLocked ? "text-neutral-600" : rankColor} mb-1`}
			>
				{power.rank}
			</span>
			<h3
				className={`font-bold text-sm text-center mb-2 ${isLocked ? "text-neutral-500" : "text-white"}`}
			>
				{power.name}
			</h3>
			<p className="text-neutral-500 text-xs text-center">
				{power.description}
			</p>
		</Card>
	);

	if (isLocked) {
		return (
			<Tooltip content={<LockedTooltipContent prereqResult={prereqResult} />}>
				<div className="cursor-not-allowed">{cardContent}</div>
			</Tooltip>
		);
	}

	return (
		<button
			type="button"
			onClick={onSelect}
			className="group cursor-pointer transition-transform hover:scale-105 hover:-translate-y-2"
		>
			{cardContent}
		</button>
	);
}

export function LootSelectionDialog({
	powers,
	onSelect,
	onCancel,
}: LootSelectionDialogProps) {
	const bonusStats = useGameStore((state) => state.bonusStats);
	const collectedPowers = useGameStore((state) => state.collectedPowers);

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-auto">
			<div className="flex flex-col items-center gap-8">
				<CardHeader className="p-0">
					<CardTitle className="text-2xl">Choose Your Reward</CardTitle>
					<CardDescription className="mt-2">
						Select one of the following powers
					</CardDescription>
				</CardHeader>

				<div className="flex gap-6">
					{powers.map((power, index) => {
						const prereqResult = checkPrerequisites(
							power,
							bonusStats,
							collectedPowers,
						);
						return (
							<PowerCard
								key={power.id}
								power={power}
								onSelect={() => onSelect(power)}
								hotkeyIndex={index + 1}
								isLocked={!prereqResult.met}
								prereqResult={prereqResult}
							/>
						);
					})}
				</div>

				<Button variant="secondary" onClick={onCancel}>
					<span>Cancel</span>
					<Kbd className="px-1.5 py-0.5 text-[10px]">Esc</Kbd>
				</Button>
			</div>
		</div>
	);
}
