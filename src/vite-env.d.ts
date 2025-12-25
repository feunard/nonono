/// <reference types="vite/client" />

// File System Access API types
interface FilePickerAcceptType {
	description?: string;
	accept: Record<string, string[]>;
}

interface OpenFilePickerOptions {
	multiple?: boolean;
	excludeAcceptAllOption?: boolean;
	types?: FilePickerAcceptType[];
}

interface SaveFilePickerOptions {
	excludeAcceptAllOption?: boolean;
	suggestedName?: string;
	types?: FilePickerAcceptType[];
}

interface Window {
	showOpenFilePicker: (
		options?: OpenFilePickerOptions,
	) => Promise<FileSystemFileHandle[]>;
	showSaveFilePicker: (
		options?: SaveFilePickerOptions,
	) => Promise<FileSystemFileHandle>;
}

declare module "*.png" {
	const src: string;
	export default src;
}

declare module "*.jpg" {
	const src: string;
	export default src;
}

declare module "*.gif" {
	const src: string;
	export default src;
}

declare module "*.webp" {
	const src: string;
	export default src;
}
