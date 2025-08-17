import React from 'react';
import { Button } from './ui/button';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen bg-gradient-felt flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <span className="text-white text-lg">Welcome</span>
        </div>
        <h1 className="text-4xl font-bold text-gold mb-8">Three of Spades</h1>
        <Button 
          onClick={onStartGame}
          className="bg-gradient-gold text-casino-black font-bold text-lg px-8 py-4"
        >
          Start New Game
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
