# UI Components

This document lists all UI cards and dialogs in the game. Each component has a brief explanation of what it does, how it works, and why it exists.

---

## Screens

Full-page screens that replace the entire view.

### LoadingScreen

- **What:** Shows loading spinner during game initialization
- **How:** Displayed while Phaser loads assets in BootScene
- **Why:** Provides visual feedback during asset loading
- **File:** `src/ui/LoadingScreen.tsx`

### LaunchScreen

- **What:** Title screen with game name and "Start Game" button
- **How:** Shown before game starts, removed when player presses Enter or clicks button
- **Why:** Entry point for the game, allows player to start when ready
- **File:** `src/ui/screens/LaunchScreen.tsx`

---

## Cards (HUD)

Cards are HUD elements visible during gameplay. They use the Card primitive for consistent styling.

### HealthBarCard

- **What:** Displays hero HP with visual progress bar
- **How:** Reads health/maxHealth from props, calculates percentage, shows pulsing animation at critical HP (<=25%)
- **Why:** Player needs to monitor health to survive
- **File:** `src/ui/cards/HealthBarCard.tsx`

### EnergyBarCard

- **What:** Displays sprint energy with visual progress bar
- **How:** Shows current/max energy, pulsing while sprinting, dimmed when below sprint threshold
- **Why:** Player needs to monitor energy for sprint timing
- **File:** `src/ui/cards/EnergyBarCard.tsx`

### GameStatsCard

- **What:** Shows current wave, orcs alive, total kills, and elapsed time
- **How:** Displays four Stat components in a horizontal row with dividers
- **Why:** Core gameplay metrics for player awareness
- **File:** `src/ui/cards/GameStatsCard.tsx`

### FPSCard

- **What:** Displays current frame rate
- **How:** Shows FPS value from Phaser's performance monitor
- **Why:** Performance monitoring for players
- **File:** `src/ui/cards/FPSCard.tsx`

### HeroStatsCard

- **What:** Lists all hero stats (health, speed, agility, strength, etc.)
- **How:** Reads base values from GameConfig and bonuses from gameStore, shows base + bonus format
- **Why:** Detailed stat visibility for build planning
- **File:** `src/ui/cards/HeroStatsCard.tsx`

### PowersCard

- **What:** Shows collected power hexagons with rank-colored borders
- **How:** Groups duplicate powers with count badges, shows tooltips on hover with power details, displays 4-5 per row
- **Why:** Visual inventory of acquired powers
- **File:** `src/ui/cards/PowersCard.tsx`

### BagCard

- **What:** Shows inventory bag count with hotkey hint
- **How:** Only renders when bagCount > 0, displays count badge and E hotkey
- **Why:** Indicates stored loot bags that can be opened
- **File:** `src/ui/cards/BagCard.tsx`

### MenuBarCard

- **What:** Pause/Resume button with Space hotkey
- **How:** Toggles between pause and play icons based on isPaused state
- **Why:** Quick access to pause functionality
- **File:** `src/ui/cards/MenuBarCard.tsx`

### ZoomControlCard

- **What:** Camera zoom level selector (3 levels)
- **How:** Three buttons with increasing magnifying glass sizes, highlights current zoom level
- **Why:** Allows player to adjust view distance
- **File:** `src/ui/cards/ZoomControlCard.tsx`

### LogsCard

- **What:** Combat log showing damage messages
- **How:** Scrollable list of log entries from gameStore, auto-scrolls to bottom on new entries
- **Why:** WoW-style combat feedback for damage dealt/received
- **File:** `src/ui/cards/LogsCard.tsx`

---

## Debug Cards

Cards only shown when debug mode is enabled (?debug=true or X key toggle).

### DebugHotkeysCard

- **What:** Reference list of debug hotkeys
- **How:** Static list of hotkey-action pairs, shows spawn pause status
- **Why:** Quick reference for debug commands
- **File:** `src/ui/cards/debug/DebugHotkeysCard.tsx`

### DebugHeroStatsCard

- **What:** Detailed calculated stats with modifiers and DPS breakdowns
- **How:** Computes all derived values (agility modifier, strength modifier, attack intervals, DPS, etc.)
- **Why:** Deep stat analysis for balancing and debugging
- **File:** `src/ui/cards/debug/DebugHeroStatsCard.tsx`

---

## Dialogs/Overlays

Modal dialogs that pause gameplay and require player interaction.

### PauseDialog

- **What:** Pause menu with Resume button
- **How:** Overlay with card, can be dismissed by clicking overlay or pressing Space
- **Why:** Standard pause functionality
- **File:** `src/ui/dialogs/PauseDialog.tsx`

### GameOverDialog

- **What:** Death screen showing final stats with Play Again and Export Logs buttons
- **How:** Shows survival time, kills, wave reached; Enter to restart, export button for log download
- **Why:** End-of-run summary and restart point
- **File:** `src/ui/dialogs/GameOverDialog.tsx`

### LootSelectionDialog

- **What:** Power selection screen with 3 power options
- **How:** Shows power cards with rank colors, prerequisites, hotkeys (1-3), Esc to cancel
- **Why:** Core progression mechanic for choosing powers
- **File:** `src/ui/dialogs/LootSelectionDialog.tsx`

---

## Debug Dialogs

### DebugPowerDialog

- **What:** Full power browser for testing
- **How:** Tabbed interface (Core/Offensive/Defensive/Arrow/Sword), shows all powers with current stacks, locked powers show lock icon with tooltip explaining requirements
- **Why:** Quick power testing without loot drops
- **File:** `src/ui/dialogs/debug/DebugPowerDialog.tsx`

---

## Container Component

### GameUI

- **What:** Main UI container that orchestrates all HUD elements and dialogs
- **How:** Positions cards in screen corners, conditionally renders dialogs based on game state
- **Why:** Central coordination of all UI components
- **File:** `src/ui/GameUI.tsx`

---

## Primitives

Reusable UI building blocks in `src/ui/primitives/`. These are not documented individually as they are implementation details:

- `Button.tsx` - Styled button component
- `Card.tsx` - Card container with variants
- `IconBox.tsx` - Icon wrapper with background
- `Kbd.tsx` - Keyboard key display
- `Overlay.tsx` - Modal backdrop
- `Stat.tsx` - Stat display with icon, label, value
- `Tooltip.tsx` - Hover tooltip
