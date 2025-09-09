import { Card, Suite } from "../types/game";
import { NUM_PLAYERS, NUM_TRICKS } from "./constants";
import {
  canBeatAllRemainingCardsInSuite,
  getHighestRankedCardIndexInSuite,
  getHighestValueCardIndex,
  getLeastValueCardIndexInSuite,
  getUnwinnableCardsInSuite,
} from "./handUtils";

export const doOthersStillHaveTrump = (
  hand: Card[],
  trumpSuite: Suite,
  discardedCards: Card[],
  teamIndices: number[],
  missingSuiteMemory: Record<number, Suite[]>
): boolean => {
  const trumpsPlayed = discardedCards.filter(
    card => card.suite === trumpSuite
  ).length;
  const trumpsInHand = hand.filter(card => card.suite === trumpSuite).length;
  const remainingTrumps = NUM_TRICKS - trumpsPlayed - trumpsInHand;

  console.info("SuiteMemory: Trumps played: ", trumpsPlayed);
  console.info("SuiteMemory: Trumps in hand: ", trumpsInHand);
  console.info("SuiteMemory: Remaining trumps: ", remainingTrumps);
  if (remainingTrumps <= 0) return false;

  // Count other players confirmed to be missing trump
  const otherPlayersMissingTrump = Object.entries(missingSuiteMemory).filter(
    ([playerIndex, missingSuites]) =>
      missingSuites.includes(trumpSuite) &&
      !teamIndices.includes(Number(playerIndex))
  ).length;
  console.info("SuiteMemory: Missing Suite Memory: ", missingSuiteMemory);
  console.info(
    "SuiteMemory: Other players missing trump: ",
    otherPlayersMissingTrump
  );
  console.info("SuiteMemory: Team indices: ", teamIndices);
  return otherPlayersMissingTrump < NUM_PLAYERS - teamIndices.length;
};

export const getHighestUnwinnableCardIndexInSuite = (
  hand: Card[],
  suite: Suite,
  discardedCards: Card[],
  tableCards: Card[] = []
): number => {
  if (!hand || hand.length === 0) {
    throw Error("hand can't be empty");
  }
  const unwinnableCards = getUnwinnableCardsInSuite(
    hand,
    suite,
    discardedCards,
    tableCards
  );
  // get highest value unwinnable card
  const highestUnwinnableCard = getHighestValueCardIndex(unwinnableCards);
  if (highestUnwinnableCard !== null) {
    return hand.indexOf(unwinnableCards[highestUnwinnableCard]);
  }
  // @ts-expect-error - hand is not empty when this is called
  return getLeastValueCardIndexInSuite(hand, suite);
};

export const tryAndWinWithSuite = (
  hand: Card[],
  tableCards: Card[],
  discardedCards: Card[],
  suite: Suite,
  currentWinningCard: Card,
  throwPoints: boolean = false
): number => {
  console.info("Yet to use throwPoints functionality : ", throwPoints);
  if (currentWinningCard.suite !== suite) {
    throw Error("Current winning card is not from suite we're trying to win");
  }

  const winningCards = hand.filter(
    card => card.suite === suite && card.rank > currentWinningCard.rank
  );

  // Early returns for cases where we can't win
  if (winningCards.length === 0) {
    // @ts-expect-error - hand is not empty when this is called
    return getLeastValueCardIndexInSuite(hand, suite);
  }

  // If we're the last player, try to win with the lowest possible card
  if (tableCards.length === NUM_PLAYERS - 1) {
    const winningCardIndex = getLeastValueCardIndexInSuite(winningCards, suite);
    if (winningCardIndex !== null) {
      return hand.indexOf(winningCards[winningCardIndex]);
    }
    console.log("When does this happen?");
    console.log("winningCards: ", winningCards);
    // @ts-expect-error - hand is not empty when this is called
    return getLeastValueCardIndexInSuite(hand, suite);
  } else {
    const highestCardIndex = getHighestRankedCardIndexInSuite(hand, suite);
    if (highestCardIndex === null) {
      throw Error("highestCardIndex can't be null");
    }
    const highestCard = hand[highestCardIndex];
    // Check if we can beat all remaining cards in this suite
    if (
      canBeatAllRemainingCardsInSuite(
        hand,
        discardedCards,
        tableCards,
        highestCard
      )
    ) {
      return highestCardIndex;
    }
    // @ts-expect-error - hand is not empty when this is called
    return getLeastValueCardIndexInSuite(hand, suite);
  }
};
