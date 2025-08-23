/*
  Centralized, memoized selectors for the game state.
  Phase 0: Additive-only, no behavior changes. These selectors are not yet used.
*/
import type { RootState } from "@/store";
import type { GameStage } from "@/store/gameStages";
import { GameStages } from "@/store/gameStages";
import type {
  BiddingState,
  Card,
  GameState,
  Playerv2,
  TableCard,
} from "@/types/game";
import { createSelector } from "@reduxjs/toolkit";

// Root selectors
/** Returns the game slice */
export const selectGame = (state: RootState): GameState => state.game;
/** Returns the player state slice */
export const selectPlayerState = (state: RootState) => state.game.playerState;
/** Returns the current stage */
export const selectStage = createSelector(
  selectGame,
  (g): GameStage => g.stage as GameStage
);

export const selectIsInit = createSelector(
  selectStage,
  s => s === GameStages.INIT
);
export const selectIsBidding = createSelector(
  selectStage,
  s => s === GameStages.BIDDING
);
export const selectIsTrumpSelection = createSelector(
  selectStage,
  s => s === GameStages.TRUMP_SELECTION
);
export const selectIsPlaying = createSelector(
  selectStage,
  s => s === GameStages.PLAYING
);
export const selectIsCardsDisplay = createSelector(
  selectStage,
  s => s === GameStages.CARDS_DISPLAY
);
export const selectIsRoundComplete = createSelector(
  selectStage,
  s => s === GameStages.ROUND_COMPLETE
);
export const selectIsRoundSummary = createSelector(
  selectStage,
  s => s === GameStages.ROUND_SUMMARY
);
export const selectIsGameOver = createSelector(
  selectStage,
  s => s === GameStages.GAME_OVER
);

// Players and turn

// Trick (table, leader/winner, suits)
/** Cards currently on table (current trick) */
export const selectCurrentTrick = createSelector(
  selectGame,
  (g): TableCard[] => g.tableState.tableCards
);
/** Number of cards in current trick */
export const selectTrickCount = createSelector(
  selectCurrentTrick,
  t => t.length
);
/** Leading suit for the trick (runningSuite) */
export const selectLeadingSuit = createSelector(
  selectGame,
  (g): number | null => g.tableState.runningSuite
);
/** Current trump suit */
export const selectTrumpSuit = createSelector(
  selectGame,
  (g): number | null => g.trumpSuite
);
/** Index of trick leader (first to play this trick) */
export const selectTrickLeaderIndex = createSelector(
  selectCurrentTrick,
  (t): number | null => (t.length > 0 ? t[0].player : null)
);
/** Whether the trick has 4 cards */
export const selectIsTrickComplete = createSelector(
  selectTrickCount,
  c => c === 4
);

// Scores and teams
/** Named team scores - updated for new format */
export const selectTeamScores = createSelector(
  selectGame,
  (g): { team1: number; team2: number } => g.scores
);

/** Player -> team map */
export const selectPlayers = createSelector(
  selectPlayerState,
  (playerState): Record<number, Playerv2> | null => playerState.players
);

/** Player names mapping */
export const selectPlayerNames = createSelector(
  selectPlayerState,
  (playerState): Record<number, string> => playerState.playerNames
);

/** Individual player by index */
export const selectPlayerByIndex = (playerIndex: number) =>
  createSelector(selectPlayers, players => players?.[playerIndex] || null);

// Derive teams from players - updated for new team system (1/2 instead of 0/1)
export const selectTeams = createSelector(
  selectPlayers,
  (players): Record<number, number[]> => {
    const teams: Record<number, number[]> = { 1: [], 2: [] }; // Changed from 0/1 to 1/2
    if (!players) return teams;

    // Group players by their team
    Object.entries(players).forEach(([playerId, playerRecord]) => {
      const player = parseInt(playerId);
      const team = playerRecord.team;
      if (team === null) return { 1: [], 2: [] }; // Changed from 0/1 to 1/2
      if (!teams[team]) teams[team] = [];
      teams[team].push(player);
    });

    return teams;
  }
);

// Bidding (core selectors)
/** Raw bidding state */
export const selectBiddingStateRaw = createSelector(
  selectGame,
  (g): BiddingState => g.biddingState
);
export const selectCurrentBid = createSelector(
  selectBiddingStateRaw,
  b => b.currentBid
);
export const selectCurrentBidder = createSelector(
  selectBiddingStateRaw,
  b => b.currentBidder
);
export const selectPassedPlayers = createSelector(
  selectBiddingStateRaw,
  b => b.passedPlayers
);
export const selectBidWinner = createSelector(
  selectBiddingStateRaw,
  b => b.bidWinner
);
export const selectBidHistory = createSelector(
  selectBiddingStateRaw,
  b => b.bidHistory
);
export const selectBidTimer = createSelector(
  selectBiddingStateRaw,
  b => b.bidTimer
);

// Bidding (derived selectors)
export const selectBiddingActive = createSelector(
  [selectPassedPlayers, selectBidWinner],
  (passedPlayers, bidWinner): boolean =>
    passedPlayers.length < 3 && bidWinner === null
);
export const selectActiveBidders = createSelector(
  selectPassedPlayers,
  (passedPlayers): number[] =>
    [0, 1, 2, 3].filter(idx => !passedPlayers.includes(idx))
);

// Phase flags (derived from stage and game state)
export const selectShowCardsPhase = createSelector(
  selectStage,
  (stage): boolean => stage === GameStages.ROUND_COMPLETE
);
export const selectIsCollectingCards = createSelector(
  selectStage,
  (stage): boolean => stage === GameStages.ROUND_COMPLETE
);
export const selectCollectionWinner = createSelector(
  selectGame,
  (g): number | null => g.collectionWinner
);

// Game config & identity
export const selectTotalRounds = createSelector(
  selectGame,
  (g): number => g.totalRounds
);
export const selectRoundIndex = createSelector(
  selectGame,
  (g): number => g.round
);
export const selectBidAmount = createSelector(
  selectGame,
  (g): number | null => g.bidAmount
);

// Phase 1: Basic selectors for new state structure
/** Current player index - only valid during PLAYING stage */
export const selectCurrentPlayerIndex = createSelector(
  [selectGame, selectStage],
  (game, stage): number =>
    stage === GameStages.PLAYING ? game.tableState.turn : -1
);

// Phase 2: Player display data selectors
/** Transform players for UI consumption - computed on-demand, no state redundancy */
export const selectPlayerDisplayData = createSelector(
  [selectPlayers, selectPlayerState, selectCurrentPlayerIndex],
  (players, playerState, currentPlayerIndex) => {
    if (!players) return [];

    return Object.entries(players).map(([index, player]) => ({
      id: `player-${index}`,
      name:
        playerState.playerNames[parseInt(index)] ||
        `Player ${parseInt(index) + 1}`,
      team: player.team, // Already in 1/2 format from Phase 1
      cards: player.hand,
      isCurrentPlayer: parseInt(index) === currentPlayerIndex,
      isTeammate: player.isTeammate,
      isBidWinner: player.isBidWinner,
    }));
  }
);

/** Efficiently compute teammate relationships - returns set of teammate indices */
export const selectTeammates = createSelector([selectPlayers], players => {
  if (!players) return new Set<number>();

  const firstPlayerTeam = players[0]?.team;
  if (!firstPlayerTeam) return new Set<number>();

  const teammates = new Set<number>();
  Object.entries(players).forEach(([index, player]) => {
    const playerIndex = parseInt(index);
    if (player.team === firstPlayerTeam && playerIndex !== 0) {
      teammates.add(playerIndex);
    }
  });

  return teammates;
});

export const selectBidder = createSelector(
  selectGame,
  (g): number | null => g.bidWinner // Changed from g.bidder to g.bidWinner
);
export const selectTeammateCard = createSelector(
  selectGame,
  (g): Card | null => g.teammateCard
);
