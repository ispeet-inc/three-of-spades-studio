import { Card, Suite, TableCard, Player } from "@/types/game";
import { createCard } from "./cardUtils";
import { BIDDING_TEAM, DEFENDING_TEAM } from "./constants";

export const determineRoundWinner = (
  tableCards: TableCard[],
  runningSuite: Suite,
  trumpSuite: Suite
): TableCard => {
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

export const getMaxRankedCard = (cards: TableCard[]): TableCard => {
  return cards.reduce((max, current) => {
    return current.rank > max.rank ? current : max;
  });
};

export const assignTeamsByTeammateCard = (
  players: Record<number, Player>,
  bidder: number,
  teammateCard: Card,
  numPlayers: number
) => {
  const playerTeamMap = {} as Record<number, number>;

  // Find who has the teammate card
  let teammateIndex = -1;
  for (let i = 0; i < numPlayers; i++) {
    const hasCard = players[i].hand.some(
      (card) => card.suite === teammateCard.suite && card.number === teammateCard.number
    );
    if (hasCard) {
      teammateIndex = i;
      break;
    }
  }

  // Assign teams
  for (let i = 0; i < numPlayers; i++) {
    if (i === bidder || i === teammateIndex) {
      playerTeamMap[i] = BIDDING_TEAM;
    } else {
      playerTeamMap[i] = DEFENDING_TEAM;
    }
  }

  return playerTeamMap;
};

export const getTeammateOptions = (hand: Card[], suite: number): Card[] => {
  // Get all possible teammate cards for a given suite that are NOT in the player's hand
  const allCards = [3, 5, 7, 8, 9, 10, 11, 12, 13, 1].map(num => createCard(suite, num));
  
  return allCards.filter(card => 
    !hand.some(handCard => 
      handCard.suite === card.suite && handCard.number === card.number
    )
  );
};

export const getDisplayPlayerName = (playerNames: Record<number, string>, idx: number): string => {
  return playerNames[idx] || `Player ${idx + 1}`;
};

export const getFormattedPlayerName = (playerNames: Record<number, string>, idx: number | string): string => {
  const index = typeof idx === 'string' ? parseInt(idx) : idx;
  return getDisplayPlayerName(playerNames, index);
};

export const hasSuite = (hand: Card[], suite: number): boolean => {
  return hand.some(card => card.suite === suite);
};

export const getRandomCardIndex = (hand: Card[]): number => {
  return Math.floor(Math.random() * hand.length);
};

export const getRandomCardIndexBySuite = (hand: Card[], suite: number): number => {
  const suiteCards = hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.suite === suite);
  
  if (suiteCards.length === 0) return -1;
  
  const randomIndex = Math.floor(Math.random() * suiteCards.length);
  return suiteCards[randomIndex].index;
};

export const getRandomSuite = (): number => {
  return Math.floor(Math.random() * 4);
};

// Function to randomly select 3 names from the pool that are not already in state.playerNames
export const selectRandomNames = (pool: string[], playerNames: Record<number, string>): string[] => {
  // Collect all names currently in use (including player 0)
  const usedNames = new Set(Object.values(playerNames).map(name => name.trim()).filter(Boolean));
  // Filter pool to exclude used names
  const availableNames = pool.filter(name => !usedNames.has(name));
  // Shuffle available names
  for (let i = availableNames.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableNames[i], availableNames[j]] = [availableNames[j], availableNames[i]];
  }
  // Return up to 3 names
  return availableNames.slice(0, 3);
}