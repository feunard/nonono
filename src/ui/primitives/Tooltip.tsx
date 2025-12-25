import { type ReactNode, useState } from "react";

type TooltipProps = {
	children: ReactNode;
	content: ReactNode;
};

export function Tooltip({ children, content }: TooltipProps) {
	const [show, setShow] = useState(false);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: tooltip hover tracking
		<div
			className="relative"
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
		>
			{children}
			{show && (
				<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-neutral-600 rounded text-xs whitespace-nowrap z-50 pointer-events-none">
					{content}
					{/* Tooltip arrow */}
					<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
				</div>
			)}
		</div>
	);
}
