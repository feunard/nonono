import { useEffect, useRef } from "react";
import { getMapConfig } from "../../../config/MapConfig";
import type { Position } from "../../../stores/gameStore";
import { Card } from "../../shared/primitives/Card";

type MinimapCardProps = {
	heroPosition: Position;
	orcPositions: Position[];
};

const MINIMAP_SIZE = 100; // Size in pixels

export function MinimapCard({ heroPosition, orcPositions }: MinimapCardProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Map dimensions from config
	const mapConfig = getMapConfig();
	const mapWidth = mapConfig.width * mapConfig.tileSize;
	const mapHeight = mapConfig.height * mapConfig.tileSize;

	// Scale factor: world coords to minimap coords
	const scale = MINIMAP_SIZE / Math.max(mapWidth, mapHeight);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Clear canvas
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

		// Draw map boundary
		ctx.strokeStyle = "#404040";
		ctx.lineWidth = 1;
		ctx.strokeRect(0, 0, mapWidth * scale, mapHeight * scale);

		// Draw orcs as small grey dots
		ctx.fillStyle = "#666666";
		for (const orc of orcPositions) {
			const x = orc.x * scale;
			const y = orc.y * scale;
			ctx.beginPath();
			ctx.arc(x, y, 1.5, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw hero as white dot (larger)
		ctx.fillStyle = "#FFFFFF";
		const heroX = heroPosition.x * scale;
		const heroY = heroPosition.y * scale;
		ctx.beginPath();
		ctx.arc(heroX, heroY, 3, 0, Math.PI * 2);
		ctx.fill();
	}, [heroPosition, orcPositions, scale, mapWidth, mapHeight]);

	return (
		<Card className="p-1.5">
			<canvas
				ref={canvasRef}
				width={MINIMAP_SIZE}
				height={MINIMAP_SIZE}
				className="rounded-sm"
			/>
		</Card>
	);
}
