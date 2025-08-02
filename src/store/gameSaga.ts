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
  startCardCollection,
  startNewRound,
} from "./gameSlice";
import { GameStages } from "./gameStages";
import type { RootState } from "./index";

function* handleStageTransition(action: any) {
  console.log(
    "Saga: handleStageTransition called with payload:",
    action.payload
  );
  
  if (action.payload === GameStages.CARDS_DISPLAY) {
    console.log("Saga: Starting 2-second card display phase");
    yield delay(1500);
    console.log("Saga: Card display complete, starting collection animation");
    yield put(startCardCollection());
    console.log("Saga: Waiting for collection animation to finish");
    yield delay(2500); // 2s animation + 0.5s cleanup
    console.log("Saga: Animation complete, starting new round");
    yield put(startNewRound());
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
      const biddingState: any = yield select((state: RootState) => state.game.biddingState);
      const stage: typeof GameStages[keyof typeof GameStages] = yield select((state: RootState) => state.game.stage);
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
        (action: any) =>
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
  ]);
}