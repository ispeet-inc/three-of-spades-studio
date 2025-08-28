# Multi-Game Foundation Implementation Plan

## 🎯 Overview

This document details the technical implementation plan for the multi-game foundation, including variable renaming for consistency, state management updates, and game flow modifications.

## 🔄 Phase 1: Variable Renaming for Consistency

### **Current "round" Variables to Rename**

**Files to update:**

- `src/types/game.ts`
- `src/store/gameSlice.ts`
- `src/store/gameSaga.ts`
- `src/store/sagas/gameFlowSaga.ts`
- `src/store/selectors.ts`
- `src/utils/gameUtils.ts`
- `src/utils/tableUtils.ts`
- `src/components/game/GameInfo.tsx`
- `src/components/game/CenterTable.tsx`
- `src/components/game/GameBoard.tsx`
- `src/agents/GreedyBot.ts`

### **Variable Mapping**

| Current Name           | New Name               | Description                        |
| ---------------------- | ---------------------- | ---------------------------------- |
| `roundWinner`          | `trickWinner`          | Winner of current trick            |
| `startNewRound`        | `startNewTrick`        | Start next trick                   |
| `totalRounds`          | `totalTricks`          | Total tricks per game              |
| `round`                | `trick`                | Current trick number               |
| `determineRoundWinner` | `determineTrickWinner` | Function to determine trick winner |
| `ROUND_COMPLETE`       | `TRICK_COMPLETE`       | Game stage for completed trick     |
| `ROUND_SUMMARY`        | `TRICK_SUMMARY`        | Game stage for trick summary       |

### **Implementation Steps**

#### **Step 1: Update Type Definitions**

```typescript
// src/types/game.ts
export interface TableState {
  runningSuite: Suite | null;
  tableCards: TableCard[];
  turn: number;
  trickWinner: TableCard | null; // renamed from roundWinner
  discardedCards: Card[];
}

export interface GameProgress {
  trick: number; // renamed from round
  scores: TeamScores;
  stage: GameStage;
}
```

#### **Step 2: Update Game Stages**

```typescript
// src/store/gameStages.ts
export const GameStages = {
  INIT: "INIT",
  DISTRIBUTE_CARDS: "DISTRIBUTE_CARDS",
  BIDDING: "BIDDING",
  BIDDING_COMPLETE: "BIDDING_COMPLETE",
  TRUMP_SELECTION: "TRUMP_SELECTION",
  TRUMP_SELECTION_COMPLETE: "TRUMP_SELECTION_COMPLETE",
  PLAYING: "PLAYING",
  CARDS_DISPLAY: "CARDS_DISPLAY",
  TRICK_COMPLETE: "TRICK_COMPLETE", // renamed from ROUND_COMPLETE
  TRICK_SUMMARY: "TRICK_SUMMARY", // renamed from ROUND_SUMMARY
  GAME_OVER: "GAME_OVER",
  // NEW: Multi-game stages
  GAME_SUMMARY: "GAME_SUMMARY",
  SERIES_COMPLETE: "SERIES_COMPLETE",
  SERIES_SUMMARY: "SERIES_SUMMARY", // ADDED: Missing stage for series completion
} as const;
```

#### **Step 3: Update Game Slice**

```typescript
// src/store/gameSlice.ts
const initialState: GameState = {
  // ... existing fields
  gameProgress: {
    stage: GameStages.INIT,
    trick: 0, // renamed from round
    scores: { team1: 0, team2: 0 },
  },
  // ... rest of state
};

// Update actions
startNewTrick: state => { // renamed from startNewRound
  console.log(
    "GAME: Starting new trick, previous winner:",
    state.tableState.trickWinner?.player // renamed from roundWinner
  );

  state.tableState = newTrickOnTable(state.tableState); // renamed function
  state.gameProgress.trick = state.gameProgress.trick + 1; // renamed from round
},

// Update game completion logic
if (state.gameProgress.trick >= state.gameConfig.totalTricks) { // renamed from totalRounds
  state.gameProgress.stage = GameStages.TRICK_COMPLETE; // renamed from ROUND_COMPLETE
}
```

#### **Step 4: Update Utility Functions**

```typescript
// src/utils/gameUtils.ts
export const determineTrickWinner = (
  // renamed from determineRoundWinner
  tableCards: TableCard[],
  trumpSuite: number | null
): TableCard => {
  // ... existing logic
};

// src/utils/tableUtils.ts
export const newTrickOnTable = (oldState: TableState): TableState => {
  // renamed from newRoundOnTable
  if (!oldState.trickWinner) {
    // renamed from roundWinner
    throw new Error("Cannot start new trick: trickWinner is null"); // updated error message
  }

  return {
    ...oldState,
    tableCards: [],
    turn: oldState.trickWinner.player, // renamed from roundWinner
    trickWinner: null, // renamed from roundWinner
  };
};
```

## 🏗️ Phase 2: Extend GameState for Series Management

### **New Interfaces**

#### **SeriesProgress Interface**

```typescript
// src/types/game.ts
export interface SeriesProgress {
  currentGame: number;
  totalGames: number;
  gameScores: Record<number, Record<number, number>>; // game -> player -> score
  seriesScores: Record<number, number>; // player -> cumulative score
  startingPlayerIndex: number; // Current starting player (0-3)
  seriesWinner: number | null;
  isActive: boolean; // Whether series is currently active
}

export interface GameConfig {
  bidAmount: number;
  bidWinner: number;
  teammateCard: Card;
  trumpSuite: number;
  totalTricks: number; // renamed from totalRounds
  totalGames: number; // NEW: number of games in series
  gameMode: "single" | "series"; // NEW: game mode
}
```

#### **Updated GameState**

```typescript
export interface GameState {
  gameConfig: GameConfig | null;
  gameProgress: GameProgress;
  biddingState: BiddingState;
  tableState: TableState;
  playerState: PlayerState;
  error: GameError | null;
  // NEW: Series management
  seriesProgress: SeriesProgress;
  gameMode: "single" | "series";
}
```

### **Initial State Updates**

```typescript
// src/store/gameSlice.ts
const initialState: GameState = {
  // ... existing fields
  seriesProgress: {
    currentGame: 1,
    totalGames: 4, // Default 4 games
    gameScores: {},
    seriesScores: { 0: 0, 1: 0, 2: 0, 3: 0 },
    startingPlayerIndex: 0,
    seriesWinner: null,
    isActive: false,
  },
  gameMode: "single", // Default to single game
};

// Update GameConfig initialization
const initialGameConfig: GameConfig = {
  bidAmount: 0,
  bidWinner: 0,
  teammateCard: null,
  trumpSuite: null,
  totalTricks: 10, // renamed from totalRounds
  totalGames: 4, // NEW
  gameMode: "single", // NEW
};
```

## 🔄 Phase 3: Implement Game-to-Game Transitions

### **New Actions**

#### **Game Management Actions**

```typescript
// src/store/gameSlice.ts
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // ... existing reducers

    // NEW: Set game mode
    setGameMode: (state, action: PayloadAction<"single" | "series">) => {
      state.gameMode = action.payload;
      if (action.payload === "series") {
        state.seriesProgress.isActive = true;
        state.seriesProgress.totalGames = 4; // Default for series
      } else {
        state.seriesProgress.isActive = false;
        state.seriesProgress.totalGames = 1; // Single game
      }
    },

    // NEW: Start new game in series
    startNewGame: state => {
      // 1. Rotate starting player
      state.seriesProgress.startingPlayerIndex = rotateStartingPlayer(
        state.seriesProgress.startingPlayerIndex
      );

      // 2. Reset game state
      state.gameProgress.stage = GameStages.INIT;
      state.gameProgress.trick = 0; // renamed from round
      state.biddingState = initialBiddingState(NUM_PLAYERS, 0, false); // FIXED: Added required parameters
      state.tableState = initialTableState(0, true); // FIXED: Added required parameters

      // 3. Redistribute cards from discardedCards
      // (Implementation depends on card redistribution logic)

      // 4. Set starting player
      state.playerState.startingPlayer =
        state.seriesProgress.startingPlayerIndex;

      // 5. Increment game counter
      state.seriesProgress.currentGame += 1;
    },

    // NEW: Complete current game
    completeGame: state => {
      // 1. Calculate final game scores (existing logic)
      const gameScores = calculateGameScores(state);

      // 2. Update series scores
      Object.entries(gameScores).forEach(([playerId, score]) => {
        const playerIndex = parseInt(playerId);
        state.seriesProgress.seriesScores[playerIndex] += score;
      });

      // 3. Store game scores for history
      state.seriesProgress.gameScores[state.seriesProgress.currentGame] =
        gameScores;

      // 4. Check if series complete
      if (state.seriesProgress.currentGame >= state.seriesProgress.totalGames) {
        state.gameProgress.stage = GameStages.SERIES_COMPLETE;
      } else {
        state.gameProgress.stage = GameStages.GAME_SUMMARY;
      }
    },

    // NEW: Complete series
    completeSeries: state => {
      // Determine series winner
      const winner = Object.entries(state.seriesProgress.seriesScores).reduce(
        (max, [playerId, score]) =>
          score > max.score ? { playerId: parseInt(playerId), score } : max,
        { playerId: 0, score: -1 }
      );

      state.seriesProgress.seriesWinner = winner.playerId;
    },
  },
});
```

### **Starting Player Rotation Logic**

```typescript
// src/utils/gameUtils.ts
export const rotateStartingPlayer = (currentIndex: number): number => {
  return (currentIndex + 1) % 4; // 0 → 1 → 2 → 3 → 0
};

export const getNextStartingPlayer = (currentIndex: number): number => {
  return rotateStartingPlayer(currentIndex);
};
```

## 🎮 Phase 4: Game Flow Updates

### **Updated Saga Logic**

```typescript
// src/store/sagas/gameFlowSaga.ts
function* handleGameStageTransition(
  action: PayloadAction<GameStage>
): Generator<any, void, any> {
  const newStage = action.payload;

  try {
    switch (newStage) {
      // ... existing cases

      case GameStages.TRICK_COMPLETE: {
        // renamed from ROUND_COMPLETE
        console.log(
          "Game Flow Saga: Orchestrating trick complete stage transition"
        );

        // Check if game should continue or end
        const gameProgress = yield select(selectGameProgress);
        if (gameProgress.trick >= 10) {
          // renamed from round
          // Game complete, check if series should continue
          const gameState = yield select(selectGameState);
          if (gameState.gameMode === "series") {
            yield put(completeGame());
          } else {
            yield put(triggerGameCompletion()); // VERIFIED: Function exists in gameSlice
          }
        }
        break;
      }

      case GameStages.GAME_SUMMARY: {
        console.log(
          "Game Flow Saga: Orchestrating game summary stage transition"
        );

        // Show game summary for 30 seconds
        yield delay(30000);

        // Start next game
        yield put(startNewGame());
        break;
      }

      case GameStages.SERIES_COMPLETE: {
        console.log(
          "Game Flow Saga: Orchestrating series complete stage transition"
        );

        // Determine series winner
        yield put(completeSeries());

        // Show series summary
        yield put(setStage(GameStages.SERIES_SUMMARY)); // FIXED: Added missing stage
        break;
      }

      // ... rest of cases
    }
  } catch (error) {
    console.error("Game stage transition error:", error);
  }
}
```

### **Updated Selectors**

```typescript
// src/store/selectors.ts
export const selectCurrentTrick = createSelector(
  // renamed from selectCurrentRound
  [(g): GameProgress => g.gameProgress],
  (g): number => g.trick // renamed from round
);

export const selectTrickWinner = createSelector(
  // renamed from selectRoundWinner
  [(g): TableState => g.tableState],
  (g): number | null => g.trickWinner?.player ?? null // renamed from roundWinner
);

export const selectIsTrickComplete = createSelector(
  // renamed from selectIsRoundComplete
  [(g): GameStage => g.gameProgress.stage],
  (stage): boolean => stage === GameStages.TRICK_COMPLETE // renamed from ROUND_COMPLETE
);

// NEW: Series selectors
export const selectSeriesProgress = createSelector(
  [(g): GameState => g],
  (g): SeriesProgress => g.seriesProgress
);

export const selectCurrentGame = createSelector(
  [(g): SeriesProgress => g.seriesProgress],
  (s): number => s.currentGame
);

export const selectTotalGames = createSelector(
  [(g): SeriesProgress => g.seriesProgress],
  (s): number => s.totalGames
);

export const selectSeriesScores = createSelector(
  [(g): SeriesProgress => g.seriesProgress],
  (s): Record<number, number> => s.seriesScores
);

export const selectGameMode = createSelector(
  [(g): GameState => g],
  (g): "single" | "series" => g.gameMode
);
```

## 🔧 Phase 5: Card Redistribution Logic

### **Game Reset Implementation**

```typescript
// src/utils/gameUtils.ts
export const redistributeCardsForNewGame = (
  discardedCards: Card[],
  playerCount: number
): Card[][] => {
  // ADDED: Error handling for edge cases
  if (!discardedCards || discardedCards.length === 0) {
    throw new Error("No discarded cards available for redistribution");
  }

  if (playerCount <= 0 || playerCount > 4) {
    throw new Error(
      `Invalid player count: ${playerCount}. Must be between 1 and 4.`
    );
  }

  // Shuffle discarded cards
  const shuffledCards = shuffle([...discardedCards]); // VERIFIED: shuffle function exists in cardUtils

  // Distribute evenly among players
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);

  shuffledCards.forEach((card, index) => {
    const playerIndex = index % playerCount;
    hands[playerIndex].push(card);
  });

  return hands;
};

export const resetGameState = (state: GameState): GameState => {
  return {
    ...state,
    gameProgress: {
      ...state.gameProgress,
      stage: GameStages.INIT,
      trick: 0, // renamed from round
      scores: { team1: 0, team2: 0 },
    },
    biddingState: initialBiddingState(NUM_PLAYERS, 0, false), // FIXED: Added required parameters
    tableState: initialTableState(0, true), // FIXED: Added required parameters
    playerState: {
      ...state.playerState,
      startingPlayer: state.seriesProgress.startingPlayerIndex,
    },
  };
};
```

## 📊 Score Computation Clarification

### **Per-Game Scores vs Series Scores**

**Per-Game Scores (TeamScores):**

- Calculated based on tricks won vs. bid amount
- Reset to `{ team1: 0, team2: 0 }` at the start of each new game
- Stored in `gameProgress.scores` during gameplay
- Used to determine if bidding team met their bid

**Series Scores (Individual Player Scores):**

- Cumulative scores across all games in the series
- Stored in `seriesProgress.seriesScores` as `Record<number, number>`
- Player indices: 0, 1, 2, 3 (not team-based)
- Accumulated from individual game performance
- Used to determine series winner

**Score Conversion Logic:**

```typescript
// Convert team scores to individual player scores for series accumulation
const convertTeamScoresToPlayerScores = (
  teamScores: TeamScores,
  playerTeams: Record<number, 1 | 2>
): Record<number, number> => {
  const playerScores: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

  Object.entries(playerTeams).forEach(([playerIndex, team]) => {
    const teamKey = team === 1 ? "team1" : "team2";
    playerScores[parseInt(playerIndex)] = teamScores[teamKey];
  });

  return playerScores;
};
```

## 📋 Implementation Checklist

### **Week 1: Foundation & Renaming**

- [ ] Rename all "round" variables to "trick" for consistency
- [ ] Update type definitions and interfaces
- [ ] Update game stages and constants
- [ ] Update utility function names

### **Week 2: Series State Management**

- [ ] Add SeriesProgress interface
- [ ] Extend GameState with seriesProgress
- [ ] Update GameConfig with totalGames and gameMode
- [ ] Implement starting player rotation logic

### **Week 3: Game Transitions & Logic**

- [ ] Implement startNewGame action
- [ ] Add completeGame action
- [ ] Add completeSeries action
- [ ] Update saga flow for new stages
- [ ] Implement card redistribution logic

### **Week 4: Integration & Testing**

- [ ] Integrate all changes into existing game flow
- [ ] Test single game mode still works
- [ ] Test series mode progression
- [ ] Validate player rotation
- [ ] Test game state persistence

## 🚨 Breaking Changes & Migration

### **Component Updates Required**

- **GameInfo**: Update props from `round` to `trick`
- **GameBoard**: Update state references
- **CenterTable**: Update roundWinner to trickWinner
- **All components**: Update selector usage

### **Migration Strategy**

1. **Phase 1**: Rename variables, maintain backward compatibility
2. **Phase 2**: Add new series functionality alongside existing
3. **Phase 3**: Gradually migrate to new naming convention
4. **Phase 4**: Remove deprecated round-based code

### **Backward Compatibility**

- Maintain existing single-game functionality during transition
- Add series features incrementally
- Ensure existing games can complete normally
- Provide fallbacks for missing series data

## 🎯 Success Criteria

### **Technical Success**

- [ ] All "round" variables successfully renamed to "trick"
- [ ] Series state management working correctly
- [ ] Game-to-game transitions smooth and reliable
- [ ] Player rotation working as expected
- [ ] Card redistribution functioning properly

### **Functional Success**

- [ ] Single game mode works exactly as before
- [ ] Series mode progresses through multiple games
- [ ] Scores accumulate correctly across games
- [ ] Starting player rotates properly
- [ ] Game state persists and recovers correctly

---

_This document provides the technical foundation for implementing multi-game series functionality while maintaining code consistency and existing functionality._
