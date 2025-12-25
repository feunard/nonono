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
			return `Wave ${event.data.wave} started (${event.data.orcsToSpawn} orcs)`;

		case "wave_end":
			return `Wave ${event.data.wave} completed`;

		case "orc_spawn":
			return `Orc #${event.data.orcId} (L${event.data.level}) spawned`;

		case "orc_kill": {
			const { orcId, level, killedBy, finalBlow } = event.data;
			const source =
				killedBy === "hero_arrow"
					? "arrow"
					: killedBy === "hero_melee"
						? "melee"
						: killedBy === "hero_riposte"
							? "riposte"
							: "";
			const critText = finalBlow.isCritical ? " (crit)" : "";
			return `Orc #${orcId} (L${level}) killed${source ? ` by ${source}` : ""}${critText}`;
		}

		case "damage_dealt": {
			const { targetId, targetLevel, damage, isCritical, source, wasDodged } =
				event.data;
			if (wasDodged) {
				return `Attack dodged by Orc #${targetId} (L${targetLevel})`;
			}
			const critText = isCritical ? " crit" : "";
			return `${damage}${critText} damage to Orc #${targetId} (L${targetLevel}) [${source}]`;
		}

		case "damage_received": {
			const { sourceId, sourceLevel, finalDamage, wasDodged } = event.data;
			if (wasDodged) {
				return `Dodged attack from Orc #${sourceId} (L${sourceLevel})`;
			}
			return `Took ${finalDamage} damage from Orc #${sourceId} (L${sourceLevel})`;
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
			return `Loot dropped from Orc #${event.data.fromOrcId} (L${event.data.fromOrcLevel})`;

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
