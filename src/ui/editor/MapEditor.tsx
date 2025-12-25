import { EditorStatusBar } from "./EditorStatusBar";
import { EditorToolbar } from "./EditorToolbar";
import { MapCanvas } from "./MapCanvas";
import { TilePalette } from "./TilePalette";
import { useMapEditor } from "./useMapEditor";

type MapEditorProps = {
	onBack: () => void;
};

export function MapEditor({ onBack }: MapEditorProps) {
	const editor = useMapEditor();

	return (
		<div className="flex flex-col h-screen bg-neutral-900">
			{/* Top toolbar */}
			<EditorToolbar
				showGrid={editor.showGrid}
				mapSize={editor.width}
				zoom={editor.zoom}
				importError={editor.importError}
				fileInputRef={editor.fileInputRef}
				onToggleGrid={editor.toggleGrid}
				onClearMap={editor.clearMap}
				onSetMapSize={editor.setMapSize}
				onZoomIn={editor.zoomIn}
				onZoomOut={editor.zoomOut}
				onBack={onBack}
				onExport={() => editor.exportMap()}
				onImport={editor.triggerImport}
				onFileChange={editor.handleFileChange}
				onClearImportError={editor.clearImportError}
			/>

			{/* Main content area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left sidebar - Tile palette */}
				<TilePalette
					selectedTile={editor.selectedTile}
					onSelectTile={editor.selectTile}
				/>

				{/* Canvas area */}
				<MapCanvas
					tiles={editor.tiles}
					width={editor.width}
					height={editor.height}
					showGrid={editor.showGrid}
					zoom={editor.zoom}
					onPaintTile={editor.paintTile}
					onHover={editor.setHover}
				/>
			</div>

			{/* Bottom status bar */}
			<EditorStatusBar
				mapWidth={editor.width}
				mapHeight={editor.height}
				selectedTile={editor.selectedTile}
				hoverPosition={editor.hoverPosition}
			/>
		</div>
	);
}
