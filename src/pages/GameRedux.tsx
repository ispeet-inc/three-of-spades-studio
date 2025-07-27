import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { RootState } from "@/store";
import { GameStages } from "@/store/gameStages";
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
import { GameBoard } from "@/components/game/GameBoard";
import { Card } from "@/types/game";
import { Button } from "@/components/ui/button";

const GameRedux = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);

  // Transform Redux state to GameBoard props
  const transformedGameState = {
    players: Object.entries(gameState.players).map(([index, player]) => ({
      id: `player-${index}`,
      name: gameState.playerNames[parseInt(index)] || `Player ${parseInt(index) + 1}`,
      team: (gameState.playerTeamMap?.[parseInt(index)] === 0 ? 1 : 2) as 1 | 2,
      cards: player.hand,
      isCurrentPlayer: parseInt(index) === gameState.turn && gameState.stage === GameStages.PLAYING,
      isTeammate: gameState.playerTeamMap?.[parseInt(index)] === gameState.playerTeamMap?.[0] && parseInt(index) !== 0
    })),
    currentTrick: gameState.tableCards,
    trumpSuit: gameState.trumpSuite === 0 ? 'clubs' as const : 
              gameState.trumpSuite === 1 ? 'diamonds' as const :
              gameState.trumpSuite === 2 ? 'hearts' as const : 'spades' as const,
    currentBid: gameState.bidAmount || 0,
    round: gameState.round,
    teamScores: { 
      team1: gameState.scores[0], 
      team2: gameState.scores[1] 
    },
    teammate: gameState.teammateCard ? `Player with ${gameState.teammateCard.number} of ${gameState.teammateCard.suite}` : undefined
  };

  const handleCardPlay = (card: Card) => {
    const playerHand = gameState.players[0].hand;
    const cardIndex = playerHand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      dispatch(playCard({ playerIndex: 0, cardIndex }));
    }
  };

  const handleStartGame = () => {
    dispatch(startGame());
    dispatch(setStage(GameStages.BIDDING));
    dispatch(startBiddingRound());
  };

  const handleBid = (amount: number) => {
    dispatch(placeBid({ playerIndex: 0, bidAmount: amount }));
  };

  const handlePass = () => {
    dispatch(passBid({ playerIndex: 0 }));
  };

  const handleTrumpSelection = (trumpSuite: number, teammateCard: { suite: number; number: number }) => {
    dispatch(setBidAndTrump({ 
      trumpSuite, 
      bidder: gameState.biddingState.bidWinner!, 
      teammateCard 
    }));
    dispatch(setStage(GameStages.PLAYING));
  };

  const handleContinueAfterRound = () => {
    dispatch(startNewRound());
  };

  const handleNewGame = () => {
    dispatch(startGame());
    dispatch(setStage(GameStages.BIDDING));
    dispatch(startBiddingRound());
  };

  // Handle bot actions
  useEffect(() => {
    if (gameState.stage === GameStages.PLAYING && gameState.turn !== 0) {
      const timer = setTimeout(() => {
        const currentPlayer = gameState.players[gameState.turn];
        if (currentPlayer.hand.length > 0) {
          const randomCardIndex = Math.floor(Math.random() * currentPlayer.hand.length);
          dispatch(playCard({ playerIndex: gameState.turn, cardIndex: randomCardIndex }));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.stage, gameState.turn, dispatch, gameState.players]);

  // Handle bot bidding
  useEffect(() => {
    if (gameState.stage === GameStages.BIDDING && 
        gameState.biddingState.currentBidder !== 0 && 
        gameState.biddingState.biddingActive) {
      const timer = setTimeout(() => {
        // Simple bot logic: 50% chance to bid higher, 50% to pass
        if (Math.random() > 0.5 && gameState.biddingState.currentBid < 200) {
          dispatch(placeBid({ 
            playerIndex: gameState.biddingState.currentBidder, 
            bidAmount: gameState.biddingState.currentBid + 5 
          }));
        } else {
          dispatch(passBid({ playerIndex: gameState.biddingState.currentBidder }));
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.stage, gameState.biddingState, dispatch]);

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
      />

      {/* Modals */}
      {gameState.stage === GameStages.BIDDING && (
        <BiddingModal />
      )}

      {gameState.stage === GameStages.TRUMP_SELECTION && (
        <TrumpSelectionModal />
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