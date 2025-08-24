/**
 * Centralized, memoized selectors for the game state.
 * All selectors are properly memoized for optimal performance.
 */
import type { RootState } from "@/store";
import type { GameStage } from "@/store/gameStages";
import { GameStages } from "@/store/gameStages";
import type {
  BiddingState,
  GameConfig,
  GameProgress,
  GameState,
  PlayerDisplayData,
  Playerv2,
  TableCard,
  TeamScores,
} from "@/types/game";
import { createSelector } from "@reduxjs/toolkit";
import { FIRST_PLAYER_ID } from "../utils/constants";

// ============================================================================
// ROOT SELECTORS
// ============================================================================

/** Returns the game slice */
export const selectGame = (state: RootState): GameState => state.game;

/** Returns the player state slice */
export const selectPlayerState = (state: RootState) => state.game.playerState;

/** Returns the current game stage */
export const selectStage = createSelector(
  selectGame,
  (g): GameStage => g.gameProgress.stage as GameStage
);

/** Returns the current game error state */
export const selectGameError = createSelector(selectGame, g => g.error);

export const selectGameConfig = createSelector(
  selectGame,
  (g): GameConfig | null => g.gameConfig
);

export const selectGameProgress = createSelector(
  selectGame,
  (g): GameProgress => g.gameProgress
);

// ============================================================================
// TRICK MANAGEMENT SELECTORS
// ============================================================================

/** Cards currently on the table (current trick) */
export const selectCurrentTrick = createSelector(
  selectGame,
  (g): TableCard[] => g.tableState.tableCards
);

/** Number of cards in current trick */
export const selectTrickCount = createSelector(
  selectCurrentTrick,
  t => t.length
);

/** Whether the trick has 4 cards (is complete) */
export const selectIsTrickComplete = createSelector(
  selectTrickCount,
  c => c === 4
);

// ============================================================================
// PLAYER AND TEAM SELECTORS
// ============================================================================

/** All players mapped by index */
export const selectPlayers = createSelector(
  selectPlayerState,
  (playerState): Record<number, Playerv2> | null => playerState.players
);

/** Current player index - only valid during PLAYING stage */
export const selectCurrentPlayerIndex = createSelector(
  [selectGame, selectStage],
  (game, stage): number =>
    stage === GameStages.PLAYING ? game.tableState.turn : -1
);

/** Returns whether the game is in an active playing state */
export const selectIsGameActive = createSelector(
  selectStage,
  (stage): boolean =>
    [
      GameStages.BIDDING,
      GameStages.TRUMP_SELECTION,
      GameStages.PLAYING,
      GameStages.CARDS_DISPLAY,
    ].includes(stage as any)
);

/** Returns whether the current player is a bot */
export const selectIsCurrentPlayerBot = createSelector(
  [selectCurrentPlayerIndex, selectPlayerState],
  (currentPlayer, playerState): boolean => {
    if (currentPlayer <= 0) return false;
    return !!playerState.playerAgents[currentPlayer];
  }
);

/** Teams derived from players (1/2 instead of 0/1) */
export const selectTeams = createSelector(
  selectPlayers,
  (players): Record<number, number[]> => {
    const teams: Record<number, number[]> = { 1: [], 2: [] };
    if (!players) return teams;

    Object.entries(players).forEach(([playerId, playerRecord]) => {
      const player = parseInt(playerId);
      const team = playerRecord.team;
      if (team === null) return;
      if (!teams[team]) teams[team] = [];
      teams[team].push(player);
    });

    return teams;
  }
);

/** Transform players for UI consumption */
export const selectPlayerDisplayData = createSelector(
  [selectPlayers, selectPlayerState, selectCurrentPlayerIndex],
  (players, playerState, currentPlayerIndex): PlayerDisplayData[] => {
    if (!players) return [];

    return Object.entries(players).map(([index, player]) => ({
      id: `player-${index}`,
      name:
        playerState.playerNames[parseInt(index)] ||
        `Player ${parseInt(index) + 1}`,
      team: player.team,
      cards: player.hand,
      isCurrentPlayer: parseInt(index) === currentPlayerIndex,
      isFirstPersonTeammate:
        parseInt(index) !== FIRST_PLAYER_ID &&
        player.team === players[FIRST_PLAYER_ID].team,
      isTeammate: player.isTeammate,
      isBidWinner: player.isBidWinner,
    }));
  }
);

// ============================================================================
// BIDDING SELECTORS
// ============================================================================

/** Raw bidding state */
export const selectBiddingStateRaw = createSelector(
  selectGame,
  (g): BiddingState => g.biddingState
);

/** Current bid amount */
export const selectCurrentBid = createSelector(
  selectBiddingStateRaw,
  b => b.currentBid
);

/** Current player whose turn it is to bid */
export const selectCurrentBidder = createSelector(
  selectBiddingStateRaw,
  b => b.currentBidder
);

/** Players who have passed on bidding */
export const selectPassedPlayers = createSelector(
  selectBiddingStateRaw,
  b => b.passedPlayers
);

/** Winner of the bidding round */
export const selectBidder = createSelector(
  selectBiddingStateRaw,
  b => b.bidWinner
);

/** Bidding timer value */
export const selectBidTimer = createSelector(
  selectBiddingStateRaw,
  b => b.bidTimer
);

// ============================================================================
// SCORE AND COLLECTION SELECTORS
// ============================================================================

/** Team scores */
export const selectTeamScores = createSelector(
  selectGame,
  (g): TeamScores => g.gameProgress.scores
);

/** Winner of card collection phase */
export const selectCollectionWinner = createSelector(
  selectGame,
  (g): number | null => g.tableState.roundWinner?.player ?? null
);

// ============================================================================
// PHASE FLAG SELECTORS
// ============================================================================

/** Whether to show cards phase */
export const selectShowCardsPhase = createSelector(
  selectStage,
  (stage): boolean => stage === GameStages.ROUND_COMPLETE
);

/** Whether currently collecting cards */
export const selectIsCollectingCards = createSelector(
  selectStage,
  (stage): boolean => stage === GameStages.ROUND_COMPLETE
);
