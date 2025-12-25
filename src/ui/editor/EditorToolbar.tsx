import {
	ArrowLeft,
	Eraser,
	File,
	FilePlus,
	FolderOpen,
	Grid3X3,
	Maximize2,
	Redo2,
	Save,
	SaveAll,
	Search,
	Undo2,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { MAP_SIZES, type MapSize } from "../../stores/editorStore";
import {
	Menu,
	MenuBar,
	MenuCheckbox,
	MenuItem,
	MenuSeparator,
	SubMenu,
} from "../primitives/Menu";

type EditorToolbarProps = {
	showGrid: boolean;
	mapSize: MapSize;
	zoom: number;
	importError: string | null;
	availableMaps: string[];
	canUndo: boolean;
	canRedo: boolean;
	fileName: string | null;
	hasUnsavedChanges: boolean;
	onToggleGrid: () => void;
	onClearMap: () => void;
	onSetMapSize: (size: MapSize) => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onBack: () => void;
	onOpenFile: () => void;
	onSaveFile: () => void;
	onSaveFileAs: () => void;
	onLoadMap: (mapId: string) => void;
	onUndo: () => void;
	onRedo: () => void;
	onClearImportError: () => void;
};

export function EditorToolbar({
	showGrid,
	mapSize,
	zoom,
	importError,
	availableMaps,
	canUndo,
	canRedo,
	fileName,
	hasUnsavedChanges,
	onToggleGrid,
	onClearMap,
	onSetMapSize,
	onZoomIn,
	onZoomOut,
	onBack,
	onOpenFile,
	onSaveFile,
	onSaveFileAs,
	onLoadMap,
	onUndo,
	onRedo,
	onClearImportError,
}: EditorToolbarProps) {
	return (
		<div className="flex flex-col">
			{/* Menu bar */}
			<div className="flex items-center gap-2 px-2 py-1 bg-neutral-900 border-b border-neutral-700">
				<MenuBar>
					{/* File Menu */}
					<Menu id="file" label="File">
						<MenuItem icon={<FilePlus size={14} />} onClick={onClearMap}>
							New Map
						</MenuItem>
						<MenuSeparator />
						<SubMenu icon={<FolderOpen size={14} />} label="Open Built-in">
							{availableMaps.map((mapId) => (
								<MenuItem
									icon={<File size={14} />}
									key={mapId}
									onClick={() => onLoadMap(mapId)}
								>
									{mapId}
								</MenuItem>
							))}
						</SubMenu>
						<MenuItem
							icon={<FolderOpen size={14} />}
							onClick={onOpenFile}
							shortcut="Ctrl+O"
						>
							Open...
						</MenuItem>
						<MenuSeparator />
						<MenuItem
							icon={<Save size={14} />}
							onClick={onSaveFile}
							shortcut="Ctrl+S"
						>
							Save
						</MenuItem>
						<MenuItem
							icon={<SaveAll size={14} />}
							onClick={onSaveFileAs}
							shortcut="Ctrl+Shift+S"
						>
							Save As...
						</MenuItem>
						<MenuSeparator />
						<MenuItem icon={<ArrowLeft size={14} />} onClick={onBack}>
							Exit Editor
						</MenuItem>
					</Menu>

					{/* Edit Menu */}
					<Menu id="edit" label="Edit">
						<MenuItem
							icon={<Undo2 size={14} />}
							onClick={onUndo}
							disabled={!canUndo}
							shortcut="Ctrl+Z"
						>
							Undo
						</MenuItem>
						<MenuItem
							icon={<Redo2 size={14} />}
							onClick={onRedo}
							disabled={!canRedo}
							shortcut="Ctrl+Y"
						>
							Redo
						</MenuItem>
						<MenuSeparator />
						<MenuItem icon={<Eraser size={14} />} onClick={onClearMap}>
							Clear All
						</MenuItem>
					</Menu>

					{/* View Menu */}
					<Menu id="view" label="View">
						<MenuCheckbox
							icon={<Grid3X3 size={14} />}
							checked={showGrid}
							onChange={onToggleGrid}
						>
							Show Grid
						</MenuCheckbox>
						<MenuSeparator />
						<MenuItem
							icon={<ZoomIn size={14} />}
							onClick={onZoomIn}
							shortcut="Ctrl++"
						>
							Zoom In
						</MenuItem>
						<MenuItem
							icon={<ZoomOut size={14} />}
							onClick={onZoomOut}
							shortcut="Ctrl+-"
						>
							Zoom Out
						</MenuItem>
						<MenuItem icon={<Search size={14} />} disabled>
							Zoom: {Math.round(zoom * 100)}%
						</MenuItem>
					</Menu>

					{/* Map Menu */}
					<Menu id="map" label="Map">
						<SubMenu icon={<Maximize2 size={14} />} label="Resize">
							{MAP_SIZES.map((size) => (
								<MenuItem
									key={size}
									onClick={() => onSetMapSize(size)}
									shortcut={mapSize === size ? "●" : ""}
								>
									{size}×{size}
								</MenuItem>
							))}
						</SubMenu>
					</Menu>
				</MenuBar>

				{/* Spacer */}
				<div className="flex-1" />

				{/* Title */}
				<span className="text-sm text-neutral-400">
					{fileName ? (
						<>
							{fileName}
							{hasUnsavedChanges && <span className="text-white ml-1">●</span>}
						</>
					) : (
						"Map Editor"
					)}
				</span>

				{/* Spacer */}
				<div className="flex-1" />

				{/* Quick info */}
				<div className="flex items-center gap-4 text-xs text-neutral-500">
					<span>
						Size: {mapSize}×{mapSize}
					</span>
					<span>Zoom: {Math.round(zoom * 100)}%</span>
				</div>
			</div>

			{/* Import error message */}
			{importError && (
				<div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
					<span className="text-sm text-white">
						Import failed: {importError}
					</span>
					<button
						type="button"
						onClick={onClearImportError}
						className="text-sm text-neutral-400 hover:text-white cursor-pointer"
					>
						Dismiss
					</button>
				</div>
			)}
		</div>
	);
}
