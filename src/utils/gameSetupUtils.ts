import { BiddingState, Card, Playerv2 } from "@/types/game";

export const initialBiddingState = (
  numPlayers: number,
  startingPlayer: number,
  active: boolean
): BiddingState => {
  return {
    biddingActive: active,
    currentBid: 165,
    currentBidder: startingPlayer,
    passedPlayers: [],
    bidStatusByPlayer: Object.fromEntries(
      Array.from({ length: numPlayers }, (_, i) => [i, "Bidding"])
    ),
    bidWinner: null,
    bidHistory: [],
    bidTimer: 30,
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
