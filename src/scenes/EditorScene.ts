import Phaser from "phaser";
import { editorStore } from "../stores/editorStore";

const TILE_SIZE = 16;

export class EditorScene extends Phaser.Scene {
	private tileGraphics!: Phaser.GameObjects.Graphics;
	private gridGraphics!: Phaser.GameObjects.Graphics;
	private hoverGraphics!: Phaser.GameObjects.Graphics;
	private isPainting = false;
	private lastPaintedTile: { x: number; y: number } | null = null;
	private unsubscribe: (() => void) | null = null;

	// Cache current state to avoid unnecessary redraws
	private cachedTiles: number[][] = [];
	private cachedWidth = 0;
	private cachedHeight = 0;
	private cachedShowGrid = true;
	private cachedZoom = 1;

	constructor() {
		super({ key: "EditorScene" });
	}

	create(): void {
		// Create graphics objects
		this.tileGraphics = this.add.graphics();
		this.gridGraphics = this.add.graphics();
		this.hoverGraphics = this.add.graphics();
		this.hoverGraphics.setDepth(10);

		// Setup input
		this.setupInput();

		// Subscribe to store changes
		this.unsubscribe = editorStore.subscribe((state) => {
			this.onStoreChange(state);
		});

		// Initial render
		const state = editorStore.getState();
		this.cachedTiles = state.tiles;
		this.cachedWidth = state.width;
		this.cachedHeight = state.height;
		this.cachedShowGrid = state.showGrid;
		this.cachedZoom = state.zoom;

		this.updateCameraBounds();
		this.cameras.main.setZoom(state.zoom);
		this.renderTiles();
		this.renderGrid();

		// Setup keyboard shortcuts
		this.setupKeyboard();

		// Mark as ready
		editorStore.setReady();
	}

	private setupInput(): void {
		// Mouse down - start painting
		this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
			if (pointer.leftButtonDown()) {
				this.isPainting = true;
				editorStore.saveToHistory();
				this.paintAtPointer(pointer);
			}
		});

		// Mouse move - continue painting or update hover
		this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
			const tile = this.getTileAtPointer(pointer);
			editorStore.setHover(tile);
			this.renderHover(tile);

			if (this.isPainting && pointer.leftButtonDown()) {
				this.paintAtPointer(pointer);
			}
		});

		// Mouse up - stop painting
		this.input.on("pointerup", () => {
			this.isPainting = false;
			this.lastPaintedTile = null;
		});

		// Mouse leave canvas
		this.input.on("pointerout", () => {
			this.isPainting = false;
			this.lastPaintedTile = null;
			editorStore.setHover(null);
			this.hoverGraphics.clear();
		});

		// Scroll wheel zoom
		this.input.on(
			"wheel",
			(
				_pointer: Phaser.Input.Pointer,
				_gameObjects: Phaser.GameObjects.GameObject[],
				_deltaX: number,
				deltaY: number,
			) => {
				if (deltaY < 0) {
					editorStore.zoomIn();
				} else if (deltaY > 0) {
					editorStore.zoomOut();
				}
			},
		);
	}

	private setupKeyboard(): void {
		// Undo: Ctrl+Z
		this.input.keyboard?.on("keydown-Z", (event: KeyboardEvent) => {
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault();
				if (event.shiftKey) {
					editorStore.redo();
				} else {
					editorStore.undo();
				}
			}
		});

		// Redo: Ctrl+Y
		this.input.keyboard?.on("keydown-Y", (event: KeyboardEvent) => {
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault();
				editorStore.redo();
			}
		});

		// Toggle grid: G
		this.input.keyboard?.on("keydown-G", () => {
			editorStore.toggleGrid();
		});
	}

	private getTileAtPointer(
		pointer: Phaser.Input.Pointer,
	): { x: number; y: number } | null {
		const worldX = pointer.worldX;
		const worldY = pointer.worldY;

		const tileX = Math.floor(worldX / TILE_SIZE);
		const tileY = Math.floor(worldY / TILE_SIZE);

		const state = editorStore.getState();
		if (
			tileX < 0 ||
			tileX >= state.width ||
			tileY < 0 ||
			tileY >= state.height
		) {
			return null;
		}

		return { x: tileX, y: tileY };
	}

	private paintAtPointer(pointer: Phaser.Input.Pointer): void {
		const tile = this.getTileAtPointer(pointer);
		if (!tile) return;

		// Skip if same tile as last painted
		if (
			this.lastPaintedTile &&
			this.lastPaintedTile.x === tile.x &&
			this.lastPaintedTile.y === tile.y
		) {
			return;
		}

		const state = editorStore.getState();
		const tileId = state.tool === "erase" ? 0 : state.selectedTile;
		editorStore.setTile(tile.x, tile.y, tileId);
		this.lastPaintedTile = tile;
	}

	private onStoreChange(state: ReturnType<typeof editorStore.getState>): void {
		// Check what changed and update accordingly
		const tilesChanged =
			state.tiles !== this.cachedTiles ||
			state.width !== this.cachedWidth ||
			state.height !== this.cachedHeight;

		const gridChanged = state.showGrid !== this.cachedShowGrid;
		const zoomChanged = state.zoom !== this.cachedZoom;
		const sizeChanged =
			state.width !== this.cachedWidth || state.height !== this.cachedHeight;

		// Update cache
		this.cachedTiles = state.tiles;
		this.cachedWidth = state.width;
		this.cachedHeight = state.height;
		this.cachedShowGrid = state.showGrid;
		this.cachedZoom = state.zoom;

		// Apply changes
		if (sizeChanged) {
			this.updateCameraBounds();
		}

		if (zoomChanged) {
			this.cameras.main.setZoom(state.zoom);
		}

		if (tilesChanged) {
			this.renderTiles();
		}

		if (gridChanged || tilesChanged) {
			this.renderGrid();
		}
	}

	private updateCameraBounds(): void {
		const state = editorStore.getState();
		const mapWidth = state.width * TILE_SIZE;
		const mapHeight = state.height * TILE_SIZE;

		// Don't set camera bounds - allow free panning in editor
		// Just center the camera on the map
		this.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
	}

	private renderTiles(): void {
		this.tileGraphics.clear();

		const state = editorStore.getState();
		const { tiles, width, height } = state;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tileId = tiles[y]?.[x] ?? 0;
				const color = tileId === 0 ? 0xffffff : 0x000000;

				this.tileGraphics.fillStyle(color, 1);
				this.tileGraphics.fillRect(
					x * TILE_SIZE,
					y * TILE_SIZE,
					TILE_SIZE,
					TILE_SIZE,
				);
			}
		}
	}

	private renderGrid(): void {
		this.gridGraphics.clear();

		const state = editorStore.getState();
		if (!state.showGrid) return;

		const { width, height } = state;
		const mapWidth = width * TILE_SIZE;
		const mapHeight = height * TILE_SIZE;

		this.gridGraphics.lineStyle(1, 0x666666, 0.5);

		// Vertical lines
		for (let x = 0; x <= width; x++) {
			this.gridGraphics.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, mapHeight);
		}

		// Horizontal lines
		for (let y = 0; y <= height; y++) {
			this.gridGraphics.lineBetween(0, y * TILE_SIZE, mapWidth, y * TILE_SIZE);
		}

		// Border
		this.gridGraphics.lineStyle(2, 0x888888, 1);
		this.gridGraphics.strokeRect(0, 0, mapWidth, mapHeight);
	}

	private renderHover(tile: { x: number; y: number } | null): void {
		this.hoverGraphics.clear();

		if (!tile) return;

		const state = editorStore.getState();
		const previewColor =
			state.tool === "erase"
				? 0xffffff
				: state.selectedTile === 0
					? 0xffffff
					: 0x000000;

		// Draw semi-transparent preview
		this.hoverGraphics.fillStyle(previewColor, 0.5);
		this.hoverGraphics.fillRect(
			tile.x * TILE_SIZE,
			tile.y * TILE_SIZE,
			TILE_SIZE,
			TILE_SIZE,
		);

		// Draw hover border
		this.hoverGraphics.lineStyle(2, 0x00ff00, 1);
		this.hoverGraphics.strokeRect(
			tile.x * TILE_SIZE,
			tile.y * TILE_SIZE,
			TILE_SIZE,
			TILE_SIZE,
		);
	}

	update(): void {
		// Check store state each frame for changes triggered outside Phaser (menu clicks)
		const state = editorStore.getState();
		if (
			state.zoom !== this.cachedZoom ||
			state.showGrid !== this.cachedShowGrid ||
			state.tiles !== this.cachedTiles ||
			state.width !== this.cachedWidth
		) {
			this.onStoreChange(state);
		}
	}

	shutdown(): void {
		// Cleanup subscription
		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
	}
}
