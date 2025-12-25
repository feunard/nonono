import { Package } from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { Card } from "../primitives/Card";
import { Kbd } from "../primitives/Kbd";

type BagCardProps = {
	onOpen: () => void;
};

export function BagCard({ onOpen }: BagCardProps) {
	const bagCount = useGameStore((state) => state.bagCount);

	// Don't render if no bags
	if (bagCount === 0) {
		return null;
	}

	return (
		<Card className="p-2 w-fit">
			<button
				type="button"
				onClick={onOpen}
				className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
			>
				<div className="relative">
					<Package className="w-6 h-6 text-white" />
					{/* Count badge */}
					<div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
						{bagCount > 9 ? "9+" : bagCount}
					</div>
				</div>
				<Kbd className="px-1.5 py-0.5 text-[10px]">E</Kbd>
			</button>
		</Card>
	);
}
