import { Card, Suite } from "../types/game";
import { createCard } from "../utils/cardUtils";

// Sample hand data - Edit this to test different hands
export const sampleHand: Card[] = [
  createCard(Suite.Spade, 9),
  createCard(Suite.Heart, 3),
  createCard(Suite.Heart, 7),
  createCard(Suite.Heart, 10),
  createCard(Suite.Heart, 11),
  createCard(Suite.Club, 10),
  createCard(Suite.Club, 11),
  createCard(Suite.Club, 12),
  createCard(Suite.Diamond, 8),
];

// Sample discarded cards data - Edit this to test different discarded cards
export const sampleDiscardedCards: Card[] = [
  createCard(Suite.Club, 1), // Ace of Clubs
  createCard(Suite.Club, 3), // 3 of Clubs
  createCard(Suite.Club, 7), // 7 of Clubs
  createCard(Suite.Club, 8), // 8 of Clubs
];
