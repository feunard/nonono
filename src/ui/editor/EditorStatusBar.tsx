import { TILES, type TileId } from "../../stores/editorStore";

type EditorStatusBarProps = {
	mapWidth: number;
	mapHeight: number;
	selectedTile: TileId;
	hoverPosition: { x: number; y: number } | null;
};

export function EditorStatusBar({
	mapWidth,
	mapHeight,
	selectedTile,
	hoverPosition,
}: EditorStatusBarProps) {
	const tile = TILES.find((t) => t.id === selectedTile) || TILES[0];

	return (
		<div className="flex items-center gap-6 px-4 py-2 bg-neutral-900 border-t border-neutral-700 text-xs text-neutral-400">
			{/* Map size */}
			<div className="flex items-center gap-2">
				<span className="text-neutral-500">Size:</span>
				<span className="text-white">
					{mapWidth}x{mapHeight}
				</span>
			</div>

			{/* Selected tile */}
			<div className="flex items-center gap-2">
				<span className="text-neutral-500">Tile:</span>
				<span className="text-white">
					{tile.name} ({tile.id})
				</span>
			</div>

			{/* Hover position */}
			<div className="flex items-center gap-2">
				<span className="text-neutral-500">Pos:</span>
				<span className="text-white font-mono">
					{hoverPosition ? `(${hoverPosition.x}, ${hoverPosition.y})` : "---"}
				</span>
			</div>
		</div>
	);
}
