import { Card, Suite } from "../types/game";
import { NUM_PLAYERS, NUM_TRICKS } from "./constants";

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

  if (remainingTrumps <= 0) return false;

  // Count other players confirmed to be missing trump
  const otherPlayersMissingTrump = Object.entries(missingSuiteMemory).filter(
    ([playerIndex, missingSuites]) =>
      missingSuites.includes(trumpSuite) &&
      !teamIndices.includes(Number(playerIndex))
  ).length;

  return otherPlayersMissingTrump < NUM_PLAYERS - teamIndices.length;
};
