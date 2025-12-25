import {
	Children,
	createContext,
	forwardRef,
	type HTMLAttributes,
	isValidElement,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { cn } from "../utils";

// Context for accordion state management
type AccordionContextValue = {
	openItems: Set<number>;
	toggle: (index: number) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
	const context = useContext(AccordionContext);
	if (!context) {
		throw new Error("AccordionItem must be used within an Accordion");
	}
	return context;
}

// Context for item index
const AccordionItemContext = createContext<number>(-1);

function useAccordionItemIndex() {
	const index = useContext(AccordionItemContext);
	if (index === -1) {
		throw new Error("AccordionItem must be used within an Accordion");
	}
	return index;
}

// Accordion root component
type AccordionProps = HTMLAttributes<HTMLDivElement> & {
	allowMultiple?: boolean;
	defaultOpen?: number | number[];
	children: ReactNode;
};

// Helper function to compute initial open items from defaultOpen prop
function computeInitialOpenItems(
	defaultOpen: number | number[] | undefined,
): Set<number> {
	if (defaultOpen === undefined) return new Set<number>();
	if (Array.isArray(defaultOpen)) return new Set(defaultOpen);
	return new Set([defaultOpen]);
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
	(
		{ allowMultiple = false, defaultOpen, className, children, ...props },
		ref,
	) => {
		// Use a function initializer for useState - runs once on mount
		const [openItems, setOpenItems] = useState<Set<number>>(() =>
			computeInitialOpenItems(defaultOpen),
		);

		const toggle = useCallback(
			(index: number) => {
				setOpenItems((prev) => {
					const next = new Set(prev);
					if (next.has(index)) {
						next.delete(index);
					} else {
						if (!allowMultiple) {
							next.clear();
						}
						next.add(index);
					}
					return next;
				});
			},
			[allowMultiple],
		);

		const contextValue = useMemo(
			() => ({ openItems, toggle }),
			[openItems, toggle],
		);

		// Process children to wrap each AccordionItem with index context
		const childrenWithIndex = useMemo(() => {
			let itemIndex = 0;
			return Children.map(children, (child) => {
				// Only wrap valid AccordionItem elements
				if (isValidElement(child) && child.type === AccordionItem) {
					const currentIndex = itemIndex++;
					return (
						<AccordionItemContext.Provider
							key={currentIndex}
							value={currentIndex}
						>
							{child}
						</AccordionItemContext.Provider>
					);
				}
				return child;
			});
		}, [children]);

		return (
			<AccordionContext.Provider value={contextValue}>
				<div ref={ref} className={cn("flex flex-col", className)} {...props}>
					{childrenWithIndex}
				</div>
			</AccordionContext.Provider>
		);
	},
);
Accordion.displayName = "Accordion";

// AccordionItem component
type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
	title: string;
	children: ReactNode;
};

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
	({ title, className, children, ...props }, ref) => {
		const { openItems, toggle } = useAccordionContext();
		const index = useAccordionItemIndex();
		const isOpen = openItems.has(index);

		return (
			<div
				ref={ref}
				className={cn(
					"border-t border-neutral-700 first:border-t-0",
					className,
				)}
				{...props}
			>
				<button
					type="button"
					onClick={() => toggle(index)}
					className="flex w-full items-center justify-between py-1.5 text-left text-neutral-400 text-[10px] uppercase tracking-wider hover:text-neutral-300 transition-colors"
				>
					<span>{title}</span>
					<span
						className={cn(
							"text-neutral-500 transition-transform duration-200",
							isOpen && "rotate-180",
						)}
						aria-hidden="true"
					>
						<ChevronDown />
					</span>
				</button>
				<div
					className={cn(
						"grid transition-[grid-template-rows] duration-200 ease-out",
						isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
					)}
				>
					<div className="overflow-hidden">
						<div className="pb-1">{children}</div>
					</div>
				</div>
			</div>
		);
	},
);
AccordionItem.displayName = "AccordionItem";

// Chevron icon component - purely decorative, parent has aria-hidden
function ChevronDown() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	);
}

export { Accordion, AccordionItem };
