import { Card, Suite, TableCard } from "../types/game";
import { NUM_PLAYERS, NUM_TRICKS } from "./constants";
import { determineTrickWinner } from "./gameUtils";
import {
  canBeatAllRemainingCardsInSuite,
  getHighestValueCardIndex,
  getLeastValueCardIndexInSuite,
  getUnwinnableCardsInSuite,
} from "./handUtils";

// todo - something wrong with this function
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
    "SuiteMemory: Number of non-team players missing trump: ",
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
  currentWinningCard: Card
): number => {
  if (currentWinningCard.suite !== suite) {
    throw Error("Current winning card is not from suite we're trying to win");
  }

  // Precompute default fallback once
  // todo - incorporate throw points here
  const defaultIndex = getLeastValueCardIndexInSuite(hand, suite);
  if (defaultIndex === null) {
    throw Error("Player has suite cards. Why is the error thrown?");
  }

  // winning cards are always sorted too.
  const winningCards = hand.filter(
    card => card.suite === suite && card.rank > currentWinningCard.rank
  );

  // If we have no winning cards in the suite, shed the least valuable in suite
  if (winningCards.length === 0) {
    console.log("tryAndWinWithSuite: no winnable cards");
    return defaultIndex;
  }

  const isLastPlayer = tableCards.length === NUM_PLAYERS - 1;

  // Last to act: win with the lowest possible card from the winning set
  if (isLastPlayer) {
    console.log("tryAndWinWithSuite: playing lowest winning card");
    return hand.indexOf(winningCards[0]);
  }

  // Otherwise, if our highest card in suite can beat all remaining, play it
  const highestCard = winningCards[winningCards.length - 1];
  if (
    canBeatAllRemainingCardsInSuite(
      hand,
      discardedCards,
      tableCards,
      highestCard
    )
  ) {
    console.log("tryAndWinWithSuite: playing highest card");
    return hand.indexOf(highestCard);
  }

  // Default: keep options open by playing the least in suite
  console.log("tryAndWinWithSuite: default return");
  return defaultIndex;
};

/**
 * Determines if the teammate will definitely win the current trick.
 * @param teammateIndex - Index of teammate (-1 if not revealed)
 * @param teammateCard - The card that identifies the teammate
 */
export const teammateSureShotWin = (
  hand: Card[],
  runningSuite: Suite,
  trumpSuite: Suite,
  tableCards: TableCard[],
  discardedCards: Card[],
  isBidWinner: boolean,
  teammateIndex: number,
  teammateCard: Card
): boolean => {
  const currentWinner = determineTrickWinner(
    tableCards,
    runningSuite,
    trumpSuite
  );

  // Case 1: Teammate is currently winning the trick
  if (currentWinner.player === teammateIndex) {
    console.log(
      "teammateSureShotWin, Case 1: Teammate is currently winning the trick"
    );
    return isTeammateWinningTrick(
      currentWinner,
      hand,
      discardedCards,
      tableCards,
      trumpSuite,
      runningSuite
    );
  }

  // Case 2: Teammate is not revealed yet, but might cover the round
  if (
    teammateIndex === -1 &&
    isBidWinner &&
    runningSuite === teammateCard.suite
  ) {
    console.log(
      "teammateSureShotWin, Case 2: Teammate is not revealed yet, but might cover the round"
    );
    return true;
  }

  return false;
};

/**
 * Helper function to determine if teammate's current winning card will stay winning.
 * Covers all 3 cases:
 * 1. Teammate is currently winning and we are last to play (no one else can beat).
 * 2. Teammate is currently winning with a trump cut (trumpSuite != runningSuite).
 * 3. Teammate is currently winning and no higher cards are left to beat their card.
 */
const isTeammateWinningTrick = (
  winningCard: TableCard,
  hand: Card[],
  discardedCards: Card[],
  tableCards: TableCard[],
  trumpSuite: Suite,
  runningSuite: Suite
): boolean => {
  const isLastCard = tableCards.length === NUM_PLAYERS - 1;
  const isTrumpCut =
    winningCard.suite === trumpSuite && trumpSuite !== runningSuite;
  const noHigherCardsLeft = canBeatAllRemainingCardsInSuite(
    hand,
    discardedCards,
    tableCards,
    winningCard
  );
  console.log(
    `lastCard=${isLastCard}, isCut=${isTrumpCut}, noHigherCardsLeft=${noHigherCardsLeft}`
  );

  return isLastCard || isTrumpCut || noHigherCardsLeft;
};
