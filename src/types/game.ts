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
  Diamond
}

export interface TableCard extends Card {
  player: number;
}

export interface Player {
  hand: Card[];
  score: number;
}

export interface BiddingState {
  biddingActive: boolean;
  currentBid: number;
  currentBidder: number;
  passedPlayers: number[];
  bidStatusByPlayer: Record<number, string>;
  bidWinner: number | null;
  bidHistory: Array<{ player: number; bid: number }>;
  bidTimer: number;
}

export interface GameState {
  stage: string;
  players: Record<number, Player>;
  round: number;
  runningSuite: number | null;
  trumpSuite: number | null;
  bidAmount: number | null;
  bidder: number | null;
  tableCards: TableCard[];
  scores: [number, number];
  turn: number;
  roundWinner: number | null;
  isRoundEnding: boolean;
  totalRounds: number;
  teams: Record<number, number[]>;
  playerTeamMap: Record<number, number> | null;
  teamColors: Record<number, string>;
  playerAgents: Record<number, any>;
  playerNames: Record<number, string>;
  teammateCard: Card | null;
  biddingState: BiddingState;
}

export interface TeammateCard {
  suite: number;
  number: number;
}