import Suite from "../classes/Suite";

// Consolidated suite data for better performance and maintainability
export const SUITE_DATA = {
  [Suite.CLUB]: {
    symbol: "♣",
    name: "club",
    label: "Clubs",
    icon: "♣️",
    value: Suite.CLUB,
  },
  [Suite.DIAMOND]: {
    symbol: "♦",
    name: "diamond",
    label: "Diamonds",
    icon: "♦️",
    value: Suite.DIAMOND,
  },
  [Suite.HEART]: {
    symbol: "♥",
    name: "heart",
    label: "Hearts",
    icon: "♥️",
    value: Suite.HEART,
  },
  [Suite.SPADE]: {
    symbol: "♠",
    name: "spade",
    label: "Spades",
    icon: "♠️",
    value: Suite.SPADE,
  },
};

// Optimized exports for backward compatibility and performance
export const suitSymbols = Object.fromEntries(
  Object.entries(SUITE_DATA).map(([key, data]) => [key, data.symbol])
);

export const suitNames = Object.fromEntries(
  Object.entries(SUITE_DATA).map(([key, data]) => [key, data.name])
);

export const SUITES = Object.values(SUITE_DATA);

// Utility functions for better performance
export const getSuiteSymbol = (suite) => SUITE_DATA[suite]?.symbol || "";
export const getSuiteName = (suite) => SUITE_DATA[suite]?.name || "";
export const getSuiteLabel = (suite) => SUITE_DATA[suite]?.label || "";
export const getSuiteIcon = (suite) => SUITE_DATA[suite]?.icon || "";

// Memoized array of all suite values for performance
export const ALL_SUITES = Object.values(Suite);

// Utility to get random suite
export const getRandomSuite = () => {
  return ALL_SUITES[Math.floor(Math.random() * ALL_SUITES.length)];
};
