import { Card, Suite, TableCard } from "@/types/game";
import { getHash } from "@/utils/cardUtils";
import { DECK_SUITES } from "@/utils/constants";
import { determineRoundWinner } from "@/utils/gameUtils";
import {
  getHighestRankedCardIndex,
  getHighestRankedCardIndexInSuite,
  getLeastValueCardIndex,
  getLeastValueCardIndexInSuite,
  getTeammateInSuite,
  teammateOptionScore,
} from "@/utils/handUtils";
import BotAgent, {
  BidAction,
  BidParams,
  TrumpTeammateChoice,
  TrumpTeammateParams,
} from "./BotAgent";

export default class GreedyBot extends BotAgent {
  static displayName = "Greedy";

  // Start a new round by playing the highest card
  startRound(hand: Card[], trumpSuite: Suite, discardedCards: Card[]): number {
    // @ts-expect-error - hand is not empty when this is called
    return getHighestRankedCardIndex(hand);
  }

  // if P(win) > 0, pick the highest card from the running suite
  // else pick the least value card
  pickRunningSuite(
    hand: Card[],
    runningSuite: Suite,
    trumpSuite: Suite,
    tableCards: TableCard[]
  ): number {
    const winningCard = determineRoundWinner(
      tableCards,
      runningSuite,
      trumpSuite
    );
    const isRoundCut =
      winningCard.suite === trumpSuite && trumpSuite !== runningSuite;

    const highestCardIndex = getHighestRankedCardIndexInSuite(
      hand,
      runningSuite
    );
    if (highestCardIndex === null) {
      throw Error("can't be null");
    }
    const highestCard = hand[highestCardIndex];
    if (isRoundCut || winningCard.rank > highestCard.rank) {
      // @ts-expect-error - hand is not empty when this is called
      return getLeastValueCardIndexInSuite(hand, runningSuite);
    } else {
      return highestCardIndex;
    }
  }

  // If player has trump, if P(win) > 0 --> play highest trump card
  // else, play least value card
  toCutOrNotToCut(
    hand: Card[],
    runningSuite: Suite,
    trumpSuite: Suite,
    tableCards: TableCard[]
  ): number {
    const winningCard = determineRoundWinner(
      tableCards,
      runningSuite,
      trumpSuite
    );
    const isRoundCut =
      winningCard.suite === trumpSuite && trumpSuite !== runningSuite;

    const highestTrumpIndex = getHighestRankedCardIndexInSuite(
      hand,
      trumpSuite
    );
    if (highestTrumpIndex !== null) {
      const highestTrump = hand[highestTrumpIndex];
      if (isRoundCut && winningCard.rank > highestTrump.rank) {
        // @ts-expect-error - hand is not empty when this is called
        return getLeastValueCardIndex(hand);
      }
      return highestTrumpIndex;
    } else {
      // @ts-expect-error - hand is not empty when this is called
      return getLeastValueCardIndex(hand);
    }
  }

  getBidAction(params: BidParams): BidAction {
    const { currentBid, minIncrement, maxBid, hand } = params;

    if (currentBid >= maxBid) return { action: "pass" };

    // Count high cards and trump potential
    const highCards = hand.filter(card => card.rank >= 8).length;
    const aces = hand.filter(card => card.number === 1).length;
    const kings = hand.filter(card => card.number === 13).length;

    // Greedy bidding based on hand strength
    const handStrength = highCards + aces * 2 + kings * 1.5;

    if (handStrength >= 8) {
      // Strong hand - bid aggressively
      const bidAmount = Math.min(
        currentBid + Math.max(minIncrement, 10),
        maxBid
      );
      return { action: "bid", bidAmount };
    } else if (handStrength >= 5 && currentBid < 200) {
      // Decent hand - bid conservatively
      const bidAmount = Math.min(currentBid + minIncrement, maxBid);
      return { action: "bid", bidAmount };
    }

    return { action: "pass" };
  }

  chooseTrumpAndTeammate(params: TrumpTeammateParams): TrumpTeammateChoice {
    const { hand, teammateOptions } = params;
    console.log("chooseTrumpAndTeammate: ", hand);
    // Choose trump based on strongest suite
    const suiteCounts = DECK_SUITES.map(suite => ({
      suite,
      count: hand.filter(card => card.suite === suite).length,
      strength: hand
        .filter(card => card.suite === suite)
        .reduce((sum, card) => sum + card.rank, 0),
    }));

    const bestSuite = suiteCounts.reduce((best, current) =>
      current.count > best.count ||
      (current.count === best.count && current.strength > best.strength)
        ? current
        : best
    );
    const trumpSuite = bestSuite.suite;

    // Find potential teammate cards for each suite
    const potentialTeammateOptions = DECK_SUITES.map(suite =>
      getTeammateInSuite(hand, suite)
    ).filter(option => option !== null);

    const handSet = new Set(hand.map(card => card.hash));
    const hasCrownJewel = handSet.has(getHash(Suite.Spade, 3));

    const cardOptionsScored = potentialTeammateOptions.map(option => ({
      option,
      card: option.potentialTeammateCard,
      score: teammateOptionScore(
        option.potentialTeammateCard,
        trumpSuite,
        hasCrownJewel
      ),
      unwinnablePoints: option.unwinnablePoints,
    }));

    // Choose strongest teammate card available (with tie-breaker using unwinnablePoints)
    const strongestTeammate = cardOptionsScored.reduce((best, current) => {
      if (current.score > best.score) {
        return current;
      } else if (current.score === best.score) {
        // Use unwinnablePoints as tie-breaker
        return current.unwinnablePoints > best.unwinnablePoints
          ? current
          : best;
      } else {
        return best;
      }
    });

    return {
      trumpSuite: trumpSuite,
      teammateCard: strongestTeammate.card,
    };
  }
}
