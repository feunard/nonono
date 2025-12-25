import { useUIStore } from "../../../stores/uiStore";
import { Card, Kbd } from "../../primitives";

export function DebugHotkeysCard() {
	const isSpawnPaused = useUIStore((state) => state.isSpawnPaused);

	return (
		<Card className="p-2 text-xs">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					<Kbd>I</Kbd>
					<span className="text-neutral-400">Power List</span>
				</div>
				<div className="flex items-center gap-2">
					<Kbd>U</Kbd>
					<span className="text-neutral-400">Kill Orcs</span>
					{isSpawnPaused && (
						<span className="px-1.5 py-0.5 bg-white text-black text-[10px] font-bold rounded">
							PAUSED
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Kbd>P</Kbd>
					<span className="text-neutral-400">Spawn Loot</span>
				</div>
				<div className="flex items-center gap-2">
					<Kbd>X</Kbd>
					<span className="text-neutral-400">Toggle Debug</span>
				</div>
			</div>
		</Card>
	);
}
