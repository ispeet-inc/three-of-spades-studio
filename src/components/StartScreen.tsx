import { useMobileLayout } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
  compact?: boolean;
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
  compact = false,
}) => (
  <div className={compact ? "mb-3" : "mb-8"}>
    <div className={cn(
      "inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full border border-gold/30",
      compact ? "px-3 py-1.5" : "px-6 py-3"
    )}>
      <span className={cn("text-white/90 font-light", compact ? "text-sm" : "text-lg")}>Welcome</span>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => onEditChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onSave}
          className={cn(
            "text-gold font-semibold bg-transparent border-none outline-none px-0 py-0 border-b-2 border-gold/60 cursor-text transition-all duration-300 min-w-[80px]",
            compact ? "text-sm" : "text-lg"
          )}
          placeholder="Enter your name"
        />
      ) : (
        <span
          onClick={onStartEditing}
          className={cn(
            "text-gold font-semibold cursor-pointer transition-all duration-300 hover:text-gold-light hover:scale-105",
            compact ? "text-sm" : "text-lg",
            playerName === "Stranger" ? "opacity-60" : "opacity-100"
          )}
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
  compact?: boolean;
}> = ({ mode, title, subtitle, isSelected, onClick, compact = false }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative rounded-2xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 touch-target",
      compact ? "p-3" : "p-6",
      isSelected
        ? "border-gold bg-gold/10 shadow-glow"
        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
    )}
  >
    <div className="text-center space-y-1">
      <div
        className={cn(
          "font-bold transition-colors duration-300",
          compact ? "text-base" : "text-xl",
          isSelected ? "text-gold" : "text-white"
        )}
      >
        {title}
      </div>
      <div
        className={cn(
          "transition-colors duration-300",
          compact ? "text-xs" : "text-sm",
          isSelected ? "text-gold/80" : "text-white/60"
        )}
      >
        {subtitle}
      </div>
    </div>
  </button>
);

const StartGameButton: React.FC<{ onClick: () => void; compact?: boolean }> = ({ onClick, compact = false }) => (
  <div className="relative">
    <Button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-gold via-gold-light to-gold text-casino-black font-bold rounded-2xl shadow-2xl hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 group touch-target",
        compact ? "text-base px-8 py-4" : "text-xl px-12 py-6"
      )}
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
  const { isMobile, isPhoneLandscape } = useMobileLayout();
  const compact = isMobile;

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

      <div className={cn(
        "relative z-10 flex items-center justify-center min-h-screen",
        compact ? "px-3" : "px-6"
      )}>
        <div className={cn(
          "text-center mx-auto",
          compact ? "max-w-sm" : "max-w-2xl"
        )}>
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
            compact={compact}
          />

          {/* Game Title */}
          <div className={compact ? "mb-5" : "mb-12"}>
            <h1 className={cn(
              "font-black text-gold tracking-tight leading-none",
              compact
                ? (isPhoneLandscape ? "text-3xl mb-2" : "text-4xl mb-3")
                : "text-6xl md:text-7xl mb-4"
            )}>
              Three of Spades
            </h1>
            <div className={cn(
              "h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto rounded-full shadow-glow",
              compact ? "w-16" : "w-24"
            )}></div>
          </div>

          {/* Game Mode Selection */}
          <div className={compact ? "mb-5" : "mb-10"}>
            <div className={cn(
              "text-white/80 font-medium tracking-wide uppercase",
              compact ? "text-xs mb-3" : "text-sm mb-6"
            )}>
              Choose Your Game Mode
            </div>

            <div className={cn(
              "grid grid-cols-2 gap-3 mx-auto",
              compact ? "max-w-xs" : "max-w-lg md:gap-4"
            )}>
              {GAME_MODES.map(({ mode, title, subtitle }) => (
                <GameModeButton
                  key={mode}
                  mode={mode}
                  title={title}
                  subtitle={subtitle}
                  isSelected={selectedMode === mode}
                  onClick={() => setSelectedMode(mode)}
                  compact={compact}
                />
              ))}
            </div>

            {/* Series Description - hidden on landscape mobile to save space */}
            {selectedGameMode?.description && !isPhoneLandscape && (
              <div className={cn(
                "bg-gold/10 border border-gold/30 rounded-xl backdrop-blur-sm animate-in fade-in duration-500",
                compact ? "mt-3 p-2" : "mt-6 p-4"
              )}>
                <div className={cn("text-gold font-medium", compact ? "text-xs mb-0.5" : "mb-1")}>🏆 Series Mode</div>
                <div className={cn("text-white/80 leading-relaxed", compact ? "text-[10px]" : "text-sm")}>
                  {selectedGameMode.description}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <StartGameButton onClick={handleStartGame} compact={compact} />
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className={cn(
        "fixed z-50 flex gap-2",
        compact ? "top-2 right-2" : "top-6 right-6 gap-3"
      )}>
        {/* How to Play Button */}
        <Button
          onClick={() => setShowHowToPlay(true)}
          className={cn(
            "group relative bg-gradient-gold text-casino-black font-bold rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 touch-target",
            compact ? "px-2 py-1.5 text-xs" : "px-4 py-3"
          )}
          size="sm"
        >
          <span className={cn("group-hover:rotate-12 transition-transform duration-300", compact ? "text-sm" : "text-lg mr-2")}>
            📖
          </span>
          {!compact && <span className="hidden sm:inline">How to Play</span>}

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gold/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
        </Button>

        {/* Statistics Button */}
        <Button
          onClick={() => setShowStats(true)}
          className={cn(
            "group relative bg-gradient-gold text-casino-black font-bold rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 touch-target",
            compact ? "px-2 py-1.5 text-xs" : "px-4 py-3"
          )}
          size="sm"
        >
          <BarChart3 className={cn("group-hover:rotate-12 transition-transform duration-300", compact ? "w-4 h-4" : "w-5 h-5 mr-2")} />
          {!compact && <span className="hidden sm:inline">Stats</span>}

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
