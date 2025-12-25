import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant = "primary", size = "md", children, ...props },
		ref,
	) => {
		return (
			<button
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center gap-2 font-semibold cursor-pointer rounded",
					"transition-all duration-150 ease-out",
					"hover:scale-[1.02] active:scale-[0.98]",
					// Variants
					variant === "primary" && "bg-white hover:bg-neutral-200 text-black",
					variant === "secondary" &&
						"bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
					variant === "ghost" &&
						"bg-transparent hover:bg-neutral-800 text-white",
					// Sizes
					size === "sm" && "h-9 px-3 text-xs",
					size === "md" && "h-11 px-4 text-sm",
					size === "lg" && "h-12 px-6 text-base",
					className,
				)}
				{...props}
			>
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";

export { Button };
