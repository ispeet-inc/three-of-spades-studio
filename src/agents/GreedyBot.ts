import { Card, Suite } from "@/types/game";
import { getHash } from "@/utils/cardUtils";
import { DECK_SUITES, NUM_PLAYERS } from "@/utils/constants";
import { determineTrickWinner } from "@/utils/gameUtils";
import {
  getHighestRankedCardIndexInSuite,
  getLeastValueCard,
  getLeastValueCardIndex,
  getLeastValueCardIndexInSuite,
  getLeastValueCardInSuite,
  getLeastValueCardNotInSuite,
  getLowestRankedCardIndexInSuite,
  getMaxBid,
  getTeammateInSuite,
  getWinProbability,
  hasSuite,
  teammateOptionScore,
} from "@/utils/handUtils";
import {
  doOthersStillHaveTrump,
  getHighestUnwinnableCardIndexInSuite,
  getHighestUnwinnableCardInSuite,
  teammateSureShotWin,
  throwUnwinnablePoints,
  tryAndGetLeastValueCardIndexNotInSuite,
  tryAndWinWithSuite,
} from "../utils/botUtils";
import BotAgent, {
  BidAction,
  BidParams,
  BotChoiceParams,
  TrumpTeammateChoice,
  TrumpTeammateParams,
} from "./BotAgent";

export default class GreedyBot extends BotAgent {
  static displayName = "Greedy";

  // Start a new trick by playing the highest card
  // todo - improve this function by taking into account number of cards over & trump suite
  startTrick(params: BotChoiceParams): Card {
    const {
      hand,
      trumpSuite,
      discardedCards,
      isBidWinner,
      teammateIndex,
      playerIndex,
      isTeammateRevealed,
      teammateCard,
      isTeammate,
      missingSuiteMemory,
    } = params;

    const teamIndices = [playerIndex];
    if (teammateIndex !== -1) {
      teamIndices.push(teammateIndex);
    }
    // if teammate is not revealed,
    // and is safe to get teammate out,
    // play unwinnable card from teammate's suite
    if (isBidWinner) {
      console.log("[startTrick]: Bid winner starting trick");
      if (!isTeammateRevealed && hasSuite(hand, teammateCard.suite)) {
        const numTrumpsDone = discardedCards.filter(
          card => card.suite === trumpSuite
        ).length;
        console.log(
          "[startTrick]: Teammate not revealed and has teammate suite: ",
          "numTrumpsDone: ",
          numTrumpsDone
        );
        if (teammateCard.suite === trumpSuite || numTrumpsDone >= 4) {
          console.log("[startTrick]: Safe to make teammate reveal themselves");
          return getHighestUnwinnableCardInSuite(
            hand,
            teammateCard.suite,
            discardedCards
          );
        }
      }
    }

    // if bidding team & others have trump
    // play trump suite
    if (isBidWinner || isTeammate) {
      console.log(
        "[startTrick]: isBidWinner || isTeammate: ",
        isBidWinner,
        isTeammate
      );
      console.log(
        "[startTrick]: Player has trump suite: ",
        hasSuite(hand, trumpSuite)
      );
      // Do others still have trump?
      if (
        hasSuite(hand, trumpSuite) &&
        doOthersStillHaveTrump(
          hand,
          trumpSuite,
          discardedCards,
          teamIndices,
          missingSuiteMemory
        )
      ) {
        console.log(
          "[startTrick]: Others still have trump, try and empty trumps"
        );
        // for trump suite, if P(win) == 1, play highest card
        const winProbObj = getWinProbability(hand, discardedCards, trumpSuite);
        if (winProbObj?.winProbability === 1) {
          return winProbObj.card;
        } else {
          return getLeastValueCardInSuite(hand, trumpSuite);
        }
      }
    }
    console.log("[startTrick]: Default behavior");

    const winningOptions = DECK_SUITES.filter(suite => suite !== trumpSuite)
      .map(suite => getWinProbability(hand, discardedCards, suite))
      .filter(
        (option): option is NonNullable<ReturnType<typeof getWinProbability>> =>
          option !== null && option.winProbability > 0
      );

    if (winningOptions.length === 0) {
      console.log("[startTrick]: No winning options, playing least card");
      // pick lowest card in hand to start the trick
      const leastCard = getLeastValueCardNotInSuite(hand, trumpSuite);
      if (leastCard !== null) {
        return leastCard;
      }
      return getLeastValueCard(hand);
    }

    const bestOption = winningOptions.reduce((best, current) => {
      if (current.winProbability > best.winProbability) {
        return current;
      } else if (current.winProbability === best.winProbability) {
        return current.numCardsOver < best.numCardsOver ? current : best;
      } else {
        return best;
      }
    });

    console.log("[startTrick]: Best option: ", bestOption);
    return bestOption.card;
  }

  // if P(win) > 0, pick the highest card from the running suite
  // else pick the least value card
  pickRunningSuite(params: BotChoiceParams): number {
    const {
      hand,
      tableCards,
      runningSuite,
      trumpSuite,
      discardedCards,
      isTeammate,
      isTeammateRevealed,
      teammateCard,
      teammateIndex,
      isBidWinner,
      bidWinner,
    } = params;
    if (runningSuite === null) {
      throw Error("runningSuite can't be null");
    }

    // Teammate about to reveal themselves
    if (
      !isTeammateRevealed &&
      isTeammate &&
      runningSuite === teammateCard.suite &&
      tableCards.length !== NUM_PLAYERS - 1
    ) {
      const teammateCardIndex = hand.findIndex(
        card => card.hash === teammateCard.hash
      );
      if (teammateCardIndex === -1) {
        throw Error("Teammate card not present in teammate hand. How?");
      }
      return teammateCardIndex;
    }

    // Teammate sure-shot wins: dump unwinnable points in running suite
    if (
      teammateSureShotWin(
        hand,
        runningSuite,
        trumpSuite,
        tableCards,
        discardedCards,
        isBidWinner,
        teammateIndex,
        teammateCard
      )
    ) {
      console.log(
        "[pickRunningSuite]: teammate will sure shot win --> play unwinnable points"
      );
      return getHighestUnwinnableCardIndexInSuite(
        hand,
        runningSuite,
        discardedCards,
        tableCards
      );
    }

    // Try to win ourselves
    const winningCard = determineTrickWinner(
      tableCards,
      runningSuite,
      trumpSuite
    );
    const isTrickCut =
      winningCard.suite === trumpSuite && trumpSuite !== runningSuite;

    // todo - need to add functionality to throw points if defender.
    // const throwPoints =
    //   !isTeammate && !isBidWinner && winningCard.player !== bidWinner;

    // Trick is already cut; cannot win with running suite
    if (isTrickCut) {
      // @ts-expect-error - hand is not empty when this is called
      return getLeastValueCardIndexInSuite(hand, runningSuite);
    }

    return tryAndWinWithSuite(
      hand,
      tableCards,
      discardedCards,
      runningSuite,
      winningCard
    );
  }

  // If player has trump, if P(win) > 0 --> play highest trump card
  // else, play least value card
  toCutOrNotToCut(params: BotChoiceParams): number {
    const {
      hand,
      tableCards,
      runningSuite,
      trumpSuite,
      discardedCards,
      isBidWinner,
      teammateIndex,
      teammateCard,
    } = params;
    if (runningSuite === null) {
      throw Error("runningSuite can't be null");
    }

    // Teammate sure-shot wins: dump unwinnable points from other suites
    // or empty other suites to cut later.
    if (
      teammateSureShotWin(
        hand,
        runningSuite,
        trumpSuite,
        tableCards,
        discardedCards,
        isBidWinner,
        teammateIndex,
        teammateCard
      )
    ) {
      console.log(
        "[toCutOrNotToCut]: teammate will sure shot win --> play unwinnable points"
      );
      // todo - dump unwinnable points from other suites
      const filteredSuites = DECK_SUITES.filter(
        suite => suite !== trumpSuite && suite !== runningSuite
      );
      const pointCardIndex = throwUnwinnablePoints(
        hand,
        filteredSuites,
        discardedCards,
        tableCards
      );
      if (pointCardIndex === null) {
        return tryAndGetLeastValueCardIndexNotInSuite(hand, trumpSuite);
      } else {
        return pointCardIndex;
      }
    }

    const winningCard = determineTrickWinner(
      tableCards,
      runningSuite,
      trumpSuite
    );
    const isTrickCut =
      winningCard.suite === trumpSuite && trumpSuite !== runningSuite;

    const highestTrumpIndex = getHighestRankedCardIndexInSuite(
      hand,
      trumpSuite
    );
    // user has trump
    if (highestTrumpIndex !== null) {
      console.log(
        "[toCutOrNotToCut]: user has trump --> try and win with trump"
      );
      const highestTrump = hand[highestTrumpIndex];

      if (!isTrickCut) {
        // @ts-expect-error - hand is not empty when this is called
        return getLowestRankedCardIndexInSuite(hand, trumpSuite);
      }
      // trick already cut, we have higher trump card.
      if (highestTrump.rank > winningCard.rank) {
        // we want to win the trick with card just higher than winning card.
        const winnableTrumpCards = hand.filter(
          card => card.suite === trumpSuite && card.rank > winningCard.rank
        );
        const winningCardIndex = getLeastValueCardIndexInSuite(
          winnableTrumpCards,
          trumpSuite
        );
        if (winningCardIndex !== null) {
          return hand.indexOf(winnableTrumpCards[winningCardIndex]);
        }
      }
    }
    // default behavior: play least non-trump card from hand.
    return tryAndGetLeastValueCardIndexNotInSuite(hand, trumpSuite);
  }

  getBidAction(params: BidParams): BidAction {
    const { currentBid, minIncrement, maxBid, hand } = params;

    if (currentBid >= maxBid) return { action: "pass" };

    const ceilingBid = getMaxBid(hand);
    console.log("Bot Bidding: ceilingBid: ", ceilingBid);
    if (currentBid + minIncrement <= ceilingBid) {
      const bidAmount = currentBid + minIncrement;
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
