import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayingCard } from "./PlayingCard";
import { createCard } from "@/utils/cardUtils";
import { Suite } from "@/types/game";

interface StartScreenProps {
  onStartGame: (playerName: string) => void;
  isStarting?: boolean;
}

export const StartScreen = ({ onStartGame, isStarting = false }: StartScreenProps) => {
  const [playerName, setPlayerName] = useState("Akash");
  
  const logoCard = createCard(Suite.Spade, 3);
  
  const handleStartGame = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) return;
    onStartGame(trimmedName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isStarting) {
      handleStartGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-felt flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo Card */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <PlayingCard 
              card={logoCard} 
              isSelected={false}
              onClick={() => {}}
              className="w-28 h-40 shadow-elegant"
            />
          </div>
        </div>
        
        {/* Game Title */}
        <div className="space-y-2 animate-fade-in animation-delay-200">
          <h1 className="text-5xl font-casino font-bold text-gold tracking-wide">
            Three of Spades
          </h1>
          <p className="text-gold-muted text-lg font-ui italic opacity-90">
            Bid smart. Play bold. Win big.
          </p>
        </div>
        
        {/* Welcome Section */}
        <div className="space-y-4 animate-fade-in animation-delay-400">
          <div className="text-cream text-xl font-ui">
            Welcome{" "}
            <span className="text-gold font-semibold">
              {playerName.trim() || "Player"}
            </span>
          </div>
          
          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="player-name" className="block text-cream text-sm font-ui opacity-80">
              Enter your name
            </label>
            <Input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Your name"
              maxLength={20}
              className="text-center text-lg font-ui bg-casino-dark/20 border-gold/30 text-cream placeholder:text-cream/50 focus:border-gold focus:ring-gold/20"
              disabled={isStarting}
            />
          </div>
        </div>
        
        {/* Start Button */}
        <div className="space-y-3 animate-fade-in animation-delay-600">
          <Button 
            onClick={handleStartGame}
            disabled={!playerName.trim() || isStarting}
            className="w-full bg-gradient-gold hover:bg-gradient-gold-hover text-casino-black font-bold text-lg px-8 py-4 shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isStarting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-casino-black border-t-transparent"></div>
                <span>Starting Game...</span>
              </div>
            ) : (
              "Start New Game"
            )}
          </Button>
          
          <p className="text-cream/60 text-sm font-ui">
            Press Enter to start quickly
          </p>
        </div>
      </div>
    </div>
  );
};