import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../utils";
import { Kbd } from "./Kbd";

// Context for menu state
type MenuContextType = {
	openMenuId: string | null;
	setOpenMenuId: (id: string | null) => void;
};

const MenuContext = createContext<MenuContextType>({
	openMenuId: null,
	setOpenMenuId: () => {},
});

// Menu Bar container
export function MenuBar({ children }: { children: ReactNode }) {
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	// Close menu when clicking outside
	useEffect(() => {
		if (!openMenuId) return;

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest("[data-menu]")) {
				setOpenMenuId(null);
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpenMenuId(null);
			}
		};

		document.addEventListener("click", handleClick);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("click", handleClick);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [openMenuId]);

	return (
		<MenuContext.Provider value={{ openMenuId, setOpenMenuId }}>
			<div className="flex items-center" data-menu>
				{children}
			</div>
		</MenuContext.Provider>
	);
}

// Individual menu (File, Edit, View, etc.)
type MenuProps = {
	id: string;
	label: string;
	children: ReactNode;
};

export function Menu({ id, label, children }: MenuProps) {
	const { openMenuId, setOpenMenuId } = useContext(MenuContext);
	const isOpen = openMenuId === id;
	const menuRef = useRef<HTMLDivElement>(null);

	const handleClick = useCallback(() => {
		setOpenMenuId(isOpen ? null : id);
	}, [id, isOpen, setOpenMenuId]);

	const handleMouseEnter = useCallback(() => {
		// If another menu is open, switch to this one on hover
		if (openMenuId && openMenuId !== id) {
			setOpenMenuId(id);
		}
	}, [id, openMenuId, setOpenMenuId]);

	return (
		<div className="relative" ref={menuRef} data-menu>
			<button
				type="button"
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				className={cn(
					"px-3 py-1.5 text-sm cursor-pointer transition-colors rounded",
					isOpen
						? "bg-neutral-700 text-white"
						: "text-neutral-300 hover:bg-neutral-800 hover:text-white",
				)}
			>
				{label}
			</button>
			{isOpen && (
				<div className="absolute top-full left-0 mt-1 min-w-48 bg-neutral-800 border border-neutral-700 rounded shadow-xl z-50">
					{children}
				</div>
			)}
		</div>
	);
}

// Menu item (clickable action)
type MenuItemProps = {
	onClick?: () => void;
	disabled?: boolean;
	shortcut?: string;
	icon?: ReactNode;
	children: ReactNode;
};

export function MenuItem({
	onClick,
	disabled,
	shortcut,
	icon,
	children,
}: MenuItemProps) {
	const { setOpenMenuId } = useContext(MenuContext);

	const handleClick = useCallback(() => {
		if (disabled) return;
		onClick?.();
		setOpenMenuId(null);
	}, [disabled, onClick, setOpenMenuId]);

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={disabled}
			className={cn(
				"w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors",
				disabled
					? "text-neutral-500 cursor-not-allowed"
					: "text-neutral-200 hover:bg-neutral-700 cursor-pointer",
			)}
		>
			<span className="flex items-center gap-2">
				{icon && <span className="w-4 text-center opacity-70">{icon}</span>}
				{children}
			</span>
			{shortcut && (
				<Kbd className="ml-4 px-1.5 py-0.5 text-[10px]">{shortcut}</Kbd>
			)}
		</button>
	);
}

// Submenu (nested menu)
type SubMenuProps = {
	label: string;
	icon?: ReactNode;
	children: ReactNode;
};

export function SubMenu({ label, icon, children }: SubMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const timeoutRef = useRef<number | null>(null);

	const handleMouseEnter = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setIsOpen(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		timeoutRef.current = window.setTimeout(() => {
			setIsOpen(false);
		}, 100);
	}, []);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: submenu hover behavior
		<div
			className="relative"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div
				className={cn(
					"w-full flex items-center justify-between px-3 py-2 text-sm transition-colors",
					"text-neutral-200 hover:bg-neutral-700 cursor-pointer",
				)}
			>
				<span className="flex items-center gap-2">
					{icon && <span className="w-4 text-center opacity-70">{icon}</span>}
					{label}
				</span>
				<span className="text-neutral-500">▶</span>
			</div>
			{isOpen && (
				<div className="absolute top-0 left-full ml-1 min-w-48 bg-neutral-800 border border-neutral-700 rounded shadow-xl z-50">
					{children}
				</div>
			)}
		</div>
	);
}

// Separator line
export function MenuSeparator() {
	return <div className="my-1 border-t border-neutral-700" />;
}

// Checkbox menu item
type MenuCheckboxProps = {
	checked: boolean;
	onChange: (checked: boolean) => void;
	shortcut?: string;
	icon?: ReactNode;
	children: ReactNode;
};

export function MenuCheckbox({
	checked,
	onChange,
	shortcut,
	icon,
	children,
}: MenuCheckboxProps) {
	const { setOpenMenuId } = useContext(MenuContext);

	const handleClick = useCallback(() => {
		onChange(!checked);
		setOpenMenuId(null);
	}, [checked, onChange, setOpenMenuId]);

	return (
		<button
			type="button"
			onClick={handleClick}
			className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-neutral-200 hover:bg-neutral-700 cursor-pointer transition-colors"
		>
			<span className="flex items-center gap-2">
				<span className="w-4 text-center">{checked ? "✓" : ""}</span>
				{icon && <span className="w-4 text-center opacity-70">{icon}</span>}
				{children}
			</span>
			{shortcut && (
				<Kbd className="ml-4 px-1.5 py-0.5 text-[10px]">{shortcut}</Kbd>
			)}
		</button>
	);
}
