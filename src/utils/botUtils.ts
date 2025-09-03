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
