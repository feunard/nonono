import { Button } from "../primitives/Button";
import { Kbd } from "../primitives/Kbd";

type LaunchScreenProps = {
	onStartGame: () => void;
};

export function LaunchScreen({ onStartGame }: LaunchScreenProps) {
	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
			<div className="flex flex-col items-center gap-12">
				{/* Game title */}
				<div className="flex flex-col items-center gap-2">
					<h1 className="text-6xl font-bold text-black tracking-tight">
						SURVIVOR
					</h1>
					<p className="text-neutral-500 text-sm tracking-wider uppercase">
						A 2D Survival Game
					</p>
				</div>

				{/* Start button */}
				<Button size="lg" onClick={onStartGame} className="min-w-48">
					<span>Start Game</span>
					<Kbd className="px-1.5 py-0.5 text-[10px]">Enter</Kbd>
				</Button>
			</div>
		</div>
	);
}
