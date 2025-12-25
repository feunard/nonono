import type Phaser from "phaser";
import { useEffect, useRef } from "react";
import {
	editorStore,
	type MapSize,
	type TileId,
	useEditorStore,
} from "../../stores/editorStore";
import { createEditorGame } from "./EditorGame";
import { EditorStatusBar } from "./EditorStatusBar";
import { EditorToolbar } from "./EditorToolbar";
import { TilePalette } from "./TilePalette";

type MapEditorProps = {
	onBack: () => void;
};

export function MapEditor({ onBack }: MapEditorProps) {
	const gameRef = useRef<Phaser.Game | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Subscribe to store state
	const {
		width,
		height,
		showGrid,
		zoom,
		selectedTile,
		hoverPosition,
		importError,
		history,
		future,
		fileName,
		hasUnsavedChanges,
	} = useEditorStore();

	const canUndo = history.length > 0;
	const canRedo = future.length > 0;
	const availableMaps = editorStore.getAvailableMaps();

	// Initialize Phaser game
	useEffect(() => {
		if (!containerRef.current) return;

		// Create the game
		gameRef.current = createEditorGame(containerRef.current);

		// Cleanup on unmount
		return () => {
			if (gameRef.current) {
				gameRef.current.destroy(true);
				gameRef.current = null;
			}
			// Reset editor store when leaving
			editorStore.reset();
		};
	}, []);

	return (
		<div className="flex flex-col h-screen bg-neutral-900">
			{/* Top toolbar */}
			<EditorToolbar
				showGrid={showGrid}
				mapSize={width}
				zoom={zoom}
				importError={importError}
				availableMaps={availableMaps}
				canUndo={canUndo}
				canRedo={canRedo}
				fileName={fileName}
				hasUnsavedChanges={hasUnsavedChanges}
				onToggleGrid={() => editorStore.toggleGrid()}
				onClearMap={() => editorStore.clearMap()}
				onSetMapSize={(size: MapSize) => editorStore.setMapSize(size)}
				onZoomIn={() => editorStore.zoomIn()}
				onZoomOut={() => editorStore.zoomOut()}
				onBack={onBack}
				onOpenFile={() => editorStore.openFile()}
				onSaveFile={() => editorStore.saveFile()}
				onSaveFileAs={() => editorStore.saveFileAs()}
				onLoadMap={(mapId: string) => editorStore.loadMap(mapId)}
				onUndo={() => editorStore.undo()}
				onRedo={() => editorStore.redo()}
				onClearImportError={() => editorStore.clearImportError()}
			/>

			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left sidebar - Tile palette */}
				<TilePalette
					selectedTile={selectedTile}
					onSelectTile={(tileId: TileId) => editorStore.selectTile(tileId)}
				/>

				{/* Canvas area with floating controls */}
				<div className="relative flex-1 overflow-hidden">
					{/* Phaser canvas container */}
					<div ref={containerRef} className="w-full h-full" />

					{/* Floating zoom controls */}
					<div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1.5 bg-neutral-800/90 border border-neutral-700 rounded-lg shadow-lg">
						<button
							type="button"
							onClick={() => editorStore.zoomOut()}
							className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-700 rounded cursor-pointer transition-colors"
							title="Zoom Out"
						>
							−
						</button>
						<span className="w-12 text-center text-xs text-neutral-300 font-mono">
							{Math.round(zoom * 100)}%
						</span>
						<button
							type="button"
							onClick={() => editorStore.zoomIn()}
							className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-700 rounded cursor-pointer transition-colors"
							title="Zoom In"
						>
							+
						</button>
					</div>
				</div>
			</div>

			{/* Bottom status bar */}
			<EditorStatusBar
				mapWidth={width}
				mapHeight={height}
				selectedTile={selectedTile}
				hoverPosition={hoverPosition}
			/>
		</div>
	);
}
