import { hasSuite } from "../utils/handUtils";

export default class BotAgent {
  /**
   * Start a new round - must be implemented by subclass
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} trumpSuite - The trump suite for the game
   * @returns {number} - The index of the card to play
   */
  startRound(hand, trumpSuite) {
    throw new Error("startRound() must be implemented by subclass");
  }

  /**
   * Pick a card from the running suite - must be implemented by subclass
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} runningSuite - The suite that is currently running
   * @param {string} trumpSuite - The trump suite for the game
   * @param {Array} tableCards - Cards currently on the table
   * @returns {number} - The index of the card to play
   */
  pickRunningSuite(hand, runningSuite, trumpSuite, tableCards) {
    throw new Error("pickRunningSuite() must be implemented by subclass");
  }

  /**
   * Decide whether to cut (play trump) or not - must be implemented by subclass
   * @param {Array} hand - The players hand (array of card objects)
   * @param {string} runningSuite - The suite that is currently running
   * @param {string} trumpSuite - The trump suite for the game
   * @param {Array} tableCards - Cards currently on the table
   * @returns {number} - The index of the card to play
   */
  toCutOrNotToCut(hand, runningSuite, trumpSuite, tableCards) {
    throw new Error("toCutOrNotToCut() must be implemented by subclass");
  }

  /**
   * Main method to pick a card based on round state
   * @param {Object} params - The parameters object
   * @param {Array} params.hand - The players hand (array of card objects)
   * @param {Array} params.tableCards - Cards currently on the table
   * @param {string} params.trumpSuite - The trump suite for the game
   * @param {string} params.runningSuite - The suite that is currently running
   * @param {number} params.playerIndex - The player index
   * @param {boolean} verbose - Whether to print debug info
   * @returns {number|null} - The index of the card to play
   */
  chooseCardIndex(
    { hand, tableCards, trumpSuite, runningSuite, playerIndex },
    verbose = false
  ) {
    if (verbose) {
      console.log("Current hand:", hand);
    }

    if (!hand || hand.length === 0) return null;

    if (runningSuite === null) {
      let pickedCardIndex = this.startRound(hand, trumpSuite);
      if (verbose) {
        console.log(`Starting round with card index: ${pickedCardIndex}`);
      }
      return pickedCardIndex;
    }

    // Try running suite
    if (hasSuite(hand, runningSuite)) {
      let pickedCardIndex = this.pickRunningSuite(
        hand,
        runningSuite,
        trumpSuite,
        tableCards
      );
      if (verbose) {
        console.log(
          `Playing card from running suite at index: ${pickedCardIndex}`
        );
      }
      return pickedCardIndex;
    }

    // To cut or not?
    let pickedCardIndex = this.toCutOrNotToCut(
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

  /**
   * Decide whether to bid or pass in the bidding round.
   * @param {Object} params - { currentBid, minIncrement, maxBid, passedPlayers, hand, playerIndex }
   * @returns {Object} - { action: 'bid', bidAmount } or { action: 'pass' }
   */
  getBidAction(params) {
    throw new Error("getBidAction() must be implemented by subclass");
  }

  /**
   * Choose trump suite and teammate card after winning the bid.
   * @param {Object} params - { hand, playerNames, playerIndex, teammateOptions }
   * @returns {Object} - { trumpSuite, teammateCard }
   */
  chooseTrumpAndTeammate(params) {
    throw new Error("chooseTrumpAndTeammate() must be implemented by subclass");
  }
}
