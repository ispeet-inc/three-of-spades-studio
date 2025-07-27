import BotAgent from "./BotAgent.js";
import {
  getRandomCardIndex,
  getRandomCardIndexBySuite,
} from "../utils/handUtils";
import { getRandomSuite } from "../utils/suiteUtils";

export default class RandomBot extends BotAgent {
  /**
   * Start a new round by playing a random card
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} trumpSuite - The trump suite for the game
   * @returns {number} - The index of the card to play
   */
  startRound(hand, trumpSuite) {
    if (!hand || hand.length === 0) return null;

    return getRandomCardIndex(hand);
  }

  /**
   * Pick a random card from the running suite
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} runningSuite - The suite that is currently running
   * @param {string} trumpSuite - The trump suite for the game
   * @param {Array} tableCards - Cards currently on the table
   * @returns {number} - The index of the card to play
   */
  pickRunningSuite(hand, runningSuite, trumpSuite, tableCards) {
    return getRandomCardIndexBySuite(hand, runningSuite);
  }

  /**
   * Randomly decide whether to cut or play a random card
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} runningSuite - The suite that is currently running
   * @param {string} trumpSuite - The trump suite for the game
   * @param {Array} tableCards - Cards currently on the table
   * @returns {number} - The index of the card to play
   */
  toCutOrNotToCut(hand, runningSuite, trumpSuite, tableCards) {
    const trumpCards = hand.filter((card) => card.suite === trumpSuite);
    console.log("In random agent, trumpCards = ", trumpCards);
    // 50% chance to cut if we have trump cards
    if (trumpCards.length > 0 && Math.random() < 0.5) {
      const randomTrumpIndex = getRandomCardIndexBySuite(hand, trumpSuite);
      console.log(
        "Playing trum card",
        randomTrumpIndex,
        hand[randomTrumpIndex]
      );
      return randomTrumpIndex;
    } else {
      // Play random card from any suite
      return getRandomCardIndex(hand);
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

  /**
   * Choose trump suite and teammate card after winning the bid.
   * @param {Object} params - { hand, playerNames, playerIndex, teammateOptions }
   * @returns {Object} - { trumpSuite, teammateCard }
   */
  chooseTrumpAndTeammate({ hand, playerNames, playerIndex, teammateOptions }) {
    // Pick a random trump suite
    const trumpSuite = getRandomSuite();
    // Pick a random teammate card from teammateOptions
    const teammateCard =
      teammateOptions[Math.floor(Math.random() * teammateOptions.length)];
    return { trumpSuite, teammateCard };
  }
}
