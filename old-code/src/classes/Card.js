import Suite from "./Suite.js";

// Utility functions for card operations
const getId = (number) => {
  if (number === 1) return "A";
  if (number === 11) return "J";
  if (number === 12) return "Q";
  if (number === 13) return "K";
  return number;
};

const getPoints = (number, suite) => {
  if (number === 1) {
    return 10;
  } else if (number >= 10) {
    return 10;
  } else if (number === 5) {
    return 5;
  } else if (number === 3 && suite === Suite.SPADE) {
    return 30;
  } else {
    return 0;
  }
};

const getRank = (number) => {
  if (number === 1) {
    return 14;
  } else {
    return number;
  }
};

const getPositionValue = (suite, rank) => {
  return 100 * suite + rank;
};

const getHash = (suite, number) => {
  return `${suite},${number}`;
};

// Factory function to create card objects
const createCard = (suite, number) => {
  const id = getId(number);
  const rank = getRank(number);
  const points = getPoints(number, suite);
  const positionValue = getPositionValue(suite, rank);
  const hash = getHash(suite, number);

  return {
    suite,
    number,
    id,
    rank,
    points,
    positionValue,
    hash,
  };
};

export default createCard;

// Function to print list of cards
// function printCards(cards, delimiter = ", ") {
//   const seq = cards.map(card => card.toString()).join(delimiter);
//   console.log(seq);
// }

// // Function to get string representation of cards
// function getCardsStr(cards, delimiter = ", ") {
//   return cards.map(card => card.toString()).join(delimiter);
// }

//   get getIndices() {
//     return [this.suite, this.index];
//   }
