import { BiddingModal } from "@/components/game/BiddingModal";
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
  gameInitialize,
  passBid,
  placeBid,
  playCard,
  setBidAndTrump,
  setPlayerName,
  setStage,
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
import { FIRST_PLAYER_ID } from "@/utils/constants";
import { useFeedback } from "@/utils/feedbackSystem";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const GameRedux = () => {
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

  // Use selectors instead of manual transformations - Phase 2 implementation
  const players = useAppSelector(selectPlayerDisplayData);
  const teams = useAppSelector(selectTeams);
  const isMobile = useIsMobile();

  const handleCardPlay = (card: Card) => {
    const playerHand = playerState.players[FIRST_PLAYER_ID].hand;
    const cardIndex = playerHand.findIndex(
      c => c.positionValue === card.positionValue
    );
    if (cardIndex !== -1) {
      dispatch(playCard({ playerIndex: FIRST_PLAYER_ID, cardIndex }));
    }
  };

  const handleStartGame = (playerName: string = "You") => {
    // Set the player name in the game state
    dispatch(setPlayerName({ playerIndex: FIRST_PLAYER_ID, name: playerName }));

    setIsDealing(true);
    dispatch(startGame());
    dispatch(setStage(GameStages.BIDDING));

    // Trigger game initialization saga instead of setTimeout
    dispatch(gameInitialize());
  };

  const handleBid = (amount: number) => {
    trigger("bid", { intensity: "medium" });
    dispatch(placeBid({ playerIndex: FIRST_PLAYER_ID, bidAmount: amount }));
  };

  const handlePass = () => {
    trigger("buttonClick", { intensity: "light" });
    dispatch(passBid({ playerIndex: FIRST_PLAYER_ID }));
  };

  const handleTrumpSelection = useCallback(
    (trumpSuite: Suite, teammateCard: Card) => {
      trigger("trump", { intensity: "strong" });
      dispatch(
        setBidAndTrump({
          trumpSuite: trumpSuite,
          bidder: gameState.biddingState.bidWinner as number,
          teammateCard,
        })
      );
    },
    [trigger, dispatch, gameState.biddingState.bidWinner]
  );

  const handleBidResultClose = () => {
    dispatch(setStage(GameStages.PLAYING));
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
      />

      {/* Modals */}
      {gameState.gameProgress.stage === GameStages.BIDDING && (
        <BiddingModal
          isOpen={true}
          playerHand={playerState.players[FIRST_PLAYER_ID].hand}
          currentBid={gameState.biddingState.currentBid}
          currentBidder={gameState.biddingState.currentBidder}
          bidTimer={gameState.biddingState.bidTimer}
          playerNames={playerState.playerNames}
          canBid={
            !gameState.biddingState.passedPlayers.includes(FIRST_PLAYER_ID) &&
            gameState.biddingState.currentBidder === FIRST_PLAYER_ID
          }
          onBid={handleBid}
          onPass={handlePass}
        />
      )}

      {gameState.gameProgress.stage === GameStages.TRUMP_SELECTION &&
        gameState.biddingState.bidWinner === FIRST_PLAYER_ID && (
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
        />
      )}
    </div>
  );
};

export default GameRedux;
