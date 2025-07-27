import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  startGame,
  playCard,
  startNewRound,
  setStage,
  // startBiddingRound, // No longer needed here
} from "../store/gameSlice";
import { GameStages } from "../store/gameStages";

import StartScreen from "./StartScreen";
import GameContent from "./GameContent";
import GameContentv2 from "./GameContentv2";

// Custom hook for bot logic
const useBotMoves = (gameState, dispatch) => {
  const BOT_INDICES = useMemo(() => [1, 2, 3], []);

  useEffect(() => {
    let timeout;
    // Only trigger if game is started, not over, not round ending, and it's a bot's turn
    if (
      gameState.stage === GameStages.PLAYING &&
      BOT_INDICES.includes(gameState.turn) &&
      gameState.players[gameState.turn]?.hand.length > 0
    ) {
      const delay = 1000 + Math.random() * 500; // 1-2 seconds
      timeout = setTimeout(() => {
        const hand = gameState.players[gameState.turn].hand;
        const agent = gameState.playerAgents[gameState.turn];

        try {
          const cardIndex = agent.chooseCardIndex({
            hand,
            tableCards: gameState.tableCards,
            trumpSuite: gameState.trumpSuite,
            runningSuite: gameState.runningSuite,
            playerIndex: gameState.turn,
          });
          if (cardIndex !== null && cardIndex >= 0 && cardIndex < hand.length) {
            dispatch(playCard({ playerIndex: gameState.turn, cardIndex }));
          } else {
            console.error(
              "Invalid card index returned by agent:",
              cardIndex,
              agent
            );
            alert("Check console");
            // Fallback to random card
            const fallbackIndex = Math.floor(Math.random() * hand.length);
            dispatch(
              playCard({
                playerIndex: gameState.turn,
                cardIndex: fallbackIndex,
              })
            );
          }
        } catch (error) {
          console.error("Agent error:", error);
          // Fallback to random card
          const fallbackIndex = Math.floor(Math.random() * hand.length);
          dispatch(
            playCard({ playerIndex: gameState.turn, cardIndex: fallbackIndex })
          );
        }
      }, delay);
    }
    return () => clearTimeout(timeout);
  }, [
    gameState.stage,
    gameState.isRoundEnding,
    gameState.turn,
    gameState.players,
    gameState.tableCards,
    gameState.trumpSuite,
    gameState.runningSuite,
    gameState.playerAgents,
    BOT_INDICES,
    dispatch,
  ]);
};

export default function ThreeOfSpades() {
  const [showV2, setShowV2] = useState(false);

  // Consolidate all game state into a single selector to reduce re-renders
  const gameState = useSelector((state) => ({
    stage: state.game.stage,
    players: state.game.players,
    round: state.game.round,
    tableCards: state.game.tableCards,
    scores: state.game.scores,
    turn: state.game.turn,
    roundWinner: state.game.roundWinner,
    runningSuite: state.game.runningSuite,
    trumpSuite: state.game.trumpSuite,
    isRoundEnding: state.game.isRoundEnding,
    playerAgents: state.game.playerAgents,
    playerNames: state.game.playerNames,
  }));

  const dispatch = useDispatch();

  // Add state for hiding bot cards
  const [botCardsHidden, setBotCardsHidden] = useState(true);

  // Use custom hook for bot logic
  useBotMoves(gameState, dispatch);

  // Memoize player hands transformation
  const playerHands = useMemo(
    () => Object.values(gameState.players).map((player) => player.hand),
    [gameState.players]
  );

  // Memoize handlers to prevent unnecessary re-renders
  const handleStartGame = useCallback(() => {
    setShowV2(false);
    dispatch(startGame());
    dispatch(setStage(GameStages.DISTRIBUTE_CARDS));
  }, [dispatch]);

  const handleStartGamev2 = useCallback(() => {
    setShowV2(true);
    dispatch(startGame());
    dispatch(setStage(GameStages.DISTRIBUTE_CARDS));
  }, [dispatch]);

  const handlePlayCard = useCallback(
    (playerIndex, cardIndex) => {
      dispatch(playCard({ playerIndex, cardIndex }));
    },
    [dispatch]
  );

  const handleToggleBotCardsHidden = useCallback((hidden) => {
    setBotCardsHidden(hidden);
  }, []);

  // Effect to handle round end
  useEffect(() => {
    if (gameState.isRoundEnding) {
      const timer = setTimeout(() => {
        dispatch(startNewRound());
      }, 100000); // Show winner for 10 seconds before starting new round
      return () => clearTimeout(timer);
    }
  }, [gameState.isRoundEnding, dispatch]);

  return (
    <div className="game-container">
      {gameState.stage === GameStages.INIT && (
        <StartScreen
          onStartGame={handleStartGame}
          onStartGamev2={handleStartGamev2}
        />
      )}
      {!showV2 && gameState.stage !== GameStages.INIT && (
        <GameContent
          round={gameState.round}
          tableCards={gameState.tableCards}
          roundWinner={gameState.roundWinner}
          players={playerHands}
          turn={gameState.turn}
          scores={gameState.scores}
          playCard={handlePlayCard}
          runningSuite={gameState.runningSuite}
          trumpSuite={gameState.trumpSuite}
          playerNames={gameState.playerNames}
          botCardsHidden={botCardsHidden}
          onToggleBotCardsHidden={handleToggleBotCardsHidden}
        />
      )}
      {showV2 && gameState.stage !== GameStages.INIT && (
        <GameContentv2
          round={gameState.round}
          tableCards={gameState.tableCards}
          roundWinner={gameState.roundWinner}
          players={playerHands}
          turn={gameState.turn}
          scores={gameState.scores}
          playCard={handlePlayCard}
          runningSuite={gameState.runningSuite}
          trumpSuite={gameState.trumpSuite}
          playerNames={gameState.playerNames}
          botCardsHidden={botCardsHidden}
          onToggleBotCardsHidden={handleToggleBotCardsHidden}
        />
      )}
    </div>
  );
}
