import { DoorOpen, Pause, Play } from "lucide-react";
import { Button } from "../../shared/primitives/Button";
import { Card } from "../../shared/primitives/Card";
import { IconBox } from "../../shared/primitives/IconBox";
import { Kbd } from "../../shared/primitives/Kbd";
import { Overlay } from "../../shared/primitives/Overlay";

type PauseDialogProps = {
	onResume: () => void;
	onExit: () => void;
};

export function PauseDialog({ onResume, onExit }: PauseDialogProps) {
	return (
		<Overlay onClick={onResume}>
			<Card className="p-8" onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-center mb-4">
					<IconBox size="lg">
						<Pause className="w-8 h-8" />
					</IconBox>
				</div>
				<h2 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">
					PAUSED
				</h2>
				<p className="text-neutral-400 text-sm text-center mb-6">Game paused</p>
				<div className="flex flex-col gap-2">
					<Button onClick={onResume} className="w-full justify-between">
						<span className="flex items-center gap-2">
							<Play className="w-4 h-4" />
							Resume
						</span>
						<Kbd>Space</Kbd>
					</Button>
					<Button onClick={onExit} variant="ghost" className="w-full">
						<span className="flex items-center gap-2">
							<DoorOpen className="w-4 h-4" />
							Abandon Game
						</span>
					</Button>
				</div>
			</Card>
		</Overlay>
	);
}
