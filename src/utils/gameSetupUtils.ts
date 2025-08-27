import { BiddingState, Card, Playerv2 } from "@/types/game";
import { BID_TIMER_DURATION } from "@/utils/constants";

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
