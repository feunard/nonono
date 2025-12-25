import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
	transparent?: boolean;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
	({ className, transparent, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"border-2 border-neutral-700 rounded-lg shadow-[0_0_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]",
				transparent
					? "bg-neutral-900/80 backdrop-blur-sm"
					: "bg-gradient-to-b from-neutral-900 to-black",
				className,
			)}
			{...props}
		/>
	),
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex flex-col items-center p-6", className)}
			{...props}
		/>
	),
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
	HTMLHeadingElement,
	HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn(
			"text-3xl font-bold text-white tracking-tight text-center",
			className,
		)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
	HTMLParagraphElement,
	HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-neutral-400 text-sm text-center", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
	),
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
	),
);
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
};
