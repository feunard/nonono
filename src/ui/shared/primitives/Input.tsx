import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils";

type InputVariant = "default" | "minimal";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	variant?: InputVariant;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, variant = "default", ...props }, ref) => {
		return (
			<input
				ref={ref}
				className={cn(
					"w-full text-xs text-white placeholder-neutral-500 focus:outline-none",
					variant === "default" &&
						"px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded focus:border-neutral-500",
					variant === "minimal" && "bg-transparent border-none px-0 py-1",
					className,
				)}
				{...props}
			/>
		);
	},
);

Input.displayName = "Input";
