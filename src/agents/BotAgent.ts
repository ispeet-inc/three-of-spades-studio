import { Card, Suite, TableCard } from "@/types/game";
import { hasSuite } from "@/utils/gameUtils";

export interface BidAction {
  action: 'bid' | 'pass';
  bidAmount?: number;
}

export interface TrumpTeammateChoice {
  trumpSuite: Suite;
  teammateCard: Card;
}

export interface BotChoiceParams {
  hand: Card[];
  tableCards: TableCard[];
  trumpSuite: Suite;
  runningSuite: Suite | null;
  playerIndex: number;
}

export interface BidParams {
  currentBid: number;
  minIncrement: number;
  maxBid: number;
  passedPlayers: number[];
  hand: Card[];
  playerIndex: number;
}

export interface TrumpTeammateParams {
  hand: Card[];
  playerNames: Record<number, string>;
  playerIndex: number;
  teammateOptions: Card[];
}

export default abstract class BotAgent {
  abstract startRound(hand: Card[], trumpSuite: Suite): number;
  
  abstract pickRunningSuite(
    hand: Card[], 
    runningSuite: Suite, 
    trumpSuite: Suite, 
    tableCards: TableCard[]
  ): number;
  
  abstract toCutOrNotToCut(
    hand: Card[], 
    runningSuite: Suite, 
    trumpSuite: Suite, 
    tableCards: TableCard[]
  ): number;

  abstract getBidAction(params: BidParams): BidAction;
  
  abstract chooseTrumpAndTeammate(params: TrumpTeammateParams): TrumpTeammateChoice;

  chooseCardIndex(params: BotChoiceParams, verbose = false): number | null {
    const { hand, tableCards, trumpSuite, runningSuite, playerIndex } = params;
    
    if (verbose) {
      console.log("Current hand:", hand);
    }

    if (!hand || hand.length === 0) return null;

    if (runningSuite === null) {
      const pickedCardIndex = this.startRound(hand, trumpSuite);
      if (verbose) {
        console.log(`Starting round with card index: ${pickedCardIndex}`);
      }
      return pickedCardIndex;
    }

    // Try running suite
    if (hasSuite(hand, runningSuite)) {
      const pickedCardIndex = this.pickRunningSuite(
        hand,
        runningSuite,
        trumpSuite,
        tableCards
      );
      if (verbose) {
        console.log(`Playing card from running suite at index: ${pickedCardIndex}`);
      }
      return pickedCardIndex;
    }

    // To cut or not?
    const pickedCardIndex = this.toCutOrNotToCut(
      hand,
      runningSuite,
      trumpSuite,
      tableCards
    );
    if (verbose) {
      console.log(`Playing other card at index: ${pickedCardIndex}`);
    }
    return pickedCardIndex;
  }
}