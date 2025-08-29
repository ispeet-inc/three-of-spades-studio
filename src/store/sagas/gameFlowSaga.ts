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
  completeBiddingWithDelay,
  completeGame,
  completeSeries,
  gameInitialize,
  gameStageTransition,
  setDealingAnimation,
  setGameError,
  setStage,
  startBiddingRound,
  startNextGame,
  triggerGameCompletion,
  triggerTrickTransition,
} from "../gameSlice";
import { GameStages, type GameStage } from "../gameStages";
import {
  selectBiddingStateRaw,
  selectGame,
  selectGameProgress,
} from "../selectors";

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

    // Stop dealing animation
    yield put(setDealingAnimation(false));

    // Start bidding round
    yield put(startBiddingRound());

    console.log("Game Flow Saga: Game initialization completed successfully");
  } catch (error) {
    console.error("Game initialization error:", error);
    // Enhanced fallback: try to recover gracefully
    try {
      console.log("Game Flow Saga: Attempting fallback initialization");
      yield put(setDealingAnimation(false));
      yield put(startBiddingRound());
    } catch (fallbackError) {
      console.error(
        "Game Flow Saga: Fallback initialization failed:",
        fallbackError
      );
    }
  }
}

// Game stage transition saga
function* handleGameStageTransition(
  action: PayloadAction<GameStage>
): Generator<any, void, any> {
  try {
    const newStage = action.payload;
    console.log(`Game Flow Saga: Transitioning to stage: ${newStage}`);

    // Handle different stage transitions
    switch (newStage) {
      case GameStages.BIDDING:
        console.log("Game Flow Saga: Orchestrating bidding stage transition");
        // Start bidding round if not already started
        // Additional bidding stage logic can be added here
        // This could include bot coordination and validation
        break;

      case GameStages.TRUMP_SELECTION:
        console.log(
          "Game Flow Saga: Orchestrating trump selection stage transition"
        );
        // Handle trump selection stage logic
        // This could include bot AI coordination
        break;

      case GameStages.PLAYING:
        console.log("Game Flow Saga: Orchestrating playing stage transition");
        // Handle playing stage logic
        // This could include turn management and bot coordination
        break;

      case GameStages.CARDS_DISPLAY:
        console.log(
          "Game Flow Saga: Orchestrating cards display stage transition"
        );
        // Handle cards display logic
        // This could include timing and animation coordination
        // Trigger automatic transition to trick completion after display
        yield put(triggerTrickTransition());
        break;

      case GameStages.TRICK_COMPLETE: {
        console.log(
          "Game Flow Saga: Orchestrating trick complete stage transition"
        );
        // Handle trick complete logic
        // This could include score calculation and trick transition
        // Check if game should continue or end
        const gameProgress = yield select(selectGameProgress);
        if (gameProgress.trick >= 10) {
          // renamed from round
          // Game complete, check if series should continue
          const gameState = yield select(selectGame);
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
        yield put(startNextGame());
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

      case GameStages.GAME_OVER:
        console.log("Game Flow Saga: Orchestrating game over stage transition");
        // Handle game over logic
        // This could include final score calculation and cleanup
        break;

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
    }
  }
}

// Bidding completion delay saga
function* handleBiddingCompletionDelay(): Generator<any, void, any> {
  try {
    console.log("Game Flow Saga: Bidding completed, starting delay");

    // Wait for 1.5 seconds to allow players to see the final pass
    yield delay(TIMINGS.biddingResultDelayMs);

    console.log("Game Flow Saga: Delay complete, transitioning to next stage");

    // Complete the bidding stage transition
    yield put(completeBiddingWithDelay());
  } catch (error) {
    console.error("Bidding completion delay error:", error);
    // Fallback: complete bidding immediately
    yield put(completeBiddingWithDelay());
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
      const biddingState = yield select(selectBiddingStateRaw);
      // If bidding is complete (only one player left), start the delay saga
      if (biddingState && biddingState.bidWinner !== null) {
        yield call(handleBiddingCompletionDelay);
      }
    }
  );
}
