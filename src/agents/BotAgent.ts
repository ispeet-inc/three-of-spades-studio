import { Card, Suite, TableCard } from "@/types/game";
import { hasSuite } from "@/utils/gameUtils";

export interface BidAction {
  action: "bid" | "pass";
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
  discardedCards: Card[];
  teammateCard: Card;
  isTeammateRevealed: boolean;
  // teammate index = -1, if not revealed.
  teammateIndex: number;
  isBidWinner: boolean;
  isTeammate: boolean;
  missingSuiteMemory: Record<number, Suite[]>;
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
  abstract startTrick(params: BotChoiceParams): number;

  abstract pickRunningSuite(params: BotChoiceParams): number;

  abstract toCutOrNotToCut(params: BotChoiceParams): number;

  abstract getBidAction(params: BidParams): BidAction;

  abstract chooseTrumpAndTeammate(
    params: TrumpTeammateParams
  ): TrumpTeammateChoice;

  chooseCardIndex(params: BotChoiceParams, verbose = false): number | null {
    const {
      hand,
      tableCards,
      trumpSuite,
      runningSuite,
      playerIndex,
      discardedCards,
    } = params;

    if (verbose) {
      console.log("Current hand:", hand);
    }

    if (!hand || hand.length === 0) return null;

    if (runningSuite === null) {
      const pickedCardIndex = this.startTrick(params);
      if (verbose) {
        console.log(
          "BotAgent: ",
          playerIndex,
          "Starting trick - hand: ",
          hand,
          "runningSuite: ",
          runningSuite,
          "trumpSuite: ",
          trumpSuite,
          "tableCards: ",
          tableCards,
          "discardedCards: ",
          discardedCards,
          "pickedCard: ",
          hand[pickedCardIndex]
        );
      }
      return pickedCardIndex;
    }

    // Try running suite
    if (hasSuite(hand, runningSuite)) {
      const pickedCardIndex = this.pickRunningSuite(params);
      if (verbose) {
        console.log(
          "BotAgent: ",
          playerIndex,
          "Playing card from running suite - hand: ",
          hand,
          "runningSuite: ",
          runningSuite,
          "trumpSuite: ",
          trumpSuite,
          "tableCards: ",
          tableCards,
          "discardedCards: ",
          discardedCards,
          "pickedCard: ",
          hand[pickedCardIndex]
        );
      }
      return pickedCardIndex;
    }

    // To cut or not?
    const pickedCardIndex = this.toCutOrNotToCut(params);
    if (verbose) {
      console.log(
        "BotAgent: ",
        playerIndex,
        "Playing card from other suite - hand: ",
        hand,
        "runningSuite: ",
        runningSuite,
        "trumpSuite: ",
        trumpSuite,
        "tableCards: ",
        tableCards,
        "discardedCards: ",
        discardedCards,
        "pickedCard: ",
        hand[pickedCardIndex]
      );
    }
    return pickedCardIndex;
  }
}
