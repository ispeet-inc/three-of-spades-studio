import { Card, Suite } from "@/types/game";
import { generateDeck, getCardSet } from "../utils/cardUtils";
import { DECK_SUITES } from "../utils/constants";
import { getWinProbability } from "../utils/handUtils";

/**
 * Analyzes a hand and returns up to 4 cards from each suite along with their scores
 * @param hand - Array of cards to analyze
 * @returns Array of suite analysis objects with suite name, cards, and score
 */
export function getSuiteAnalysis(hand: Card[]) {
  const result: { suite: Suite; cards: Card[]; score: number }[] = [];

  DECK_SUITES.forEach(suite => {
    const suiteCards = hand.filter(card => card.suite === suite);
    const score = suiteCards.reduce((sum, card) => sum + card.points, 0);

    // Get up to 4 cards from this suite
    const selectedCards = suiteCards.slice(0, 4);

    result.push({
      suite: suite,
      cards: selectedCards,
      score,
    });
  });

  return result;
}

/**
 * Gets the total score of a hand
 * @param hand - Array of cards
 * @returns Total points in the hand
 */
export function getHandScore(hand: Card[]): number {
  return hand.reduce((sum, card) => sum + card.points, 0);
}

/**
 * Gets the number of suites represented in a hand
 * @param hand - Array of cards
 * @returns Number of unique suites
 */
export function getSuiteCount(hand: Card[]): number {
  return new Set(hand.map(card => card.suite)).size;
}

/**
 * Gets the number of point cards in a hand
 * @param hand - Array of cards
 * @returns Number of cards with points > 0
 */
export function getPointCardCount(hand: Card[]): number {
  return hand.filter(card => card.points > 0).length;
}

export function perSuiteScoreAndCard(hand: Card[], discardedCards: Card[]) {
  // For each suite, pick the highest card (by rank) from the hand and return it with score
  const result: Record<Suite, { card: Card | null; score: number }> = {
    [Suite.Spade]: { card: null, score: 0 },
    [Suite.Heart]: { card: null, score: 0 },
    [Suite.Club]: { card: null, score: 0 },
    [Suite.Diamond]: { card: null, score: 0 },
  };
  const discardedCardsSet = getCardSet(discardedCards);
  const handSet = getCardSet(hand);
  const deck = generateDeck();
  // filter out cards that are in the hand or discarded
  const remainingCards = deck.filter(
    card => !handSet.has(card.hash) && !discardedCardsSet.has(card.hash)
  );

  DECK_SUITES.forEach(suite => {
    const trumpSuite = suite;
    const winProbObj = getWinProbability(
      hand,
      discardedCards,
      suite,
      trumpSuite
    );
    if (winProbObj) {
      result[suite] = {
        card: winProbObj.card,
        score: winProbObj.winProbability,
      };
    }
  });
  return result;
}
