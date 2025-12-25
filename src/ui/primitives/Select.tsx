import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{ className, variant = "secondary", size = "sm", children, ...props },
		ref,
	) => {
		return (
			<select
				ref={ref}
				className={cn(
					"appearance-none cursor-pointer rounded font-medium",
					"transition-all duration-150 ease-out",
					"bg-[length:16px] bg-no-repeat bg-[right_8px_center]",
					"bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a3a3a3%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
					// Variants
					variant === "primary" && "bg-white hover:bg-neutral-200 text-black",
					variant === "secondary" &&
						"bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
					variant === "ghost" &&
						"bg-transparent hover:bg-neutral-800 text-white border border-transparent",
					// Sizes
					size === "sm" && "h-9 pl-3 pr-7 text-xs",
					size === "md" && "h-11 pl-4 pr-8 text-sm",
					size === "lg" && "h-12 pl-6 pr-10 text-base",
					className,
				)}
				{...props}
			>
				{children}
			</select>
		);
	},
);

Select.displayName = "Select";

export { Select };
