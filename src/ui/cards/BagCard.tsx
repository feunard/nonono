import { Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../../config/GameConfig";
import { useGameStore } from "../../stores/gameStore";
import { Card } from "../primitives/Card";
import { Kbd } from "../primitives/Kbd";

type BagCardProps = {
	onOpen: () => void;
};

export function BagCard({ onOpen }: BagCardProps) {
	const bagCount = useGameStore((state) => state.bagCount);
	const prevBagCount = useRef(0);
	const [animationClass, setAnimationClass] = useState("");

	// Detect bag count changes for animations
	useEffect(() => {
		const prev = prevBagCount.current;
		prevBagCount.current = bagCount;

		// First item pickup: subtle pop animation
		if (prev === 0 && bagCount === 1) {
			setAnimationClass("animate-bag-pop");
			const timer = setTimeout(() => setAnimationClass(""), 300);
			return () => clearTimeout(timer);
		}

		// Full bag: celebratory animation
		if (
			prev < GAME_CONFIG.loot.maxBagsInventory &&
			bagCount === GAME_CONFIG.loot.maxBagsInventory
		) {
			setAnimationClass("animate-bag-celebrate");
			const timer = setTimeout(() => setAnimationClass(""), 600);
			return () => clearTimeout(timer);
		}
	}, [bagCount]);

	// Don't render if no bags
	if (bagCount === 0) {
		return null;
	}

	const isFull = bagCount >= GAME_CONFIG.loot.maxBagsInventory;

	return (
		<Card className={`p-2 w-fit ${animationClass}`}>
			<button
				type="button"
				onClick={onOpen}
				className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
			>
				<div className="relative">
					<Package className="w-6 h-6 text-white" />
					{/* Count badge */}
					<div
						className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
							isFull
								? "bg-white text-black animate-pulse"
								: "bg-white text-black"
						}`}
					>
						{bagCount > 9 ? "9+" : bagCount}
					</div>
				</div>
				<Kbd className="px-1.5 py-0.5 text-[10px]">E</Kbd>
			</button>
		</Card>
	);
}
