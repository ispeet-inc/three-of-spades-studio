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
  isCurrentPlayer?: boolean;
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

export interface GameState {
  stage: GameStage;
  round: number;
  trumpSuite: number | null;
  bidAmount: number | null;
  bidWinner: number | null; // Changed from bidder to bidWinner
  scores: TeamScores; // Updated to use the new type
  totalRounds: number;
  teammateCard: Card | null;
  /** @deprecated Use selectIsCollectingCards selector instead */
  isCollectingCards: boolean;
  /** @deprecated Use selectShowCardsPhase selector instead */
  showCardsPhase: boolean;
  collectionWinner: number | null;
  biddingState: BiddingState;
  tableState: TableState;
  playerState: PlayerState;
}
