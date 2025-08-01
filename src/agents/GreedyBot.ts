import BotAgent, { BidAction, TrumpTeammateChoice, BidParams, TrumpTeammateParams } from "./BotAgent";
import { Card, Suite, TableCard } from "@/types/game";
import { determineRoundWinner, getRandomCardIndex, getRandomCardIndexBySuite, hasSuite } from "@/utils/gameUtils";
import {
  getHighestRankedCardIndex,
  getHighestRankedCardIndexInSuite,
  getLeastValueCardIndex,
  getLeastValueCardIndexInSuite,
} from "@/utils/handUtils";

export default class GreedyBot extends BotAgent {
  static displayName = "Greedy";

  // Start a new round by playing the highest card
  startRound(hand: Card[], trumpSuite: Suite): number {
    return getHighestRankedCardIndex(hand);
  }

  // if P(win) > 0, pick the highest card from the running suite
  // else pick the least value card
  pickRunningSuite(hand: Card[], runningSuite: Suite, trumpSuite: Suite, tableCards: TableCard[]): number {
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
    const highestCard = hand[highestCardIndex];
    if (isRoundCut || winningCard.rank > highestCard.rank) {
      return getLeastValueCardIndexInSuite(hand, runningSuite);
    } else {
      return highestCardIndex;
    }    
  }

  // If player has trump, if P(win) > 0 --> play highest trump card
  // else, play least value card
  toCutOrNotToCut(hand: Card[], runningSuite: Suite, trumpSuite: Suite, tableCards: TableCard[]): number {
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
        return getLeastValueCardIndex(hand);
      }
      return highestTrumpIndex;
    } else {
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
      const bidAmount = Math.min(currentBid + Math.max(minIncrement, 10), maxBid);
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
    
    // Choose trump based on strongest suite
    const suiteCounts = [0, 1, 2, 3].map(suite => ({
      suite,
      count: hand.filter(card => card.suite === suite).length,
      strength: hand
        .filter(card => card.suite === suite)
        .reduce((sum, card) => sum + card.rank, 0)
    }));
    
    const bestSuite = suiteCounts.reduce((best, current) => 
      (current.count > best.count || 
       (current.count === best.count && current.strength > best.strength)) 
        ? current : best
    );
    
    // Choose strongest teammate card available
    const strongestTeammate = teammateOptions.reduce((best, current) => 
      current.rank > best.rank ? current : best
    );
    
    return {
      trumpSuite: bestSuite.suite,
      teammateCard: { suite: strongestTeammate.suite, number: strongestTeammate.number }
    };
  }

}
