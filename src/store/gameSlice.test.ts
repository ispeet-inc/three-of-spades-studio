import { describe, expect, it } from "vitest";
import { GameMode, type GameState } from "@/types/game";
import reducer, { restoreGameState } from "./gameSlice";
import { GameStages } from "./gameStages";

describe("restoreGameState", () => {
  it("restores completed Series metadata and clears transient dealing state", () => {
    const initialState = reducer(undefined, { type: "@@INIT" });
    const savedState: GameState = {
      ...structuredClone(initialState),
      gameMode: GameMode.Series,
      gameProgress: {
        stage: GameStages.SERIES_SUMMARY,
        trick: 10,
        scores: { team1: 200, team2: 50 },
      },
      seriesProgress: {
        ...structuredClone(initialState.seriesProgress),
        currentGame: 4,
        totalGames: 4,
        startingPlayerIndex: 2,
        seriesScores: { 0: 410, 1: 430, 2: 420, 3: 400 },
        seriesWinner: 1,
      },
      uiState: {
        showWhitewashAnimation: true,
        isDealing: true,
      },
    };

    const restored = reducer(initialState, restoreGameState(savedState));

    expect(restored.gameMode).toBe(GameMode.Series);
    expect(restored.gameProgress.stage).toBe(GameStages.SERIES_SUMMARY);
    expect(restored.seriesProgress.currentGame).toBe(4);
    expect(restored.seriesProgress.totalGames).toBe(4);
    expect(restored.seriesProgress.seriesScores).toEqual({
      0: 410,
      1: 430,
      2: 420,
      3: 400,
    });
    expect(restored.seriesProgress.seriesWinner).toBe(1);
    expect(restored.uiState).toEqual({
      showWhitewashAnimation: true,
      isDealing: false,
    });
  });
});
