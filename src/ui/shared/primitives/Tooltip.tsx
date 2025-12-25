import { type ReactNode, useState } from "react";
import { cn } from "../utils";

type TooltipPosition = "top" | "bottom" | "left" | "right";

type TooltipProps = {
	children: ReactNode;
	content: ReactNode;
	position?: TooltipPosition;
};

const positionStyles: Record<
	TooltipPosition,
	{ container: string; arrow: string }
> = {
	top: {
		container: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		arrow: "top-full left-1/2 -translate-x-1/2 border-t-black/90",
	},
	bottom: {
		container: "top-full left-1/2 -translate-x-1/2 mt-2",
		arrow: "bottom-full left-1/2 -translate-x-1/2 border-b-black/90",
	},
	left: {
		container: "right-full top-1/2 -translate-y-1/2 mr-2",
		arrow: "left-full top-1/2 -translate-y-1/2 border-l-black/90",
	},
	right: {
		container: "left-full top-1/2 -translate-y-1/2 ml-2",
		arrow: "right-full top-1/2 -translate-y-1/2 border-r-black/90",
	},
};

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
	const [show, setShow] = useState(false);
	const styles = positionStyles[position];

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: tooltip hover tracking
		<div
			className="relative"
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
		>
			{children}
			{show && (
				<div
					className={cn(
						"absolute px-2 py-1 bg-black/90 border border-neutral-600 rounded text-xs whitespace-nowrap z-50 pointer-events-none",
						styles.container,
					)}
				>
					{content}
					{/* Tooltip arrow */}
					<div
						className={cn("absolute border-4 border-transparent", styles.arrow)}
					/>
				</div>
			)}
		</div>
	);
}
