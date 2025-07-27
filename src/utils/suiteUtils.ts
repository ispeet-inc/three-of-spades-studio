import { Suite } from "@/types/game";

export const suitSymbols = {
  [Suite.Heart]: "♥",
  [Suite.Diamond]: "♦",
  [Suite.Clubs]: "♣",
  [Suite.Spade]: "♠",
};

export const suitColors = {
  [Suite.Heart]: "text-casino-red",
  [Suite.Diamond]: "text-casino-red",
  [Suite.Clubs]: "text-casino-black",
  [Suite.Spade]: "text-casino-black",
};

export const suiteMetadata = [
  { value: 0, icon: "♠", name: "Spades" },
  { value: 1, icon: "♥", name: "Hearts" },
  { value: 2, icon: "♦", name: "Diamonds" },
  { value: 3, icon: "♣", name: "Clubs" },
];

export const getSuiteName = (suite: Suite): string => {
  const names = ['spade', 'heart', 'club', 'diamond'];
  return names[suite];
};

export const getSuiteColor = (suite: number): string => {
  return suite === 1 || suite === 3 ? 'red' : 'black';
};

export const getSuiteIcon = (suite: number): string => {
  const icons = ['♠', '♥', '♣', '♦'];
  return icons[suite];
};