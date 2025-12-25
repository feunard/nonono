import {
	Clock,
	Download,
	RotateCcw,
	Skull,
	Swords,
	Trophy,
} from "lucide-react";
import { LogSystem } from "../../systems/LogSystem";
import { Button } from "../primitives/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../primitives/Card";
import { IconBox } from "../primitives/IconBox";
import { Kbd } from "../primitives/Kbd";
import { Overlay } from "../primitives/Overlay";
import { Stat, StatDivider } from "../primitives/Stat";

type GameOverDialogProps = {
	survivalTime: number;
	kills: number;
	wave: number;
	onRestart: () => void;
};

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function GameOverDialog({
	survivalTime,
	kills,
	wave,
	onRestart,
}: GameOverDialogProps) {
	return (
		<Overlay>
			<Card className="w-[340px]">
				<CardHeader>
					<IconBox size="lg" className="mb-4">
						<Skull className="w-8 h-8" />
					</IconBox>
					<CardTitle>GAME OVER</CardTitle>
					<CardDescription className="mt-1">
						Your adventure has ended
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex items-center gap-2">
						<Stat
							icon={<Clock className="w-4 h-4" />}
							label="Survived"
							value={formatTime(survivalTime)}
							direction="vertical"
							className="flex-1"
						/>
						<StatDivider className="h-14" />
						<Stat
							icon={<Trophy className="w-4 h-4" />}
							label="Kills"
							value={kills}
							direction="vertical"
							className="flex-1"
						/>
						<StatDivider className="h-14" />
						<Stat
							icon={<Swords className="w-4 h-4" />}
							label="Wave"
							value={wave}
							direction="vertical"
							className="flex-1"
						/>
					</div>
				</CardContent>

				<CardFooter className="flex-col gap-2">
					<Button onClick={onRestart} className="w-full justify-between">
						<span className="flex items-center gap-2">
							<RotateCcw className="w-4 h-4" />
							Play Again
						</span>
						<Kbd>Enter</Kbd>
					</Button>
					<Button
						onClick={() => LogSystem.downloadLogs()}
						variant="secondary"
						className="w-full justify-center"
					>
						<Download className="w-4 h-4 mr-2" />
						Export Logs
					</Button>
				</CardFooter>
			</Card>
		</Overlay>
	);
}
