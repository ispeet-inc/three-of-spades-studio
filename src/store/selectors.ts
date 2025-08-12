/*
  Centralized, memoized selectors for the game state.
  Phase 0: Additive-only, no behavior changes. These selectors are not yet used.
*/
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { GameStages } from "@/store/gameStages";
import type {
  GameState,
  Card,
  TableCard,
  Player,
  BiddingState,
} from "@/types/game";
import type { GameStage } from "@/store/gameStages";

// Root selectors
/** Returns the game slice */
export const selectGame = (state: RootState): GameState => state.game;
/** Returns the current stage */
export const selectStage = createSelector(selectGame, (g): GameStage => g.stage as GameStage);

export const selectIsInit = createSelector(selectStage, (s) => s === GameStages.INIT);
export const selectIsBidding = createSelector(selectStage, (s) => s === GameStages.BIDDING);
export const selectIsTrumpSelection = createSelector(
  selectStage,
  (s) => s === GameStages.TRUMP_SELECTION
);
export const selectIsPlaying = createSelector(selectStage, (s) => s === GameStages.PLAYING);
export const selectIsCardsDisplay = createSelector(
  selectStage,
  (s) => s === GameStages.CARDS_DISPLAY
);
export const selectIsRoundComplete = createSelector(
  selectStage,
  (s) => s === GameStages.ROUND_COMPLETE
);
export const selectIsRoundSummary = createSelector(
  selectStage,
  (s) => s === GameStages.ROUND_SUMMARY
);
export const selectIsGameOver = createSelector(selectStage, (s) => s === GameStages.GAME_OVER);

// Players and turn
/** All players map */
export const selectPlayers = createSelector(selectGame, (g): Record<number, Player> => g.players);
/** Current turn index */
export const selectTurnIndex = createSelector(selectGame, (g): number => g.turn);
/** Player hand factory */
export const makeSelectPlayerHand = (playerIndex: number) =>
  createSelector(selectPlayers, (players): Card[] => players[playerIndex]?.hand ?? []);
/** Is given player the current turn */
export const makeSelectIsCurrentPlayer = (playerIndex: number) =>
  createSelector(selectTurnIndex, (turn): boolean => turn === playerIndex);

// Trick (table, leader/winner, suits)
/** Cards currently on table (current trick) */
export const selectCurrentTrick = createSelector(selectGame, (g): TableCard[] => g.tableCards);
/** Number of cards in current trick */
export const selectTrickCount = createSelector(selectCurrentTrick, (t) => t.length);
/** Leading suit for the trick (runningSuite) */
export const selectLeadingSuit = createSelector(selectGame, (g): number | null => g.runningSuite);
/** Current trump suit */
export const selectTrumpSuit = createSelector(selectGame, (g): number | null => g.trumpSuite);
/** Index of trick leader (first to play this trick) */
export const selectTrickLeaderIndex = createSelector(selectCurrentTrick, (t): number | null =>
  t.length > 0 ? t[0].player : null
);
/** Index of trick winner (roundWinner) */
export const selectTrickWinnerIndex = createSelector(selectGame, (g): number | null => g.roundWinner);
/** Whether the trick has 4 cards */
export const selectIsTrickComplete = createSelector(selectTrickCount, (c) => c === 4);

// Scores and teams
/** Tuple scores [team1, team2] */
export const selectScoresTuple = createSelector(selectGame, (g): [number, number] => g.scores);
/** Named team scores */
export const selectTeamScores = createSelector(selectScoresTuple, ([team1, team2]) => ({ team1, team2 }));
/** Player -> team map */
export const selectPlayerTeamMap = createSelector(
  selectGame,
  (g): Record<number, number> | null => g.playerTeamMap
);
/** Team id for a given player (or null) */
export const makeSelectTeamForPlayer = (playerIndex: number) =>
  createSelector(selectPlayerTeamMap, (map): number | null => (map ? map[playerIndex] ?? null : null));
/** Teams composition */
export const selectTeams = createSelector(selectGame, (g): Record<number, number[]> => g.teams);

// Bidding (core selectors)
/** Raw bidding state */
export const selectBiddingStateRaw = createSelector(selectGame, (g): BiddingState => g.biddingState);
export const selectCurrentBid = createSelector(selectBiddingStateRaw, (b) => b.currentBid);
export const selectCurrentBidder = createSelector(selectBiddingStateRaw, (b) => b.currentBidder);
export const selectPassedPlayers = createSelector(selectBiddingStateRaw, (b) => b.passedPlayers);
export const selectBidWinner = createSelector(selectBiddingStateRaw, (b) => b.bidWinner);
export const selectBidHistory = createSelector(selectBiddingStateRaw, (b) => b.bidHistory);
export const selectBidTimer = createSelector(selectBiddingStateRaw, (b) => b.bidTimer);

// Bidding (derived selectors)
export const selectBiddingActive = createSelector(
  [selectPassedPlayers, selectBidWinner],
  (passedPlayers, bidWinner): boolean => passedPlayers.length < 3 && bidWinner === null
);
export const selectActiveBidders = createSelector(
  selectPassedPlayers,
  (passedPlayers): number[] => [0, 1, 2, 3].filter(idx => !passedPlayers.includes(idx))
);
export const selectBidStatusByPlayer = createSelector(
  [selectBidHistory, selectPassedPlayers, selectCurrentBidder, selectCurrentBid],
  (bidHistory, passedPlayers, currentBidder, currentBid): Record<number, string> => {
    const status: Record<number, string> = {};
    
    // Initialize all players as "Bidding"
    for (let i = 0; i < 4; i++) {
      status[i] = "Bidding";
    }
    
    // Mark passed players
    passedPlayers.forEach(player => {
      status[player] = "Passed";
    });
    
    // Mark current highest bidder
    const lastBid = bidHistory[bidHistory.length - 1];
    if (lastBid && !passedPlayers.includes(lastBid.player)) {
      status[lastBid.player] = `Current Bid: ${lastBid.bid}`;
    }
    
    return status;
  }
);

// Phase flags (derived from stage and game state)
export const selectShowCardsPhase = createSelector(selectStage, (stage): boolean => stage === GameStages.ROUND_COMPLETE);
export const selectIsCollectingCards = createSelector(selectStage, (stage): boolean => stage === GameStages.ROUND_COMPLETE);
export const selectIsRoundEnding = createSelector(
  [selectIsTrickComplete, selectTrickWinnerIndex],
  (isTrickComplete, trickWinner): boolean => isTrickComplete && trickWinner !== null
);
export const selectCollectionWinner = createSelector(
  selectGame,
  (g): number | null => g.collectionWinner
);

// Game config & identity
export const selectTotalRounds = createSelector(selectGame, (g): number => g.totalRounds);
export const selectRoundIndex = createSelector(selectGame, (g): number => g.round);
export const selectBidAmount = createSelector(selectGame, (g): number | null => g.bidAmount);
export const selectBidder = createSelector(selectGame, (g): number | null => g.bidder);
export const selectTeammateCard = createSelector(selectGame, (g): Card | null => g.teammateCard);
export const selectPlayerNames = createSelector(
  selectGame,
  (g): Record<number, string> => g.playerNames
);
