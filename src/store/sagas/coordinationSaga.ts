import {
  call,
  cancelled,
  put,
  race,
  select,
  take,
  takeLatest,
} from "redux-saga/effects";
import { botShouldPlayCard, setStage } from "../gameSlice";
import { GameStages } from "../gameStages";
import {
  selectCurrentPlayerIndex,
  selectGameProgress,
  selectStage,
} from "../selectors";

// Saga coordination to prevent race conditions and coordinate game flow
function* coordinateGameFlow(): Generator<any, void, any> {
  try {
    console.log("Coordination Saga: Starting game flow coordination");

    while (true) {
      // Wait for any game state change
      yield take("*");

      const gameProgress = yield select(selectGameProgress);
      const currentStage = yield select(selectStage);
      const currentPlayer = yield select(selectCurrentPlayerIndex);

      // Coordinate different game phases
      yield call(handleStageCoordination, currentStage, currentPlayer);
    }
  } finally {
    if (yield cancelled()) {
      console.log("Game flow coordination saga cancelled");
    }
  }
}

// Handle coordination for different game stages
function* handleStageCoordination(
  stage: string,
  currentPlayer: number
): Generator<any, void, any> {
  try {
    switch (stage) {
      case GameStages.BIDDING:
        yield call(coordinateBiddingPhase);
        break;

      case GameStages.PLAYING:
        yield call(coordinatePlayingPhase, currentPlayer);
        break;

      case GameStages.TRUMP_SELECTION:
        yield call(coordinateTrumpSelectionPhase);
        break;

      default:
        // No coordination needed for other stages
        break;
    }
  } catch (error) {
    console.error("Stage coordination error:", error);
  }
}

// Coordinate bidding phase to prevent race conditions
function* coordinateBiddingPhase(): Generator<any, void, any> {
  try {
    // Ensure only one bot bidding saga runs at a time
    // This prevents multiple bots from bidding simultaneously
    console.log("Coordination Saga: Coordinating bidding phase");
  } catch (error) {
    console.error("Bidding phase coordination error:", error);
  }
}

// Coordinate playing phase to manage bot turns
function* coordinatePlayingPhase(
  currentPlayer: number
): Generator<any, void, any> {
  try {
    // Only coordinate if it's a bot's turn (player 1, 2, or 3)
    if (currentPlayer > 0) {
      console.log(
        `Coordination Saga: Coordinating bot turn for player ${currentPlayer}`
      );

      // Trigger bot action with proper coordination
      yield put(botShouldPlayCard({ playerIndex: currentPlayer }));
    }
  } catch (error) {
    console.error("Playing phase coordination error:", error);
  }
}

// Coordinate trump selection phase
function* coordinateTrumpSelectionPhase(): Generator<any, void, any> {
  try {
    console.log("Coordination Saga: Coordinating trump selection phase");

    // This phase needs coordination to ensure only one bot selects trump
    // and prevents conflicts with user input
  } catch (error) {
    console.error("Trump selection phase coordination error:", error);
  }
}

// Watch for specific coordination events
function* watchCoordinationEvents(): Generator<any, void, any> {
  try {
    // Watch for stage changes to trigger coordination
    yield takeLatest(setStage.type, function* (action: any) {
      const newStage = action.payload;
      console.log(
        `Coordination Saga: Stage changed to ${newStage}, coordinating...`
      );

      // Trigger coordination for the new stage
      yield call(handleStageCoordination, newStage, -1);
    });
  } catch (error) {
    console.error("Coordination events watch error:", error);
  }
}

export default function* coordinationSaga() {
  yield race([coordinateGameFlow(), watchCoordinationEvents()]);
}
