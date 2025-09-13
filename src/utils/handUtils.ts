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
 * Returns the card with the lowest value in the hand, prioritizing cards with the fewest points.
 * If multiple cards have the same lowest points, the card with the lowest rank is chosen.
 * @param hand - Array of card objects.
 * @returns The least value card in the hand.
 * @throws Error if hand is empty.
 */
export function getLeastValueCard(hand: Card[]): Card {
  validateHand(hand);
  return hand.reduce((least, current) => {
    if (current.points < least.points) {
      return current;
    } else if (current.points === least.points) {
      return current.rank < least.rank ? current : least;
    } else {
      return least;
    }
  });
}

/**
 * Returns the card with the highest value in the hand, prioritizing cards with the most points.
 * If multiple cards have the same highest points, the card with the lowest rank is chosen.
 * @param hand - Array of card objects.
 * @returns The highest value card in the hand.
 * @throws Error if hand is empty.
 */
export function getHighestValueCard(hand: Card[]): Card {
  validateHand(hand);
  return hand.reduce((highest, current) => {
    if (current.points > highest.points) {
      return current;
    } else if (current.points === highest.points) {
      return current.rank < highest.rank ? current : highest;
    } else {
      return highest;
    }
  });
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

export function printCardHashes(hand: Card[]): void {
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
  validateHand(hand);
  if (!hasSuite(hand, suite)) {
    return null;
  }
  let winProbability = 0;
  const highestCard = getHighestRankedCardInSuite(hand, suite);

  if (canBeatAllRemainingCardsInSuite(hand, discardedCards, [], highestCard)) {
    winProbability = 1;
  } else {
    winProbability = 0;
  }

  return {
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

export function getMaxBid(hand: Card[]): number {
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
