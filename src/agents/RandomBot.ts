import { Card } from "@/types/game";
import { getRandomSuite } from "@/utils/gameUtils";
import {
  getRandomCard,
  getRandomCardInSuite,
  hasSuite,
} from "@/utils/handUtils";
import BotAgent, {
  BidAction,
  BidParams,
  BotChoiceParams,
  TrumpTeammateChoice,
  TrumpTeammateParams,
} from "./BotAgent";

export default class RandomBot extends BotAgent {
  static displayName = "Random";

  // Start a new trick by playing a random card
  startTrick(params: BotChoiceParams): Card {
    const { hand } = params;
    return getRandomCard(hand);
  }

  // Pick a random card from the running suite
  pickRunningSuite(params: BotChoiceParams): Card {
    const { hand, runningSuite } = params;
    if (runningSuite === null) {
      throw Error("runningSuite can't be null");
    }

    return getRandomCardInSuite(hand, runningSuite);
  }

  // Randomly decide whether to cut or play a random card
  toCutOrNotToCut(params: BotChoiceParams): Card {
    const { hand, trumpSuite } = params;

    // 50% chance to cut if we have trump cards
    if (hasSuite(hand, trumpSuite) && Math.random() < 0.5) {
      return getRandomCardInSuite(hand, trumpSuite);
    } else {
      // Play random card from any suite
      return getRandomCard(hand);
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
    const teammateCard =
      teammateOptions[Math.floor(Math.random() * teammateOptions.length)];

    return {
      trumpSuite,
      teammateCard: teammateCard,
    };
  }
}
