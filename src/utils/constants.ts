import { Suite } from "@/types/game";

export const DECK_SUITES = [
  Suite.Spade,
  Suite.Heart,
  Suite.Club,
  Suite.Diamond,
]; // SPADE=0, HEART=1, DIAMOND=2, CLUB=3
export const DECK_NUMBERS = [3, 5, 7, 8, 9, 10, 11, 12, 13, 1]; // 11=J, 12=Q, 13=K, 1=A

export const TIMINGS = {
  // Trick display and collection flow
  trickDisplayMs: 1500, // delay before collection begins
  collectionAnimationMs: 2000, // collection animation duration
  collectionBufferMs: 500, // buffer after collection

  // Bidding
  biddingTimerStepMs: 1000, // saga decrements timer per second
  botBidThinkMs: 2000, // bot bidding delay
  biddingResultDelayMs: 3000, // delay before bidding result is shown

  // Playing
  botPlayDelayMs: 1000, // bot play delay
  botTrumpThinkMs: 2000, // bot trump selection delay

  // Dealing
  dealingStaggerMs: 150, // dealing stagger between cards
} as const;

export const BIDDING_TEAM = 1; // Changed from 0 to 1
export const DEFENDING_TEAM = 2; // Changed from 1 to 2
// todo - use this to set orientation + update hard-coded logic everywhere
export const FIRST_PLAYER_ID = 3;
export const NUM_PLAYERS = 4;

// Bidding constants
export const BID_TIMER_DURATION = 30;
export const MAX_BID = 250;
export const MIN_INCREMENT_BELOW_200 = 5;
export const MIN_INCREMENT_ABOVE_200 = 10;

export const PLAYER_NAME_POOL = [
  "Akash",
  "Natasha",
  "Prateek",
  "Abhi",
  "Vladmir Putin",
  "Dumbledore",
];
