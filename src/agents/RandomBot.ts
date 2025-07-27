import BotAgent, { BidAction, TrumpTeammateChoice, BidParams, TrumpTeammateParams } from "./BotAgent";
import { Card, TableCard } from "@/types/game";
import { getRandomCardIndex, getRandomCardIndexBySuite, getRandomSuite } from "@/utils/gameUtils";

export default class RandomBot extends BotAgent {
  static displayName = "RandomBot";

  startRound(hand: Card[], trumpSuite: number): number {
    if (!hand || hand.length === 0) return -1;
    return getRandomCardIndex(hand);
  }

  pickRunningSuite(hand: Card[], runningSuite: number, trumpSuite: number, tableCards: TableCard[]): number {
    return getRandomCardIndexBySuite(hand, runningSuite);
  }

  toCutOrNotToCut(hand: Card[], runningSuite: number, trumpSuite: number, tableCards: TableCard[]): number {
    const trumpCards = hand.filter((card) => card.suite === trumpSuite);
    
    // 50% chance to cut if we have trump cards
    if (trumpCards.length > 0 && Math.random() < 0.5) {
      const randomTrumpIndex = getRandomCardIndexBySuite(hand, trumpSuite);
      return randomTrumpIndex;
    } else {
      // Play random card from any suite
      return getRandomCardIndex(hand);
    }
  }

  getBidAction(params: BidParams): BidAction {
    const { currentBid, minIncrement, maxBid } = params;
    
    // If already at max bid, must pass
    if (currentBid >= maxBid) return { action: "pass" };
    
    // 50% chance to pass, 50% to bid
    if (Math.random() < 0.5) return { action: "pass" };
    
    // Pick a valid increment
    let increment = minIncrement;
    if (currentBid + 10 <= maxBid && Math.random() < 0.5) increment = 10;
    const bidAmount = Math.min(currentBid + increment, maxBid);
    
    return { action: "bid", bidAmount };
  }

  chooseTrumpAndTeammate(params: TrumpTeammateParams): TrumpTeammateChoice {
    const { teammateOptions } = params;
    
    // Pick a random trump suite
    const trumpSuite = getRandomSuite();
    
    // Pick a random teammate card from teammateOptions
    const teammateCard = teammateOptions[Math.floor(Math.random() * teammateOptions.length)];
    
    return { 
      trumpSuite, 
      teammateCard: { suite: teammateCard.suite, number: teammateCard.number }
    };
  }
}