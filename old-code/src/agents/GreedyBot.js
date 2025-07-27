import BotAgent from "./BotAgent.js";
import {
  getHighestRankedCardIndex,
  getHighestRankedCardIndexInSuite,
  getLeastValueCardIndex,
  getLeastValueCardIndexInSuite,
} from "../utils/handUtils";
import { determineRoundWinner } from "../utils/gameUtils";

export default class GreedyBot extends BotAgent {
  /**
   * Start a new round by playing the highest card
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} trumpSuite - The trump suite for the game
   * @returns {number} - The index of the card to play
   */
  startRound(hand, trumpSuite) {
    return getHighestRankedCardIndex(hand);
  }

  /**
   * if P(win) > 0, pick the highest card from the running suite
   * else pick the least value card
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} runningSuite - The suite that is currently running
   * @param {string} trumpSuite - The trump suite for the game
   * @param {Array} tableCards - Cards currently on the table
   * @returns {number} - The index of the card to play
   */
  pickRunningSuite(hand, runningSuite, trumpSuite, tableCards) {
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

  /**
   * If player has trump, if P(win) > 0 --> play highest trump card
   * else, play least value card
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} runningSuite - The suite that is currently running
   * @param {string} trumpSuite - The trump suite for the game
   * @param {Array} tableCards - Cards currently on the table
   * @returns {number} - The index of the card to play
   */
  toCutOrNotToCut(hand, runningSuite, trumpSuite, tableCards) {
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

  /**
   * Decide whether to bid or pass in the bidding round.
   * @param {Object} params - { currentBid, minIncrement, maxBid, passedPlayers, hand, playerIndex }
   * @returns {Object} - { action: 'bid', bidAmount } or { action: 'pass' }
   */
  getBidAction({
    currentBid,
    minIncrement,
    maxBid,
    passedPlayers,
    hand,
    playerIndex,
  }) {
    if (currentBid >= maxBid) return { action: "pass" };

    // Count high cards (A, K, Q, J, 10)
    const highNumbers = [1, 13, 12];
    const highCards = hand.filter((card) =>
      highNumbers.includes(card.number)
    ).length;

    // Count trumps (assume bot will pick the suite with most cards as trump)
    const suiteCounts = [0, 1, 2, 3].map(
      (suite) => hand.filter((card) => card.suite === suite).length
    );
    const maxTrumpCount = Math.max(...suiteCounts);

    // Decide max safe bid based on hand strength
    let safeMaxBid = 200;
    if (highCards >= 5 && maxTrumpCount >= 4) {
      safeMaxBid = 210;
    }
    if (highCards >= 7 && maxTrumpCount >= 5) {
      safeMaxBid = 220;
    }
    if (highCards >= 8 && maxTrumpCount >= 6) {
      safeMaxBid = 230;
    }

    // If current bid is above safe max, pass
    if (currentBid >= safeMaxBid) return { action: "pass" };

    // Otherwise, bid with a reasonable increment
    let increment = 10;
    if (currentBid < 200 || currentBid + 10 > safeMaxBid)
      increment = minIncrement;
    const bidAmount = Math.min(currentBid + increment, safeMaxBid, maxBid);

    return { action: "bid", bidAmount };
  }

  /**
   * Choose trump suite and teammate card after winning the bid.
   * @param {Object} params - { hand, playerNames, playerIndex, teammateOptions }
   * @returns {Object} - { trumpSuite, teammateCard }
   */
  chooseTrumpAndTeammate({ hand, playerNames, playerIndex, teammateOptions }) {
    // Pick trump suite with most cards in hand
    const suiteCounts = [0, 1, 2, 3].map(
      (suite) => hand.filter((card) => card.suite === suite).length
    );
    let trumpSuite = suiteCounts.indexOf(Math.max(...suiteCounts));
    // Prefer A, K, Q, J, 10, 9, ...
    const preferredOrder = [1, 13, 12, 11, 10, 9, 8, 7, 5, 3];
    teammateOptions.sort(
      (a, b) =>
        preferredOrder.indexOf(a.number) - preferredOrder.indexOf(b.number)
    );
    const teammateCard = teammateOptions[0];
    return { trumpSuite, teammateCard };
  }
}
