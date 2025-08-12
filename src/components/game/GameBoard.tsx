
import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Card, Suite, TableCard } from "@/types/game";
import { PlayerArea } from "./PlayerArea";
import { GameInfo } from "./GameInfo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { announceToScreenReader, gameStateAnnouncements } from "@/utils/accessibility";
import { CenterTable } from "./CenterTable";

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

  // Helper function to get card played by specific player
  const getPlayedCardForPlayer = (playerIndex: number): Card | null => {
    // Search for a card in currentTrick that was played by this player
    // Note: This assumes Card interface has a player property, or we need to track this differently
    // For now, using the order they appear in currentTrick array based on play sequence
    return gameState.currentTrick[playerIndex] || null;
  };

  return (
    <main 
      className="min-h-screen bg-gradient-felt relative overflow-hidden"
      role="main"
      aria-label="Three of Spades game board"
    >
      {/* Premium Felt Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
      
      {/* Table Border */}
      <div className="absolute inset-8 border-4 border-gold/30 rounded-3xl shadow-glow/10" />

      {/* Game Header */}
      <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        {/* Game Info */}
        <div className="bg-casino-black/40 backdrop-blur-sm border border-gold/30 rounded-lg shadow-elevated p-4">
          <GameInfo gameState={gameState} />
        </div>

        {/* Settings */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onSettingsClick}
          className="bg-casino-black/40 hover:bg-casino-black/60 text-gold border border-gold/30 backdrop-blur-sm shadow-elevated"
          aria-label="Open game settings"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
        </Button>
      </header>

      {/* Team Scores */}
      <section 
        className="absolute top-6 right-6 flex gap-6 z-20"
        aria-label="Team scores"
      >
        <div 
          className="bg-gradient-gold text-casino-black px-6 py-3 rounded-xl shadow-elevated border border-gold-dark"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div 
              className={cn("text-2xl font-bold", animateScore.team1 && "animate-score-update")}
              aria-label={`Team 1 score: ${gameState.teamScores.team1} points`}
            >
              {gameState.teamScores.team1}
            </div>
            <div className="text-sm text-muted-foreground">Team 1</div>
          </div>
        </div>
        <div 
          className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow-elevated border border-blue-600"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div 
              className={cn("text-2xl font-bold", animateScore.team2 && "animate-score-update")}
              aria-label={`Team 2 score: ${gameState.teamScores.team2} points`}
            >
              {gameState.teamScores.team2}
            </div>
            <div className="text-sm text-muted-foreground">Team 2</div>
          </div>
        </div>
      </section>

      {/* Main Game Area */}
      <section 
        className="relative h-screen flex items-center justify-center"
        aria-label="Game playing area"
      >
        
        {/* Center Table Area */}
        <CenterTable
          currentTrick={gameState.currentTrick}
          winner={gameState.roundWinner !== null && gameState.players[gameState.roundWinner].name}
          isCollectingCards={gameState.isCollectingCards}
          showCardsPhase={gameState.showCardsPhase}
          collectionWinner={gameState.collectionWinner}
          roundWinner={gameState.roundWinner}
          playerNames={gameState.playerNames}
        />

        {/* Player Areas */}
        
        {/* Left Player */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <PlayerArea 
            player={players[1]} 
            runningSuite={gameState.runningSuite}
            position="left" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
          />
        </div>

        {/* Top Player */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <PlayerArea 
            player={players[2]} 
            runningSuite={gameState.runningSuite}
            position="top" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
          />
        </div>

        {/* Right Player */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <PlayerArea 
            player={players[3]} 
            runningSuite={gameState.runningSuite}
            position="right" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
          />
        </div>

        {/* Bottom Player (Human) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <PlayerArea 
            player={players[0]} 
            runningSuite={gameState.runningSuite}
            position="bottom" 
            onCardPlay={onCardPlay}
            isDealing={isDealing}
            botCardsHidden={botCardsHidden}
          />
        </div>
      </section>
    </main>
  );
};
