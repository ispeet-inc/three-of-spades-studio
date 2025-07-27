import { cn } from "@/lib/utils";
import { PlayingCard, Card } from "./PlayingCard";
import { PlayerArea } from "./PlayerArea";
import { GameInfo } from "./GameInfo";
import { Button } from "@/components/ui/button";
import { Settings, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Player {
  id: string;
  name: string;
  team: 1 | 2;
  cards: Card[];
  isCurrentPlayer?: boolean;
  isTeammate?: boolean;
  isTrump?: boolean;
}

interface GameState {
  players: Player[];
  currentTrick: Card[];
  trumpSuit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  currentBid: number;
  round: number;
  teamScores: { team1: number; team2: number };
  teammate?: string;
}

interface GameBoardProps {
  gameState: GameState;
  onCardPlay?: (card: Card) => void;
  onSettingsClick?: () => void;
}

export const GameBoard = ({ gameState, onCardPlay, onSettingsClick }: GameBoardProps) => {
  const [showBotCards, setShowBotCards] = useState(false);
  
  // Arrange players by position (assuming 4 players)
  const playerPositions = {
    bottom: gameState.players[0], // Current player
    left: gameState.players[1],
    top: gameState.players[2], 
    right: gameState.players[3]
  };

  return (
    <div className="min-h-screen bg-gradient-felt relative overflow-hidden">
      {/* Table Surface with Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')]" />

      {/* Game Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowBotCards(!showBotCards)}
          className="bg-secondary/90 backdrop-blur border border-border/50"
        >
          {showBotCards ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Bot Cards
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Bot Cards
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSettingsClick}
          className="bg-secondary/90 backdrop-blur border border-border/50"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Game Info Header */}
      <div className="absolute top-4 left-4 z-20">
        <GameInfo gameState={gameState} />
      </div>

      {/* Main Game Area */}
      <div className="relative h-screen flex items-center justify-center p-8">
        
        {/* Top Player */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <PlayerArea
            player={playerPositions.top}
            position="top"
            showCards={showBotCards}
          />
        </div>

        {/* Left Player */}
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2">
          <PlayerArea
            player={playerPositions.left}
            position="left"
            showCards={showBotCards}
          />
        </div>

        {/* Right Player */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
          <PlayerArea
            player={playerPositions.right}
            position="right"
            showCards={showBotCards}
          />
        </div>

        {/* Center Play Area */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Table Center Circle */}
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-felt-green-light/30 to-felt-green-dark/30 border-4 border-gold/20 flex items-center justify-center backdrop-blur-sm">
              
              {/* Current Trick Cards */}
              <div className="grid grid-cols-2 gap-4 place-items-center">
                {gameState.currentTrick.map((card, index) => (
                  <div
                    key={`trick-${index}`}
                    className="animate-card-deal"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <PlayingCard 
                      card={card} 
                      size="md"
                      className="shadow-elevated"
                    />
                  </div>
                ))}
                
                {/* Empty slots for remaining cards */}
                {Array.from({ length: 4 - gameState.currentTrick.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="w-16 h-24 rounded-lg border-2 border-dashed border-gold/30 bg-gold/5 flex items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full border border-gold/30"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Logo/Text */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-2xl font-bold text-gold mb-2 drop-shadow-lg">
                Three of Spades
              </h1>
              <div className="text-sm text-foreground/80">
                Round {gameState.round}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Player (Current Player) */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <PlayerArea
            player={playerPositions.bottom}
            position="bottom"
            onCardClick={onCardPlay}
            showCards={true}
          />
        </div>

        {/* Team Scores */}
        <div className="absolute bottom-4 right-4 flex gap-4">
          <div className="bg-gold/90 text-casino-black px-4 py-2 rounded-lg font-bold shadow-elevated">
            Team 1: {gameState.teamScores.team1}
          </div>
          <div className="bg-blue-500/90 text-white px-4 py-2 rounded-lg font-bold shadow-elevated">
            Team 2: {gameState.teamScores.team2}
          </div>
        </div>
      </div>
    </div>
  );
};