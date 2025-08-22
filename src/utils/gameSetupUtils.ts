import { BiddingState } from "@/types/game"

export const initialBiddingState = (numPlayers: number, startingPlayer: number, active: boolean): BiddingState => {
  return {
    biddingActive: active,
    currentBid: 165,
    currentBidder: startingPlayer,
    passedPlayers: [],
    bidStatusByPlayer: Object.fromEntries(Array.from({ length: numPlayers }, (_, i) => [i, "Bidding"])),
    bidWinner: null,
    bidHistory: [],
    bidTimer: 30,
  }
}
