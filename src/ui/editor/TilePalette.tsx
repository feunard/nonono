import { cn } from "../utils";
import { TILES, type TileId } from "./useMapEditor";

type TilePaletteProps = {
	selectedTile: TileId;
	onSelectTile: (tileId: TileId) => void;
};

export function TilePalette({ selectedTile, onSelectTile }: TilePaletteProps) {
	return (
		<div className="flex flex-col gap-3 p-4 bg-neutral-900 border-r border-neutral-700">
			<h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
				Tiles
			</h3>
			<div className="flex flex-col gap-2">
				{TILES.map((tile) => (
					<button
						type="button"
						key={tile.id}
						onClick={() => onSelectTile(tile.id)}
						className={cn(
							"flex items-center gap-3 p-2 rounded cursor-pointer transition-all",
							"hover:bg-neutral-800",
							selectedTile === tile.id
								? "bg-neutral-700 ring-2 ring-white"
								: "bg-neutral-850",
						)}
					>
						{/* Tile preview */}
						<div
							className={cn(
								"w-8 h-8 rounded border",
								tile.id === 0
									? "bg-white border-neutral-400"
									: "bg-black border-neutral-600",
							)}
						/>
						{/* Tile info */}
						<div className="flex flex-col items-start">
							<span className="text-sm font-medium text-white">
								{tile.name}
							</span>
							<span className="text-xs text-neutral-500">ID: {tile.id}</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
