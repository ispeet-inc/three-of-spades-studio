import { useMobileLayout } from "@/hooks/use-mobile";
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
  const { isMobile } = useMobileLayout();

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
    return <IconComponent className={isMobile ? "w-3.5 h-3.5 text-gold" : "w-4 h-4 text-gold"} />;
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
      <div className={`relative bg-gradient-to-br from-felt-green-light/95 via-felt-green/95 to-felt-green-dark/95 border border-gold/30 shadow-2xl backdrop-blur-xl w-full overflow-hidden rounded-xl ${
        isMobile ? "max-w-sm max-h-[85vh]" : "max-w-2xl max-h-[80vh]"
      }`}>
        {/* Header */}
        <div className={`relative border-b border-gold/20 ${isMobile ? "p-3" : "p-6"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg ${isMobile ? "p-1.5" : "p-2"} ${
                  gameWon
                    ? "bg-gradient-to-r from-gold/25 to-gold/15 border border-gold/40"
                    : "bg-gradient-to-r from-red-500/25 to-red-500/15 border border-red-500/40"
                }`}
              >
                {gameWon ? (
                  <Trophy className={isMobile ? "w-5 h-5 text-gold" : "w-6 h-6 text-gold"} />
                ) : (
                  <Target className={isMobile ? "w-5 h-5 text-red-400" : "w-6 h-6 text-red-400"} />
                )}
              </div>
              <div>
                <h2
                  className={`font-bold ${isMobile ? "text-lg" : "text-2xl"} ${
                    gameWon ? "text-gold" : "text-red-400"
                  }`}
                >
                  {gameWon ? "Victory!" : "Game Over"}
                </h2>
                <p className={`text-foreground/80 ${isMobile ? "text-xs" : ""}`}>
                  Final Score:{" "}
                  <span className="font-bold text-gold">{finalScore}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gold hover:text-casino-black hover:bg-gold/20 rounded-full w-10 h-10 touch-target"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Content */}
        <div className={`overflow-y-auto ${isMobile ? "p-3 max-h-[50vh]" : "p-6"}`}>
          {/* Quick Stats Grid */}
          <div className={`grid grid-cols-2 mb-4 ${isMobile ? "gap-2" : "gap-4 mb-6"}`}>
            {[
              { value: totalGames, label: "Total Games" },
              { value: `${winRate}%`, label: "Win Rate" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className={`bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent border border-casino-black/20 rounded-lg text-center shadow-md ${
                  isMobile ? "p-2" : "p-4"
                }`}
              >
                <div className={`font-bold text-gold ${isMobile ? "text-base" : "text-xl"}`}>{value}</div>
                <div className={`text-foreground/70 ${isMobile ? "text-xs" : "text-sm"}`}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent Performance */}
          <div className="space-y-2">
            <h3 className={`font-semibold text-foreground/95 ${isMobile ? "text-sm mb-2" : "text-lg mb-3"}`}>
              Recent Performance
            </h3>
            {quickStats.slice(0, 3).map(stat => (
              <div
                key={stat.label}
                className={`flex items-center justify-between bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent rounded-lg border border-casino-black/20 shadow-md ${
                  isMobile ? "p-2" : "p-3"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`bg-gradient-to-r from-gold/25 to-gold/15 rounded border border-gold/40 ${isMobile ? "p-0.5" : "p-1"}`}>
                    {getIcon(stat.icon)}
                  </div>
                  <span className={`font-medium text-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
                    {stat.label}
                  </span>
                </div>
                <div className={`font-bold text-gold ${isMobile ? "text-sm" : "text-lg"}`}>
                  {isNaN(Number(stat.value)) ? 0 : stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t border-gold/20 bg-gradient-to-r from-casino-black/10 to-transparent ${
          isMobile ? "p-3" : "p-6"
        }`}>
          <div className={`flex ${isMobile ? "gap-2" : "gap-3"}`}>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-gold text-casino-black font-bold hover:shadow-glow transition-all duration-300 hover:scale-105 touch-target"
            >
              Continue
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gold/30 text-gold hover:bg-gold/10 transition-all duration-300 touch-target"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {isMobile ? "Stats" : "View Full Stats"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
