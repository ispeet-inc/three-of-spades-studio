import { getQuickStats, loadStats } from "@/lib/statsEngine";
import { PlayerStats, StatsDisplay } from "@/types/stats";
import { BarChart3, Target, Trophy, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { GameMode } from "../../types/game";
import { Button } from "./button";

interface PostGameStatsProps {
  isOpen: boolean;
  onClose: () => void;
  gameWon: boolean;
  finalScore: number;
  mode: GameMode;
}

export const PostGameStats: React.FC<PostGameStatsProps> = ({
  isOpen,
  onClose,
  gameWon,
  finalScore,
  mode,
}) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [quickStats, setQuickStats] = useState<StatsDisplay[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load fresh stats using the stats engine
      const freshStats = loadStats();
      setStats(freshStats);
      setQuickStats(getQuickStats(freshStats, mode));
    }
  }, [isOpen, mode]);

  if (!isOpen || !stats) return null;

  const getIcon = (iconName: string) => {
    const iconMap = {
      "🏆": Trophy,
      "🎯": Target,
      "📊": BarChart3,
    };
    const IconComponent =
      iconMap[iconName as keyof typeof iconMap] || BarChart3;
    return <IconComponent className="w-4 h-4 text-gold" />;
  };

  const isSeriesMode = mode === GameMode.Series;
  const totalGames = isSeriesMode
    ? stats.series.totalSeries
    : stats.game.totalGames;
  const gamesWon = isSeriesMode ? stats.series.seriesWon : stats.game.gamesWon;
  const winRate =
    totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-felt-green-light/95 via-felt-green/95 to-felt-green-dark/95 border border-gold/30 shadow-2xl backdrop-blur-xl max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-xl">
        {/* Header */}
        <div className="relative p-6 border-b border-gold/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  gameWon
                    ? "bg-gradient-to-r from-gold/25 to-gold/15 border border-gold/40"
                    : "bg-gradient-to-r from-red-500/25 to-red-500/15 border border-red-500/40"
                }`}
              >
                {gameWon ? (
                  <Trophy className="w-6 h-6 text-gold" />
                ) : (
                  <Target className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    gameWon ? "text-gold" : "text-red-400"
                  }`}
                >
                  {gameWon ? "Victory!" : "Game Over"}
                </h2>
                <p className="text-foreground/80">
                  Final Score:{" "}
                  <span className="font-bold text-gold">{finalScore}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gold hover:text-casino-black hover:bg-gold/20 rounded-full w-10 h-10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Content */}
        <div className="p-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { value: totalGames, label: "Total Games" },
              { value: `${winRate}%`, label: "Win Rate" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent border border-casino-black/20 rounded-lg p-4 text-center shadow-md"
              >
                <div className="text-xl font-bold text-gold">{value}</div>
                <div className="text-sm text-foreground/70">{label}</div>
              </div>
            ))}
          </div>

          {/* Recent Performance */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground/95 mb-3">
              Recent Performance
            </h3>
            {quickStats.slice(0, 3).map(stat => (
              <div
                key={stat.label}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent rounded-lg border border-casino-black/20 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-gradient-to-r from-gold/25 to-gold/15 rounded border border-gold/40">
                    {getIcon(stat.icon)}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {stat.label}
                  </span>
                </div>
                <div className="text-lg font-bold text-gold">
                  {isNaN(Number(stat.value)) ? 0 : stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gold/20 bg-gradient-to-r from-casino-black/10 to-transparent">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-gold text-casino-black font-bold hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              Continue
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gold/30 text-gold hover:bg-gold/10 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Stats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
