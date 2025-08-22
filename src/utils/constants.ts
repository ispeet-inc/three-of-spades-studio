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
  botBidThinkMs: 1500, // bot bidding delay

  // Playing
  botPlayDelayMs: 1000, // bot play delay
  botTrumpThinkMs: 2000, // bot trump selection delay

  // Dealing
  dealingStaggerMs: 150, // dealing stagger between cards
} as const;

export const BIDDING_TEAM = 0;
export const DEFENDING_TEAM = 1;
// todo - use this to set orientation + update hard-coded logic everywhere
export const FIRST_PLAYER_ID = 0;

export const PLAYER_NAME_POOL = [
  "Akash",
  "Natasha",
  "Prateek",
  "Abhi",
  "Vladmir Putin",
  "Dumbledore",
];
