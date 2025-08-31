/**
 * Centralized, memoized selectors for the game state.
 * All selectors are properly memoized for optimal performance.
 */
import type { RootState } from "@/store";
import type { GameStage } from "@/store/gameStages";
import { GameStages } from "@/store/gameStages";
import {
  GameMode,
  type BiddingState,
  type GameConfig,
  type GameProgress,
  type GameState,
  type PlayerDisplayData,
  type Playerv2,
  type TableCard,
  type TeamScores,
} from "@/types/game";
import { createSelector } from "@reduxjs/toolkit";
import { FIRST_PLAYER_ID, NUM_PLAYERS } from "../utils/constants";

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

export const selectIsSeries = createSelector(
  selectGame,
  (g): boolean => g.gameMode === GameMode.Series
);

// ============================================================================
// TRICK MANAGEMENT SELECTORS
// ============================================================================

/** Cards currently on the table (current trick) */
export const selectCurrentTrickCards = createSelector(
  selectGame,
  (g): TableCard[] => g.tableState.tableCards
);

/** Current trick number (0-9) */
export const selectCurrentTrick = createSelector(
  selectGame,
  (g): number => g.gameProgress.trick
);

/** Number of cards in current trick */
export const selectTrickCount = createSelector(
  selectCurrentTrickCards,
  t => t.length
);

/** Whether the trick has 4 cards (is complete) */
export const selectIsTrickComplete = createSelector(
  selectTrickCount,
  c => c === 4
);

// NEW: Trick management selectors (renamed from round)
export const selectTrickWinner = createSelector(
  selectGame,
  (g): number | null => g.tableState.trickWinner?.player ?? null
);

export const selectIsTrickCompleteStage = createSelector(
  selectGame,
  (g): boolean => g.gameProgress.stage === GameStages.TRICK_COMPLETE
);

// NEW: Series selectors
export const selectSeriesProgress = createSelector(
  selectGame,
  (g): any => g.seriesProgress
);

export const selectCurrentGame = createSelector(
  selectSeriesProgress,
  (s): number => s.currentGame
);

export const selectTotalGames = createSelector(
  selectSeriesProgress,
  (s): number => s.totalGames
);

export const selectSeriesScores = createSelector(
  selectSeriesProgress,
  (s): Record<number, number> => s.seriesScores
);

export const selectGameMode = createSelector(
  selectGame,
  (g): GameMode => g.gameMode
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

// ============================================================================
// BIDDING SELECTORS
// ============================================================================

/** Raw bidding state */
export const selectBiddingStateRaw = createSelector(
  selectGame,
  (g): BiddingState => g.biddingState
);

/** Current bid amount */
export const selectCurrentBid = createSelector(selectBiddingStateRaw, b =>
  b.biddingActive ? b.currentBid : null
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

export const selectActivePlayersInBidding = createSelector(
  selectPassedPlayers,
  passedPlayers => NUM_PLAYERS - passedPlayers.length
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

/** Whether the teammate has been revealed */
export const selectIsTeammateRevealed = createSelector(
  selectGame,
  (g): boolean => g.gameConfig?.isTeammateRevealed ?? false
);

/** Whether the current player can bid */
export const selectCanPlayerBid = createSelector(
  [selectBiddingStateRaw],
  biddingState => {
    return (
      !biddingState.passedPlayers.includes(FIRST_PLAYER_ID) &&
      biddingState.currentBidder === FIRST_PLAYER_ID
    );
  }
);

/** Transform players for UI consumption */
export const selectPlayerDisplayData = createSelector(
  [
    selectPlayers,
    selectPlayerState,
    selectCurrentPlayerIndex,
    selectCurrentBidder,
    selectStage,
    selectIsTeammateRevealed,
  ],
  (
    players,
    playerState,
    currentPlayerIndex,
    currentBidder,
    stage,
    isTeammateRevealed
  ): PlayerDisplayData[] => {
    if (!players) return [];

    return Object.entries(players).map(([index, player]) => {
      const playerIndex = parseInt(index);

      // Determine if this player is the current player based on game stage
      let isCurrentPlayer = false;
      if (stage === GameStages.PLAYING) {
        isCurrentPlayer = playerIndex === currentPlayerIndex;
      } else if (stage === GameStages.BIDDING) {
        isCurrentPlayer = playerIndex === currentBidder;
      }

      return {
        id: `player-${playerIndex}`,
        name:
          playerState.playerNames[playerIndex] || `Player ${playerIndex + 1}`,
        team: player.team,
        cards: player.hand,
        isCurrentPlayer,
        isFirstPersonTeammate:
          isTeammateRevealed &&
          player.team !== null &&
          playerIndex !== FIRST_PLAYER_ID &&
          player.team === players[FIRST_PLAYER_ID].team,
        isTeammate: isTeammateRevealed && player.isTeammate,
        isBidWinner: player.isBidWinner,
      };
    });
  }
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
  (g): number | null => g.tableState.trickWinner?.player ?? null
);

// ============================================================================
// PHASE FLAG SELECTORS
// ============================================================================

/** Whether to show cards phase */
export const selectShowCardsPhase = createSelector(
  selectStage,
  (stage): boolean => stage === GameStages.TRICK_COMPLETE
);

/** Whether currently collecting cards */
export const selectIsCollectingCards = createSelector(
  selectStage,
  (stage): boolean => stage === GameStages.TRICK_COMPLETE
);
