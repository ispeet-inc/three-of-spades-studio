# Test Data Configuration

This directory contains test data for the HandTester component. You can easily edit these files to test different scenarios without modifying the component code.

## Files

### `testData.ts`

The main test data file containing sample hands and discarded cards.

## How to Edit Test Data

### 1. **Edit Existing Data**

Simply modify the arrays in `testData.ts`:

```typescript
// Change the sample hand
export const sampleHand: Card[] = [
  createCard("A", 0, 1, 14, 10), // Ace of Spades
  createCard("K", 0, 13, 13, 10), // King of Spades
  // Add more cards...
];

// Change the discarded cards
export const sampleDiscardedCards: Card[] = [
  createCard("2", 0, 2, 2, 0), // 2 of Spades
  // Add more cards...
];
```

### 2. **Use the Helper Function**

The `createCard()` function from `cardUtils` makes it easy to create cards:

```typescript
import { createCard } from "../utils/cardUtils";
import { Suite } from "../types/game";

createCard(suite, number);

// Parameters:
// suite: Suite - Use Suite.Spade, Suite.Heart, Suite.Club, or Suite.Diamond
// number: number - Card number (1-14, where 1=Ace, 11=Jack, 12=Queen, 13=King)
//
// The function automatically calculates:
// - id (A, K, Q, J, 10, 9, etc.)
// - rank (1-14, where 14=Ace is highest)
// - points (10 for A, K, Q, J, 10; 5 for 5; 30 for 3 of Spades; 0 for others)
// - positionValue (suite * 100 + rank)
// - hash (e.g., "A-of-spade")
```

### 3. **Quick Examples**

```typescript
// Create a high-value hand
export const highValueHand: Card[] = [
  createCard(Suite.Spade, 1), // Ace of Spades
  createCard(Suite.Spade, 13), // King of Spades
  createCard(Suite.Spade, 12), // Queen of Spades
  createCard(Suite.Spade, 11), // Jack of Spades
  createCard(Suite.Spade, 10), // 10 of Spades
];

// Create a mixed suite hand
export const mixedSuiteHand: Card[] = [
  createCard(Suite.Spade, 1), // Ace of Spades
  createCard(Suite.Heart, 13), // King of Hearts
  createCard(Suite.Club, 12), // Queen of Clubs
  createCard(Suite.Diamond, 11), // Jack of Diamonds
];
```

## Suite Reference

| Number | Suite   | Symbol |
| ------ | ------- | ------ |
| 0      | Spade   | ♠     |
| 1      | Heart   | ♥     |
| 2      | Club    | ♣     |
| 3      | Diamond | ♦     |

## Card Values

| Card | Number | Rank | Points |
| ---- | ------ | ---- | ------ |
| A    | 1      | 14   | 10     |
| K    | 13     | 13   | 10     |
| Q    | 12     | 12   | 10     |
| J    | 11     | 11   | 10     |
| 10   | 10     | 10   | 10     |
| 9    | 9      | 9    | 0      |
| 8    | 8      | 8    | 0      |
| ...  | ...    | ...  | 0      |
| 2    | 2      | 2    | 0      |

## Testing Workflow

1. **Edit** the data in `testData.ts`
2. **Save** the file
3. **Refresh** your browser or restart the dev server
4. **Click** the test data buttons in the UI to switch between different scenarios

## Tips

- **Keep it simple**: Start with a few cards to test basic functionality
- **Test edge cases**: Try hands with no point cards, all point cards, single suite, etc.
- **Use the helper**: The `createCard()` function prevents typos and ensures consistency
- **Comment your data**: Add comments to explain what you're testing

## Example Test Scenarios

### Empty Hand

```typescript
export const emptyHand: Card[] = [];
export const emptyDiscarded: Card[] = [];
```

### Single Suite Hand

```typescript
export const spadesOnly: Card[] = [
  createCard(Suite.Spade, 1),
  createCard(Suite.Spade, 13),
  createCard(Suite.Spade, 12),
];
```

### High Point Hand

```typescript
export const highPoints: Card[] = [
  createCard(Suite.Spade, 1),
  createCard(Suite.Heart, 1),
  createCard(Suite.Club, 1),
  createCard(Suite.Diamond, 1),
];
```
