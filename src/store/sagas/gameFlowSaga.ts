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
  completeSeries,
  gameInitialize,
  gameStageTransition,
  setGameError,
  setStage,
  startBiddingRound,
  startNextGame,
} from "../gameSlice";
import {
  GameStages,
  isValidStageTransition,
  type GameStage,
} from "../gameStages";
import { selectActivePlayersInBidding, selectStage } from "../selectors";

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

  // // Change the stage
  // yield put(setStage(newStage));

  // // Handle any side effects
  // yield call(handleStageSideEffects, newStage);
}

// Handle side effects for each stage
function* handleStageSideEffects(
  newStage: GameStage
): Generator<any, void, any> {
  switch (newStage) {
    case GameStages.BIDDING:
      // yield put(startBiddingRound());
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
    case GameStages.TRICK_COMPLETE:
      // todo - this is only to fix type error for timebeing
      yield delay(500);
      break;
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

    // Start bidding round
    yield put(startBiddingRound());

    console.log("Game Flow Saga: Game initialization completed successfully");
  } catch (error) {
    console.error("Game initialization error:", error);
    // Enhanced fallback: try to recover gracefully
    try {
      console.log("Game Flow Saga: Attempting fallback initialization");
      yield put(startBiddingRound());
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
    console.log(`Game Flow Saga: Transitioning to stage: ${newStage}`);

    // todo - Use the new centralized transition system
    yield call(handleStageTransition, newStage);

    // Handle special cases that need additional logic
    switch (newStage) {
      case GameStages.TRICK_COMPLETE: {
        // Check if game should continue or end
        // const gameProgress = yield select(selectGameProgress);
        // if (gameProgress.trick >= 10) {
        //   // Game complete, check if series should continue
        //   const gameState = yield select(selectGame);
        //   if (gameState.gameMode === "series") {
        //     yield put(completeGame());
        //   } else {
        //     console.log("Need to trigger game completion");
        //   }
        // }
        break;
      }

      case GameStages.GAME_SUMMARY: {
        console.log(
          "Game Flow Saga: Orchestrating game summary stage transition"
        );

        // Show game summary for 30 seconds
        yield delay(30000);

        // Start next game
        yield put(startNextGame());
        break;
      }

      case GameStages.SERIES_SUMMARY: {
        console.log(
          "Game Flow Saga: Orchestrating series summary stage transition"
        );

        // Determine series winner
        yield put(completeSeries());

        // Show series summary - no further transitions needed
        break;
      }

      default:
        console.warn(`Game Flow Saga: Unknown stage transition: ${newStage}`);
        break;
    }
  } catch (error) {
    console.error("Game stage transition error:", error);
    yield call(handleStageTransitionError, error, action.payload);
  } finally {
    if (yield cancelled()) {
      console.log("Game stage transition saga cancelled");
    } else {
      // Actually change the stage after all logic is complete
      yield put(setStage(action.payload));
      yield call(handleStageSideEffects, action.payload);
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
}
