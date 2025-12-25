import { Sparkles } from "lucide-react";
import type { Power } from "../../config/PowersConfig";
import { RANK_BORDER_COLORS, RANK_COLORS } from "../../config/PowersConfig";
import { Button } from "../primitives/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../primitives/Card";
import { Kbd } from "../primitives/Kbd";

type LootSelectionDialogProps = {
	powers: Power[];
	onSelect: (power: Power) => void;
	onCancel: () => void;
};

function PowerCard({
	power,
	onSelect,
	hotkeyIndex,
}: {
	power: Power;
	onSelect: () => void;
	hotkeyIndex: number;
}) {
	const rankColor = RANK_COLORS[power.rank];
	const borderColor = RANK_BORDER_COLORS[power.rank];

	return (
		<button
			type="button"
			onClick={onSelect}
			className="group cursor-pointer transition-transform hover:scale-105 hover:-translate-y-2"
		>
			<Card
				className={`w-40 h-56 flex flex-col items-center justify-center p-4 ${borderColor} relative`}
			>
				<Kbd className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px]">
					{hotkeyIndex}
				</Kbd>
				<div
					className={`w-12 h-12 rounded-full bg-neutral-800 border ${borderColor} flex items-center justify-center mb-4`}
				>
					<Sparkles className={`w-6 h-6 ${rankColor}`} />
				</div>
				<span
					className={`text-xs uppercase tracking-wider font-medium ${rankColor} mb-1`}
				>
					{power.rank}
				</span>
				<h3 className="text-white font-bold text-sm text-center mb-2">
					{power.name}
				</h3>
				<p className="text-neutral-500 text-xs text-center">
					{power.description}
				</p>
			</Card>
		</button>
	);
}

export function LootSelectionDialog({
	powers,
	onSelect,
	onCancel,
}: LootSelectionDialogProps) {
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
					{powers.map((power, index) => (
						<PowerCard
							key={power.id}
							power={power}
							onSelect={() => onSelect(power)}
							hotkeyIndex={index + 1}
						/>
					))}
				</div>

				<Button variant="secondary" onClick={onCancel}>
					<span>Cancel</span>
					<Kbd className="px-1.5 py-0.5 text-[10px]">Esc</Kbd>
				</Button>
			</div>
		</div>
	);
}
