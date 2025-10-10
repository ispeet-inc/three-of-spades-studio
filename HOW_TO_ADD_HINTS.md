# How to Add Hints

Add contextual hints that appear during gameplay to help new players.

## 1. Add Hint Config

**File**: `src/hooks/useHintSystem.ts`

```typescript
const HINT_CONFIG = {
  // ... existing hints
  "your-hint-id": {
    maxShows: 3, // How many times to show
    content: "Your helpful hint text",
  },
} as const;
```

## 2. Add Hint to Game

**File**: `src/components/game/GameBoard.tsx`

```typescript
// Import (already exists)
import { useHintSystem } from "@/hooks/useHintSystem";

// Add hook (already exists)
const { shouldShowHint, markHintShown, getHintContent } = useHintSystem();

// Add your hint JSX
{(() => {
  const shouldShow =
    gameProgress.stage === GameStages.YOUR_STAGE &&
    shouldShowHint("your-hint-id");
  return shouldShow;
})() && (
  <div className="absolute top-20 right-6 z-50">
    <HintTooltip
      content={getHintContent("your-hint-id")}
      position="left"
      visible={true}
      onDismiss={() => markHintShown("your-hint-id")}
    />
  </div>
)}
```

## Common Triggers

```typescript
// Game stage
gameProgress.stage === GameStages.BIDDING;
gameProgress.stage === GameStages.PLAYING;

// Player's turn
tableState.turn === FIRST_PLAYER_ID;

// First time only
gameProgress.trick === 1;

// Player can act
canPlayerBid && !isObserver;
```

## Positioning

```typescript
// Top: bottom-20 left-1/2 transform -translate-x-1/2
// Bottom: bottom-20 left-1/2 transform -translate-x-1/2
// Left: top-20 right-6
// Right: top-20 left-6
// Center: top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
```

## Test

1. Enable Helper Mode in Settings
2. Start new game (resets hints)
3. Trigger your condition
4. Hint should appear with X button to dismiss

## Example: First Trick Hint

**Config:**

```typescript
"first-trick": {
  maxShows: 1,
  content: "This is your first trick - play any card!",
},
```

**Usage:**

```typescript
{(() => {
  const shouldShow =
    gameProgress.stage === GameStages.PLAYING &&
    gameProgress.trick === 1 &&
    shouldShowHint("first-trick");
  return shouldShow;
})() && (
  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
    <HintTooltip
      content={getHintContent("first-trick")}
      position="top"
      visible={true}
      onDismiss={() => markHintShown("first-trick")}
    />
  </div>
)}
```
