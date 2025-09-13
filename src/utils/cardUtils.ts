import { Card, Suite } from "@/types/game";
import { DECK_NUMBERS, DECK_SUITES } from "@/utils/constants";
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

// split array into two parts, put them back in different order, do this N times
export const splitShuffle = (array: Card[], N: number = 1): Card[] => {
  if (array.length < 2) return [...array];
  let shuffled = [...array];
  for (let i = 0; i < N; i++) {
    // Pick a random split point (not at the ends)
    const splitIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
    const firstPart = shuffled.slice(0, splitIndex);
    const secondPart = shuffled.slice(splitIndex);
    // Put the second part first, then the first part
    shuffled = [...secondPart, ...firstPart];
  }
  return shuffled;
};

export const sortHand = (hand: Card[]): Card[] => {
  return hand.sort((a, b) => a.positionValue - b.positionValue);
};

export const distributeDeck = (deck: Card[], numPlayers: number): Card[][] => {
  const hands: Card[][] = Array(numPlayers)
    .fill(null)
    .map(() => []);

  if (deck.length % numPlayers !== 0) {
    throw new Error("Deck size must be divisible by number of players");
  }

  // we want to distribute 4 cards at a time, if not enough cards left to distribute 4 each, distribute 2 each.
  let index = 0;
  while (index < deck.length) {
    const remaining = deck.length - index;
    const perPlayerThisRound =
      remaining >= 4 * numPlayers ? 4 : remaining >= 2 * numPlayers ? 2 : 1;

    for (let p = 0; p < numPlayers; p++) {
      for (let c = 0; c < perPlayerThisRound; c++) {
        hands[p].push(deck[index++]);
      }
    }
  }

  // Sort each hand by position value
  hands.forEach(hand => {
    hand.sort((a, b) => a.positionValue - b.positionValue);
  });

  return hands;
};
