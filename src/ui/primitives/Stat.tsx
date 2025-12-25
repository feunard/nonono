import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils";
import { IconBox } from "./IconBox";

type StatProps = HTMLAttributes<HTMLDivElement> & {
	icon: ReactNode;
	label: string;
	value: string | number;
	direction?: "horizontal" | "vertical";
};

const Stat = forwardRef<HTMLDivElement, StatProps>(
	(
		{ className, icon, label, value, direction = "horizontal", ...props },
		ref,
	) => (
		<div
			ref={ref}
			className={cn(
				"flex items-center",
				direction === "horizontal" && "gap-2.5",
				direction === "vertical" && "flex-col gap-2",
				className,
			)}
			{...props}
		>
			<IconBox size="sm">{icon}</IconBox>
			<div
				className={cn(
					"flex flex-col",
					direction === "vertical" && "items-center",
				)}
			>
				{direction === "horizontal" ? (
					<>
						<span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
							{label}
						</span>
						<span className="text-base font-bold text-white tabular-nums">
							{value}
						</span>
					</>
				) : (
					<>
						<span className="text-xl font-bold text-white tabular-nums">
							{value}
						</span>
						<span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
							{label}
						</span>
					</>
				)}
			</div>
		</div>
	),
);
Stat.displayName = "Stat";

const StatDivider = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ className, orientation = "vertical", ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"bg-neutral-700",
			orientation === "vertical" && "w-px h-8",
			orientation === "horizontal" && "h-px w-full",
			className,
		)}
		{...props}
	/>
));
StatDivider.displayName = "StatDivider";

export { Stat, StatDivider };
