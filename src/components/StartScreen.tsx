import { BarChart3 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useStats } from "../hooks/useStats";
import { GameMode } from "../types/game";
import HowToPlayModal from "./HowToPlayModal";
import { Button } from "./ui/button";
import { StatsModal } from "./ui/StatsModal";

interface StartScreenProps {
  onStartGame: (playerName: string, gameMode: GameMode) => void;
}

// Constants
const GAME_MODES = [
  {
    mode: GameMode.Single,
    title: "Single Game",
    subtitle: "1 Game • Quick Play",
    description: null,
  },
  {
    mode: GameMode.Series,
    title: "Series",
    subtitle: "4 Games • Epic Battle",
    description:
      "Compete across multiple games with cumulative scoring! Build rivalries and climb the leaderboard in this epic card battle arena.",
  },
] as const;

// Custom hook for name management
const usePlayerName = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("threeOfSpades_playerName");
    if (savedName?.trim()) {
      setPlayerName(savedName.trim());
    } else {
      // Simple typewriter effect
      let index = 0;
      const interval = setInterval(() => {
        if (index < "Stranger".length) {
          setPlayerName("Stranger".substring(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(playerName);
  };

  const saveName = () => {
    const trimmed = editValue.trim();
    if (
      trimmed &&
      /^[A-Za-z\s]+$/.test(trimmed) &&
      trimmed.split(" ").filter(w => w.length > 0).length <= 2
    ) {
      const formatted = trimmed
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
      setPlayerName(formatted);
      localStorage.setItem("threeOfSpades_playerName", formatted);
    }
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(playerName);
  };

  return {
    playerName,
    isEditing,
    editValue,
    inputRef,
    startEditing,
    saveName,
    cancelEditing,
    setEditValue,
  };
};

// Reusable components
const WelcomeSection: React.FC<{
  playerName: string;
  isEditing: boolean;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onStartEditing: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}> = ({
  playerName,
  isEditing,
  editValue,
  inputRef,
  onStartEditing,
  onSave,
  onCancel,
  onEditChange,
  onKeyDown,
}) => (
  <div className="mb-8">
    <div className="inline-flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3 border border-gold/30">
      <span className="text-white/90 text-lg font-light">Welcome</span>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => onEditChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onSave}
          className="text-gold text-lg font-semibold bg-transparent border-none outline-none px-0 py-0 border-b-2 border-gold/60 cursor-text transition-all duration-300 min-w-[120px]"
          placeholder="Enter your name"
        />
      ) : (
        <span
          onClick={onStartEditing}
          className={`text-gold text-lg font-semibold cursor-pointer transition-all duration-300 hover:text-gold-light hover:scale-105 ${
            playerName === "Stranger" ? "opacity-60" : "opacity-100"
          }`}
        >
          {playerName}
          {playerName === "Stranger" && (
            <span className="inline-block w-1 h-5 bg-gold ml-2 animate-pulse"></span>
          )}
        </span>
      )}
    </div>
  </div>
);

const GameModeButton: React.FC<{
  mode: GameMode;
  title: string;
  subtitle: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ mode, title, subtitle, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
      isSelected
        ? "border-gold bg-gold/10 shadow-glow"
        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
    }`}
  >
    <div className="text-center space-y-2">
      <div
        className={`text-xl font-bold transition-colors duration-300 ${
          isSelected ? "text-gold" : "text-white"
        }`}
      >
        {title}
      </div>
      <div
        className={`text-sm transition-colors duration-300 ${
          isSelected ? "text-gold/80" : "text-white/60"
        }`}
      >
        {subtitle}
      </div>
    </div>
  </button>
);

const StartGameButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="relative">
    <Button
      onClick={onClick}
      className="relative overflow-hidden bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-glow transition-all duration-300 hover:scale-105 group"
    >
      <span className="relative z-10">Start Game</span>
      <div className="absolute inset-0 bg-gradient-to-r from-gold-light via-gold to-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </Button>
    <div className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
  </div>
);

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.Single);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { stats, resetAllStats } = useStats();

  const {
    playerName,
    isEditing,
    editValue,
    inputRef,
    startEditing,
    saveName,
    cancelEditing,
    setEditValue,
  } = usePlayerName();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveName();
    else if (e.key === "Escape") cancelEditing();
  };

  const handleStartGame = () => {
    const validName =
      playerName && playerName.trim() && playerName !== "Stranger"
        ? playerName.trim()
        : "You";
    onStartGame(validName, selectedMode);
  };

  const selectedGameMode = GAME_MODES.find(mode => mode.mode === selectedMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-2xl mx-auto">
          <WelcomeSection
            playerName={playerName}
            isEditing={isEditing}
            editValue={editValue}
            inputRef={inputRef}
            onStartEditing={startEditing}
            onSave={saveName}
            onCancel={cancelEditing}
            onEditChange={setEditValue}
            onKeyDown={handleKeyDown}
          />

          {/* Game Title */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-black text-gold mb-4 tracking-tight leading-none">
              Three of Spades
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto rounded-full shadow-glow"></div>
          </div>

          {/* Game Mode Selection */}
          <div className="mb-10">
            <div className="text-white/80 text-sm mb-6 font-medium tracking-wide uppercase">
              Choose Your Game Mode
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              {GAME_MODES.map(({ mode, title, subtitle }) => (
                <GameModeButton
                  key={mode}
                  mode={mode}
                  title={title}
                  subtitle={subtitle}
                  isSelected={selectedMode === mode}
                  onClick={() => setSelectedMode(mode)}
                />
              ))}
            </div>

            {/* Series Description */}
            {selectedGameMode?.description && (
              <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-xl backdrop-blur-sm animate-in fade-in duration-500">
                <div className="text-gold font-medium mb-1">🏆 Series Mode</div>
                <div className="text-white/80 text-sm leading-relaxed">
                  {selectedGameMode.description}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <StartGameButton onClick={handleStartGame} />
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        {/* How to Play Button */}
        <Button
          onClick={() => setShowHowToPlay(true)}
          className="group relative bg-gradient-gold text-casino-black font-bold px-4 py-3 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
          size="sm"
        >
          <span className="text-lg mr-2 group-hover:rotate-12 transition-transform duration-300">
            📖
          </span>
          <span className="hidden sm:inline">How to Play</span>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gold/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
        </Button>

        {/* Statistics Button */}
        <Button
          onClick={() => setShowStats(true)}
          className="group relative bg-gradient-gold text-casino-black font-bold px-4 py-3 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
          size="sm"
        >
          <BarChart3 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          <span className="hidden sm:inline">Stats</span>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gold/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
        </Button>
      </div>

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />
    </div>
  );
};

export default StartScreen;
