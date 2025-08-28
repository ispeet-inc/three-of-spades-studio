// Command to run:
// npx tsx /Users/sky/Documents/Workspace/three-of-spades-studio/src/tester.ts
import { Suite } from "./types/game";
import { createCard } from "./utils/cardUtils";
import { getMaxBid, printCardHashes } from "./utils/handUtils";

// 3, 5, 7, Q, A Spade
// 5, 8, J, K Club
// A Diamond
const hand = [
  createCard(Suite.Spade, 3),
  createCard(Suite.Spade, 5),
  createCard(Suite.Spade, 7),
  createCard(Suite.Spade, 12),
  createCard(Suite.Spade, 1),
  createCard(Suite.Club, 5),
  createCard(Suite.Club, 8),
  createCard(Suite.Club, 11),
  createCard(Suite.Club, 13),
  createCard(Suite.Diamond, 1),
];

console.log("User Hand: ");
printCardHashes(hand);

console.log("Max Bid: ", getMaxBid(hand));
