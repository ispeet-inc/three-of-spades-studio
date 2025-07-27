import { Card } from "@/types/game";

// Utility functions for card operations
const getId = (number: number): string => {
  if (number === 1) return "A";
  if (number === 11) return "J";
  if (number === 12) return "Q";
  if (number === 13) return "K";
  return number.toString();
};

const getPoints = (number: number, suite: number): number => {
  if (number === 1) {
    return 10;
  } else if (number >= 10) {
    return 10;
  } else if (number === 5) {
    return 5;
  } else if (number === 3 && suite === 0) {
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

export const createCard = (suite: number, number: number): Card => {
  const id = getId(number);
  const rank = getRank(number);
  const points = getPoints(number, suite)
  const positionValue = 100 * suite + rank;
  return {
    id,
    suite,
    number,
    rank: rank,
    points: points,
    positionValue: positionValue
  };
};

export const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  const suites = [0, 1, 2, 3]; // SPADE=0, HEART=1, DIAMOND=2, CLUB=3
  const numbers = [3, 5, 7, 8, 9, 10, 11, 12, 13, 1]; // 11=J, 12=Q, 13=K, 1=A

  suites.forEach((suite) => {
    numbers.forEach((number) => {
      deck.push(createCard(suite, number));
    });
  });
  return deck;
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
  const hands: Card[][] = Array(numPlayers).fill(null).map(() => []);

  if (deck.length % numPlayers !== 0) {
    throw new Error("Deck size must be divisible by number of players");
  }

  for (let i = 0; i < deck.length; i++) {
    hands[i % numPlayers].push(deck[i]);
  }

  // Sort each hand by position value
  hands.forEach((hand) => {
    hand.sort((a, b) => a.positionValue - b.positionValue);
  });

  return hands;
};

export const getSuiteName = (suite: number): string => {
  const names = ['spade', 'heart', 'club', 'diamond'];
  return names[suite];
};

export const getSuiteColor = (suite: number): string => {
  return suite === 1 || suite === 3 ? 'red' : 'black';
};

export const getSuiteIcon = (suite: number): string => {
  const icons = ['♠', '♥', '♣', '♦'];
  return icons[suite];
};