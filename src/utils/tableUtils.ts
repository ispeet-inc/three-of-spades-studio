import { Suite, TableCard, TableState } from "@/types/game";
import { generateDeck } from "./cardUtils";
import { determineTrickWinner } from "./gameUtils";

export const initialTableState = (
  numPlayers: number,
  startingTurn: number,
  fresh_deck: boolean
): TableState => {
  return {
    runningSuite: null,
    tableCards: [],
    turn: startingTurn,
    trickWinner: null,
    discardedCards: fresh_deck ? generateDeck() : [],
    missingSuiteMemory: Object.fromEntries(
      Array.from({ length: numPlayers }, (_, i) => [i, []])
    ),
  };
};

// keep track of who has what suite missing
export const updateMissingSuiteMemory = (
  runningSuite: Suite,
  tableCard: TableCard,
  missingSuiteMemory: Record<number, Suite[]>
): Record<number, Suite[]> => {
  if (tableCard.suite !== runningSuite) {
    missingSuiteMemory[tableCard.player] = [
      ...missingSuiteMemory[tableCard.player],
      runningSuite,
    ];
  }

  return missingSuiteMemory;
};

export const playCardOnTable = (
  oldState: TableState,
  tableCard: TableCard,
  trumpSuite: Suite,
  numPlayers: number
): TableState => {
  let runningSuite = oldState.runningSuite;
  const updatedTableCards = [...oldState.tableCards, tableCard];
  let trickWinner = null;
  let missingSuiteMemory = oldState.missingSuiteMemory;
  if (updatedTableCards.length === 1) {
    runningSuite = tableCard.suite;
  }
  if (updatedTableCards.length === 4) {
    console.log("GAME: All 4 cards played, determining winner");
    trickWinner = determineTrickWinner(
      updatedTableCards,
      runningSuite as Suite,
      trumpSuite
    );
  }

  // if someone played non running suite, update missing suite memory
  if (tableCard.suite !== runningSuite) {
    missingSuiteMemory = updateMissingSuiteMemory(
      runningSuite as Suite,
      tableCard,
      missingSuiteMemory
    );
  }

  return {
    runningSuite: runningSuite,
    tableCards: updatedTableCards,
    turn: (oldState.turn + 1) % numPlayers,
    trickWinner: trickWinner,
    discardedCards: oldState.discardedCards,
    missingSuiteMemory: missingSuiteMemory,
  };
};

export const newTrickOnTable = (oldState: TableState): TableState => {
  if (!oldState.trickWinner) {
    throw new Error("Cannot start new trick: trickWinner is null");
  }
  return {
    runningSuite: null,
    tableCards: [],
    turn: oldState.trickWinner.player,
    trickWinner: null,
    discardedCards: oldState.discardedCards.concat(oldState.tableCards),
    missingSuiteMemory: oldState.missingSuiteMemory,
  };
};
