import {
  BiddingState,
  Card,
  GameState,
  Playerv2,
  SeriesProgress,
} from "@/types/game";
import { BID_TIMER_DURATION } from "@/utils/constants";
import { GameStages } from "../store/gameStages";
import { distributeDeck, splitShuffle } from "./cardUtils";
import { initialTableState } from "./tableUtils";

export const initialBiddingState = (
  numPlayers: number,
  startingPlayer: number,
  active: boolean
): BiddingState => {
  return {
    biddingActive: active,
    currentBid: 165,
    currentBidder: active ? (startingPlayer + 1) % numPlayers : startingPlayer,
    passedPlayers: [],
    bidWinner: null,
    bidHistory: active ? { [startingPlayer]: 165 } : {},
    bidTimer: BID_TIMER_DURATION,
  };
};

export const initPlayerObject = (hand: Card[]): Playerv2 => {
  return {
    hand: hand,
    score: 0,
    isBidWinner: false,
    isTeammate: false,
    team: null,
  };
};

export const initPlayerNames = (
  numPlayers: number,
  firstPlayerId: number,
  firstPlayerName: string
): Record<number, string> => {
  const playerNames = Object.fromEntries(
    Array.from({ length: numPlayers }, (_, i) => [i, ""])
  );
  playerNames[firstPlayerId] = firstPlayerName;
  return playerNames;
};

export const initSeriesProgress = (
  numPlayers: number,
  totalGames: number
): SeriesProgress => {
  return {
    currentGame: 0,
    totalGames: totalGames,
    gameScores: {},
    seriesScores: Object.fromEntries(
      Array.from({ length: numPlayers }, (_, i) => [i, 0])
    ),
    startingPlayerIndex: 0,
    seriesWinner: null,
  };
};

export const resetGameStateForNewGame = (
  state: GameState,
  numPlayers: number,
  startingPlayer: number
): Partial<GameState> => {
  const deck = splitShuffle(state.tableState.discardedCards, 2);
  const distributedHands = distributeDeck(deck, numPlayers);

  // Initialize each player's hand
  const newPlayers: Record<number, Playerv2> = {};
  for (let i = 0; i < numPlayers; i++) {
    newPlayers[i] = initPlayerObject(distributedHands[i]);
  }

  const scores = { team1: 0, team2: 0 };
  return {
    tableState: initialTableState(numPlayers, startingPlayer, false),
    playerState: {
      ...state.playerState,
      players: newPlayers,
      startingPlayer: startingPlayer,
    },
    biddingState: initialBiddingState(numPlayers, startingPlayer, false),
    gameProgress: {
      ...state.gameProgress,
      scores: scores,
      trick: 0,
    },
    gameConfig: null,
  };
};

export const resetGameStateForNewSeries = (
  state: GameState,
  numPlayers: number,
  totalGames: number
): Partial<GameState> => {
  return {
    gameProgress: {
      stage: GameStages.INIT,
      trick: 0,
      scores: { team1: 0, team2: 0 },
    },
    seriesProgress: initSeriesProgress(numPlayers, totalGames),
  };
};
