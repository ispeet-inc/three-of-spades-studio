import { Card, Suite, TableCard } from "@/types/game";
import { hasSuite } from "@/utils/gameUtils";
import { validateHand } from "../utils/handUtils";

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
  bidWinner: number;
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
  abstract startTrick(params: BotChoiceParams): Card;

  abstract pickRunningSuite(params: BotChoiceParams): number;

  abstract toCutOrNotToCut(params: BotChoiceParams): number;

  abstract getBidAction(params: BidParams): BidAction;

  abstract chooseTrumpAndTeammate(
    params: TrumpTeammateParams
  ): TrumpTeammateChoice;

  chooseCard(params: BotChoiceParams, verbose = false): Card {
    const {
      hand,
      tableCards,
      trumpSuite,
      runningSuite,
      playerIndex,
      discardedCards,
    } = params;

    validateHand(hand);
    if (verbose) {
      console.log("Current hand:", hand);
    }

    let pickedCardIndex: number;
    let reason: string;

    if (runningSuite === null) {
      const pickedCard = this.startTrick(params);
      if (!pickedCard) {
        throw new Error("startTrick returned null/undefined card");
      }
      return pickedCard;
    } else if (hasSuite(hand, runningSuite)) {
      pickedCardIndex = this.pickRunningSuite(params);
      reason = "pickRunningSuite";
    } else {
      pickedCardIndex = this.toCutOrNotToCut(params);
      reason = "toCutOrNotToCut";
    }

    const pickedCard = hand[pickedCardIndex];
    if (!pickedCard) {
      throw new Error(
        `Invalid card index returned by bot decision (${reason})`
      );
    }

    if (verbose) {
      console.log(
        "BotAgent:",
        playerIndex,
        reason,
        "- hand:",
        hand,
        "runningSuite:",
        runningSuite,
        "trumpSuite:",
        trumpSuite,
        "tableCards:",
        tableCards,
        "discardedCards:",
        discardedCards,
        "pickedCard:",
        pickedCard
      );
    }

    return pickedCard;
  }
}
