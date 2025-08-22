import { Suite } from "@/types/game";

// Consolidated suite data for better performance and maintainability
export const SUITE_DATA = {
  [Suite.Club]: {
    symbol: "♣",
    name: "club",
    label: "Clubs",
    icon: "♣️",
    value: Suite.Club,
    color: "black",
  },
  [Suite.Diamond]: {
    symbol: "♦",
    name: "diamond",
    label: "Diamonds",
    icon: "♦️",
    value: Suite.Diamond,
    color: "red",
  },
  [Suite.Heart]: {
    symbol: "♥",
    name: "heart",
    label: "Hearts",
    icon: "♥️",
    value: Suite.Heart,
    color: "red",
  },
  [Suite.Spade]: {
    symbol: "♠",
    name: "spade",
    label: "Spades",
    icon: "♠️",
    value: Suite.Spade,
    color: "black",
  },
};

export const SUITES = Object.values(SUITE_DATA);

// Optimized exports for backward compatibility and performance
export const suitSymbols = Object.fromEntries(
  Object.entries(SUITE_DATA).map(([key, data]) => [key, data.symbol])
);

// Optimized exports for backward compatibility and performance
export const suitColors = Object.fromEntries(
  Object.entries(SUITE_DATA).map(([key, data]) => [
    key,
    "text-casino-" + data.color,
  ])
);

export const suiteMetadata = Object.values(SUITE_DATA)
  // Sort by Suite enum order: Spade, Heart, Club, Diamond
  .sort((a, b) => a.value - b.value)
  .map(data => ({
    value: data.value,
    icon: data.symbol,
    name: data.label,
  }));

export const getSuiteName = (suite: Suite): string => {
  return SUITE_DATA[suite].name;
};

export const getSuiteColor = (suite: Suite): string => {
  return SUITE_DATA[suite].color;
};

export const getSuiteSymbol = (suite: Suite): string => {
  return SUITE_DATA[suite].symbol;
};

export const getSuiteIcon = (suite: Suite): string => {
  return SUITE_DATA[suite].icon;
};
