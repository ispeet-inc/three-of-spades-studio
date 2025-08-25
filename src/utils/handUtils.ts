import { Card, Suite } from "@/types/game";
import { generateDeck, getCardSet, getTopKCardsFromSuite } from "./cardUtils";

/**
 * Checks if the given suite is present in the hand.
 * @param hand - Array of card objects.
 * @param suite - The suite to check for.
 * @returns True if the suite is present, false otherwise.
 */
export function hasSuite(hand: Card[], suite: Suite): boolean {
  const suiteCards = hand.filter(card => card.suite === suite);
  return suiteCards.length > 0;
}

/**
 * Returns a random valid index from the hand array.
 * @param hand - Array of card objects.
 * @returns A random index, or null if hand is empty or not an array.
 */
export function getRandomCardIndex(hand: Card[]): number | null {
  if (!Array.isArray(hand) || hand.length === 0) return null;
  return Math.floor(Math.random() * hand.length);
}

/**
 * Returns a random card index from hand for a given suite.
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns The index of a random card in the suite, or null if none found.
 */
export function getRandomCardIndexBySuite(
  hand: Card[],
  suite: Suite
): number | null {
  const suiteCards = hand.filter(card => card.suite === suite);
  if (suiteCards.length > 0) {
    const randomIndex = getRandomCardIndex(suiteCards);
    if (randomIndex === null) return null;
    return hand.indexOf(suiteCards[randomIndex]);
  }
  return null;
}

/**
 * Returns the index of the highest ranked card in the hand.
 * @param hand - Array of card objects.
 * @returns The index of the highest ranked card, or null if hand is empty.
 */
export function getHighestRankedCardIndex(hand: Card[]): number | null {
  if (!hand || hand.length === 0) return null;

  let highestCardIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].rank > hand[highestCardIndex].rank) {
      highestCardIndex = i;
    }
  }
  return highestCardIndex;
}

/**
 * Returns the index of the highest ranked card in a specific suite.
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns The index of the highest ranked card in the suite, or null if none found.
 */
export function getHighestRankedCardIndexInSuite(
  hand: Card[],
  suite: Suite
): number | null {
  if (!hand || hand.length === 0) return null;

  const suiteCards = hand.filter(card => card.suite === suite);
  if (suiteCards.length === 0) return null;

  // Use getHighestRankedCardIndex on the filtered suite cards
  const highestInSuiteIdx = getHighestRankedCardIndex(suiteCards);
  if (highestInSuiteIdx === null) return null;
  // Map back to the original hand index
  return hand.indexOf(suiteCards[highestInSuiteIdx]);
}

/**
 * Returns the index of the least value card in the hand.
 * @param hand - Array of card objects.
 * @returns The index of the least value card, or null if hand is empty.
 */
export function getLeastValueCardIndex(hand: Card[]): number | null {
  if (!hand || hand.length === 0) return null;

  let leastValueCardIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].points < hand[leastValueCardIndex].points) {
      leastValueCardIndex = i;
    }
  }
  return leastValueCardIndex;
}

/**
 * Returns the index of the least value card in the hand for a specific suite.
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns The index of the least value card in the suite, or null if none found.
 */
export function getLeastValueCardIndexInSuite(
  hand: Card[],
  suite: Suite
): number | null {
  if (!hand || hand.length === 0) return null;

  // Filter cards by suite
  const suiteCards = hand.filter(card => card.suite === suite);
  if (suiteCards.length === 0) return null;

  // Find the least value card in the filtered suite cards
  const leastValueIdx = getLeastValueCardIndex(suiteCards);
  if (leastValueIdx === null) return null;
  // Map back to the original hand index
  return hand.indexOf(suiteCards[leastValueIdx]);
}

export function printCardHashes(hand: Card[]) {
  for (const card of hand) {
    console.log(card.hash);
  }
}

export function getTeammateInSuite(hand: Card[], suite: Suite) {
  if (!hasSuite(hand, suite)) return null;

  const suiteCards = hand.filter(card => card.suite === suite);
  const topCards = getTopKCardsFromSuite(suite, suiteCards.length);

  const topCardsSet = getCardSet(topCards);
  const winnableCards = suiteCards.filter(card => topCardsSet.has(card.hash));
  const unwinnableCards = suiteCards.filter(
    card => !topCardsSet.has(card.hash)
  );

  // Get the top ranked card from topCards which is not in suiteCardsSet
  const suiteCardsSet = getCardSet(suiteCards);
  const potentialTeammateCard = topCards
    .reverse()
    .find(card => !suiteCardsSet.has(card.hash));

  // To check if topRankedCardNotInHand is unknown (i.e., not found), check if it is undefined:
  if (typeof potentialTeammateCard === "undefined") {
    console.log("Top ranked card not in hand is unknown (undefined).");
    return null;
  }

  return {
    count: suiteCards.length,
    winnableCards: winnableCards,
    unwinnableCards: unwinnableCards,
    unwinnablePoints: unwinnableCards.reduce(
      (sum, card) => sum + card.points,
      0
    ),
    potentialTeammateCard: potentialTeammateCard,
  };
}

export function teammateRawScore(card: Card): number {
  if (card.rank <= 12) {
    // delta measures how much below Q the card is.
    const delta = 12 - card.rank;
    return 0.15 - delta * 0.015;
  } else if (card.rank === 13) {
    return 0.5;
  } else if (card.rank === 14) {
    return 0.8;
  }
  console.error("ERROR: What card is this? Lol.");
  return 0;
}

export function teammateOptionScore(
  card: Card,
  trumpSuite: Suite,
  hasCrownJewel: boolean
): number {
  const rawScore = teammateRawScore(card);
  let boost = 1;

  // trump boost
  if (card.suite === trumpSuite) {
    boost = boost * 1.5;
  }

  // spade boost
  if (card.suite === Suite.Spade) {
    // to cover 3 of Spades
    if (hasCrownJewel) {
      boost = boost * 2;
    }
    boost = boost * 1.6;
  }
  const boostedScore = Math.round(boost * rawScore * 100) / 100;
  console.log(card.hash, rawScore, boostedScore);
  return boostedScore;
}

export function getRemainingCards(
  hand: Card[],
  discardedCards: Card[],
  tableCards: Card[] = []
): Card[] {
  const discardedCardsSet = getCardSet(discardedCards);
  const handSet = getCardSet(hand);
  const tableCardsSet = getCardSet(tableCards);
  const deck = generateDeck();
  // filter out cards that are in the hand or discarded
  return deck.filter(
    card =>
      !handSet.has(card.hash) &&
      !discardedCardsSet.has(card.hash) &&
      !tableCardsSet.has(card.hash)
  );
}

export function canBeatAllRemainingCardsInSuite(
  hand: Card[],
  discardedCards: Card[],
  tableCards: Card[],
  suite: Suite,
  highestCard: Card
): boolean {
  if (highestCard.suite !== suite) {
    throw new Error("Highest card is not in the suite");
  }

  const remainingCards = getRemainingCards(hand, discardedCards, tableCards);
  const highestRemainingCardIndex = getHighestRankedCardIndexInSuite(
    remainingCards,
    suite
  );

  if (highestRemainingCardIndex === null) {
    return true; // No higher cards remaining
  }

  const highestRemainingCard = remainingCards[highestRemainingCardIndex];
  return highestCard.rank > highestRemainingCard.rank;
}

export function getWinProbability(
  hand: Card[],
  discardedCards: Card[],
  suite: Suite,
  trumpSuite: Suite
) {
  let winProbability = 0;
  const highestCardIndex = getHighestRankedCardIndexInSuite(hand, suite);
  if (highestCardIndex === null) return null;

  const highestCard = hand[highestCardIndex];

  if (
    canBeatAllRemainingCardsInSuite(
      hand,
      discardedCards,
      [],
      suite,
      highestCard
    )
  ) {
    winProbability = 1;
  } else {
    winProbability = 0;
  }

  return {
    highestCardIndex: highestCardIndex,
    card: highestCard,
    winProbability: winProbability,
    numCardsOver: discardedCards.filter(card => card.suite === suite).length,
  };
}
