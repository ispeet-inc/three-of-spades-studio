# Redux Store Redesign: GameStage Transition Streamlining

## Overview

Transform the current mixed approach (direct reducer changes + saga handling) into a unified, validated system where ALL stage transitions flow through `gameFlowSaga.ts` with proper validation and orchestration.

## Current State Analysis

### Problems Identified

1. **Mixed Responsibility**: Some stage changes happen directly in reducers, others through sagas
2. **Inconsistent Flow**: `gameStageTransition` actions exist but aren't always used
3. **Direct State Mutations**: Several reducers directly modify `state.gameProgress.stage`
4. **Complex Logic in Reducers**: Business logic mixed with state updates

### Current Stage-Changing Reducers (to be refactored)

- `startNewTrick` - Sets stage to `PLAYING` then potentially `GAME_OVER`
- `startCardCollection` - Sets stage to `TRICK_COMPLETE`
- `setBidAndTrump` - Sets stage to `TRUMP_SELECTION_COMPLETE`
- `completeBiddingWithDelay` - Sets stages to `BIDDING_COMPLETE` then `TRUMP_SELECTION`
- `startNextGame` - Sets stage to `INIT`
- `completeGame` - Sets stage to `GAME_SUMMARY` or `SERIES_SUMMARY`
- `completeSeries` - No stage change (final state)

## Implementation Plan

### Phase 1: Barebones Stage Transition System

#### 1.1 Update gameFlowSaga.ts with Simple Transition Logic

**File**: `src/store/sagas/gameFlowSaga.ts`

```typescript
// Simple inline validation - no separate files needed
function isValidTransition(from: GameStage, to: GameStage): boolean {
  const validTransitions = {
    INIT: ["DISTRIBUTE_CARDS"],
    DISTRIBUTE_CARDS: ["BIDDING"],
    BIDDING: ["BIDDING_COMPLETE"],
    BIDDING_COMPLETE: ["TRUMP_SELECTION"],
    TRUMP_SELECTION: ["TRUMP_SELECTION_COMPLETE"],
    TRUMP_SELECTION_COMPLETE: ["PLAYING"],
    PLAYING: ["CARDS_DISPLAY", "GAME_OVER"],
    CARDS_DISPLAY: ["TRICK_COMPLETE"],
    TRICK_COMPLETE: ["PLAYING", "GAME_OVER"],
    GAME_OVER: ["GAME_SUMMARY", "INIT"],
    GAME_SUMMARY: ["SERIES_SUMMARY", "INIT"],
    SERIES_SUMMARY: ["INIT"],
  };

  return validTransitions[from]?.includes(to) || false;
}

// Simple transition handler - inline everything
function* handleStageTransition(newStage: GameStage) {
  const currentStage: GameStage = yield select(selectStage);

  // Basic validation
  if (!isValidTransition(currentStage, newStage)) {
    console.error(`Invalid transition: ${currentStage} -> ${newStage}`);
    return;
  }

  // Change the stage
  yield put(setStage(newStage));

  // Handle any side effects
  yield call(handleStageSideEffects, newStage);
}

// Handle side effects for each stage
function* handleStageSideEffects(newStage: GameStage) {
  switch (newStage) {
    case GameStages.BIDDING:
      yield put(startBiddingRound());
      break;
    case GameStages.PLAYING:
      // Check if it's bot's turn
      const tableState = yield select(
        (state: RootState) => state.game.tableState
      );
      if (tableState.turn !== FIRST_PLAYER_ID) {
        yield put(botShouldPlayCard({ playerIndex: tableState.turn }));
      }
      break;
    case GameStages.TRICK_COMPLETE:
      yield put(startCardCollection());
      break;
    default:
      console.log(`Transition: No specific logic for ${newStage}`);
  }
}
```

### Phase 2: Remove Direct Stage Changes from Reducers

**Simple rule**: Remove all `state.gameProgress.stage = X` lines from reducers.

**Example changes:**

```typescript
// OLD: state.gameProgress.stage = GameStages.PLAYING;
// NEW: dispatch(gameStageTransition(GameStages.PLAYING));

// OLD: state.gameProgress.stage = GameStages.GAME_OVER;
// NEW: dispatch(gameStageTransition(GameStages.GAME_OVER));
```

**Files to update:**

- `src/store/gameSlice.ts` - Remove stage assignments from reducers
- Keep all other logic, just remove stage changes

```typescript

```

### Phase 3: Move Functions from gameSaga.ts to gameFlowSaga.ts

**Simple task**: Copy these functions from `gameSaga.ts` to `gameFlowSaga.ts`:

- `watchTrickCompletion`
- `biddingTimerSaga`
- `watchBiddingTimerTriggers`

**Then delete `gameSaga.ts`**

```







```

**Simple task**: Update `rootSaga.ts` to only import `botAISaga` and `gameFlowSaga`, then delete `gameSaga.ts`

### Phase 5: Update Component Usage

**Simple task**: Replace all `state.gameProgress.stage = X` calls with `dispatch(gameStageTransition(X))` in components

## Implementation Order

1. **Phase 1**: Update gameFlowSaga.ts with simple inline transition logic
2. **Phase 2**: Remove direct stage changes from reducers
3. **Phase 3**: Move functions from gameSaga.ts and delete it
4. **Phase 4**: Update rootSaga.ts and delete gameSaga.ts
5. **Phase 5**: Replace stage assignments with dispatch calls in components
6. **Test**: Verify all stage transitions work correctly

## Expected Benefits

- **Predictable Flow**: All stage changes follow the same pattern
- **Minimal Complexity**: Everything in one place, no separate validation files
- **Easy to Understand**: Simple lookup table for transitions, inline logic
- **Faster Implementation**: No need to create multiple validation files
- **Easier Debugging**: Centralized logic makes issues easier to trace
- **Basic Validation**: Prevents obvious invalid transitions

## Testing Checklist

- [ ] All stage transitions work correctly
- [ ] Validation prevents invalid transitions
- [ ] Error handling works for failed transitions
- [ ] Transition logic executes properly
- [ ] No direct stage changes in reducers
- [ ] All existing functionality preserved
