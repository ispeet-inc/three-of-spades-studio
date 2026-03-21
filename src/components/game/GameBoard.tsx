
import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Card, Suite, TableCard } from "@/types/game";
import { PlayerArea } from "./PlayerArea";
import { GameInfo } from "./GameInfo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { announceToScreenReader, gameStateAnnouncements } from "@/utils/accessibility";
import { CenterTable } from "./CenterTable";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectCollectionWinner, selectIsCollectingCards, selectShowCardsPhase } from "@/store/selectors";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameBoardProps {
  gameState: {
    players: Array<{
      id: string;
      name: string;
      team: 1 | 2;
      cards: Card[];
      isCurrentPlayer?: boolean;
      isTeammate?: boolean;
      isBidder?: boolean;
    }>;
    currentTrick: TableCard[];
    runningSuite?: Suite;
    roundWinner?: number;
    trumpSuit: Suite;
    currentBid: number;
    round: number;
    teamScores: { team1: number; team2: number };
    teammateCard?: Card;
    isCollectingCards?: boolean;
    showCardsPhase?: boolean;
    collectionWinner?: number | null;
    playerNames?: Record<number, string>;
  };
  onCardPlay: (card: Card) => void;
  onSettingsClick: () => void;
  isDealing?: boolean;
  botCardsHidden?: boolean;
}

export const GameBoard = ({ gameState, onCardPlay, onSettingsClick, isDealing = false, botCardsHidden = false }: GameBoardProps) => {
  const [lastScores, setLastScores] = useState(gameState.teamScores);
  const [animateScore, setAnimateScore] = useState({ team1: false, team2: false });
  const isMobile = useIsMobile();
  
  // Use derived selectors for animation states
  const isCollectingCards = useAppSelector(selectIsCollectingCards);
  const showCardsPhase = useAppSelector(selectShowCardsPhase);
  const collectionWinner = useAppSelector(selectCollectionWinner);

  // Define players array FIRST before any useEffect that references it
  const players = [
    gameState.players[0], // bottom
    gameState.players[1], // left  
    gameState.players[2], // top
    gameState.players[3]  // right
  ];

  // Score animation effect
  useEffect(() => {
    if (lastScores.team1 !== gameState.teamScores.team1) {
      setAnimateScore(prev => ({ ...prev, team1: true }));
      announceToScreenReader(`Team 1 scores updated: ${gameState.teamScores.team1} points`);
      setTimeout(() => setAnimateScore(prev => ({ ...prev, team1: false })), 500);
    }
    if (lastScores.team2 !== gameState.teamScores.team2) {
      setAnimateScore(prev => ({ ...prev, team2: true }));
      announceToScreenReader(`Team 2 scores updated: ${gameState.teamScores.team2} points`);
      setTimeout(() => setAnimateScore(prev => ({ ...prev, team2: false })), 500);
    }
    setLastScores(gameState.teamScores);
  }, [gameState.teamScores, lastScores]);

  // Announce current player turn
  useEffect(() => {
    const currentPlayer = players.find(p => p.isCurrentPlayer);
    if (currentPlayer) {
      if (currentPlayer.id === 'player-0') {
        announceToScreenReader(gameStateAnnouncements.yourTurn);
      } else {
        announceToScreenReader(gameStateAnnouncements.botTurn(currentPlayer.name));
      }
    }
  }, [players]);

  return (
    <main 
      className="h-[100dvh] w-screen bg-gradient-felt relative overflow-hidden touch-none-select safe-area-inset"
      role="main"
      aria-label="Three of Spades game board"
    >
      {/* Premium Felt Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
      
      {/* Table Border - smaller on mobile */}
      <div className={cn(
        "absolute border-4 border-gold/30 rounded-3xl shadow-glow/10",
        "inset-2 sm:inset-8"
      )} />

      {/* Game Header - compact on mobile */}
      <header className={cn(
        "absolute left-2 right-2 flex justify-between items-start z-20",
        "top-2 sm:top-6 sm:left-6 sm:right-6"
      )}>
        {/* Game Info */}
        <div className={cn(
          "bg-casino-black/40 backdrop-blur-sm border border-gold/30 rounded-lg shadow-elevated",
          "p-2 sm:p-4"
        )}>
          <GameInfo gameState={gameState} compact={isMobile} />
        </div>

        {/* Settings */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onSettingsClick}
          className={cn(
            "bg-casino-black/40 hover:bg-casino-black/60 text-gold border border-gold/30 backdrop-blur-sm shadow-elevated",
            "min-w-[44px] min-h-[44px] p-2"
          )}
          aria-label="Open game settings"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
        </Button>
      </header>

      {/* Team Scores - repositioned for mobile */}
      <section 
        className={cn(
          "absolute flex gap-2 z-20",
          // Mobile: centered below header
          "top-2 right-2 sm:top-6 sm:right-6 sm:gap-6"
        )}
        aria-label="Team scores"
      >
        <div 
          className={cn(
            "bg-gradient-gold text-casino-black rounded-xl shadow-elevated border border-gold-dark",
            "px-3 py-1.5 sm:px-6 sm:py-3"
          )}
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div 
              className={cn(
                "font-bold",
                "text-lg sm:text-2xl",
                animateScore.team1 && "animate-score-update"
              )}
              aria-label={`Team 1 score: ${gameState.teamScores.team1} points`}
            >
              {gameState.teamScores.team1}
            </div>
            <div className="text-xs sm:text-sm">Team 1</div>
          </div>
        </div>
        <div 
          className={cn(
            "bg-blue-500 text-white rounded-xl shadow-elevated border border-blue-600",
            "px-3 py-1.5 sm:px-6 sm:py-3"
          )}
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div 
              className={cn(
                "font-bold",
                "text-lg sm:text-2xl",
                animateScore.team2 && "animate-score-update"
              )}
              aria-label={`Team 2 score: ${gameState.teamScores.team2} points`}
            >
              {gameState.teamScores.team2}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Team 2</div>
          </div>
        </div>
      </section>

      {/* Main Game Area */}
      <section 
        className="relative h-full flex items-center justify-center"
        aria-label="Game playing area"
      >
        
        {/* Center Table Area */}
        <CenterTable
          currentTrick={gameState.currentTrick}
          winner={gameState.roundWinner !== null && gameState.players[gameState.roundWinner].name}
          isCollectingCards={isCollectingCards}
          showCardsPhase={showCardsPhase}
          collectionWinner={collectionWinner}
          roundWinner={gameState.roundWinner}
          playerNames={gameState.playerNames}
          compact={isMobile}
        />

        {/* Player Areas */}
        
        {/* Left Player */}
        <div className={cn(
          "absolute top-1/2 transform -translate-y-1/2",
          "left-1 sm:left-4"
        )}>
          <PlayerArea 
            player={players[1]} 
            runningSuite={gameState.runningSuite}
            position="left" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
            compact={isMobile}
          />
        </div>

        {/* Top Player */}
        <div className={cn(
          "absolute left-1/2 transform -translate-x-1/2",
          "top-14 sm:top-4"
        )}>
          <PlayerArea 
            player={players[2]} 
            runningSuite={gameState.runningSuite}
            position="top" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
            compact={isMobile}
          />
        </div>

        {/* Right Player */}
        <div className={cn(
          "absolute top-1/2 transform -translate-y-1/2",
          "right-1 sm:right-4"
        )}>
          <PlayerArea 
            player={players[3]} 
            runningSuite={gameState.runningSuite}
            position="right" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
            compact={isMobile}
          />
        </div>

        {/* Bottom Player (Human) */}
        <div className={cn(
          "absolute left-1/2 transform -translate-x-1/2",
          "bottom-2 sm:bottom-4"
        )}>
          <PlayerArea 
            player={players[0]} 
            runningSuite={gameState.runningSuite}
            position="bottom" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
            compact={isMobile}
          />
        </div>
      </section>
    </main>
  );
};
