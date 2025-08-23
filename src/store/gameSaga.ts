import type { BiddingState } from "@/types/game";
import { TIMINGS } from "@/utils/constants";
import {
  all,
  call,
  cancelled,
  delay,
  put,
  race,
  select,
  take,
  takeEvery,
} from "redux-saga/effects";
import {
  passBid,
  passBid as passBidAction,
  placeBid,
  playCard,
  setStage,
  startBiddingRound,
  startCardCollection,
  startNewRound,
  updateBidTimer,
} from "./gameSlice";
import { GameStages, type GameStage } from "./gameStages";
import {
  selectBiddingStateRaw,
  selectIsTrickComplete,
  selectStage,
} from "./selectors";

function* handleStageTransition(action: any) {
  console.log(
    "Saga: handleStageTransition called with payload:",
    action.payload
  );

  if (action.payload === GameStages.CARDS_DISPLAY) {
    console.log("Saga: Starting trick display phase");
    yield delay(TIMINGS.trickDisplayMs);
    console.log("Saga: Trick display complete, starting collection animation");
    yield put(startCardCollection());
    console.log("Saga: Waiting for collection animation to finish");
    yield delay(TIMINGS.collectionAnimationMs + TIMINGS.collectionBufferMs);
    console.log("Saga: Animation complete, starting new round");
    yield put(startNewRound());
  }
}

// Watch for trick completion and automatically transition to CARDS_DISPLAY
function* watchTrickCompletion() {
  console.log("Saga: watchTrickCompletion started");
  yield takeEvery(playCard.type, function* handleTrickCompletion() {
    const isTrickComplete: boolean = yield select(selectIsTrickComplete);
    const stage: GameStage = yield select(selectStage);

    if (isTrickComplete && stage === GameStages.PLAYING) {
      console.log(
        "Saga: Trick completed with 4 cards, transitioning to CARDS_DISPLAY"
      );
      yield put(setStage(GameStages.CARDS_DISPLAY));
    }
  });
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
      // Get current bidding state using selectors
      const biddingState: BiddingState = yield select(selectBiddingStateRaw);
      const stage: GameStage = yield select(selectStage);
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
        yield delay(TIMINGS.biddingTimerStepMs);
        yield put(updateBidTimer(biddingState.bidTimer - 1));
      } else {
        // Timer ran out, auto-pass for current bidder
        yield put(passBid({ playerIndex: biddingState.currentBidder }));
        break;
      }
    }
  } finally {
    // @ts-expect-error - cancelled is not typed
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
    watchTrickCompletion(),
  ]);
}
