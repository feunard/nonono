/**
 * Chat bubble messages for various game events.
 * Each category contains an array of possible messages.
 * One message is randomly selected when shown.
 */
export const CHAT_MESSAGES = {
	gameStart: [
		"Here we go again...",
		"What a beautiful day!",
		"Time to hunt some orcs.",
		"Another day, another battle.",
		"Let's do this!",
		"Ready for action!",
	],
	orcKill: [
		"Too easy!",
		"Next!",
		"Is that all?",
		"Pathetic.",
		"Another one bites the dust!",
		"You call that a fight?",
		"Sweet dreams!",
		"Rest in pieces!",
		"Get rekt!",
		"Back to the shadow!",
	],
	lowHealth: [
		"That hurt!",
		"I need to be careful...",
		"Close call!",
		"Ouch!",
		"Not good...",
	],
	powerPickup: [
		"Nice!",
		"I feel stronger.",
		"This will help.",
		"Power up!",
		"Excellent!",
	],
	waveStart: [
		"Here they come again...",
		"More orcs? Bring it on!",
		"They keep coming...",
		"Another wave approaches...",
		"Is that all you've got?",
	],
} as const;

export type ChatMessageCategory = keyof typeof CHAT_MESSAGES;

/**
 * Get a random message from a category.
 */
export function getRandomMessage(category: ChatMessageCategory): string {
	const messages = CHAT_MESSAGES[category];
	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random message from a custom array.
 */
export function getRandomMessageFromArray(messages: readonly string[]): string {
	return messages[Math.floor(Math.random() * messages.length)];
}
