import { Search } from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { Card } from "../primitives/Card";

// Icon sizes for each zoom level (smallest = zoomed out, largest = zoomed in)
const ICON_SIZES = [10, 12, 14];

export function ZoomControlCard() {
	const { zoomLevel, setZoomLevel } = useGameStore();

	return (
		<Card className="p-1.5">
			<div className="flex flex-col gap-0.5">
				{ICON_SIZES.map((size, index) => (
					<button
						// biome-ignore lint/suspicious/noArrayIndexKey: static zoom level buttons
						key={index}
						type="button"
						onClick={() => setZoomLevel(index)}
						className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
							zoomLevel === index
								? "bg-neutral-600 text-white"
								: "bg-transparent text-neutral-500 hover:bg-neutral-700 hover:text-white"
						}`}
					>
						<Search style={{ width: size, height: size }} />
					</button>
				))}
			</div>
		</Card>
	);
}
