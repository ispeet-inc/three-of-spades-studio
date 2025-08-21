import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import HowToPlayModal from './HowToPlayModal';

interface StartScreenProps {
  onStartGame: (playerName: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem('threeOfSpades_playerName');
    if (savedName && savedName.trim()) {
      setPlayerName(savedName.trim());
    } else {
      // Typewriter effect for "Stranger"
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < 'Stranger'.length) {
          setPlayerName('Stranger'.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, 200); // 200ms delay between each letter
    }
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setIsEditing(true);
    setEditValue(playerName);
  };

  const handleNameSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      // Validate: only letters and spaces, max 2 words
      const hasInvalidChars = !/^[A-Za-z\s]+$/.test(trimmedValue);
      const wordCount = trimmedValue.split(' ').filter(word => word.length > 0).length;
      const isTooManyWords = wordCount > 2;
      
      if (hasInvalidChars || isTooManyWords) {
        // If validation fails, just close editing without changing the name
        setEditValue(playerName);
        setIsEditing(false);
        return;
      }
      
      // Capitalize first letter of each word
      const formattedName = trimmedValue
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setPlayerName(formattedName);
      localStorage.setItem('threeOfSpades_playerName', formattedName);
    } else {
      // If empty, just close editing without changing the name
      setEditValue(playerName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(playerName);
    }
  };

  const handleInputBlur = () => {
    handleNameSave();
  };

  const handleStartGame = () => {
    // Ensure we have a valid name, fallback to "You" if needed
    const validName = playerName && playerName.trim() && playerName !== 'Stranger' 
      ? playerName.trim() 
      : 'You';
    
    // Pass the player name to the parent component
    onStartGame(validName);
  };

  return (
    <div className="min-h-screen bg-gradient-felt flex items-center justify-center animate-in fade-in duration-500">
      <div className="text-center max-w-4xl mx-auto px-6">
        <div className="mb-6 flex items-baseline justify-center gap-3">
          <span className="font-['Lora'] text-white text-2xl font-normal tracking-wide">Welcome</span>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              className="font-['Lora'] text-white text-2xl font-normal opacity-90 transition-all duration-300 bg-transparent border-none outline-none px-0 py-0 border-b-2 border-yellow-400 cursor-text"
              placeholder="Enter your name"
              style={{ width: `${Math.max(120, editValue.length * 16)}px` }}
            />
          ) : (
            <span
              onClick={handleNameClick}
              className={`font-['Lora'] text-white text-2xl font-normal cursor-pointer transition-all duration-300 hover:opacity-100 hover:text-yellow-300 hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] ${
                playerName === 'Stranger' || editValue.length === 0 ? 'opacity-50' : 'opacity-90'
              }`}
            >
              {playerName}
              {playerName === 'Stranger' && (
                <span className="inline-block w-2 h-6 bg-yellow-400 ml-1 animate-pulse" style={{ verticalAlign: 'text-bottom' }}></span>
              )}
            </span>
          )}
        </div>
        
        <h1 className="font-['Merriweather'] text-5xl md:text-6xl font-black text-gold mb-8 tracking-wide leading-tight drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
          Three of Spades
        </h1>
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleStartGame}
            className="font-['Open_Sans'] bg-gradient-gold text-casino-black font-bold text-lg px-10 py-5 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
          >
            Start
          </Button>
          <Button 
            onClick={() => setShowHowToPlay(true)}
            className="font-['Open_Sans'] bg-gradient-gold text-casino-black font-bold text-lg px-10 py-5 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
          >
            How to Play
          </Button>
        </div>
      </div>
      
      <HowToPlayModal 
        isOpen={showHowToPlay} 
        onClose={() => setShowHowToPlay(false)} 
      />
    </div>
  );
};

export default StartScreen;
