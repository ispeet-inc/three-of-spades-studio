import type { GameStage } from "../store/gameStages";

export interface Card {
  id: string;
  suite: number;
  number: number;
  rank: number;
  points: number;
  positionValue: number;
  hash: string;
}

export enum Suite {
  Spade,
  Heart,
  Club,
  Diamond,
}

export interface TableCard extends Card {
  player: number;
}

// Team scores interface
export interface TeamScores {
  team1: number;
  team2: number;
}

export enum GameMode {
  Single,
  Series,
}

// Game state player - extends base with game-specific properties
export interface Playerv2 {
  team: 1 | 2 | null;
  isTeammate: boolean;
  isBidWinner: boolean;
  hand: Card[];
  score: number;
}

// UI display player - extends base with display-specific properties
export interface PlayerDisplayData extends Playerv2 {
  id: string;
  name: string;
  isCurrentPlayer: boolean;
  isFirstPersonTeammate: boolean;
}

export interface BiddingState {
  /** @deprecated Use selectBiddingActive selector instead */
  biddingActive: boolean;
  currentBid: number;
  currentBidder: number;
  passedPlayers: number[];
  bidWinner: number | null;
  bidHistory: Record<number, number>;
  bidTimer: number;
}

export interface TableState {
  runningSuite: Suite | null;
  tableCards: TableCard[];
  turn: number;
  trickWinner: TableCard | null;
  discardedCards: Card[];
  // keep track of who has what suite missing based on not playing the running suite
  missingSuiteMemory: Record<number, Suite[]>;
}

export interface PlayerState {
  startingPlayer: number;
  players: Record<number, Playerv2>;
  playerAgents: Record<number, string>;
  playerNames: Record<number, string>;
}

export interface GameConfig {
  bidAmount: number;
  bidWinner: number;
  teammateCard: Card;
  trumpSuite: number;
  totalTricks: number;
  isTeammateRevealed: boolean;
}

export interface GameResult {
  gameScores: Record<number, number>; // player -> score
  margin: number; // points won by defending team
  whitewash: boolean; // whitewash
}

// NEW: Series progress interface for multi-game series
export interface SeriesProgress {
  currentGame: number;
  totalGames: number;
  gameResults: Record<number, GameResult>; // game -> game result
  /** @deprecated Use gameResults instead */
  gameScores: Record<number, Record<number, number>>; // game -> player -> score
  seriesScores: Record<number, number>; // player -> cumulative score
  startingPlayerIndex: number; // Current starting player (0-3)
  seriesWinner: number | null;
}

export interface GameProgress {
  trick: number;
  scores: TeamScores;
  stage: GameStage;
}

export interface GameError {
  type: "STAGE_TRANSITION" | "INITIALIZATION" | "GAME_LOGIC" | "UNKNOWN";
  message: string;
  timestamp: number;
  recoverable: boolean;
  fallbackAction?: string;
}

export interface GameState {
  gameConfig: GameConfig | null;
  gameProgress: GameProgress;
  biddingState: BiddingState;
  tableState: TableState;
  playerState: PlayerState;
  error: GameError | null;
  // NEW: Series management
  seriesProgress: SeriesProgress;
  gameMode: GameMode;
  // NEW: UI state for animations
  uiState: {
    showWhitewashAnimation: boolean;
  };
}
