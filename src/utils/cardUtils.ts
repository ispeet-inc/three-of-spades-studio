import { Card } from "@/types/game";

// Card number to rank mapping for Three of Spades
const RANK_MAP: Record<number, number> = {
  3: 1,   // 3 is lowest
  5: 2,   // 5 
  7: 3,   // 7
  8: 4,   // 8
  9: 5,   // 9
  10: 6,  // 10
  11: 7,  // Jack
  12: 8,  // Queen  
  13: 9,  // King
  1: 10,  // Ace is highest
};

// Points for each card
const POINTS_MAP: Record<number, number> = {
  3: 0, 5: 5, 7: 0, 8: 0, 9: 0, 10: 10, 11: 2, 12: 3, 13: 4, 1: 11
};

// Position value for sorting
const POSITION_MAP: Record<number, number> = {
  3: 1, 5: 2, 7: 3, 8: 4, 9: 5, 10: 6, 11: 7, 12: 8, 13: 9, 1: 10
};

export const createCard = (suite: number, number: number): Card => {
  const id = number === 1 ? 'A' : number.toString();
  return {
    id,
    suite,
    number,
    rank: RANK_MAP[number],
    points: POINTS_MAP[number],
    positionValue: POSITION_MAP[number]
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
  const names = ['spade', 'heart', 'diamond', 'club'];
  return names[suite];
};

export const getSuiteColor = (suite: number): string => {
  return suite === 1 || suite === 2 ? 'red' : 'black';
};

export const getSuiteIcon = (suite: number): string => {
  const icons = ['♠', '♥', '♦', '♣'];
  return icons[suite];
};