import { useState } from "react";
import { TILES, type TileId } from "../../stores/editorStore";
import { Input } from "../primitives/Input";
import { cn } from "../utils";

type TilePaletteProps = {
	selectedTile: TileId;
	onSelectTile: (tileId: TileId) => void;
};

export function TilePalette({ selectedTile, onSelectTile }: TilePaletteProps) {
	const [search, setSearch] = useState("");
	const [hoveredTile, setHoveredTile] = useState<number | null>(null);

	// Filter tiles by search
	const filteredTiles = TILES.filter(
		(tile) =>
			tile.name.toLowerCase().includes(search.toLowerCase()) ||
			tile.id.toString().includes(search),
	);

	const selectedTileData = TILES.find((t) => t.id === selectedTile);

	return (
		<div className="flex flex-col w-48 bg-neutral-900 border-r border-neutral-700">
			{/* Header with selected tile info */}
			<div className="p-3 border-b border-neutral-700">
				<div className="flex items-center gap-2 mb-2">
					<div
						className={cn(
							"w-6 h-6 rounded border flex-shrink-0",
							selectedTile === 0
								? "bg-white border-neutral-400"
								: "bg-black border-neutral-600",
						)}
					/>
					<div className="flex flex-col min-w-0">
						<span className="text-xs font-medium text-white truncate">
							{selectedTileData?.name}
						</span>
						<span className="text-[10px] text-neutral-500">
							ID: {selectedTile}
						</span>
					</div>
				</div>

				{/* Search input */}
				<Input
					type="text"
					placeholder="Search tiles..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					variant="minimal"
				/>
			</div>

			{/* Tile grid - scrollable */}
			<div className="flex-1 overflow-y-auto p-2">
				<div className="grid grid-cols-4 gap-1">
					{filteredTiles.map((tile) => (
						<button
							type="button"
							key={tile.id}
							onClick={() => onSelectTile(tile.id as TileId)}
							onMouseEnter={() => setHoveredTile(tile.id)}
							onMouseLeave={() => setHoveredTile(null)}
							className={cn(
								"relative aspect-square rounded cursor-pointer transition-all",
								"hover:ring-2 hover:ring-neutral-500",
								selectedTile === tile.id
									? "ring-2 ring-white"
									: "ring-1 ring-neutral-700",
							)}
							title={`${tile.name} (ID: ${tile.id})`}
						>
							{/* Tile preview */}
							<div
								className={cn(
									"w-full h-full rounded",
									tile.id === 0 ? "bg-white" : "bg-black",
								)}
							/>
						</button>
					))}
				</div>

				{/* Empty state */}
				{filteredTiles.length === 0 && (
					<div className="text-center py-4 text-xs text-neutral-500">
						No tiles found
					</div>
				)}
			</div>

			{/* Hover tooltip at bottom */}
			<div className="px-3 py-2 border-t border-neutral-700 h-10">
				{hoveredTile !== null && (
					<div className="text-xs text-neutral-400">
						<span className="text-white">
							{TILES.find((t) => t.id === hoveredTile)?.name}
						</span>
						<span className="text-neutral-500 ml-1">#{hoveredTile}</span>
					</div>
				)}
			</div>
		</div>
	);
}
