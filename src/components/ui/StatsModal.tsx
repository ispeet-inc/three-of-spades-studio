import { generateStatsDisplay } from "@/lib/statsEngine";
import { PlayerStats, StatsDisplay } from "@/types/stats";
import {
  BarChart3,
  Crown,
  Flame,
  Gamepad2,
  Gem,
  Medal,
  RotateCcw,
  Snowflake,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { GameMode } from "../../types/game";
import { Button } from "./button";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  const [mode, setMode] = useState<GameMode>(GameMode.Series);
  const [displayStats, setDisplayStats] = useState<StatsDisplay[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && stats) {
      setIsAnimating(true);
      setDisplayStats(generateStatsDisplay(stats, mode));
    }
  }, [isOpen, mode, stats]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 150);
  };

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
  };

  const getIcon = (iconName: string) => {
    const icons = {
      "🏆": <Trophy className="w-5 h-5" />,
      "🎯": <Target className="w-5 h-5" />,
      "🎮": <Gamepad2 className="w-5 h-5" />,
      "💎": <Gem className="w-5 h-5" />,
      "🥇": <Medal className="w-5 h-5" />,
      "👑": <Crown className="w-5 h-5" />,
      "❄️": <Snowflake className="w-5 h-5" />,
      "✨": <Sparkles className="w-5 h-5" />,
      "🔥": <Flame className="w-5 h-5" />,
      "⭐": <Star className="w-5 h-5" />,
      "📊": <TrendingUp className="w-5 h-5" />,
    };
    return (
      icons[iconName as keyof typeof icons] || <BarChart3 className="w-5 h-5" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Enhanced Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Floating Modal */}
      <div
        className={`relative bg-gradient-to-br from-felt-green via-felt-green/95 to-felt-green/90 border border-gold/40 rounded-2xl shadow-2xl max-w-[720px] w-full max-h-[85vh] sm:max-h-[78vh] overflow-hidden transform transition-all duration-500 ease-out ${
          isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1)",
        }}
      >
        {/* Compact Header */}
        <div className="relative px-4 py-3 border-b border-gold/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-br from-gold to-gold/80 rounded-lg shadow-lg">
                <BarChart3 className="w-4 h-4 text-casino-black" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gold font-casino tracking-wide">
                  Stats
                </h2>
                <p className="text-[11px] text-foreground/70 font-medium">
                  Performance insights
                </p>
              </div>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="text-foreground/60 hover:text-gold hover:bg-gold/10 rounded-lg w-7 h-7 transition-all duration-150"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Compact Mode Toggle */}
        <div className="px-4 py-2.5">
          <div className="flex gap-1 bg-secondary/10 rounded-xl p-0.5 backdrop-blur-sm border border-gold/10">
            <Button
              onClick={() => handleModeChange(GameMode.Series)}
              variant="ghost"
              className={`flex-1 transition-all duration-150 rounded-lg text-[13px] ${
                mode === GameMode.Series
                  ? "bg-gradient-to-r from-gold to-gold/90 text-casino-black shadow-lg font-semibold"
                  : "text-foreground/70 hover:text-gold hover:bg-gold/5"
              }`}
            >
              Series
            </Button>
            <Button
              onClick={() => handleModeChange(GameMode.Single)}
              variant="ghost"
              className={`flex-1 transition-all duration-150 rounded-lg text-[13px] ${
                mode === GameMode.Single
                  ? "bg-gradient-to-r from-gold to-gold/90 text-casino-black shadow-lg font-semibold"
                  : "text-foreground/70 hover:text-gold hover:bg-gold/5"
              }`}
            >
              Single
            </Button>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="px-3 sm:px-4 pb-4 overflow-y-auto max-h-[55vh] sm:max-h-[52vh]">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2.5">
            {displayStats.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-sm border border-gold/15 rounded-xl p-3.5 hover:border-gold/30 hover:bg-gradient-to-br hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  animationDelay: `${index * 75}ms`,
                  animation: isAnimating
                    ? "slideUpFade 0.6s ease-out forwards"
                    : "none",
                }}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1.5 bg-gold/15 rounded-md group-hover:bg-gold/25 transition-colors duration-150 group-hover:scale-110">
                        {getIcon(stat.icon)}
                      </div>
                      <h3 className="text-[11px] font-semibold text-foreground group-hover:text-gold transition-colors duration-150 leading-tight">
                        {stat.label}
                      </h3>
                    </div>
                  </div>

                  <div className="mb-1.5">
                    <div className="text-lg font-bold text-gold font-casino mb-0.5 group-hover:scale-105 transition-transform duration-150">
                      {stat.percentage !== undefined
                        ? `${stat.percentage.toFixed(0)}%`
                        : stat.value}
                    </div>
                  </div>

                  {/* Compact progress bar */}
                  {stat.percentage !== undefined && (
                    <div className="w-full bg-secondary/20 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-gold/80 rounded-full transition-all duration-700 ease-out group-hover:shadow-sm group-hover:shadow-gold/50"
                        style={{
                          width: `${Math.min(stat.percentage, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Cool hover glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10 group-hover:animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-4 py-2.5 border-t border-gold/10 bg-gradient-to-r from-transparent to-gold/5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-foreground/50 font-medium">
              {new Date(stats.lastUpdated).toLocaleDateString()}
            </div>
            <Button
              onClick={() => {
                if (confirm("Reset all statistics? This cannot be undone.")) {
                  handleClose();
                }
              }}
              variant="ghost"
              className="text-foreground/50 hover:text-casino-red hover:bg-casino-red/10 transition-colors duration-150 text-[11px] font-medium hover:scale-105"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
