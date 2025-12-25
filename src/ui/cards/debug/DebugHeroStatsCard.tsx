import { GAME_CONFIG } from "../../../config/GameConfig";
import { useGameStore } from "../../../stores/gameStore";
import {
	calculateAttacksPerSecond,
	calculateDPS,
	getAgilityModifier,
	getStrengthModifier,
	STAT_CAPS,
} from "../../../systems/calculations";
import { Card } from "../../primitives/Card";

type DebugRowProps = {
	label: string;
	value: string | number;
	dim?: boolean;
};

function DebugRow({ label, value, dim }: DebugRowProps) {
	return (
		<div className="flex items-center justify-between gap-4 text-xs">
			<span className="text-neutral-500">{label}</span>
			<span
				className={`font-mono tabular-nums ${dim ? "text-neutral-500" : "text-white"}`}
			>
				{value}
			</span>
		</div>
	);
}

function Divider() {
	return <div className="border-t border-neutral-700 my-1" />;
}

export function DebugHeroStatsCard() {
	const bonusStats = useGameStore((state) => state.bonusStats);

	// Total stats (capped)
	const totalAgility = Math.min(
		GAME_CONFIG.hero.agility + bonusStats.agility,
		STAT_CAPS.agility,
	);
	const totalStrength = Math.min(
		GAME_CONFIG.hero.strength + bonusStats.strength,
		STAT_CAPS.default,
	);
	const totalCrit = Math.min(
		GAME_CONFIG.hero.critical + bonusStats.critical,
		100,
	);
	const totalLuck = Math.min(GAME_CONFIG.hero.luck + bonusStats.luck, 100);
	const totalMoveSpeed = GAME_CONFIG.hero.moveSpeed + bonusStats.moveSpeed;
	const totalBowRange = GAME_CONFIG.hero.bow.range + bonusStats.bowRange;
	const totalMaxHealth = GAME_CONFIG.hero.health + bonusStats.health;

	// Modifiers
	const agilityMod = getAgilityModifier(totalAgility);
	const strengthMod = getStrengthModifier(totalStrength);

	// Crit multiplier (base 2x + bonus)
	const critMultiplier = 2 + bonusStats.critMultiplier;

	// Damage multiplier (1 + bonus)
	const damageMultiplier = 1 + bonusStats.damageMultiplier;

	// Bow calculations
	const bowInterval = GAME_CONFIG.hero.bow.interval * agilityMod;
	const bowBaseDamage = Math.floor(GAME_CONFIG.hero.bow.damage * strengthMod);
	const bowDamage = Math.floor(bowBaseDamage * damageMultiplier);
	const bowCritDamage = Math.floor(bowDamage * critMultiplier);
	const bowAPS = calculateAttacksPerSecond(bowInterval);
	const bowDPS = calculateDPS(bowDamage, bowInterval);

	// Sword calculations
	const swordInterval = GAME_CONFIG.hero.sword.interval * agilityMod;
	const swordBaseDamage = Math.floor(
		GAME_CONFIG.hero.sword.damage * strengthMod,
	);
	const swordDamage = Math.floor(swordBaseDamage * damageMultiplier);
	const swordCritDamage = Math.floor(swordDamage * critMultiplier);
	const swordAPS = calculateAttacksPerSecond(swordInterval);
	const swordDPS = calculateDPS(swordDamage, swordInterval);

	// Defensive stats (base + bonus, capped at 100)
	const totalDodge = Math.min(GAME_CONFIG.hero.dodge + bonusStats.dodge, 100);
	const totalArmor = Math.min(GAME_CONFIG.hero.armor + bonusStats.armor, 100);

	// Offensive stats
	const totalAccuracy = GAME_CONFIG.hero.accuracy + bonusStats.accuracy;
	const totalPiercing = GAME_CONFIG.hero.piercing + bonusStats.piercing;

	return (
		<Card className="px-3 py-2 w-fit self-end border-dashed">
			<div className="flex flex-col gap-0.5">
				<div className="text-neutral-500 text-[10px] uppercase tracking-wider mb-1">
					Debug Stats
				</div>

				{/* Core Stats */}
				<DebugRow label="Max HP" value={totalMaxHealth} />
				<DebugRow label="Move Spd" value={totalMoveSpeed} />
				<DebugRow label="Bow Range" value={`${totalBowRange} tiles`} />
				<DebugRow label="Luck" value={`${totalLuck}%`} />

				<Divider />

				{/* Base Modifiers */}
				<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
					Modifiers
				</div>
				<DebugRow label="Agi Mod" value={agilityMod.toFixed(4)} dim />
				<DebugRow label="Str Mod" value={`${strengthMod.toFixed(3)}x`} dim />
				<DebugRow
					label="Total Agi"
					value={`${totalAgility} / ${STAT_CAPS.agility}`}
					dim
				/>
				<DebugRow
					label="Total Str"
					value={`${totalStrength} / ${STAT_CAPS.default}`}
					dim
				/>
				<DebugRow label="Crit %" value={`${totalCrit}%`} dim />

				<Divider />

				{/* Offensive Stats */}
				<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
					Offensive
				</div>
				<DebugRow label="Crit Mult" value={`${critMultiplier.toFixed(2)}x`} />
				<DebugRow
					label="Dmg Mult"
					value={`${(damageMultiplier * 100).toFixed(0)}%`}
				/>
				<DebugRow label="Accuracy" value={totalAccuracy} />
				<DebugRow label="Piercing" value={totalPiercing} />
				<DebugRow
					label="Armor Pen"
					value={
						totalStrength > 100
							? `${((totalStrength - 100) * 0.1).toFixed(1)}%`
							: "0%"
					}
				/>

				<Divider />

				{/* Defensive Stats */}
				<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
					Defensive
				</div>
				<DebugRow label="Dodge" value={`${totalDodge}%`} />
				<DebugRow label="Armor" value={`${totalArmor}%`} />
				<DebugRow
					label="HP Regen"
					value={`${bonusStats.hpRegen.toFixed(2)}/s`}
				/>

				<Divider />

				{/* Bow Stats */}
				<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
					Bow
				</div>
				<DebugRow label="Interval" value={`${Math.round(bowInterval)}ms`} />
				<DebugRow
					label="Damage"
					value={`${bowDamage} (${bowCritDamage} crit)`}
				/>
				<DebugRow label="Atk/sec" value={bowAPS.toFixed(1)} />
				<DebugRow label="DPS" value={Math.round(bowDPS)} />

				<Divider />

				{/* Sword Stats */}
				<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
					Sword
				</div>
				<DebugRow label="Interval" value={`${Math.round(swordInterval)}ms`} />
				<DebugRow
					label="Damage"
					value={`${swordDamage} (${swordCritDamage} crit)`}
				/>
				<DebugRow label="Atk/sec" value={swordAPS.toFixed(1)} />
				<DebugRow label="DPS" value={Math.round(swordDPS)} />

				{/* Arrow Powers */}
				{(bonusStats.arrowCount > 0 ||
					bonusStats.arrowPierce > 0 ||
					bonusStats.arrowBounce > 0 ||
					bonusStats.arrowHoming > 0 ||
					bonusStats.arrowExplosive > 0) && (
					<>
						<Divider />
						<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
							Arrow
						</div>
						{bonusStats.arrowCount > 0 && (
							<DebugRow label="Arrows" value={`${1 + bonusStats.arrowCount}`} />
						)}
						{bonusStats.arrowPierce > 0 && (
							<DebugRow
								label="Pierce"
								value={
									bonusStats.arrowPierce >= 99 ? "∞" : bonusStats.arrowPierce
								}
							/>
						)}
						{bonusStats.arrowBounce > 0 && (
							<DebugRow label="Bounce" value={bonusStats.arrowBounce} />
						)}
						{bonusStats.arrowHoming > 0 && (
							<DebugRow label="Homing" value={bonusStats.arrowHoming} />
						)}
						{bonusStats.arrowExplosive > 0 && (
							<DebugRow
								label="Explosive"
								value={`${bonusStats.arrowExplosive}px`}
							/>
						)}
					</>
				)}

				{/* Sword Powers */}
				{(bonusStats.swordCleave > 0 ||
					bonusStats.swordAttackSpeed > 0 ||
					bonusStats.riposteChance > 0 ||
					bonusStats.executeThreshold > 0 ||
					bonusStats.vorpalChance > 0) && (
					<>
						<Divider />
						<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
							Sword Powers
						</div>
						{bonusStats.swordCleave > 0 && (
							<DebugRow label="Cleave" value="On" />
						)}
						{bonusStats.swordAttackSpeed > 0 && (
							<DebugRow
								label="Atk Spd"
								value={`+${(bonusStats.swordAttackSpeed * 100).toFixed(0)}%`}
							/>
						)}
						{bonusStats.riposteChance > 0 && (
							<DebugRow
								label="Riposte"
								value={`${(bonusStats.riposteChance * 100).toFixed(0)}%`}
							/>
						)}
						{bonusStats.executeThreshold > 0 && (
							<DebugRow
								label="Execute"
								value={`<${(bonusStats.executeThreshold * 100).toFixed(0)}% HP`}
							/>
						)}
						{bonusStats.vorpalChance > 0 && (
							<DebugRow
								label="Vorpal"
								value={`${(bonusStats.vorpalChance * 100).toFixed(0)}%`}
							/>
						)}
					</>
				)}

				{/* Lifesteal */}
				{bonusStats.lifesteal > 0 && (
					<>
						<Divider />
						<div className="text-neutral-400 text-[10px] uppercase tracking-wider">
							On-Hit
						</div>
						<DebugRow
							label="Lifesteal"
							value={`${(bonusStats.lifesteal * 100).toFixed(0)}%`}
						/>
					</>
				)}
			</div>
		</Card>
	);
}
