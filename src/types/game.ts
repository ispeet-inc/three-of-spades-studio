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

// Base player interface with common properties
export interface BasePlayer {
  team: 1 | 2 | null;
  isTeammate: boolean;
  isBidWinner: boolean;
}

// Game state player - extends base with game-specific properties
export interface Playerv2 extends BasePlayer {
  hand: Card[];
  score: number;
}

// UI display player - extends base with display-specific properties
export interface PlayerDisplayData extends BasePlayer {
  id: string;
  name: string;
  cards: Card[];
  isCurrentPlayer: boolean;
  isFirstPersonTeammate: boolean;
}

export interface BiddingState {
  /** @deprecated Use selectBiddingActive selector instead */
  biddingActive: boolean;
  currentBid: number;
  currentBidder: number;
  passedPlayers: number[];
  /** @deprecated Use selectBidStatusByPlayer selector instead */
  bidStatusByPlayer: Record<number, string>;
  bidWinner: number | null;
  bidHistory: Array<{ player: number; bid: number }>;
  bidTimer: number;
}

export interface TableState {
  runningSuite: Suite | null;
  tableCards: TableCard[];
  turn: number;
  roundWinner: TableCard | null;
  discardedCards: Card[];
}

export interface PlayerState {
  startingPlayer: number;
  players: Record<number, Playerv2>;
  playerAgents: Record<number, any>;
  playerNames: Record<number, string>;
}

export interface GameConfig {
  bidAmount: number;
  bidWinner: number;
  teammateCard: Card;
  trumpSuite: number;
  totalRounds: number;
}

export interface GameProgress {
  round: number;
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
}
