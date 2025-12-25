import { Pause, Play } from "lucide-react";
import { useGameStore } from "../../stores/gameStore";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { Kbd } from "../primitives/Kbd";

type MenuBarCardProps = {
	onPause: () => void;
};

export function MenuBarCard({ onPause }: MenuBarCardProps) {
	const { isPaused } = useGameStore();

	return (
		<Card className="p-1.5">
			<Button
				onClick={onPause}
				variant="secondary"
				size="sm"
				className="justify-between gap-4"
			>
				<span className="flex items-center gap-1.5">
					{isPaused ? (
						<Play className="w-3 h-3" />
					) : (
						<Pause className="w-3 h-3" />
					)}
					{isPaused ? "Resume" : "Pause"}
				</span>
				<Kbd className="text-[9px] px-1 py-0.5">Space</Kbd>
			</Button>
		</Card>
	);
}
