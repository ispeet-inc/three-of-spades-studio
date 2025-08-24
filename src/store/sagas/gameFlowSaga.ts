import { cancelled, delay, put, takeLeading } from "redux-saga/effects";
import {
  gameInitialize,
  gameStageTransition,
  setDealingAnimation,
  startBiddingRound,
} from "../gameSlice";
import { GameStages } from "../gameStages";

// Game initialization saga
function* handleGameInitialization(): Generator<any, void, any> {
  try {
    console.log("Game Flow Saga: Starting game initialization");

    // Wait for dealing animation
    yield delay(2000);

    // Stop dealing animation
    yield put(setDealingAnimation(false));

    // Start bidding round
    yield put(startBiddingRound());
  } catch (error) {
    console.error("Game initialization error:", error);
    // Fallback: force start bidding
    yield put(startBiddingRound());
  } finally {
    if (yield cancelled()) {
      console.log("Game initialization saga cancelled");
    }
  }
}

// Game stage transition saga
function* handleGameStageTransition(action: any): Generator<any, void, any> {
  try {
    const newStage = action.payload;
    console.log(`Game Flow Saga: Transitioning to stage: ${newStage}`);

    // Handle specific stage transitions
    switch (newStage) {
      case GameStages.BIDDING:
        // Bidding stage started, no additional logic needed
        break;

      case GameStages.TRUMP_SELECTION:
        // Trump selection stage started, no additional logic needed
        break;

      case GameStages.PLAYING:
        // Playing stage started, no additional logic needed
        break;

      case GameStages.GAME_OVER:
        // Game over, cleanup if needed
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("Game stage transition error:", error);
  } finally {
    if (yield cancelled()) {
      console.log("Game stage transition saga cancelled");
    }
  }
}

// Main game flow saga watcher
export default function* gameFlowSaga() {
  // Use takeLeading to prevent multiple game instances
  yield takeLeading(gameInitialize.type, handleGameInitialization);
  yield takeLeading(gameStageTransition.type, handleGameStageTransition);
}
