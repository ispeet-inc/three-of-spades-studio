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
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="text-white text-lg">Welcome</span>
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
                className={`bg-transparent border-b-2 text-white text-lg px-2 py-1 focus:outline-none transition-all duration-300 ${
                  validationMessage 
                    ? 'border-red-400' 
                    : 'border-gold focus:border-yellow-300'
                }`}
                placeholder="Enter your name"
              />
              {validationMessage ? (
                <span className="text-xs text-red-300 mt-1">{validationMessage}</span>
              ) : (
                <span className="text-xs text-gray-300 mt-1">Letters and spaces only, max 2 words</span>
              )}
            </div>
          ) : (
            <span
              onClick={handleNameClick}
              className="text-white text-lg opacity-60 hover:opacity-100 cursor-pointer transition-all duration-300 hover:text-gold hover:scale-105"
            >
              {playerName}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gold mb-8">Three of Spades</h1>
        <Button 
          onClick={handleStartGame}
          className="bg-gradient-gold text-casino-black font-bold text-lg px-8 py-4 hover:scale-105 transition-transform duration-200"
        >
          Start New Game
        </Button>
      </div>
    </div>
  );
};

export default StartScreen;
