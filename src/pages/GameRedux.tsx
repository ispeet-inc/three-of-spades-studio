import { BiddingModal } from "@/components/game/BiddingModal";
import { BidResultModal } from "@/components/game/BidResultModal";
import { GameBoard } from "@/components/game/GameBoard";
import { GameOverModal } from "@/components/game/GameOverModal";
import { RoundSummaryModal } from "@/components/game/RoundSummaryModal";
import { TrumpSelectionModal } from "@/components/game/TrumpSelectionModal";
import StartScreen from "@/components/StartScreen";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootState } from "@/store";
import {
  passBid,
  placeBid,
  playCard,
  setBidAndTrump,
  setPlayerName,
  setStage,
  startBiddingRound,
  startGame,
  startNewRound,
} from "@/store/gameSlice";
import { GameStages } from "@/store/gameStages";
import { Card } from "@/types/game";
import { createCard } from "@/utils/cardUtils";
import { FIRST_PLAYER_ID, TIMINGS } from "@/utils/constants";
import { useFeedback } from "@/utils/feedbackSystem";
import { getTeammateOptions } from "@/utils/gameUtils";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const GameRedux = () => {
  const dispatch = useDispatch();
  const gameState = useAppSelector((state: RootState) => state.game);
  const tableState = useAppSelector(
    (state: RootState) => state.game.tableState
  );
  const playerState = useAppSelector(
    (state: RootState) => state.game.playerState
  );
  const { trigger } = useFeedback();

  // Add dealing animation state
  const [isDealing, setIsDealing] = useState(false);

  // Transform Redux state to GameBoard props
  const transformedGameState = {
    // todo - dismantle this object
    players: Object.entries(playerState.players).map(([index, player]) => ({
      id: `player-${index}`,
      name:
        playerState.playerNames[parseInt(index)] ||
        `Player ${parseInt(index) + 1}`,
      team: (gameState.playerTeamMap?.[parseInt(index)] === 0 ? 1 : 2) as 1 | 2,
      cards: player.hand,
      isCurrentPlayer:
        parseInt(index) === tableState.turn &&
        gameState.stage === GameStages.PLAYING,
      isTeammate:
        gameState.playerTeamMap &&
        gameState.playerTeamMap[parseInt(index)] ===
          gameState.playerTeamMap[FIRST_PLAYER_ID] &&
        parseInt(index) !== FIRST_PLAYER_ID,
      isBidder:
        gameState.bidder !== null && gameState.bidder === parseInt(index),
    })),
    trumpSuit: gameState.trumpSuite,
    currentBid: gameState.bidAmount || 0,
    round: gameState.round,
    teamScores: {
      team1: gameState.scores?.[0] ?? 0,
      team2: gameState.scores?.[1] ?? 0,
    },
    teammateCard: gameState.teammateCard,
    isCollectingCards: gameState.isCollectingCards,
    showCardsPhase: gameState.showCardsPhase,
    collectionWinner: gameState.collectionWinner,
  };

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

    // Stop dealing animation after cards are dealt
    setTimeout(() => {
      setIsDealing(false);
      dispatch(startBiddingRound());
    }, 2000);
  };

  const handleBid = (amount: number) => {
    trigger("bid", { intensity: "medium" });
    dispatch(placeBid({ playerIndex: FIRST_PLAYER_ID, bidAmount: amount }));
  };

  const handlePass = () => {
    trigger("buttonClick", { intensity: "light" });
    dispatch(passBid({ playerIndex: FIRST_PLAYER_ID }));
  };

  const handleTrumpSelection = (trumpSuite: number, teammateCard: Card) => {
    trigger("trump", { intensity: "strong" });
    dispatch(
      setBidAndTrump({
        trumpSuite,
        bidder: gameState.biddingState.bidWinner!,
        teammateCard,
      })
    );
  };

  const handleBidResultClose = () => {
    dispatch(setStage(GameStages.PLAYING));
  };

  const handleContinueAfterRound = () => {
    trigger("success", { intensity: "medium" });
    dispatch(startNewRound());
  };

  // Handle bot actions
  useEffect(() => {
    if (
      gameState.stage === GameStages.PLAYING &&
      tableState.turn !== FIRST_PLAYER_ID
    ) {
      console.log(
        `Bot ${tableState.turn} should play now. Stage: ${gameState.stage}, Turn: ${tableState.turn}`
      );
      const timer = setTimeout(() => {
        const currentPlayer = playerState.players[tableState.turn];
        const botAgent = playerState.playerAgents[tableState.turn];

        console.log(
          `Bot ${tableState.turn} - Hand length: ${currentPlayer?.hand?.length}, Agent exists: ${!!botAgent}`
        );

        if (currentPlayer.hand.length > 0 && botAgent) {
          try {
            console.log(
              `Bot ${tableState.turn} attempting to choose card with:`,
              {
                handSize: currentPlayer.hand.length,
                tableCards: tableState.tableCards.length,
                trumpSuite: gameState.trumpSuite,
                runningSuite: tableState.runningSuite,
              }
            );

            const cardIndex = botAgent.chooseCardIndex({
              hand: currentPlayer.hand,
              tableCards: tableState.tableCards,
              trumpSuite: gameState.trumpSuite,
              runningSuite: tableState.runningSuite,
              playerIndex: tableState.turn,
            });

            console.log(
              `Bot ${tableState.turn} chose card index: ${cardIndex}`
            );

            const validCardIndex =
              cardIndex !== null &&
              cardIndex >= 0 &&
              cardIndex < currentPlayer.hand.length
                ? cardIndex
                : Math.floor(Math.random() * currentPlayer.hand.length);

            console.log(
              `Bot ${tableState.turn} playing card at index: ${validCardIndex}`
            );
            dispatch(
              playCard({
                playerIndex: tableState.turn,
                cardIndex: validCardIndex,
              })
            );
          } catch (error) {
            console.error(`Bot ${tableState.turn} error:`, error);
            const fallbackIndex = Math.floor(
              Math.random() * currentPlayer.hand.length
            );
            dispatch(
              playCard({
                playerIndex: tableState.turn,
                cardIndex: fallbackIndex,
              })
            );
          }
        } else {
          console.log(
            `Bot ${tableState.turn} cannot play - no hand or no agent`
          );
        }
      }, TIMINGS.botPlayDelayMs);
      return () => clearTimeout(timer);
    }
  }, [
    gameState.stage,
    tableState.turn,
    dispatch,
    playerState.players,
    tableState.tableCards,
    gameState.trumpSuite,
    tableState.runningSuite,
    playerState.playerAgents,
  ]);

  // Handle bot bidding
  useEffect(() => {
    if (
      gameState.stage === GameStages.BIDDING &&
      gameState.biddingState.currentBidder !== FIRST_PLAYER_ID &&
      gameState.biddingState.passedPlayers.length < 3 &&
      gameState.biddingState.bidWinner === null
    ) {
      console.log(
        `Bot ${gameState.biddingState.currentBidder} timeout starting...`
      );

      const timer = setTimeout(() => {
        console.log(
          `Bot ${gameState.biddingState.currentBidder} timeout executing...`
        );

        const botAgent =
          playerState.playerAgents[gameState.biddingState.currentBidder];
        const currentPlayer =
          playerState.players[gameState.biddingState.currentBidder];

        if (botAgent && currentPlayer) {
          try {
            const bidAction = botAgent.getBidAction({
              currentBid: gameState.biddingState.currentBid,
              minIncrement: 5,
              maxBid: 200,
              passedPlayers: gameState.biddingState.passedPlayers,
              hand: currentPlayer.hand,
              playerIndex: gameState.biddingState.currentBidder,
            });

            console.log(
              `Bot ${gameState.biddingState.currentBidder} bid action:`,
              bidAction
            );

            if (bidAction.action === "bid" && bidAction.bidAmount) {
              dispatch(
                placeBid({
                  playerIndex: gameState.biddingState.currentBidder,
                  bidAmount: bidAction.bidAmount,
                })
              );
            } else {
              dispatch(
                passBid({ playerIndex: gameState.biddingState.currentBidder })
              );
            }
          } catch (error) {
            console.error(
              `Bot ${gameState.biddingState.currentBidder} bidding error:`,
              error
            );
            dispatch(
              passBid({ playerIndex: gameState.biddingState.currentBidder })
            );
          }
        } else {
          console.log(
            `Bot ${gameState.biddingState.currentBidder} missing agent or player`
          );
          dispatch(
            passBid({ playerIndex: gameState.biddingState.currentBidder })
          );
        }
      }, TIMINGS.botBidThinkMs);

      return () => {
        console.log(
          `Bot ${gameState.biddingState.currentBidder} timeout cancelled`
        );
        clearTimeout(timer);
      };
    }
  }, [
    gameState.stage,
    gameState.biddingState.currentBidder,
    gameState.biddingState.bidWinner,
    gameState.biddingState.currentBid,
    dispatch,
    playerState.playerAgents,
    playerState.players,
    gameState.biddingState.passedPlayers,
  ]);

  // Handle bot trump selection
  useEffect(() => {
    if (
      gameState.stage === GameStages.TRUMP_SELECTION &&
      gameState.biddingState.bidWinner !== FIRST_PLAYER_ID
    ) {
      const timer = setTimeout(() => {
        const botAgent =
          playerState.playerAgents[gameState.biddingState.bidWinner!];
        const bidWinner =
          playerState.players[gameState.biddingState.bidWinner!];

        if (botAgent && bidWinner) {
          try {
            // Generate teammate options for all suits
            const allTeammateOptions = [0, 1, 2, 3].flatMap(suite =>
              getTeammateOptions(bidWinner.hand, suite)
            );

            const choice = botAgent.chooseTrumpAndTeammate({
              hand: bidWinner.hand,
              playerNames: playerState.playerNames,
              playerIndex: gameState.biddingState.bidWinner!,
              teammateOptions: allTeammateOptions,
            });

            console.log(
              `Bot ${gameState.biddingState.bidWinner} chose trump and teammate:`,
              choice
            );
            handleTrumpSelection(choice.trumpSuite, choice.teammateCard);
          } catch (error) {
            console.error(
              `Bot ${gameState.biddingState.bidWinner} trump selection error:`,
              error
            );
            // Fallback: random trump and teammate
            const randomTrump = Math.floor(Math.random() * 4);
            const randomTeammate = createCard(randomTrump, 1);
            handleTrumpSelection(randomTrump, randomTeammate);
          }
        }
      }, TIMINGS.botTrumpThinkMs);
      return () => clearTimeout(timer);
    }
  }, [
    gameState.stage,
    gameState.biddingState.bidWinner,
    playerState.playerAgents,
    playerState.players,
    playerState.playerNames,
    handleTrumpSelection,
  ]);

  if (gameState.stage === GameStages.INIT) {
    return (
      <StartScreen
        onStartGame={(playerName: string) => handleStartGame(playerName)}
      />
    );
  }

  // Safety check to ensure game state is properly initialized
  if (!gameState || !playerState.players || !gameState.scores || !tableState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative">
      <GameBoard
        gameState={transformedGameState}
        tableState={tableState}
        playerState={playerState}
        onCardPlay={handleCardPlay}
        onSettingsClick={() => console.log("Settings")}
        isDealing={isDealing}
      />

      {/* Modals */}
      {gameState.stage === GameStages.BIDDING && <BiddingModal />}

      {gameState.stage === GameStages.TRUMP_SELECTION &&
        gameState.biddingState.bidWinner === 0 && <TrumpSelectionModal />}

      {gameState.stage === GameStages.TRUMP_SELECTION_COMPLETE && (
        <BidResultModal
          isOpen={true}
          bidWinner={gameState.bidder!}
          bidAmount={gameState.bidAmount!}
          trumpSuite={gameState.trumpSuite!}
          teammateCard={gameState.teammateCard!}
          playerNames={playerState.playerNames}
          onClose={handleBidResultClose}
        />
      )}

      {gameState.stage === GameStages.ROUND_SUMMARY && (
        <RoundSummaryModal onClose={handleContinueAfterRound} />
      )}

      {gameState.stage === GameStages.GAME_OVER && <GameOverModal />}
    </div>
  );
};

export default GameRedux;
