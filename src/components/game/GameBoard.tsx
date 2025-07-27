import { cn } from "@/lib/utils";
import { PlayingCard, Card } from "./PlayingCard";
import { PlayerArea } from "./PlayerArea";
import { GameInfo } from "./GameInfo";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

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
  
  // Arrange players by position (assuming 4 players)
  const playerPositions = {
    bottom: gameState.players[0], // Current player
    left: gameState.players[1],
    top: gameState.players[2], 
    right: gameState.players[3]
  };

  return (
    <div className="min-h-screen bg-gradient-table relative overflow-hidden">
      {/* Premium Table Surface with Enhanced Texture */}
      <div className="absolute inset-0 bg-gradient-felt" />
      <div className="absolute inset-0 shadow-table" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1)_0%,transparent_50%)] bg-[length:200px_200px]" />
      
      {/* Elegant Table Border */}
      <div className="absolute inset-4 border-2 border-gold/30 rounded-3xl shadow-elevated" />
      <div className="absolute inset-6 border border-gold/20 rounded-3xl" />

      {/* Premium Game Controls */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="secondary"
          size="sm"
          onClick={onSettingsClick}
          className="bg-felt-green-light/90 hover:bg-felt-green-light text-gold border border-gold/30 backdrop-blur-sm shadow-card transition-all duration-300 hover:shadow-glow/50"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Premium Game Info Header */}
      <div className="absolute top-6 left-6 z-20">
        <div className="bg-felt-green-light/90 backdrop-blur-sm border border-gold/30 rounded-lg shadow-card p-3">
          <GameInfo gameState={gameState} />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative h-screen flex items-center justify-center p-8">
        
        {/* Top Player */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <PlayerArea
            player={playerPositions.top}
            position="top"
            showCards={false}
          />
        </div>

        {/* Left Player */}
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2">
          <PlayerArea
            player={playerPositions.left}
            position="left"
            showCards={false}
          />
        </div>

        {/* Right Player */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
          <PlayerArea
            player={playerPositions.right}
            position="right"
            showCards={false}
          />
        </div>

        {/* Premium Center Play Area */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Enhanced Table Center Circle */}
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-felt-green-light/20 to-felt-green-dark/40 border-4 border-gold/30 flex items-center justify-center backdrop-blur-sm shadow-elevated relative overflow-hidden">
              
              {/* Inner glow effect */}
              <div className="absolute inset-2 rounded-full border border-gold/20 shadow-glow/20" />
              
              {/* Current Trick Cards with Enhanced Layout */}
              <div className="relative z-10">
                {gameState.currentTrick.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6 place-items-center">
                    {gameState.currentTrick.map((card, index) => (
                      <div
                        key={`trick-${index}`}
                        className="animate-card-deal transition-all duration-300 hover:scale-105"
                        style={{ 
                          animationDelay: `${index * 200}ms`,
                          zIndex: gameState.currentTrick.length - index 
                        }}
                      >
                        <PlayingCard 
                          card={card} 
                          className="shadow-elevated"
                          size="md"
                        />
                      </div>
                    ))}
                    
                    {/* Empty slots for remaining cards */}
                    {Array.from({ length: 4 - gameState.currentTrick.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-16 h-24 rounded-lg border-2 border-dashed border-gold/20 bg-gold/5 flex items-center justify-center transition-all duration-300 hover:border-gold/40"
                      >
                        <div className="w-4 h-4 rounded-full border border-gold/20 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center text-gold/60">
                    <div className="w-20 h-20 mx-auto mb-2 rounded-full border-2 border-dashed border-gold/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border border-gold/20 animate-pulse"></div>
                    </div>
                    <div className="text-sm font-medium">Trick Area</div>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Table Branding */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="font-casino text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2 drop-shadow-lg tracking-wide">
                Three of Spades
              </h1>
              <div className="text-sm text-gold/80 font-medium tracking-wider">
                Round {gameState.round} • Premium Table
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

        {/* Premium Team Scores */}
        <div className="absolute bottom-6 right-6 flex gap-4">
          <div className="bg-gradient-gold text-casino-black px-6 py-3 rounded-xl font-bold shadow-elevated border border-gold-dark backdrop-blur-sm transition-all duration-300 hover:shadow-glow/50">
            <div className="text-xs font-medium opacity-80 mb-1">Team 1</div>
            <div className="text-lg font-bold">{gameState.teamScores.team1}</div>
          </div>
          <div className="bg-blue-500/90 text-white px-6 py-3 rounded-xl font-bold shadow-elevated border border-blue-600 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
            <div className="text-xs font-medium opacity-80 mb-1">Team 2</div>
            <div className="text-lg font-bold">{gameState.teamScores.team2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};