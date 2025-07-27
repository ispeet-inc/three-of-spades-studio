import BotAgent, { BidAction, TrumpTeammateChoice, BidParams, TrumpTeammateParams } from "./BotAgent";
import { Card, TableCard } from "@/types/game";
import { getRandomCardIndex, getRandomCardIndexBySuite, hasSuite } from "@/utils/gameUtils";

export default class GreedyBot extends BotAgent {
  static displayName = "GreedyBot";

  startRound(hand: Card[], trumpSuite: number): number {
    if (!hand || hand.length === 0) return -1;
    
    // Try to play highest non-trump card to avoid giving away trump early
    const nonTrumpCards = hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => card.suite !== trumpSuite);
    
    if (nonTrumpCards.length > 0) {
      // Play highest non-trump card
      const highest = nonTrumpCards.reduce((max, current) => 
        current.card.rank > max.card.rank ? current : max
      );
      return highest.index;
    }
    
    // If only trump cards, play lowest trump
    return this.getLowestCardIndex(hand);
  }

  pickRunningSuite(hand: Card[], runningSuite: number, trumpSuite: number, tableCards: TableCard[]): number {
    const runningSuiteCards = hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => card.suite === runningSuite);
    
    if (runningSuiteCards.length === 0) return -1;
    
    // Try to win with highest card of running suite
    const highest = runningSuiteCards.reduce((max, current) => 
      current.card.rank > max.card.rank ? current : max
    );
    
    return highest.index;
  }

  toCutOrNotToCut(hand: Card[], runningSuite: number, trumpSuite: number, tableCards: TableCard[]): number {
    const trumpCards = hand.filter((card) => card.suite === trumpSuite);
    
    // Check if we can win with trump
    if (trumpCards.length > 0) {
      const highestTrumpOnTable = Math.max(
        ...tableCards
          .filter(card => card.suite === trumpSuite)
          .map(card => card.rank),
        0
      );
      
      const ourHighestTrump = Math.max(...trumpCards.map(card => card.rank));
      
      // Cut if we can win with trump
      if (ourHighestTrump > highestTrumpOnTable) {
        return getRandomCardIndexBySuite(hand, trumpSuite);
      }
    }
    
    // Otherwise play lowest card
    return this.getLowestCardIndex(hand);
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

  private getLowestCardIndex(hand: Card[]): number {
    if (hand.length === 0) return -1;
    
    let lowestIndex = 0;
    for (let i = 1; i < hand.length; i++) {
      if (hand[i].rank < hand[lowestIndex].rank) {
        lowestIndex = i;
      }
    }
    return lowestIndex;
  }
}
