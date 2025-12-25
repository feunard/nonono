import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils";

type IconBoxProps = HTMLAttributes<HTMLDivElement> & {
	size?: "sm" | "md" | "lg";
};

const IconBox = forwardRef<HTMLDivElement, IconBoxProps>(
	({ className, size = "md", children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"rounded bg-neutral-800/60 border border-neutral-700 text-white flex items-center justify-center",
				size === "sm" && "p-1.5",
				size === "md" && "p-2",
				size === "lg" && "p-3",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	),
);
IconBox.displayName = "IconBox";

export { IconBox };
