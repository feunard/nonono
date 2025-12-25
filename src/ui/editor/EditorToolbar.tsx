import { Button } from "../primitives/Button";
import { cn } from "../utils";
import { MAP_SIZES, type MapSize } from "./useMapEditor";

type EditorToolbarProps = {
	showGrid: boolean;
	mapSize: MapSize;
	zoom: number;
	onToggleGrid: () => void;
	onClearMap: () => void;
	onSetMapSize: (size: MapSize) => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onBack: () => void;
};

export function EditorToolbar({
	showGrid,
	mapSize,
	zoom,
	onToggleGrid,
	onClearMap,
	onSetMapSize,
	onZoomIn,
	onZoomOut,
	onBack,
}: EditorToolbarProps) {
	return (
		<div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-700">
			{/* Left: Title and back button */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={onBack}>
					Back
				</Button>
				<h1 className="text-lg font-semibold text-white">Map Editor</h1>
			</div>

			{/* Center: Map size selector */}
			<div className="flex items-center gap-2">
				<span className="text-xs text-neutral-400">Size:</span>
				<div className="flex gap-1">
					{MAP_SIZES.map((size) => (
						<button
							type="button"
							key={size}
							onClick={() => onSetMapSize(size)}
							className={cn(
								"px-2 py-1 text-xs rounded cursor-pointer transition-colors",
								mapSize === size
									? "bg-white text-black font-semibold"
									: "bg-neutral-700 text-neutral-300 hover:bg-neutral-600",
							)}
						>
							{size}x{size}
						</button>
					))}
				</div>
			</div>

			{/* Right: Tools */}
			<div className="flex items-center gap-2">
				{/* Zoom controls */}
				<div className="flex items-center gap-1 mr-2">
					<Button variant="ghost" size="sm" onClick={onZoomOut}>
						-
					</Button>
					<span className="text-xs text-neutral-400 w-12 text-center">
						{Math.round(zoom * 100)}%
					</span>
					<Button variant="ghost" size="sm" onClick={onZoomIn}>
						+
					</Button>
				</div>

				{/* Grid toggle */}
				<Button
					variant={showGrid ? "secondary" : "ghost"}
					size="sm"
					onClick={onToggleGrid}
				>
					Grid
				</Button>

				{/* Clear button */}
				<Button variant="ghost" size="sm" onClick={onClearMap}>
					Clear
				</Button>
			</div>
		</div>
	);
}
