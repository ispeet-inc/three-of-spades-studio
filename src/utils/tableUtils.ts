import { Suite, TableCard, TableState } from "@/types/game";
import { generateDeck } from "./cardUtils";
import { determineTrickWinner } from "./gameUtils";

export const initialTableState = (
  startingTurn: number,
  fresh_deck: boolean
): TableState => {
  return {
    runningSuite: null,
    tableCards: [],
    turn: startingTurn,
    trickWinner: null,
    discardedCards: fresh_deck ? generateDeck() : [],
  };
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
    runningSuite = tableCard.suite;
  }
  return {
    runningSuite: runningSuite,
    tableCards: updatedTableCards,
    turn: (oldState.turn + 1) % numPlayers,
    trickWinner: trickWinner,
    discardedCards: oldState.discardedCards,
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
  };
};
