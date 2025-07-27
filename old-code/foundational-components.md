# Foundational Components Guide

This document describes the atomic and foundational UI components for Three of Spades, their design, color palette usage, and how they are used to build the main game components described in `game-redesign.md`.

---

## Color Palette for Components

| Color Name      | Hex      | Usage Example                |
|----------------|----------|------------------------------|
| Table Green    | #184D47  | Modal backgrounds, panels    |
| Gold           | #FFD700  | Primary buttons, highlights  |
| Cream          | #F8F5E4  | Card faces, modal backgrounds, text |
| Jet Black      | #232323  | Text, icons, outlines        |
| Royal Blue     | #3A6EA5  | Secondary buttons, Team 2    |
| Crimson Red    | #D7263D  | Danger, pass, hearts/diamonds|
| Emerald Green  | #21A179  | Success, clubs, active       |
| Warm Orange    | #FFB347  | Bid increments, secondary    |
| Light Gray     | #E0E0E0  | Borders, disabled, chips     |

---

## 1. Button
**Description:** Reusable button for all actions (bidding, play, pass, modals, etc.)

**Key Props/Variants:**
- `variant`: primary (gold), secondary (blue/orange), danger (red), disabled
- `size`: small, medium, large
- `icon`: optional icon
- `fullWidth`: boolean

**Color Usage:**
- Primary: Gold background, Jet Black text
- Secondary: Royal Blue or Warm Orange background, Cream text
- Danger: Crimson Red background, Cream text
- Disabled: Light Gray background, Jet Black text

**Example Usage:**
- BiddingModal: Bid, Pass, Custom Bid buttons
- Game Over: New Game button
- Bidding Complete: Let's Begin button

---

## 2. Modal/Dialog
**Description:** Generic modal for overlays (bidding, round summary, game over, etc.)

**Key Props/Variants:**
- `title`: modal title
- `children`: modal content
- `actions`: array of Button components
- `onClose`: close handler
- `size`: small, medium, large

**Color Usage:**
- Background: Table Green or Cream
- Title: Gold or Jet Black
- Border/shadow: Light Gray

**Example Usage:**
- Wraps BiddingModal, TrumpSelectionModal, BidResultModal, RoundSummary, GameSummary, Bidding Complete

---

## 3. Chip/Badge
**Description:** Small, colored label for status, team, bid, trump, etc.

**Key Props/Variants:**
- `color`: gold, blue, red, green, gray
- `icon`: optional (e.g., suit, check, cross)
- `label`: text

**Color Usage:**
- Team 1: Gold
- Team 2: Royal Blue
- Status: Emerald Green (active), Crimson Red (passed), Light Gray (disabled)
- Bid: Gold

**Example Usage:**
- TeamInfo: team badges
- BiddingModal: player status, bid chips
- GameHeader: trump suit, round

---

## 4. Avatar
**Description:** Player/bot representation (initials, image, or icon)

**Key Props/Variants:**
- `name`: for initials
- `image`: optional
- `size`: small, medium, large
- `highlight`: boolean (e.g., current player)

**Color Usage:**
- Background: Gold (user), Royal Blue (bot/team 2), Light Gray (default)
- Border: Gold or Emerald Green for highlight

**Example Usage:**
- PlayerHandUI, PlayerPanel, BiddingModal, RoundSummary, GameSummary

---

## 5. Card
**Description:** Renders a playing card (face up, back, mini, etc.)

**Key Props/Variants:**
- `suit`, `rank`
- `faceUp`: boolean
- `selected`: boolean
- `glow`: boolean (for highlight)
- `mini`: boolean (for small display)

**Color Usage:**
- Face: Cream
- Spades/Clubs: Jet Black
- Hearts/Diamonds: Crimson Red
- Glow: Gold or Emerald Green
- Back: Table Green or custom pattern

**Example Usage:**
- PlayerHandUI, Trick Area, Teammate Card, BiddingModal, RoundSummary

---

## 6. ActionBar
**Description:** Groups action buttons (bidding, play, pass, etc.)

**Key Props/Variants:**
- `actions`: array of Button components
- `orientation`: horizontal/vertical
- `disabled`: boolean

**Color Usage:**
- Background: Transparent or Table Green
- Button colors as above

**Example Usage:**
- BiddingModal, Trick Area, Game Over, Bidding Complete

---

## 7. Timer/Progress
**Description:** Countdown or progress indicator (bidding, turn timer)

**Key Props/Variants:**
- `value`, `max`
- `type`: circular, bar
- `color`: Emerald Green (active), Crimson Red (warning)

**Color Usage:**
- Active: Emerald Green
- Warning: Crimson Red
- Background: Light Gray

**Example Usage:**
- BiddingModal, PlayerPanel, GameHeader

---

## 8. Scoreboard
**Description:** Displays team scores, bid, trump, round info

**Key Props/Variants:**
- `teams`, `scores`, `currentBid`, `trump`, `round`

**Color Usage:**
- Team 1: Gold
- Team 2: Royal Blue
- Bid: Gold
- Trump: Crimson Red or Emerald Green
- Background: Table Green

**Example Usage:**
- GameHeader, top of Main Game Table

---

## 9. PlayerPanel
**Description:** Encapsulates a player's hand, avatar, name, and status

**Key Props/Variants:**
- `name`, `avatar`, `cardsLeft`, `status`, `isCurrent`, `hand`

**Color Usage:**
- Background: Table Green or Light Gray
- Highlight: Gold (current player)
- Status: Chip/Badge colors

**Example Usage:**
- PlayerHandUI, bot areas, RoundSummary, BiddingModal

---

## 10. CardList
**Description:** Renders a list of Card components in a row (or grid), with spacing, optional hover/zoom effect, and selection support. Used for displaying a player's hand, teammate card selection, trick area, or any group of cards.

**Key Props/Variants:**
- `cards`: array of card objects (with suit, rank, etc.)
- `selectedCardId`: id or index of the selected card (optional)
- `onCardClick`: function called when a card is clicked (optional)
- `hoverZoom`: boolean (enables zoom on hover)
- `selectable`: boolean (enables selection highlight)
- `className`: additional classNames
- `cardProps`: extra props to pass to each Card

**Color Usage:**
- Card faces, suits, and highlights use the color palette (via Card component)
- Selection/hover highlight: Gold or Emerald Green border/shadow
- Background: transparent or inherited

**Example Usage:**
- User hand in Main Game Table or TrumpSelectionModal
- Teammate card selection in TrumpSelectionModal
- Trick area (played cards)

---

## CardList vs PlayerPanel

- **CardList** is a low-level, reusable component for rendering a group of cards with interactive features (hover, select, click, etc.).
- **PlayerPanel** is a higher-level component that represents a player area, which may include:
  - Player name, avatar, status (using Avatar, Chip, etc.)
  - CardList (for the player's hand or played cards)
  - Other player-specific info (score, current turn highlight, etc.)

**Conclusion:**
- **PlayerPanel** is still useful for encapsulating all player-related UI, but it should use **CardList** for rendering the player's hand or cards.
- This separation keeps CardList focused and reusable, while PlayerPanel handles layout and player context.

---

## How These Components Are Used in Main Game Components

- **StartScreen:** Uses Button, Modal (for overlays), Avatar (if showing user), Card (animated 3 of Spades)
- **BiddingModal:** Uses Modal, Card, Chip/Badge (status), ActionBar (bid actions), Timer, Avatar
- **Main Game Table:** Uses Scoreboard, PlayerPanel (for each player/bot), Card, ActionBar (for play/pass), Chip/Badge (team info)
- **RoundSummary/GameSummary:** Uses Modal, Card, Avatar, Chip/Badge (winner), Button (next/continue)
- **Bidding Complete:** Uses Modal, Chip/Badge (bid/trump), Avatar (winner), Button (let's begin)
- **Game Over:** Uses Modal, Scoreboard, Chip/Badge (winner), Button (new game)

---

## Refactoring & Design System Guidance
- Refactor existing components to use these foundational components for consistency and maintainability.
- Document all props and variants in your design system or README.
- Use the color palette consistently for all foundational components.
- In Figma, create matching components for designers.
- Update `game-redesign.md` to reference these foundational components in the visual mockups and descriptions for each page/component. 