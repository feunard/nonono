import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils";

const Overlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	),
);
Overlay.displayName = "Overlay";

export { Overlay };
