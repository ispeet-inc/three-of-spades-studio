import type { PayloadAction } from "@reduxjs/toolkit";
import {
  call,
  cancelled,
  delay,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLeading,
} from "redux-saga/effects";
import { TIMINGS } from "../../utils/constants";
import {
  clearGameError,
  completeGame,
  completeSeries,
  gameInitialize,
  gameStageTransition,
  setBidAndTrump,
  setGameError,
  setStage,
  startBiddingRound,
  startGame,
  startNewTrick,
} from "../gameSlice";
import {
  GameStages,
  isValidStageTransition,
  type GameStage,
} from "../gameStages";
import {
  selectActivePlayersInBidding,
  selectGameConfig,
  selectGameProgress,
  selectIsSeries,
  selectStage,
} from "../selectors";

// Simple transition handler - inline everything
function* handleStageTransition(
  newStage: GameStage
): Generator<any, void, any> {
  const currentStage: GameStage = yield select(selectStage);

  // Basic validation
  if (!isValidStageTransition(currentStage, newStage)) {
    console.error(`Invalid transition: ${currentStage} -> ${newStage}`);
    return;
  }

  // Change the stage
  yield put(setStage(newStage));

  // Handle any side effects
  yield call(handleStageSideEffects, newStage);
}

// Handle side effects for each stage
function* handleStageSideEffects(
  newStage: GameStage
): Generator<any, void, any> {
  switch (newStage) {
    case GameStages.DISTRIBUTE_CARDS: {
      // Trigger game initialization saga instead of setTimeout
      yield put(gameInitialize());
      break;
    }
    case GameStages.BIDDING:
      yield put(startBiddingRound());
      break;
    case GameStages.PLAYING: {
      // Check if it's bot's turn
      // const tableState = yield select(
      //   (state: RootState) => state.game.tableState
      // );
      // if (tableState.turn !== FIRST_PLAYER_ID) {
      //   yield put(botShouldPlayCard({ playerIndex: tableState.turn }));
      // }
      break;
    }
    case GameStages.TRICK_COMPLETE: {
      yield delay(TIMINGS.collectionAnimationMs + TIMINGS.collectionBufferMs);
      yield put(startNewTrick());

      const gameProgress = yield select(selectGameProgress);
      const gameConfig = yield select(selectGameConfig);
      const isSeries = yield select(selectIsSeries);

      // Check if game should continue or end
      if (gameConfig && gameProgress.trick >= gameConfig.totalTricks) {
        console.log("Game Flow Saga: All tricks done, Game completed");
        if (isSeries) {
          yield put(completeGame());
        } else {
          yield put(setStage(GameStages.GAME_OVER));
        }
      } else {
        console.log("Game Flow Saga: Game not over, starting next trick");
        yield put(setStage(GameStages.PLAYING));
      }
      break;
    }
    default:
      console.log(`Transition: No specific logic for ${newStage}`);
  }
}

function* handleStageTransitionError(
  error: unknown,
  stage: GameStage
): Generator<any, void, any> {
  try {
    console.error(
      `Game Flow Saga: Error in stage transition to ${stage}:`,
      error
    );

    // Set error state for UI feedback
    yield put(
      setGameError({
        type: "STAGE_TRANSITION",
        message: `Failed to transition to ${stage}: ${(error as Error)?.message || String(error)}`,
        timestamp: Date.now(),
        recoverable: true,
        fallbackAction: "RETRY_TRANSITION",
      })
    );

    // Implement error recovery logic here
    // This could include fallback actions or state rollback
    yield; // Generator function requires yield

    // Clear error after recovery attempt
    yield put(clearGameError());
  } catch (recoveryError) {
    console.error("Game Flow Saga: Error recovery failed:", recoveryError);

    // Set unrecoverable error
    yield put(
      setGameError({
        type: "STAGE_TRANSITION",
        message: `Unrecoverable error in stage transition to ${stage}: ${(recoveryError as Error)?.message || String(recoveryError)}`,
        timestamp: Date.now(),
        recoverable: false,
      })
    );
  }
}

// Game initialization saga
function* handleGameInitialization(): Generator<any, void, any> {
  try {
    console.log("Game Flow Saga: Starting game initialization");

    // Use race to allow cancellation of the dealing animation
    const result = yield race({
      dealingAnimation: delay(2000),
      cancelled: take("GAME_INIT_CANCELLED"), // Allow external cancellation
    });

    // Check if we were cancelled
    if (result.cancelled) {
      console.log("Game Flow Saga: Initialization cancelled externally");
      return;
    }

    // Now transition to BIDDING stage (which will trigger the bidding logic via handleStageSideEffects)
    yield put(gameStageTransition(GameStages.BIDDING));

    console.log("Game Flow Saga: Game initialization completed successfully");
  } catch (error) {
    console.error("Game initialization error:", error);
    // Enhanced fallback: try to recover gracefully
    try {
      console.log("Game Flow Saga: Attempting fallback initialization");
      yield put(gameStageTransition(GameStages.BIDDING));
    } catch (fallbackError) {
      console.error(
        "Game Flow Saga: Fallback initialization failed:",
        fallbackError
      );
    }
  }
}

// Game stage transition saga - simplified with new validation system
function* handleGameStageTransition(
  action: PayloadAction<GameStage>
): Generator<any, void, any> {
  try {
    const newStage = action.payload;
    console.log(`Game flow saga: Transitioning to stage: ${newStage}`);
    yield call(handleStageTransition, newStage);
  } catch (error) {
    console.error("Game flow saga: stage transition error:", error);
    yield call(handleStageTransitionError, error, action.payload);
  } finally {
    if (yield cancelled()) {
      console.log("Game flow saga: stage transition saga cancelled");
    } else {
      console.log("Game flow saga: stage transition saga completed");
    }
  }
}

// Bidding completion delay saga
function* handleBiddingCompletionDelay(): Generator<any, void, any> {
  try {
    // Wait for 1.5 seconds to allow players to see the final pass
    yield delay(TIMINGS.biddingResultDelayMs);

    // Complete the bidding stage transition
    yield put(gameStageTransition(GameStages.BIDDING_COMPLETE));
    yield put(gameStageTransition(GameStages.TRUMP_SELECTION));
  } catch (error) {
    console.error("Bidding completion delay error:", error);
  } finally {
    if (yield cancelled()) {
      console.log("Bidding completion delay saga cancelled");
    }
  }
}

// Main game flow saga watcher
export default function* gameFlowSaga() {
  // Use takeLeading to prevent multiple game instances
  yield takeLeading(gameInitialize.type, handleGameInitialization);
  yield takeLeading(gameStageTransition.type, handleGameStageTransition);

  // Watch for when bidding is complete (bidWinner is set but stage hasn't changed)
  yield takeEvery(
    (action: any) =>
      action.type === "game/passBid" &&
      action.payload &&
      action.payload.playerIndex !== undefined,
    function* (action: any): Generator<any, void, any> {
      const numActivePlayers = yield select(selectActivePlayersInBidding);
      // If bidding is complete (only one player left), start the delay saga
      if (numActivePlayers === 1) {
        console.log("Bidding complete, starting delay");
        yield call(handleBiddingCompletionDelay);
      }
    }
  );

  // Watch for trump selection completion
  yield takeEvery(setBidAndTrump.type, function* (): Generator<any, void, any> {
    yield put(gameStageTransition(GameStages.TRUMP_SELECTION_COMPLETE));
  });

  // Watch for game completion
  yield takeEvery(completeGame.type, function* (): Generator<any, void, any> {
    yield put(gameStageTransition(GameStages.GAME_SUMMARY));
  });

  // Watch for game start
  yield takeEvery(startGame.type, function* (): Generator<any, void, any> {
    yield put(gameStageTransition(GameStages.DISTRIBUTE_CARDS));
  });

  // Watch for series completion
  yield takeEvery(completeSeries.type, function* (): Generator<any, void, any> {
    yield put(gameStageTransition(GameStages.SERIES_SUMMARY));
  });
}
