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

export interface Player {
  hand: Card[];
  score: number;
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

export interface GameState {
  stage: GameStage;
  players: Record<number, Player>;
  startingPlayer: number;
  round: number;
  trumpSuite: number | null;
  bidAmount: number | null;
  bidder: number | null;
  scores: [number, number];
  totalRounds: number;
  playerTeamMap: Record<number, number> | null;
  playerAgents: Record<number, any>;
  playerNames: Record<number, string>;
  teammateCard: Card | null;
  /** @deprecated Use selectIsCollectingCards selector instead */
  isCollectingCards: boolean;
  /** @deprecated Use selectShowCardsPhase selector instead */
  showCardsPhase: boolean;
  collectionWinner: number | null;
  biddingState: BiddingState;
  tableState: TableState;
}
