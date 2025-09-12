import { Card, Suite } from "@/types/game";
import { generateDeck, getCardSet, getTopKCardsFromSuite } from "./cardUtils";
import { DECK_SUITES, MAX_BID } from "./constants";

/**
 * Checks if the given suite is present in the hand.
 * @param hand - Array of card objects.
 * @param suite - The suite to check for.
 * @returns True if the suite is present, false otherwise.
 */
export function hasSuite(hand: Card[], suite: Suite): boolean {
  return hand.some(card => card.suite === suite);
}

/**
 * Validates if a hand is valid (non-empty array).
 * @param hand - Array of card objects to validate.
 * @throws Error if the hand is invalid (empty or not an array).
 */
export function validateHand(hand: Card[]): void {
  if (!Array.isArray(hand) || hand.length === 0) {
    throw new Error("Hand must be a non-empty array");
  }
}

/**
 * Validates if a hand is valid (non-empty array).
 * @param hand - Array of card objects to validate.
 * @throws Error if the hand is invalid (empty or not an array) or if no cards are found in the specified suite.
 */
export function validateHandWithSuite(hand: Card[], suite: Suite): void {
  validateHand(hand);
  if (!hasSuite(hand, suite)) {
    throw new Error("No cards found in suite ${suite}");
  }
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
 * Returns a random card from the hand.
 * @param hand - Array of card objects.
 * @returns A random card.
 * @throws Error if hand is empty or not an array.
 */
export function getRandomCard(hand: Card[]): Card {
  validateHand(hand);
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex];
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
 * Returns a random card from the hand for a given suite.
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns A random card from the specified suite.
 * @throws Error if no cards of the specified suite are found.
 */
export function getRandomCardInSuite(hand: Card[], suite: Suite): Card {
  validateHandWithSuite(hand, suite);
  const suiteCards = hand.filter(card => card.suite === suite);
  const randomIndex = Math.floor(Math.random() * suiteCards.length);
  return suiteCards[randomIndex];
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
 * Returns the highest ranked card in the hand.
 * @param hand - Array of card objects.
 * @returns The highest ranked card.
 * @throws Error if hand is empty.
 */
export function getHighestRankedCard(hand: Card[]): Card {
  validateHand(hand);
  return hand.reduce((highest, current) =>
    current.rank > highest.rank ? current : highest
  );
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
 * Returns the highest ranked card in a specific suite.
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns The highest ranked card in the specified suite.
 * @throws Error if no cards of the specified suite are found.
 */
export function getHighestRankedCardInSuite(hand: Card[], suite: Suite): Card {
  validateHandWithSuite(hand, suite);
  const suiteCards = hand.filter(card => card.suite === suite);
  return getHighestRankedCard(suiteCards);
}

/**
 * Gets the index of the lowest ranked card in a hand.
 * @param hand - Array of cards to search through
 * @returns The index of the lowest ranked card, or null if hand is empty
 */
export function getLowestRankedCardIndex(hand: Card[]): number | null {
  if (!hand || hand.length === 0) return null;

  let lowestCardIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].rank < hand[lowestCardIndex].rank) {
      lowestCardIndex = i;
    }
  }
  return lowestCardIndex;
}

/**
 * Returns the lowest ranked card in the hand.
 * @param hand - Array of card objects.
 * @returns The lowest ranked card.
 * @throws Error if hand is empty.
 */
export function getLowestRankedCard(hand: Card[]): Card {
  validateHand(hand);
  return hand.reduce((lowest, current) =>
    current.rank < lowest.rank ? current : lowest
  );
}

/**
 * Gets the index of the lowest ranked card of a specific suite in a hand.
 * @param hand - Array of cards to search through
 * @param suite - The suite to filter by
 * @returns The index of the lowest ranked card in the specified suite, or null if no cards of that suite exist
 */
export function getLowestRankedCardIndexInSuite(
  hand: Card[],
  suite: Suite
): number | null {
  if (!hand || hand.length === 0) return null;
  const suiteCards = hand.filter(card => card.suite === suite);

  if (suiteCards.length === 0) return null;

  // Use getLowestRankedCardIndex on the filtered suite cards
  const lowestInSuiteIdx = getLowestRankedCardIndex(suiteCards);
  if (lowestInSuiteIdx === null) return null;
  // Map back to the original hand index
  return hand.indexOf(suiteCards[lowestInSuiteIdx]);
}

/**
 * Returns the lowest ranked card in a specific suite.
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns The lowest ranked card in the specified suite.
 * @throws Error if no cards of the specified suite are found.
 */
export function getLowestRankedCardInSuite(hand: Card[], suite: Suite): Card {
  validateHandWithSuite(hand, suite);
  const suiteCards = hand.filter(card => card.suite === suite);
  return getLowestRankedCard(suiteCards);
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
 * Returns the least value card in the hand (by points).
 * @param hand - Array of card objects.
 * @returns The least value card.
 * @throws Error if hand is empty.
 */
export function getLeastValueCard(hand: Card[]): Card {
  validateHand(hand);
  return hand.reduce((least, current) =>
    current.points < least.points ? current : least
  );
}

/**
 * Returns the index of the highest value card in the hand
 * @param hand - Array of card objects.
 * @returns The index of the highest value card in the hand, or null if none found.
 */
export function getHighestValueCardIndex(hand: Card[]): number | null {
  if (!hand || hand.length === 0) return null;

  let highestValueCardIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].points > hand[highestValueCardIndex].points) {
      highestValueCardIndex = i;
    }
  }
  return highestValueCardIndex;
}

/**
 * Returns the highest value card in the hand (by points).
 * @param hand - Array of card objects.
 * @returns The highest value card.
 * @throws Error if hand is empty.
 */
export function getHighestValueCard(hand: Card[]): Card {
  validateHand(hand);
  return hand.reduce((highest, current) =>
    current.points > highest.points ? current : highest
  );
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

/**
 * Returns the least value card in a specific suite (by points).
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns The least value card in the specified suite.
 * @throws Error if no cards of the specified suite are found.
 */
export function getLeastValueCardInSuite(hand: Card[], suite: Suite): Card {
  validateHandWithSuite(hand, suite);
  const suiteCards = hand.filter(card => card.suite === suite);
  return getLeastValueCard(suiteCards);
}

/**
 * Returns the index of the least value card in the hand excluding a specific suite.
 * @param hand - Array of card objects.
 * @param suite - The suite to filter by.
 * @returns The index of the least value card in the suite, or null if none found.
 */
export function getLeastValueCardIndexNotInSuite(
  hand: Card[],
  suiteToExclude: Suite
): number | null {
  if (!hand || hand.length === 0) return null;

  // Filter cards by suite
  const nonSuiteCards = hand.filter(card => card.suite !== suiteToExclude);

  // Find the least value card in the filtered suite cards
  const leastValueIdx = getLeastValueCardIndex(nonSuiteCards);
  if (leastValueIdx === null) return null;
  // Map back to the original hand index
  return hand.indexOf(nonSuiteCards[leastValueIdx]);
}

/**
 * Returns the least value card excluding a specific suite (by points).
 * @param hand - Array of card objects.
 * @param suiteToExclude - The suite to exclude from selection.
 * @returns The least value card not in the specified suite, or null if no cards exist outside the suite.
 */
export function getLeastValueCardNotInSuite(
  hand: Card[],
  suiteToExclude: Suite
): Card | null {
  validateHand(hand);
  const nonSuiteCards = hand.filter(card => card.suite !== suiteToExclude);
  if (nonSuiteCards.length === 0) {
    return null;
  }
  return getLeastValueCard(nonSuiteCards);
}

export function printCardHashes(hand: Card[]) {
  for (const card of hand) {
    console.log(card.hash);
  }
}

/**
 * Returns an array of unwinnable cards in the given suite from the player's hand.
 * A card is considered unwinnable if there are more higher-ranked cards remaining
 * outside the hand than there are lower-ranked cards in the hand, meaning it cannot
 * possibly win a trick in that suite.
 *
 * @param hand - Array of Card objects representing the player's current hand.
 * @param suite - The suite to check for unwinnable cards.
 * @param discardedCards - Array of Card objects that have already been played/discarded.
 * @param tableCards - (Optional) Array of Card objects currently on the table (default: []).
 * @returns Array of Card objects from the hand that are unwinnable in the given suite.
 */
export function getUnwinnableCardsInSuite(
  hand: Card[],
  suite: Suite,
  discardedCards: Card[],
  tableCards: Card[] = []
): Card[] {
  if (!hasSuite(hand, suite)) return [];
  const suiteCards = hand.filter(card => card.suite === suite);
  const remainingCards = getRemainingCards(
    hand,
    discardedCards,
    tableCards
  ).filter(card => card.suite === suite);

  const unwinnableCards = suiteCards.filter(card => {
    const lowerCardsInHand = suiteCards.filter(c => c.rank < card.rank);
    const higherCardsOutside = remainingCards.filter(c => c.rank > card.rank);
    return higherCardsOutside.length > lowerCardsInHand.length;
  });

  return unwinnableCards;
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
  discardedCards: Card[] = [],
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

export function howManyCardsHigherLeftInSuite(
  hand: Card[],
  discardedCards: Card[],
  tableCards: Card[],
  highestCard: Card
): number {
  const remainingCards = getRemainingCards(hand, discardedCards, tableCards);
  const remainingCardsInSuite = remainingCards.filter(
    card => card.suite === highestCard.suite
  );

  const numHigherCardsLeft = remainingCardsInSuite.filter(
    card => card.rank > highestCard.rank
  ).length;

  return numHigherCardsLeft;
}

// startTrick utils
export function canBeatAllRemainingCardsInSuite(
  hand: Card[],
  discardedCards: Card[],
  tableCards: Card[],
  highestCard: Card
): boolean {
  const numHigherCardsLeft = howManyCardsHigherLeftInSuite(
    hand,
    discardedCards,
    tableCards,
    highestCard
  );
  return numHigherCardsLeft === 0;
}

export function getWinProbability(
  hand: Card[],
  discardedCards: Card[],
  suite: Suite
) {
  let winProbability = 0;
  const highestCardIndex = getHighestRankedCardIndexInSuite(hand, suite);
  if (highestCardIndex === null) return null;

  const highestCard = hand[highestCardIndex];

  if (canBeatAllRemainingCardsInSuite(hand, discardedCards, [], highestCard)) {
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

// bidding utils
export function getWinnableCardCountPerSuite(hand: Card[], suite: Suite) {
  const suiteCards = hand.filter(card => card.suite === suite);
  if (suiteCards.length === 0) return 0;
  const hasAce = suiteCards.some(card => card.rank === 14) ? 1 : 0;
  const hasKing = suiteCards.some(card => card.rank === 13) ? 1 : 0;

  if (suiteCards.length === 1) {
    return hasAce ? 1 : 0;
  } else {
    // trick 2 onwards assume we will win
    // for first 2 tricks, we need A, K to win.
    return suiteCards.length - 2 + hasAce + hasKing;
  }
}

export function getMaxBid(hand: Card[]) {
  if (hand.length === 0) return 0;
  const winningCounts = DECK_SUITES.map(suite =>
    getWinnableCardCountPerSuite(hand, suite)
  );
  const totalWinningCards = winningCounts.reduce((acc, curr) => acc + curr, 0);
  let losingCards = hand.length - totalWinningCards;
  // assume teammate will help win won trick
  losingCards -= 1;

  const pointsPerTrick = 20;
  // todo - if bot is feeling lucky, we will reduce pointsPerTrick to 15 or 20

  // assume teammate has 1/3 odds to win losing tricks.
  losingCards = Math.round((losingCards * 2) / 3);

  const maxBid = MAX_BID - losingCards * pointsPerTrick;
  return maxBid;
}
