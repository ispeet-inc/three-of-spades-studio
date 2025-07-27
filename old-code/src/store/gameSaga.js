import {
  all,
  takeEvery,
  put,
  delay,
  select,
  take,
  race,
  call,
  cancelled,
} from "redux-saga/effects";
import {
  setStage,
  updateBidTimer,
  passBid,
  startBiddingRound,
  placeBid,
  passBid as passBidAction,
} from "./gameSlice";
import { GameStages } from "./gameStages";

function* handleStageTransition(action) {
  console.log(
    "Saga: handleStageTransition called with payload:",
    action.payload
  );
  if (action.payload === GameStages.DISTRIBUTE_CARDS) {
    console.log("Saga: Transitioning from DISTRIBUTE_CARDS to BIDDING");
    // Optionally add a small delay for realism
    yield delay(100);
    yield put(setStage(GameStages.BIDDING));
    // Initialize bidding state
    yield put(startBiddingRound());
    console.log("Saga: Dispatched setStage(BIDDING) and startBiddingRound()");
  }
}

function* watchStageTransition() {
  console.log("Saga: watchStageTransition started");
  yield takeEvery(setStage.type, handleStageTransition);
}

// --- Bidding Timer Saga ---
function* biddingTimerSaga() {
  console.log("Saga: biddingTimerSaga started");
  try {
    while (true) {
      // Get current bidding state
      const biddingState = yield select((state) => state.game.biddingState);
      const stage = yield select((state) => state.game.stage);
      console.log(
        "Saga: Timer check - stage:",
        stage,
        "biddingActive:",
        biddingState.biddingActive,
        "timer:",
        biddingState.bidTimer
      );
      if (stage !== GameStages.BIDDING || !biddingState.biddingActive) break;
      if (biddingState.bidTimer > 0) {
        yield delay(1000);
        yield put(updateBidTimer(biddingState.bidTimer - 1));
      } else {
        // Timer ran out, auto-pass for current bidder
        yield put(passBid({ playerIndex: biddingState.currentBidder }));
        break;
      }
    }
  } finally {
    if (yield cancelled()) {
      console.log("Saga: biddingTimerSaga cancelled");
    }
  }
}

// Watch for bidding round start or bidder change to restart timer
function* watchBiddingTimerTriggers() {
  console.log("Saga: watchBiddingTimerTriggers started");
  while (true) {
    // Wait for any of these actions
    yield take([startBiddingRound.type, placeBid.type, passBidAction.type]);
    console.log("Saga: watchBiddingTimerTriggers received trigger action");
    // Start the timer, cancel if stage changes or another trigger comes in
    yield race({
      timer: call(biddingTimerSaga),
      cancel: take(
        (action) =>
          (action.type === setStage.type &&
            action.payload !== GameStages.BIDDING) ||
          action.type === startBiddingRound.type ||
          action.type === placeBid.type ||
          action.type === passBidAction.type
      ),
    });
  }
}

export default function* gameSaga() {
  yield all([
    watchStageTransition(),
    watchBiddingTimerTriggers(),
    // Add individual game sagas here
  ]);
}
