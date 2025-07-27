import createCard from "../classes/Card";
import { ALL_SUITES } from "./suiteUtils";

/**
 * Generates a standard deck of cards for the game
 * Creates cards for each suite (Spades, Hearts, Diamonds, Clubs)
 * Uses numbers 3,5,7,8,9,10,J,Q,K,A
 * @returns {Array} Array of Card objects representing a complete deck
 */
export const generateDeck = () => {
  const deck = [];
  const suites = ALL_SUITES;
  const numbers = [3, 5, 7, 8, 9, 10, 11, 12, 13, 1]; // 11=J, 12=Q, 13=K, 1=A

  suites.forEach((suite) => {
    numbers.forEach((number) => {
      deck.push(createCard(suite, number));
    });
  });
  return deck;
};

/**
 * Randomly shuffles an array using the Fisher-Yates shuffle algorithm
 * @param {Array} array - The array to be shuffled
 * @returns {Array} The shuffled array
 */
export const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

/**
 * Distributes cards from a deck to multiple players
 * @param {Array} deck - The deck of cards to distribute
 * @param {number} num_players - Number of players to distribute cards to
 * @param {boolean} sort - Whether to sort each player's hand (default: true)
 * @returns {Array} Array of arrays, where each inner array represents a player's hand
 * @throws {Error} If deck size is not divisible by number of players
 */
export const distributeDeck = (deck, num_players, sort = true) => {
  const hands = [[], [], [], []];

  if (deck.length % num_players !== 0) {
    throw new Error("Deck size must be divisible by number of players");
  }

  for (let i = 0; i < deck.length; i++) {
    hands[i % num_players].push(deck[i]);
  }

  if (sort) {
    // Sort each player's hand
    hands.forEach((hand) => {
      hand.sort((cardA, cardB) => {
        return cardA.positionValue - cardB.positionValue;
      });
    });
  }

  return hands;
};

export const getPlayedCardForPlayer = (tableCards, playerIndex) => {
  // todo - fix this, not needed.
  const playedCardsThisRound = tableCards.slice(-4);
  return playedCardsThisRound.find((card) => card.player === playerIndex);
};

/**
 * Determines the winner of a round based on the cards played, running suite, and trump suite
 * @param {Array} tableCards - Array of TableCards played in the current round
 * @param {Suite} runningSuite - The suite that was led in the round
 * @param {Suite} trumpSuite - The trump suite for the game
 * @returns {TableCard}
 */
export const determineRoundWinner = (tableCards, runningSuite, trumpSuite) => {
  console.log(tableCards);
  // First check if any trump cards were played
  const trumpCards = tableCards.filter((card) => card.suite === trumpSuite);

  if (trumpCards.length > 0) {
    // If trump was played, highest trump wins
    return getMaxRankedCard(trumpCards);
  } else {
    // If no trump was played, highest card of running suite wins
    const runningSuiteCards = tableCards.filter(
      (card) => card.suite === runningSuite
    );
    return getMaxRankedCard(runningSuiteCards);
  }
};

/**
 * Gets the highest ranked card from an array of cards
 * @param {Array} cards - Array of cards to compare
 * @returns {Card} The highest ranked card
 */
export const getMaxRankedCard = (cards) => {
  return cards.reduce((max, current) => {
    return current.rank > max.rank ? current : max;
  });
};

/**
 * Randomly assigns players to two teams
 * @param {number} numPlayers - Number of players to assign to teams
 * @returns {Object} Object containing team assignments with two teams
 */
export function getRandomTeams(numPlayers) {
  const playerIndices = Array.from({ length: numPlayers }, (_, i) => i);
  shuffle(playerIndices);

  // Split players into two teams
  const midPoint = Math.ceil(numPlayers / 2);
  return {
    0: playerIndices.slice(0, midPoint), // First team
    1: playerIndices.slice(midPoint), // Second team
  };
}

/**
 * Creates a reverse map of player indices to their team IDs
 * @param {Object} teams - Object containing team assignments {0: [playerIndices], 1: [playerIndices]}
 * @returns {Object} Map of player index to team ID
 */
export function getPlayerTeamMap(teams) {
  const playerTeamMap = {};

  Object.entries(teams).forEach(([teamId, players]) => {
    players.forEach((playerIndex) => {
      playerTeamMap[playerIndex] = parseInt(teamId);
    });
  });

  return playerTeamMap;
}

/**
 * Returns the display name for a player, falling back to 'Player X' if not set
 * @param {Object|Array} playerNames - Map or array of player names
 * @param {number} idx - Player index
 * @returns {string} Display name for the player
 */
export function getDisplayPlayerName(playerNames, idx) {
  if (playerNames && playerNames[idx]) {
    // Split by space, underscore, or camelCase
    let name = playerNames[idx];
    // Convert camelCase to space-separated
    name = name.replace(/([a-z])([A-Z])/g, "$1 $2");
    // Split by space or underscore
    const parts = name.split(/\s+|_/);
    return parts[parts.length - 1];
  }
  return `Player ${idx + 1}`;
}

// Utility function to get and format the display player name
export function getFormattedPlayerName(playerNames, idx) {
  const name =
    playerNames && playerNames[idx] ? playerNames[idx] : `Player ${idx + 1}`;
  // Convert camelCase to space-separated
  const spaced = name.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Split by space or underscore
  const parts = spaced.split(/\s+|_/);
  if (parts.length === 1) return parts[0];
  return parts[0] + " " + parts[parts.length - 1];
}

/**
 * Assigns teams based on the bidder and the player who holds the teammate card.
 * teams[0] is always the bidding team (bidder + teammate holder)
 * teams[1] is always the defending team (the other two players)
 * @param {Object} players - Map of player index to player state (with .hand)
 * @param {number} bidder - Index of the bidding player
 * @param {Object} teammateCard - {suite, number} of the teammate card
 * @param {number} numPlayers - Number of players
 * @returns {{teams: Object, playerTeamMap: Object}}
 */
export function assignTeamsByTeammateCard(
  players,
  bidder,
  teammateCard,
  numPlayers
) {
  let teammateHolder = null;
  for (let i = 0; i < numPlayers; i++) {
    if (
      players[i].hand.some(
        (card) =>
          card.suite === teammateCard.suite &&
          card.number === teammateCard.number
      )
    ) {
      teammateHolder = i;
      break;
    }
  }
  // teams[0] is always bidding team
  const biddingTeam = [bidder, teammateHolder];
  const defendingTeam = [];
  for (let i = 0; i < numPlayers; i++) {
    if (!biddingTeam.includes(i)) defendingTeam.push(i);
  }
  const teams = { 0: biddingTeam, 1: defendingTeam };
  const playerTeamMap = getPlayerTeamMap(teams);
  return { teams, playerTeamMap };
}

/**
 * Returns the teammate card options for a given suite, excluding cards in the user's hand.
 * @param {Array} userHand - Array of Card objects in the user's hand
 * @param {Suite} suite - The suite to filter for
 * @returns {Array} Array of Card objects in the suite, not in userHand
 */
export function getTeammateOptions(userHand, suite) {
  const fullDeck = generateDeck();
  // Helper: check if a card is in user's hand
  const isInUserHand = (card) => {
    return userHand.some(
      (h) => h.suite === card.suite && h.number === card.number
    );
  };
  // Filter deck for current suite and not in user's hand
  return fullDeck.filter((card) => card.suite === suite && !isInUserHand(card));
}
