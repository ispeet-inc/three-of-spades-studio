import { Card } from "@/types/game";
import { generateDeck, shuffle, sortHand } from "./cardUtils";

// Generate a full deck
export const createSampleDeck = (): Card[] => {
  return generateDeck();
};

// Sample 10 cards for a hand
export const sampleHand = (deck: Card[], handSize: number = 10): Card[] => {
  if (handSize > deck.length) {
    throw new Error(
      `Cannot sample ${handSize} cards from deck of size ${deck.length}`
    );
  }

  // Shuffle the deck first to randomize the sampling
  const shuffledDeck = shuffle([...deck]);

  // Take the first 10 cards
  const hand = shuffledDeck.slice(0, handSize);
  return sortHand(hand);
};

// Sample 8 cards for discard
export const sampleDiscard = (
  deck: Card[],
  discardSize: number = 8
): Card[] => {
  if (discardSize > deck.length) {
    throw new Error(
      `Cannot sample ${discardSize} cards from deck of size ${deck.length}`
    );
  }

  // Shuffle the deck first to randomize the sampling
  const shuffledDeck = shuffle([...deck]);

  // Take the first 8 cards
  const discarded = shuffledDeck.slice(0, discardSize);
  return sortHand(discarded);
};

export const sampleHandAndDiscard = (
  handSize: number = 10,
  discardSize: number = 8
): { hand: Card[]; discard: Card[] } => {
  const deck = createSampleDeck();
  const shuffledDeck = shuffle([...deck]);
  // take the first handSize cards as hand & remove them from deck
  const hand = shuffledDeck.slice(0, handSize);
  const discard = shuffledDeck.slice(handSize, handSize + discardSize);
  return { hand: sortHand(hand), discard: sortHand(discard) };
};
