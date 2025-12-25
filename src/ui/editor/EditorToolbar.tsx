import type { RefObject } from "react";
import { Button } from "../primitives/Button";
import { cn } from "../utils";
import { MAP_SIZES, type MapSize } from "./useMapEditor";

type EditorToolbarProps = {
	showGrid: boolean;
	mapSize: MapSize;
	zoom: number;
	importError: string | null;
	fileInputRef: RefObject<HTMLInputElement | null>;
	onToggleGrid: () => void;
	onClearMap: () => void;
	onSetMapSize: (size: MapSize) => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onBack: () => void;
	onExport: () => void;
	onImport: () => void;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onClearImportError: () => void;
};

export function EditorToolbar({
	showGrid,
	mapSize,
	zoom,
	importError,
	fileInputRef,
	onToggleGrid,
	onClearMap,
	onSetMapSize,
	onZoomIn,
	onZoomOut,
	onBack,
	onExport,
	onImport,
	onFileChange,
	onClearImportError,
}: EditorToolbarProps) {
	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-700">
				{/* Left: Title and back button */}
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={onBack}>
						Back
					</Button>
					<h1 className="text-lg font-semibold text-white">Map Editor</h1>
				</div>

				{/* Center: Map size selector */}
				<div className="flex items-center gap-2">
					<span className="text-xs text-neutral-400">Size:</span>
					<div className="flex gap-1">
						{MAP_SIZES.map((size) => (
							<button
								type="button"
								key={size}
								onClick={() => onSetMapSize(size)}
								className={cn(
									"px-2 py-1 text-xs rounded cursor-pointer transition-colors",
									mapSize === size
										? "bg-white text-black font-semibold"
										: "bg-neutral-700 text-neutral-300 hover:bg-neutral-600",
								)}
							>
								{size}x{size}
							</button>
						))}
					</div>
				</div>

				{/* Right: Tools */}
				<div className="flex items-center gap-2">
					{/* Import/Export buttons */}
					<div className="flex items-center gap-1 mr-2 border-r border-neutral-700 pr-3">
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							className="hidden"
							onChange={onFileChange}
						/>
						<Button variant="ghost" size="sm" onClick={onImport}>
							Import
						</Button>
						<Button variant="ghost" size="sm" onClick={onExport}>
							Export
						</Button>
					</div>

					{/* Zoom controls */}
					<div className="flex items-center gap-1 mr-2">
						<Button variant="ghost" size="sm" onClick={onZoomOut}>
							-
						</Button>
						<span className="text-xs text-neutral-400 w-12 text-center">
							{Math.round(zoom * 100)}%
						</span>
						<Button variant="ghost" size="sm" onClick={onZoomIn}>
							+
						</Button>
					</div>

					{/* Grid toggle */}
					<Button
						variant={showGrid ? "secondary" : "ghost"}
						size="sm"
						onClick={onToggleGrid}
					>
						Grid
					</Button>

					{/* Clear button */}
					<Button variant="ghost" size="sm" onClick={onClearMap}>
						Clear
					</Button>
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
