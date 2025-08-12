import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "@/store";
import { GameStages } from "@/store/gameStages";
import { 
  selectIsCollectingCards, 
  selectShowCardsPhase, 
  selectCollectionWinner 
} from "@/store/selectors";
import { useAppSelector } from "@/hooks/useAppSelector";
import { 
  startGame, 
  startBiddingRound, 
  placeBid, 
  passBid, 
  setBidAndTrump, 
  playCard, 
  startNewRound,
  setStage 
} from "@/store/gameSlice";
import { BiddingModal } from "@/components/game/BiddingModal";
import { TrumpSelectionModal } from "@/components/game/TrumpSelectionModal";
import { RoundSummaryModal } from "@/components/game/RoundSummaryModal";
import { GameOverModal } from "@/components/game/GameOverModal";
import { BidResultModal } from "@/components/game/BidResultModal";
import { GameBoard } from "@/components/game/GameBoard";
import { Card } from "@/types/game";
import { Button } from "@/components/ui/button";
import { getTeammateOptions } from "@/utils/gameUtils";
import { useFeedback } from "@/utils/feedbackSystem";
import { TIMINGS } from "@/utils/constants";

const GameRedux = () => {
  const dispatch = useDispatch();
  const gameState = useAppSelector((state: RootState) => state.game);
  const isCollectingCards = useAppSelector(selectIsCollectingCards);
  const showCardsPhase = useAppSelector(selectShowCardsPhase);
  const collectionWinner = useAppSelector(selectCollectionWinner);
  const { trigger } = useFeedback();

  // Add dealing animation state
  const [isDealing, setIsDealing] = useState(false);

  // Transform Redux state to GameBoard props
  const transformedGameState = {
    players: Object.entries(gameState.players).map(([index, player]) => ({
      id: `player-${index}`,
      name: gameState.playerNames[parseInt(index)] || `Player ${parseInt(index) + 1}`,
      team: (gameState.playerTeamMap?.[parseInt(index)] === 0 ? 1 : 2) as 1 | 2,
      cards: player.hand,
      isCurrentPlayer: parseInt(index) === gameState.turn && gameState.stage === GameStages.PLAYING,
      isTeammate: gameState.playerTeamMap && gameState.playerTeamMap[parseInt(index)] === gameState.playerTeamMap[0] && parseInt(index) !== 0,
      isBidder: gameState.bidder && gameState.bidder === parseInt(index)
    })),
    currentTrick: gameState.tableCards,
    runningSuite: gameState.runningSuite,
    roundWinner: gameState.roundWinner,
    trumpSuit: gameState.trumpSuite,
    currentBid: gameState.bidAmount || 0,
    round: gameState.round,
    teamScores: { 
      team1: gameState.scores[0], 
      team2: gameState.scores[1] 
    },
    teammateCard: gameState.teammateCard,
    isCollectingCards,
    showCardsPhase,
    collectionWinner
  };

  const handleCardPlay = (card: Card) => {
    const playerHand = gameState.players[0].hand;
    const cardIndex = playerHand.findIndex(c => c.positionValue === card.positionValue);
    if (cardIndex !== -1) {
      dispatch(playCard({ playerIndex: 0, cardIndex }));
    }
  };

  const handleStartGame = () => {
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
    trigger('bid', { intensity: 'medium' });
    dispatch(placeBid({ playerIndex: 0, bidAmount: amount }));
  };

  const handlePass = () => {
    trigger('buttonClick', { intensity: 'light' });
    dispatch(passBid({ playerIndex: 0 }));
  };

  const handleTrumpSelection = (trumpSuite: number, teammateCard: { suite: number; number: number }) => {
    trigger('trump', { intensity: 'strong' });
    dispatch(setBidAndTrump({ 
      trumpSuite, 
      bidder: gameState.biddingState.bidWinner!, 
      teammateCard 
    }));
    // Don't immediately go to PLAYING - let BidResultModal handle the transition
  };

  const handleBidResultClose = () => {
    dispatch(setStage(GameStages.PLAYING));
  };

  const handleContinueAfterRound = () => {
    trigger('success', { intensity: 'medium' });
    dispatch(startNewRound());
  };


  // Handle bot actions
  useEffect(() => {
    if (gameState.stage === GameStages.PLAYING && gameState.turn !== 0) {
      console.log(`Bot ${gameState.turn} should play now. Stage: ${gameState.stage}, Turn: ${gameState.turn}`);
      const timer = setTimeout(() => {
        const currentPlayer = gameState.players[gameState.turn];
        const botAgent = gameState.playerAgents[gameState.turn];
        
        console.log(`Bot ${gameState.turn} - Hand length: ${currentPlayer?.hand?.length}, Agent exists: ${!!botAgent}`);
        
        if (currentPlayer.hand.length > 0 && botAgent) {
          try {
            console.log(`Bot ${gameState.turn} attempting to choose card with:`, {
              handSize: currentPlayer.hand.length,
              tableCards: gameState.tableCards.length,
              trumpSuite: gameState.trumpSuite,
              runningSuite: gameState.runningSuite
            });
            
            const cardIndex = botAgent.chooseCardIndex({
              hand: currentPlayer.hand,
              tableCards: gameState.tableCards,
              trumpSuite: gameState.trumpSuite,
              runningSuite: gameState.runningSuite,
              playerIndex: gameState.turn
            });
            
            console.log(`Bot ${gameState.turn} chose card index: ${cardIndex}`);
            
            const validCardIndex = cardIndex !== null && cardIndex >= 0 && cardIndex < currentPlayer.hand.length 
              ? cardIndex 
              : Math.floor(Math.random() * currentPlayer.hand.length);
              
            console.log(`Bot ${gameState.turn} playing card at index: ${validCardIndex}`);
            dispatch(playCard({ playerIndex: gameState.turn, cardIndex: validCardIndex }));
          } catch (error) {
            console.error(`Bot ${gameState.turn} error:`, error);
            const fallbackIndex = Math.floor(Math.random() * currentPlayer.hand.length);
            dispatch(playCard({ playerIndex: gameState.turn, cardIndex: fallbackIndex }));
          }
        } else {
          console.log(`Bot ${gameState.turn} cannot play - no hand or no agent`);
        }
      }, TIMINGS.botPlayDelayMs);
      return () => clearTimeout(timer);
    }
  }, [gameState.stage, gameState.turn, dispatch, gameState.players, gameState.tableCards, gameState.trumpSuite, gameState.runningSuite, gameState.playerAgents]);


  // Handle bot bidding
  useEffect(() => {
    if (gameState.stage === GameStages.BIDDING && 
        gameState.biddingState.currentBidder !== 0 && 
        gameState.biddingState.passedPlayers.length < 3 &&
        gameState.biddingState.bidWinner === null) {
      
      console.log(`Bot ${gameState.biddingState.currentBidder} timeout starting...`);
      
      const timer = setTimeout(() => {
        console.log(`Bot ${gameState.biddingState.currentBidder} timeout executing...`);
        
        const botAgent = gameState.playerAgents[gameState.biddingState.currentBidder];
        const currentPlayer = gameState.players[gameState.biddingState.currentBidder];
        
        if (botAgent && currentPlayer) {
          try {
            const bidAction = botAgent.getBidAction({
              currentBid: gameState.biddingState.currentBid,
              minIncrement: 5,
              maxBid: 200,
              passedPlayers: gameState.biddingState.passedPlayers,
              hand: currentPlayer.hand,
              playerIndex: gameState.biddingState.currentBidder
            });
            
            console.log(`Bot ${gameState.biddingState.currentBidder} bid action:`, bidAction);
            
            if (bidAction.action === 'bid' && bidAction.bidAmount) {
              dispatch(placeBid({ 
                playerIndex: gameState.biddingState.currentBidder, 
                bidAmount: bidAction.bidAmount 
              }));
            } else {
              dispatch(passBid({ playerIndex: gameState.biddingState.currentBidder }));
            }
          } catch (error) {
            console.error(`Bot ${gameState.biddingState.currentBidder} bidding error:`, error);
            dispatch(passBid({ playerIndex: gameState.biddingState.currentBidder }));
          }
        } else {
          console.log(`Bot ${gameState.biddingState.currentBidder} missing agent or player`);
          dispatch(passBid({ playerIndex: gameState.biddingState.currentBidder }));
        }
      }, TIMINGS.botBidThinkMs);
      
      return () => {
        console.log(`Bot ${gameState.biddingState.currentBidder} timeout cancelled`);
        clearTimeout(timer);
      };
    }
  }, [
    gameState.stage, 
    gameState.biddingState.currentBidder, 
    gameState.biddingState.biddingActive,
    gameState.biddingState.currentBid,
    dispatch, 
    gameState.playerAgents, 
    gameState.players
  ]);


  // Handle bot trump selection
  useEffect(() => {
    if (gameState.stage === GameStages.TRUMP_SELECTION && 
        gameState.biddingState.bidWinner !== 0) {
      const timer = setTimeout(() => {
        const botAgent = gameState.playerAgents[gameState.biddingState.bidWinner!];
        const bidWinner = gameState.players[gameState.biddingState.bidWinner!];
        
        if (botAgent && bidWinner) {
          try {
            // Generate teammate options for all suits
            const allTeammateOptions = [0, 1, 2, 3].flatMap(suite => 
              getTeammateOptions(bidWinner.hand, suite)
            );
            
            const choice = botAgent.chooseTrumpAndTeammate({
              hand: bidWinner.hand,
              playerNames: gameState.playerNames,
              playerIndex: gameState.biddingState.bidWinner!,
              teammateOptions: allTeammateOptions
            });
            
            console.log(`Bot ${gameState.biddingState.bidWinner} chose trump and teammate:`, choice);
            handleTrumpSelection(choice.trumpSuite, choice.teammateCard);
          } catch (error) {
            console.error(`Bot ${gameState.biddingState.bidWinner} trump selection error:`, error);
            // Fallback: random trump and teammate
            const randomTrump = Math.floor(Math.random() * 4);
            const randomTeammate = { suite: randomTrump, number: 1 }; // Ace
            handleTrumpSelection(randomTrump, randomTeammate);
          }
        }
      }, TIMINGS.botTrumpThinkMs);
      return () => clearTimeout(timer);
    }
  }, [gameState.stage, gameState.biddingState.bidWinner, gameState.playerAgents, gameState.players, gameState.playerNames]);

  if (gameState.stage === GameStages.INIT) {
    return (
      <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gold mb-8">Three of Spades</h1>
          <Button 
            onClick={handleStartGame}
            className="bg-gradient-gold text-casino-black font-bold text-lg px-8 py-4"
          >
            Start New Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GameBoard 
        gameState={transformedGameState}
        onCardPlay={handleCardPlay}
        onSettingsClick={() => console.log("Settings")}
        isDealing={isDealing}
      />

      {/* Modals */}
      {gameState.stage === GameStages.BIDDING && (
        <BiddingModal />
      )}

      {gameState.stage === GameStages.TRUMP_SELECTION && gameState.biddingState.bidWinner === 0 && (
        <TrumpSelectionModal />
      )}

      {gameState.stage === GameStages.TRUMP_SELECTION_COMPLETE && (
        <BidResultModal
          isOpen={true}
          bidWinner={gameState.bidder!}
          bidAmount={gameState.bidAmount!}
          trumpSuite={gameState.trumpSuite!}
          teammateCard={gameState.teammateCard!}
          playerNames={gameState.playerNames}
          onClose={handleBidResultClose}
        />
      )}

      {gameState.stage === GameStages.ROUND_SUMMARY && (
        <RoundSummaryModal onClose={handleContinueAfterRound} />
      )}

      {gameState.stage === GameStages.GAME_OVER && (
        <GameOverModal />
      )}
    </div>
  );
};

export default GameRedux;