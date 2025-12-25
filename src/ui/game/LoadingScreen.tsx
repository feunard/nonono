type LoadingScreenProps = {
	isVisible: boolean;
};

export function LoadingScreen({ isVisible }: LoadingScreenProps) {
	return (
		<div
			className={`absolute inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
				isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
			}`}
		>
			<div className="flex flex-col items-center gap-6">
				{/* Loading spinner */}
				<div className="relative w-12 h-12">
					<div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
					<div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin" />
				</div>

				{/* Loading text */}
				<div className="text-neutral-500 text-sm font-medium tracking-wider uppercase">
					Loading
				</div>
			</div>
		</div>
	);
}
