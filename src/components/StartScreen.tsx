import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';

interface StartScreenProps {
  onStartGame: (playerName: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState<string>('Stranger');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem('threeOfSpades_playerName');
    if (savedName && savedName.trim()) {
      setPlayerName(savedName.trim());
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
    setValidationMessage(''); // Clear any previous validation messages
  };

  const handleNameSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      // Validate: only letters and spaces, max 2 words
      const hasInvalidChars = !/^[A-Za-z\s]+$/.test(trimmedValue);
      const wordCount = trimmedValue.split(' ').filter(word => word.length > 0).length;
      const isTooManyWords = wordCount > 2;
      
      if (hasInvalidChars) {
        setValidationMessage('Only letters and spaces allowed');
        setEditValue(playerName);
        setIsEditing(false);
        return;
      }
      
      if (isTooManyWords) {
        setValidationMessage('Maximum 2 words allowed');
        setEditValue(playerName);
        setIsEditing(false);
        return;
      }
      
      // Clear any previous validation messages
      setValidationMessage('');
      
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
            <div className="flex flex-col items-center">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  // Clear validation message as user types
                  if (validationMessage) setValidationMessage('');
                }}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                className={`font-['Lora'] bg-white/10 backdrop-blur-sm border-b-2 text-white text-2xl px-3 py-2 rounded-t-md focus:outline-none transition-all duration-300 min-w-[180px] ${
                  validationMessage 
                    ? 'border-red-400 shadow-lg shadow-red-500/20' 
                    : 'border-yellow-400 focus:border-yellow-300 focus:shadow-lg focus:shadow-yellow-500/20'
                }`}
                placeholder="Enter your name"
              />
              {validationMessage ? (
                <span className="font-['Open_Sans'] text-xs text-red-300 mt-2 font-medium">{validationMessage}</span>
              ) : (
                <span className="font-['Open_Sans'] text-xs text-gray-300 mt-2 font-light">Max 2 words</span>
              )}
            </div>
          ) : (
            <span
              onClick={handleNameClick}
              className="font-['Lora'] text-white text-2xl font-normal opacity-90 hover:opacity-100 cursor-pointer transition-all duration-300 hover:text-yellow-300 hover:scale-105 hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] border-b-2 border-transparent hover:border-yellow-300/50 pb-1"
            >
              {playerName}
            </span>
          )}
        </div>
        
        <h1 className="font-['Merriweather'] text-5xl md:text-6xl font-black text-gold mb-8 tracking-wide leading-tight drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
          Three of Spades
        </h1>
        
        <Button 
          onClick={handleStartGame}
          className="font-['Open_Sans'] bg-gradient-gold text-casino-black font-bold text-lg px-10 py-5 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
        >
          Start
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
