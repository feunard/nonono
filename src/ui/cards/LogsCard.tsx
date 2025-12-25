import { useEffect, useRef } from "react";
import { useUIStore } from "../../stores/uiStore";
import { Card } from "../primitives/Card";

// Highlight only damage numbers and special keywords in white
function formatLogMessage(message: string) {
	// Match damage values (numbers after "for ") and special keywords
	// Pattern breakdown:
	// - (for )(\d+) - captures "for " and damage number separately
	// - (crit|ARMOR PEN) - special combat keywords
	const parts = message.split(/(for \d+|crit|ARMOR PEN)/gi);

	return parts.map((part) => {
		// Highlight damage numbers (after "for") and keywords
		const isHighlight =
			/^for \d+$/i.test(part) || /^(crit|ARMOR PEN)$/i.test(part);
		return { text: part, highlight: isHighlight };
	});
}

function LogMessage({ message }: { message: string }) {
	const parts = formatLogMessage(message);
	return (
		<>
			{parts.map((part, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: static content from message parsing
					key={i}
					className={
						part.highlight ? "text-white font-bold" : "text-neutral-500"
					}
				>
					{part.text}
				</span>
			))}
		</>
	);
}

export function LogsCard() {
	const logs = useUIStore((state) => state.logs);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new logs are added
	const logsLength = logs.length;
	useEffect(() => {
		// Re-run when logsLength changes
		if (logsLength > 0 && scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logsLength]);

	return (
		<Card className="w-[512px] h-48 p-2" transparent>
			{/* Inner recessed chat area */}
			<div
				className="relative h-full rounded bg-black/50"
				style={{
					boxShadow:
						"inset 0 2px 4px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(0,0,0,0.3)",
				}}
			>
				{/* Top fade for depth */}
				<div
					className="absolute top-0 left-0 right-0 h-4 rounded-t pointer-events-none z-10"
					style={{
						background:
							"linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)",
					}}
				/>
				{/* Scrollable content */}
				<div
					ref={scrollRef}
					className="h-full overflow-y-auto px-2 py-1 text-[10px] font-mono scrollbar-hidden"
				>
					{logs.map((log) => (
						<div key={log.id} className="leading-relaxed">
							<LogMessage message={log.message} />
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}
