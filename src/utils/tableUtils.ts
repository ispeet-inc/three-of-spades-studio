import { Suite, TableCard, TableState } from "@/types/game";
import { generateDeck } from "./cardUtils";
import { determineRoundWinner } from "./gameUtils";

export const initialTableState = (
  startingTurn: number,
  fresh_deck: boolean
): TableState => {
  return {
    runningSuite: null,
    tableCards: [],
    turn: startingTurn,
    roundWinner: null,
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
  let roundWinner = null;
  if (updatedTableCards.length === 1) {
    runningSuite = tableCard.suite;
  }
  if (updatedTableCards.length === 4) {
    console.log("GAME: All 4 cards played, determining winner");
    roundWinner = determineRoundWinner(
      updatedTableCards,
      runningSuite,
      trumpSuite
    );
    runningSuite = tableCard.suite;
  }
  return {
    runningSuite: runningSuite,
    tableCards: updatedTableCards,
    turn: (oldState.turn + 1) % numPlayers,
    roundWinner: roundWinner,
    discardedCards: oldState.discardedCards,
  };
};

export const newRoundOnTable = (oldState: TableState): TableState => {
  return {
    runningSuite: null,
    tableCards: [],
    turn: oldState.roundWinner?.player,
    roundWinner: null,
    discardedCards: oldState.discardedCards.concat(oldState.tableCards),
  };
};
