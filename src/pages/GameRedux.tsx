import { BidResultModal } from "@/components/game/BidResultModal";
import { GameBoard } from "@/components/game/GameBoard";
import { GameOverModal } from "@/components/game/GameOverModal";
import { TrumpSelectionModal } from "@/components/game/TrumpSelectionModal";
import StartScreen from "@/components/StartScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootState } from "@/store";
import {
  botShouldBid,
  botShouldPlayCard,
  botShouldSelectTrump,
  gameStageTransition,
  passBid,
  placeBid,
  playCard,
  playerSetup,
  restoreGameState,
  setBidAndTrump,
  setPlayerName,
  startGame,
} from "@/store/gameSlice";
import { GameStages } from "@/store/gameStages";
import {
  selectGameConfig,
  selectGameProgress,
  selectPlayerDisplayData,
  selectPlayerState,
  selectTeams,
} from "@/store/selectors";
import { Card, Suite } from "@/types/game";
import { FIRST_PLAYER_ID, NUM_PLAYERS } from "@/utils/constants";
import { useFeedback } from "@/utils/feedbackSystem";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface GameReduxProps {
  viewerIndex?: number;
}

const GameRedux = ({ viewerIndex = FIRST_PLAYER_ID }: GameReduxProps) => {
  const dispatch = useDispatch();
  const gameState = useAppSelector((state: RootState) => state.game);
  const tableState = useAppSelector(
    (state: RootState) => state.game.tableState
  );
  const playerState = useAppSelector(selectPlayerState); // Updated to use focused selector
  const gameConfig = useAppSelector(selectGameConfig);
  const gameProgress = useAppSelector(selectGameProgress);
  const { trigger } = useFeedback();

  // Add dealing animation state
  const [isDealing, setIsDealing] = useState(false);

  // NEW: Observer mode detection
  const isObserver = viewerIndex !== FIRST_PLAYER_ID;

  // NEW: Game state sharing via localStorage
  useEffect(() => {
    // Save game state to localStorage whenever it changes (only in player mode)
    if (!isObserver && gameState.gameProgress.stage !== GameStages.INIT) {
      localStorage.setItem("threeOfSpadesGameState", JSON.stringify(gameState));
    }
  }, [gameState, isObserver]);

  // NEW: Load game state from localStorage in observer mode
  useEffect(() => {
    if (isObserver) {
      const savedState = localStorage.getItem("threeOfSpadesGameState");
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          // Only load if there's an active game
          if (parsedState.gameProgress.stage !== GameStages.INIT) {
            console.log(
              "Observer mode: Restoring complete game state",
              parsedState
            );
            dispatch(restoreGameState(parsedState));
          }
        } catch (error) {
          console.error("Failed to parse saved game state:", error);
        }
      }
    }
  }, [isObserver, dispatch]);

  // NEW: Listen for localStorage changes from other tabs (real-time sync)
  useEffect(() => {
    if (!isObserver) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "threeOfSpadesGameState" && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          // Only update if there's an active game
          if (newState.gameProgress.stage !== GameStages.INIT) {
            console.log(
              "Observer mode: Received real-time state update",
              newState
            );
            dispatch(restoreGameState(newState));
          }
        } catch (error) {
          console.error("Failed to parse updated game state:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isObserver, dispatch]);

  // Use selectors instead of manual transformations - Phase 2 implementation
  const players = useAppSelector(selectPlayerDisplayData);
  const teams = useAppSelector(selectTeams);
  const isMobile = useIsMobile();

  const handleCardPlay = (card: Card) => {
    if (isObserver) return; // BLOCKED in observer mode
    const playerHand = playerState.players[FIRST_PLAYER_ID].hand;
    const cardIndex = playerHand.findIndex(
      c => c.positionValue === card.positionValue
    );
    if (cardIndex !== -1) {
      dispatch(playCard({ playerIndex: FIRST_PLAYER_ID, cardIndex }));
    }
  };

  const handleStartGame = (playerName: string = "You") => {
    if (isObserver) return; // BLOCKED in observer mode
    // Set the player name in the game state
    dispatch(setPlayerName({ playerIndex: FIRST_PLAYER_ID, name: playerName }));

    setIsDealing(true);
    dispatch(playerSetup());
    const startingPlayer = Math.floor(Math.random() * NUM_PLAYERS);
    dispatch(startGame({ startingPlayer }));
    dispatch(gameStageTransition(GameStages.DISTRIBUTE_CARDS));
  };

  const handleBid = (amount: number) => {
    if (isObserver) return; // BLOCKED in observer mode
    trigger("bid", { intensity: "medium" });
    dispatch(placeBid({ playerIndex: FIRST_PLAYER_ID, bidAmount: amount }));
  };

  const handlePass = () => {
    if (isObserver) return; // BLOCKED in observer mode
    trigger("buttonClick", { intensity: "light" });
    dispatch(passBid({ playerIndex: FIRST_PLAYER_ID }));
  };

  const handleTrumpSelection = useCallback(
    (trumpSuite: Suite, teammateCard: Card) => {
      if (isObserver) return; // BLOCKED in observer mode
      trigger("trump", { intensity: "strong" });
      dispatch(
        setBidAndTrump({
          trumpSuite: trumpSuite,
          bidder: gameState.biddingState.bidWinner as number,
          teammateCard,
        })
      );
    },
    [trigger, dispatch, gameState.biddingState.bidWinner, isObserver]
  );

  const handleBidResultClose = () => {
    if (isObserver) return; // BLOCKED in observer mode
    dispatch(gameStageTransition(GameStages.PLAYING));
  };

  // Handle bot actions - now using saga triggers
  useEffect(() => {
    if (
      gameState.gameProgress.stage === GameStages.PLAYING &&
      tableState.turn !== FIRST_PLAYER_ID
    ) {
      // Trigger bot AI saga instead of handling logic here
      dispatch(botShouldPlayCard({ playerIndex: tableState.turn }));
    }
  }, [gameState.gameProgress.stage, tableState.turn, dispatch]);

  // Handle bot bidding - now using saga triggers
  useEffect(() => {
    if (
      gameState.gameProgress.stage === GameStages.BIDDING &&
      gameState.biddingState.currentBidder !== FIRST_PLAYER_ID &&
      gameState.biddingState.passedPlayers.length < 3 &&
      gameState.biddingState.bidWinner === null
    ) {
      // Trigger bot bidding saga instead of handling logic here
      dispatch(
        botShouldBid({ playerIndex: gameState.biddingState.currentBidder })
      );
    }
  }, [
    gameState.gameProgress.stage,
    gameState.biddingState.currentBidder,
    gameState.biddingState.bidWinner,
    gameState.biddingState.passedPlayers,
    dispatch,
  ]);

  // Handle bot trump selection - now using saga triggers
  useEffect(() => {
    if (
      gameState.gameProgress.stage === GameStages.TRUMP_SELECTION &&
      gameState.biddingState.bidWinner !== FIRST_PLAYER_ID
    ) {
      // Trigger bot trump selection saga instead of handling logic here
      dispatch(
        botShouldSelectTrump({
          playerIndex: gameState.biddingState.bidWinner as number,
        })
      );
    }
  }, [
    gameState.gameProgress.stage,
    gameState.biddingState.bidWinner,
    dispatch,
  ]);

  // Handle dealing animation completion when game initialization saga completes
  useEffect(() => {
    if (gameState.gameProgress.stage === GameStages.BIDDING && isDealing) {
      // Stop dealing animation after game initialization saga completes
      const timer = setTimeout(() => {
        setIsDealing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameProgress.stage, isDealing]);

  if (gameState.gameProgress.stage === GameStages.INIT) {
    // NEW: Observer mode can't start games, but can view existing ones
    if (isObserver) {
      return (
        <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
          <div className="bg-casino-black/40 backdrop-blur-sm border border-gold/30 rounded-lg shadow-elevated p-8 text-center max-w-md">
            <div className="text-2xl font-bold text-gold mb-4">
              👁️ Observer Mode
            </div>
            <div className="text-casino-white mb-6 space-y-3">
              <p>No active game found.</p>
              <p className="text-sm text-casino-white/80">
                To use observer mode:
              </p>
              <ol className="text-sm text-casino-white/80 list-decimal list-inside space-y-1">
                <li>Start a game in player mode first</li>
                <li>Then open this observer tab to watch</li>
              </ol>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-gold text-casino-black px-6 py-3 rounded-lg font-bold hover:bg-gold/80 transition-colors"
            >
              Go to Player Mode
            </button>
          </div>
        </div>
      );
    }

    return (
      <StartScreen
        onStartGame={(playerName: string) => handleStartGame(playerName)}
      />
    );
  }

  // Safety check to ensure game state is properly initialized
  if (
    !gameState ||
    !playerState.players ||
    !gameState.gameProgress.scores ||
    !tableState
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative">
      <GameBoard
        playersDisplayData={players}
        tableState={tableState}
        playerState={playerState}
        gameConfig={gameConfig}
        gameProgress={gameProgress}
        onCardPlay={handleCardPlay}
        onSettingsClick={() => console.log("Settings")}
        isDealing={isDealing}
        isObserver={isObserver}
        viewerIndex={viewerIndex}
        // NEW: Pass bidding handlers to GameBoard
        onBid={handleBid}
        onPass={handlePass}
      />

      {/* Game Modals - visible to all but interactive only for players */}

      {gameState.gameProgress.stage === GameStages.TRUMP_SELECTION &&
        gameState.biddingState.bidWinner === FIRST_PLAYER_ID &&
        !isObserver && (
          <TrumpSelectionModal
            isOpen={true}
            playerHand={playerState.players[FIRST_PLAYER_ID].hand}
            onTrumpSelection={handleTrumpSelection}
          />
        )}

      {gameState.gameProgress.stage === GameStages.TRUMP_SELECTION_COMPLETE && (
        <BidResultModal
          isOpen={true}
          gameConfig={gameConfig}
          playerNames={playerState.playerNames}
          onClose={handleBidResultClose}
          isObserver={isObserver}
        />
      )}

      {gameState.gameProgress.stage === GameStages.GAME_OVER && (
        <GameOverModal
          isOpen={true}
          teams={teams}
          scores={gameState.gameProgress.scores}
          bidAmount={gameState.gameConfig?.bidAmount ?? 0}
          bidWinner={gameState.gameConfig?.bidWinner ?? -1}
          playerNames={playerState.playerNames}
          isMobile={isMobile}
          onNewGame={() => window.location.reload()}
          isObserver={isObserver}
        />
      )}
    </div>
  );
};

export default GameRedux;
