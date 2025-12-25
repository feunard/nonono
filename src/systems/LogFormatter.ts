// LogFormatter.ts - Convert structured log events to human-readable text

import type { GameEvent } from "./LogSystem";

/**
 * Format a game event into a human-readable string for UI display.
 * Used to convert structured LogSystem events into friendly text.
 */
export function formatLogEvent(event: GameEvent): string {
	switch (event.type) {
		case "game_start":
			return event.data.seed
				? `Game started (seed: ${event.data.seed})`
				: "Game started";

		case "wave_start":
			return `Wave ${event.data.wave} started (${event.data.orcsToSpawn} foes)`;

		case "wave_end":
			return `Wave ${event.data.wave} completed`;

		case "foe_spawn":
			return `${event.data.foeType} spawned`;

		case "foe_kill": {
			const { foeType, killedBy, finalBlow } = event.data;
			const source =
				killedBy === "hero_arrow"
					? "arrow"
					: killedBy === "hero_melee"
						? "melee"
						: killedBy === "hero_riposte"
							? "riposte"
							: "";
			const critText = finalBlow.isCritical ? " (crit)" : "";
			return `${foeType} killed${source ? ` by ${source}` : ""}${critText}`;
		}

		case "damage_dealt": {
			const { targetFoeType, damage, isCritical, source, wasDodged } =
				event.data;
			if (wasDodged) {
				return `Attack dodged by ${targetFoeType}`;
			}
			const critText = isCritical ? " crit" : "";
			return `${damage}${critText} damage to ${targetFoeType} [${source}]`;
		}

		case "damage_received": {
			const { sourceFoeType, finalDamage, wasDodged } = event.data;
			if (wasDodged) {
				return `Dodged attack from ${sourceFoeType}`;
			}
			return `Took ${finalDamage} damage from ${sourceFoeType}`;
		}

		case "power_pickup":
			return `Picked up: ${event.data.powerName}`;

		case "hero_death": {
			const { wave, kills, survivalTime } = event.data.finalStats;
			const mins = Math.floor(survivalTime / 60);
			const secs = survivalTime % 60;
			return `Hero died on wave ${wave} with ${kills} kills (${mins}:${secs.toString().padStart(2, "0")})`;
		}

		case "hero_level_up":
			return `Level up! Now level ${event.data.newLevel}`;

		case "loot_drop":
			return `Loot dropped from ${event.data.fromFoeType}`;

		case "loot_pickup":
			return "Picked up loot bag";

		default:
			return "Unknown event";
	}
}

/**
 * Format multiple events into an array of human-readable strings.
 */
export function formatLogEvents(events: GameEvent[]): string[] {
	return events.map(formatLogEvent);
}
