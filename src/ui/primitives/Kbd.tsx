import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils";

const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
	({ className, ...props }, ref) => (
		<kbd
			ref={ref}
			className={cn(
				"px-2 py-1 bg-neutral-800 rounded border border-neutral-700 text-white font-mono text-xs",
				className,
			)}
			{...props}
		/>
	),
);
Kbd.displayName = "Kbd";

export { Kbd };
