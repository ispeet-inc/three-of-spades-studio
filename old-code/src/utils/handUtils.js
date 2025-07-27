/**
 * Checks if the given suite is present in the hand.
 * @param {Array} hand - Array of card objects.
 * @param {string} suite - The suite to check for.
 * @returns {boolean} True if the suite is present, false otherwise.
 */
export function hasSuite(hand, suite) {
  const suiteCards = hand.filter((card) => card.suite === suite);
  return suiteCards.length > 0;
}

/**
 * Returns a random valid index from the hand array.
 * @param {Array} hand - Array of card objects.
 * @returns {number|null} A random index, or null if hand is empty or not an array.
 */
export function getRandomCardIndex(hand) {
  if (!Array.isArray(hand) || hand.length === 0) return null;
  return Math.floor(Math.random() * hand.length);
}

/**
 * Returns a random card index from hand for a given suite.
 * @param {Array} hand - Array of card objects.
 * @param {string} suite - The suite to filter by.
 * @returns {number|null} The index of a random card in the suite, or null if none found.
 */
export function getRandomCardIndexBySuite(hand, suite) {
  const suiteCards = hand.filter((card) => card.suite === suite);
  if (suiteCards.length > 0) {
    const randomIndex = getRandomCardIndex(suiteCards);
    return hand.indexOf(suiteCards[randomIndex]);
  }
  return null;
}

/**
 * Returns the index of the highest ranked card in the hand.
 * @param {Array} hand - Array of card objects.
 * @returns {number|null} The index of the highest ranked card, or null if hand is empty.
 */
export function getHighestRankedCardIndex(hand) {
  if (!hand || hand.length === 0) return null;

  let highestCardIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].rank > hand[highestCardIndex].rank) {
      highestCardIndex = i;
    }
  }
  return highestCardIndex;
}

/**
 * Returns the index of the highest ranked card in a specific suite.
 * @param {Array} hand - Array of card objects.
 * @param {string} suite - The suite to filter by.
 * @returns {number|null} The index of the highest ranked card in the suite, or null if none found.
 */
export function getHighestRankedCardIndexInSuite(hand, suite) {
  if (!hand || hand.length === 0) return null;

  const suiteCards = hand.filter((card) => card.suite === suite);
  if (suiteCards.length === 0) return null;

  // Use getHighestRankedCardIndex on the filtered suite cards
  const highestInSuiteIdx = getHighestRankedCardIndex(suiteCards);
  if (highestInSuiteIdx === null) return null;
  // Map back to the original hand index
  return hand.indexOf(suiteCards[highestInSuiteIdx]);
}

/**
 * Returns the index of the least value card in the hand.
 * @param {Array} hand - Array of card objects.
 * @returns {number|null} The index of the least value card, or null if hand is empty.
 */
export function getLeastValueCardIndex(hand) {
  if (!hand || hand.length === 0) return null;

  let leastValueCardIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].points < hand[leastValueCardIndex].points) {
      leastValueCardIndex = i;
    }
  }
  return leastValueCardIndex;
}

/**
 * Returns the index of the least value card in the hand for a specific suite.
 * @param {Array} hand - Array of card objects.
 * @param {string} suite - The suite to filter by.
 * @returns {number|null} The index of the least value card in the suite, or null if none found.
 */
export function getLeastValueCardIndexInSuite(hand, suite) {
  if (!hand || hand.length === 0) return null;

  // Filter cards by suite
  const suiteCards = hand.filter((card) => card.suite === suite);
  if (suiteCards.length === 0) return null;

  // Find the least value card in the filtered suite cards
  let leastValueIdx = getLeastValueCardIndex(suiteCards);
  if (leastValueIdx === null) return null;
  // Map back to the original hand index
  return hand.indexOf(suiteCards[leastValueIdx]);
}
