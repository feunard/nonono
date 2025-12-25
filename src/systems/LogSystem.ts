// LogSystem.ts - Comprehensive game event logging for replay analysis
// Logs are stored as JSON lines for easy parsing

import type { Power } from "../config/PowersConfig";
import type { BonusStats } from "../stores/gameStore";

// ==========================================
// Event Types
// ==========================================

type BaseEvent = {
	id: number;
	timestamp: number; // Game time in ms since start
	realTimestamp: number; // Real wall clock time (Date.now())
};

type GameStartEvent = BaseEvent & {
	type: "game_start";
	data: {
		seed?: number;
	};
};

type WaveStartEvent = BaseEvent & {
	type: "wave_start";
	data: {
		wave: number;
		orcsToSpawn: number;
	};
};

type WaveEndEvent = BaseEvent & {
	type: "wave_end";
	data: {
		wave: number;
	};
};

type OrcSpawnEvent = BaseEvent & {
	type: "orc_spawn";
	data: {
		orcId: number;
		level: number;
		health: number;
		maxHealth: number;
		damage: number;
		armor: number;
		dodge: number;
		speed: number;
		x: number;
		y: number;
	};
};

type OrcKillEvent = BaseEvent & {
	type: "orc_kill";
	data: {
		orcId: number;
		level: number;
		killedBy: "hero_melee" | "hero_arrow" | "hero_riposte" | "unknown";
		finalBlow: {
			damage: number;
			isCritical: boolean;
		};
	};
};

type DamageDealtEvent = BaseEvent & {
	type: "damage_dealt";
	data: {
		targetType: "orc";
		targetId: number;
		targetLevel: number;
		damage: number;
		isCritical: boolean;
		source: "arrow" | "melee" | "riposte" | "cleave";
		wasDodged: boolean;
	};
};

type DamageReceivedEvent = BaseEvent & {
	type: "damage_received";
	data: {
		sourceType: "orc";
		sourceId: number;
		sourceLevel: number;
		rawDamage: number;
		finalDamage: number;
		wasDodged: boolean;
		armorReduction: number;
	};
};

type PowerPickupEvent = BaseEvent & {
	type: "power_pickup";
	data: {
		powerId: string;
		powerName: string;
		rank: string;
		stat: string;
		value: number;
	};
};

type HeroDeathEvent = BaseEvent & {
	type: "hero_death";
	data: {
		cause: "orc_melee";
		killerOrcId?: number;
		killerOrcLevel?: number;
		finalStats: {
			health: number;
			maxHealth: number;
			kills: number;
			wave: number;
			survivalTime: number;
			bonusStats: BonusStats;
			powersCollected: number;
		};
	};
};

type HeroLevelUpEvent = BaseEvent & {
	type: "hero_level_up";
	data: {
		newLevel: number;
		totalKills: number;
	};
};

type LootDropEvent = BaseEvent & {
	type: "loot_drop";
	data: {
		x: number;
		y: number;
		fromOrcId: number;
		fromOrcLevel: number;
	};
};

type LootPickupEvent = BaseEvent & {
	type: "loot_pickup";
	data: {
		x: number;
		y: number;
	};
};

type GameEvent =
	| GameStartEvent
	| WaveStartEvent
	| WaveEndEvent
	| OrcSpawnEvent
	| OrcKillEvent
	| DamageDealtEvent
	| DamageReceivedEvent
	| PowerPickupEvent
	| HeroDeathEvent
	| HeroLevelUpEvent
	| LootDropEvent
	| LootPickupEvent;

// ==========================================
// LogSystem Class
// ==========================================

class LogSystemClass {
	private events: GameEvent[] = [];
	private eventIdCounter = 0;
	private gameStartTime = 0;
	private static orcIdCounter = 0;

	// Reset for new game
	reset(): void {
		this.events = [];
		this.eventIdCounter = 0;
		this.gameStartTime = Date.now();
		LogSystemClass.orcIdCounter = 0;
	}

	// Get next unique orc ID
	getNextOrcId(): number {
		return ++LogSystemClass.orcIdCounter;
	}

	// Get current game time in ms
	private getGameTime(): number {
		return Date.now() - this.gameStartTime;
	}

	// Create base event properties
	private createBaseEvent(): BaseEvent {
		return {
			id: ++this.eventIdCounter,
			timestamp: this.getGameTime(),
			realTimestamp: Date.now(),
		};
	}

	// ==========================================
	// Event Logging Methods
	// ==========================================

	logGameStart(seed?: number): void {
		const event: GameStartEvent = {
			...this.createBaseEvent(),
			type: "game_start",
			data: { seed },
		};
		this.events.push(event);
	}

	logWaveStart(wave: number, orcsToSpawn: number): void {
		const event: WaveStartEvent = {
			...this.createBaseEvent(),
			type: "wave_start",
			data: { wave, orcsToSpawn },
		};
		this.events.push(event);
	}

	logWaveEnd(wave: number): void {
		const event: WaveEndEvent = {
			...this.createBaseEvent(),
			type: "wave_end",
			data: { wave },
		};
		this.events.push(event);
	}

	logOrcSpawn(
		orcId: number,
		level: number,
		health: number,
		maxHealth: number,
		damage: number,
		armor: number,
		dodge: number,
		speed: number,
		x: number,
		y: number,
	): void {
		const event: OrcSpawnEvent = {
			...this.createBaseEvent(),
			type: "orc_spawn",
			data: {
				orcId,
				level,
				health,
				maxHealth,
				damage,
				armor,
				dodge,
				speed,
				x: Math.round(x),
				y: Math.round(y),
			},
		};
		this.events.push(event);
	}

	logOrcKill(
		orcId: number,
		level: number,
		killedBy: "hero_melee" | "hero_arrow" | "hero_riposte" | "unknown",
		damage: number,
		isCritical: boolean,
	): void {
		const event: OrcKillEvent = {
			...this.createBaseEvent(),
			type: "orc_kill",
			data: {
				orcId,
				level,
				killedBy,
				finalBlow: { damage, isCritical },
			},
		};
		this.events.push(event);
	}

	logDamageDealt(
		targetId: number,
		targetLevel: number,
		damage: number,
		isCritical: boolean,
		source: "arrow" | "melee" | "riposte" | "cleave",
		wasDodged: boolean,
	): void {
		const event: DamageDealtEvent = {
			...this.createBaseEvent(),
			type: "damage_dealt",
			data: {
				targetType: "orc",
				targetId,
				targetLevel,
				damage,
				isCritical,
				source,
				wasDodged,
			},
		};
		this.events.push(event);
	}

	logDamageReceived(
		sourceId: number,
		sourceLevel: number,
		rawDamage: number,
		finalDamage: number,
		wasDodged: boolean,
		armorReduction: number,
	): void {
		const event: DamageReceivedEvent = {
			...this.createBaseEvent(),
			type: "damage_received",
			data: {
				sourceType: "orc",
				sourceId,
				sourceLevel,
				rawDamage,
				finalDamage,
				wasDodged,
				armorReduction,
			},
		};
		this.events.push(event);
	}

	logPowerPickup(power: Power): void {
		const event: PowerPickupEvent = {
			...this.createBaseEvent(),
			type: "power_pickup",
			data: {
				powerId: power.id,
				powerName: power.name,
				rank: power.rank,
				stat: power.effect.stat,
				value: power.effect.value,
			},
		};
		this.events.push(event);
	}

	logHeroDeath(
		killerOrcId: number | undefined,
		killerOrcLevel: number | undefined,
		health: number,
		maxHealth: number,
		kills: number,
		wave: number,
		survivalTime: number,
		bonusStats: BonusStats,
		powersCollected: number,
	): void {
		const event: HeroDeathEvent = {
			...this.createBaseEvent(),
			type: "hero_death",
			data: {
				cause: "orc_melee",
				killerOrcId,
				killerOrcLevel,
				finalStats: {
					health,
					maxHealth,
					kills,
					wave,
					survivalTime,
					bonusStats,
					powersCollected,
				},
			},
		};
		this.events.push(event);
	}

	logLootDrop(
		x: number,
		y: number,
		fromOrcId: number,
		fromOrcLevel: number,
	): void {
		const event: LootDropEvent = {
			...this.createBaseEvent(),
			type: "loot_drop",
			data: {
				x: Math.round(x),
				y: Math.round(y),
				fromOrcId,
				fromOrcLevel,
			},
		};
		this.events.push(event);
	}

	logLootPickup(x: number, y: number): void {
		const event: LootPickupEvent = {
			...this.createBaseEvent(),
			type: "loot_pickup",
			data: {
				x: Math.round(x),
				y: Math.round(y),
			},
		};
		this.events.push(event);
	}

	// ==========================================
	// Export Methods
	// ==========================================

	// Get all events
	getEvents(): GameEvent[] {
		return [...this.events];
	}

	// Get event count
	getEventCount(): number {
		return this.events.length;
	}

	// Export as JSON lines (one JSON object per line)
	exportAsJsonLines(): string {
		return this.events.map((event) => JSON.stringify(event)).join("\n");
	}

	// Export and trigger download
	downloadLogs(): void {
		const content = this.exportAsJsonLines();
		const blob = new Blob([content], { type: "application/x-ndjson" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `game-log-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")}.jsonl`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}

// Singleton instance
export const LogSystem = new LogSystemClass();

// Export types for use elsewhere
export type { GameEvent, OrcSpawnEvent, OrcKillEvent, DamageDealtEvent };
