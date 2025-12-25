import EasyStar from "easystarjs";
import { getMapConfig } from "../config/MapConfig";

export class PathfindingManager {
	private easystar: EasyStar.js;
	private grid: number[][];

	constructor(collisionGrid: number[][]) {
		this.easystar = new EasyStar.js();
		this.grid = collisionGrid;
		this.setupPathfinding();
	}

	private setupPathfinding(): void {
		this.easystar.setGrid(this.grid);
		this.easystar.setAcceptableTiles([0]); // 0 = walkable, 1 = collision
		// Disable diagonals to prevent orcs from clipping tile corners
		// Paths will only use 4 directions (N/S/E/W)
		this.easystar.disableDiagonals();
		// Process more paths per calculate() call for faster pathfinding
		this.easystar.setIterationsPerCalculation(1000);
	}

	public findPath(
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		callback: (path: { x: number; y: number }[] | null) => void,
	): void {
		const mapConfig = getMapConfig();

		const clampedStartX = Math.max(0, Math.min(startX, mapConfig.width - 1));
		const clampedStartY = Math.max(0, Math.min(startY, mapConfig.height - 1));
		const clampedEndX = Math.max(0, Math.min(endX, mapConfig.width - 1));
		const clampedEndY = Math.max(0, Math.min(endY, mapConfig.height - 1));

		this.easystar.findPath(
			clampedStartX,
			clampedStartY,
			clampedEndX,
			clampedEndY,
			callback,
		);
		this.easystar.calculate();
	}

	public setTileWalkable(x: number, y: number, walkable: boolean): void {
		if (this.grid[y] && this.grid[y][x] !== undefined) {
			this.grid[y][x] = walkable ? 0 : 1;
			this.easystar.setGrid(this.grid);
		}
	}

	public update(): void {
		this.easystar.calculate();
	}
}
