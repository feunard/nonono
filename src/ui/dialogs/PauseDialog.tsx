import { Pause, Play } from "lucide-react";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { IconBox } from "../primitives/IconBox";
import { Kbd } from "../primitives/Kbd";
import { Overlay } from "../primitives/Overlay";

type PauseDialogProps = {
	onResume: () => void;
};

export function PauseDialog({ onResume }: PauseDialogProps) {
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
				<Button onClick={onResume} className="w-full justify-between">
					<span className="flex items-center gap-2">
						<Play className="w-4 h-4" />
						Resume
					</span>
					<Kbd>Space</Kbd>
				</Button>
			</Card>
		</Overlay>
	);
}
