import { Card, Suite } from "@/types/game";
import { DECK_SUITES, DECK_NUMBERS } from "@/utils/constants";
import { getSuiteName } from "./suiteUtils";

// Utility functions for card operations
export const getCardId = (number: number): string => {
  if (number === 1) return "A";
  if (number === 11) return "J";
  if (number === 12) return "Q";
  if (number === 13) return "K";
  return number.toString();
};

export const getHash = (suite: Suite, number: number) => {
  return `${getCardId(number)}-of-${getSuiteName(suite)}`;
};

const getPoints = (number: number, suite: Suite): number => {
  if (number === 1) {
    return 10;
  } else if (number >= 10) {
    return 10;
  } else if (number === 5) {
    return 5;
  } else if (number === 3 && suite === Suite.Spade) {
    return 30;
  } else {
    return 0;
  }
};

const getRank = (number: number): number => {
  if (number === 1) {
    return 14;
  } else {
    return number;
  }
};

export const createCard = (suite: Suite, number: number): Card => {
  const id = getCardId(number);
  const rank = getRank(number);
  const points = getPoints(number, suite);
  const positionValue = 100 * suite + rank;
  const hash = getHash(suite, number);

  return {
    id,
    suite,
    number,
    rank: rank,
    points: points,
    positionValue: positionValue,
    hash: hash,
  };
};

export const getCardSet = (cards: Card[]): Set<string> => {
  const cardSet = new Set(cards.map(card => card.hash));
  return cardSet;
};

export const generateDeck = (): Card[] => {
  const deck: Card[] = [];

  DECK_SUITES.forEach(suite => {
    DECK_NUMBERS.forEach(number => {
      deck.push(createCard(suite, number));
    });
  });
  return deck;
};

export const getTopKCardsFromSuite = (suite: Suite, k: number): Card[] => {
  const topCards: Card[] = [];

  DECK_NUMBERS.slice(-k).forEach(number => {
    topCards.push(createCard(suite, number));
  });

  return topCards;
};

export const shuffle = (array: Card[]): Card[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const distributeDeck = (deck: Card[], numPlayers: number): Card[][] => {
  const hands: Card[][] = Array(numPlayers)
    .fill(null)
    .map(() => []);

  if (deck.length % numPlayers !== 0) {
    throw new Error("Deck size must be divisible by number of players");
  }

  for (let i = 0; i < deck.length; i++) {
    hands[i % numPlayers].push(deck[i]);
  }

  // Sort each hand by position value
  hands.forEach(hand => {
    hand.sort((a, b) => a.positionValue - b.positionValue);
  });

  return hands;
};
