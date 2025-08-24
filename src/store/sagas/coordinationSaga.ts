import { cancelled, select, take } from "redux-saga/effects";
import { GameStages } from "../gameStages";
import { selectGameProgress } from "../selectors";

// Saga coordination to prevent race conditions
function* coordinateGameFlow(): Generator<any, void, any> {
  try {
    while (true) {
      // Wait for any game state change
      yield take("*");

      const gameProgress = yield select(selectGameProgress);

      // Add coordination logic here
      // For example, ensure only one stage transition at a time
      if (gameProgress.stage === GameStages.PLAYING) {
        // Ensure bot AI saga is not running multiple instances
        // This is handled by takeLatest in botAISaga
      }
    }
  } finally {
    if (yield cancelled()) {
      console.log("Game flow coordination saga cancelled");
    }
  }
}

export default function* coordinationSaga() {
  yield coordinateGameFlow();
}
