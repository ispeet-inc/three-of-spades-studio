import {
  loadStats,
  saveStats,
  updateGameStats,
  updateSeriesStats,
} from "@/lib/statsEngine";
import { call, select, takeEvery } from "redux-saga/effects";
import { completeGame, completeSeries } from "../gameSlice";
import { selectGameLogEntry, selectSeriesLogEntry } from "../selectors";

/**
 * Record game completion stats
 */
function* recordGameStats(): Generator<any, void, any> {
  try {
    // Create game log entry using utility function
    const gameLogEntry = yield select(selectGameLogEntry);

    // Update and save stats
    const currentStats = yield call(loadStats);
    const updatedStats = yield call(
      updateGameStats,
      currentStats,
      gameLogEntry
    );
    yield call(saveStats, updatedStats);

    console.log("Stats recorded:", gameLogEntry);
  } catch (error) {
    console.error("Failed to record game stats:", error);
  }
}

/**
 * Record series completion stats
 */
function* recordSeriesStats(): Generator<any, void, any> {
  try {
    // Create series result
    const seriesLogEntry = yield select(selectSeriesLogEntry);

    // Update and save stats
    const currentStats = yield call(loadStats);
    const updatedStats = yield call(
      updateSeriesStats,
      currentStats,
      seriesLogEntry
    );
    yield call(saveStats, updatedStats);

    console.log("Series stats recorded:", seriesLogEntry);
  } catch (error) {
    console.error("Failed to record series stats:", error);
  }
}

/**
 * Stats tracking saga
 */
export default function* statsSaga() {
  // Watch for game completion
  yield takeEvery(completeGame.type, recordGameStats);

  // Watch for series completion
  yield takeEvery(completeSeries.type, recordSeriesStats);
}
