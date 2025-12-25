import { useCallback, useRef, useState } from "react";
import { cn } from "../utils";
import { TILES } from "./useMapEditor";

type MapCanvasProps = {
	tiles: number[][];
	width: number;
	height: number;
	showGrid: boolean;
	zoom: number;
	onPaintTile: (x: number, y: number) => void;
	onHover: (position: { x: number; y: number } | null) => void;
};

const TILE_SIZE = 16; // Base tile size in pixels

export function MapCanvas({
	tiles,
	width,
	height,
	showGrid,
	zoom,
	onPaintTile,
	onHover,
}: MapCanvasProps) {
	const [isPainting, setIsPainting] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const scaledTileSize = TILE_SIZE * zoom;
	const canvasWidth = width * scaledTileSize;
	const canvasHeight = height * scaledTileSize;

	// Convert mouse position to tile coordinates
	const getTileCoords = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const container = containerRef.current;
			if (!container) return null;

			const rect = container.getBoundingClientRect();
			const scrollLeft = container.scrollLeft;
			const scrollTop = container.scrollTop;

			// Get position relative to the canvas content (accounting for scroll)
			const x = e.clientX - rect.left + scrollLeft;
			const y = e.clientY - rect.top + scrollTop;

			const tileX = Math.floor(x / scaledTileSize);
			const tileY = Math.floor(y / scaledTileSize);

			// Bounds check
			if (tileX < 0 || tileX >= width || tileY < 0 || tileY >= height) {
				return null;
			}

			return { x: tileX, y: tileY };
		},
		[scaledTileSize, width, height],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (e.button !== 0) return; // Only left click
			setIsPainting(true);
			const coords = getTileCoords(e);
			if (coords) {
				onPaintTile(coords.x, coords.y);
			}
		},
		[getTileCoords, onPaintTile],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const coords = getTileCoords(e);
			onHover(coords);

			if (isPainting && coords) {
				onPaintTile(coords.x, coords.y);
			}
		},
		[getTileCoords, isPainting, onPaintTile, onHover],
	);

	const handleMouseUp = useCallback(() => {
		setIsPainting(false);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsPainting(false);
		onHover(null);
	}, [onHover]);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: editor canvas scroll container
		<div
			ref={containerRef}
			className="flex-1 overflow-auto bg-neutral-800 p-4"
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
		>
			{/* Canvas area */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: editor canvas interaction */}
			<div
				className="relative mx-auto"
				style={{
					width: canvasWidth,
					height: canvasHeight,
				}}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
			>
				{/* Render tiles - using coordinate-based key since grid positions are stable */}
				{tiles.map((row, rowIndex) =>
					row.map((tileId, colIndex) => {
						const tile = TILES.find((t) => t.id === tileId) || TILES[0];
						const tileKey = `tile-${colIndex}-${rowIndex}`;
						return (
							<div
								key={tileKey}
								className={cn(
									"absolute",
									tile.id === 0 ? "bg-white" : "bg-black",
									showGrid && "border-r border-b border-neutral-600",
								)}
								style={{
									left: colIndex * scaledTileSize,
									top: rowIndex * scaledTileSize,
									width: scaledTileSize,
									height: scaledTileSize,
								}}
							/>
						);
					}),
				)}

				{/* Grid overlay border (outermost) */}
				{showGrid && (
					<div
						className="absolute inset-0 border border-neutral-500 pointer-events-none"
						style={{
							width: canvasWidth,
							height: canvasHeight,
						}}
					/>
				)}
			</div>
		</div>
	);
}
