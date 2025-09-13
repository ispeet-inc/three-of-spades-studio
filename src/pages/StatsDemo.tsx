import { Button } from "@/components/ui/button";
import { PostGameStats } from "@/components/ui/PostGameStats";
import { StatsModal } from "@/components/ui/StatsModal";
import { useStats } from "@/hooks/useStats";
import { GameMode } from "@/types/game";
import { GameLogEntry, SeriesLogEntry } from "@/types/stats";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

const StatsDemo = () => {
  const {
    stats,
    recordGameResult,
    recordSeriesResult,
    resetAllStats,
    clearAllStats,
  } = useStats();
  const [showPostGame, setShowPostGame] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const generateDummyData = () => {
    // Reset stats first
    resetAllStats();

    // Generate realistic game history
    const gameEntries: GameLogEntry[] = [];
    const seriesEntries: SeriesLogEntry[] = [];

    // Generate 35 single games with realistic patterns
    for (let i = 0; i < 35; i++) {
      const daysAgo = Math.floor(Math.random() * 45);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      // Simulate improving performance over time (newer games tend to be better)
      const winChance = 0.25 + (35 - i) * 0.015; // 25% to 77% win rate
      const isWon = Math.random() < winChance;

      // Higher scores for won games, with some exceptional scores
      let baseScore: number;
      if (isWon) {
        if (Math.random() < 0.1) {
          // 10% chance of exceptional score (90-120)
          baseScore = Math.floor(Math.random() * 31) + 90;
        } else {
          // Regular win scores (45-85)
          baseScore = Math.floor(Math.random() * 41) + 45;
        }
      } else {
        // Loss scores (5-50)
        baseScore = Math.floor(Math.random() * 46) + 5;
      }

      const bidPlaced = Math.random() < 0.75; // 75% chance of bidding
      const whitewash = baseScore === 0 && !isWon;

      gameEntries.push({
        mode: GameMode.Single,
        isWon,
        score: baseScore,
        bidPlaced,
        whitewash,
        timestamp: timestamp.toISOString(),
      });
    }

    // Generate 12 series with realistic patterns
    for (let i = 0; i < 12; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      // Series win rate around 45-65% with improvement over time
      const winChance = 0.45 + (12 - i) * 0.015;
      const isWon = Math.random() < winChance;

      let baseScore: number;
      if (isWon) {
        if (Math.random() < 0.15) {
          // 15% chance of exceptional series score (250-400)
          baseScore = Math.floor(Math.random() * 151) + 250;
        } else {
          // Regular win scores (150-250)
          baseScore = Math.floor(Math.random() * 101) + 150;
        }
      } else {
        // Loss scores (80-180)
        baseScore = Math.floor(Math.random() * 101) + 80;
      }

      seriesEntries.push({
        isWon,
        score: baseScore,
        timestamp: timestamp.toISOString(),
      });
    }

    // Record all the dummy data
    gameEntries.forEach(entry => recordGameResult(entry));
    seriesEntries.forEach(entry => recordSeriesResult(entry));
  };

  const simulateGame = () => {
    // Simulate a game result
    const gameWon = Math.random() > 0.5;
    const finalScore = Math.floor(Math.random() * 100) + 50;
    const bidPlaced = Math.random() > 0.3;
    const whitewash = finalScore === 0;

    const gameEntry = {
      mode: GameMode.Single,
      isWon: gameWon,
      score: finalScore,
      bidPlaced,
      whitewash,
      timestamp: new Date().toISOString(),
    };

    recordGameResult(gameEntry);
    setShowPostGame(true);
  };

  const simulateSeries = () => {
    // Simulate a series result
    const seriesWon = Math.random() > 0.4; // 60% win rate for series
    let finalScore: number;

    if (seriesWon) {
      if (Math.random() < 0.15) {
        // 15% chance of exceptional series score (250-400)
        finalScore = Math.floor(Math.random() * 151) + 250;
      } else {
        // Regular win scores (150-250)
        finalScore = Math.floor(Math.random() * 101) + 150;
      }
    } else {
      // Loss scores (80-180)
      finalScore = Math.floor(Math.random() * 101) + 80;
    }

    const seriesEntry = {
      isWon: seriesWon,
      score: finalScore,
      timestamp: new Date().toISOString(),
    };

    recordSeriesResult(seriesEntry);
    setShowPostGame(true);
  };

  return (
    <div className="min-h-screen bg-gradient-felt relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')]" />

      <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gold mb-4 drop-shadow-2xl animate-stats-float">
            Stats Demo
          </h1>
          <p className="text-xl text-foreground/90 mb-8 max-w-2xl">
            Test the beautiful statistics system with simulated games
          </p>
        </div>

        {/* Demo Controls */}
        <div className="mb-12 flex flex-col lg:flex-row gap-4 justify-center items-center max-w-4xl mx-auto">
          <Button
            onClick={simulateGame}
            className="bg-gradient-gold text-casino-black font-bold text-lg px-8 py-6 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Simulate Game
          </Button>
          <Button
            onClick={simulateSeries}
            className="bg-gradient-to-r from-gold to-yellow-400 text-casino-black font-bold text-lg px-8 py-6 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Simulate Series
          </Button>
          <Button
            onClick={generateDummyData}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-casino-black font-bold text-lg px-8 py-6 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Load Dummy Data
          </Button>
          <Button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to reset all statistics? This action cannot be undone."
                )
              ) {
                resetAllStats();
              }
            }}
            variant="destructive"
            className="bg-casino-red text-white font-bold text-lg px-8 py-6 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Reset Stats
          </Button>
          <Button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to clear all statistics from localStorage? This action cannot be undone."
                )
              ) {
                clearAllStats();
              }
            }}
            variant="outline"
            className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white font-bold text-lg px-8 py-6 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Clear localStorage
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="bg-secondary/20 backdrop-blur border border-gold/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gold mb-4">Single Mode</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground/80">Games Played:</span>
                <span className="text-gold font-bold">
                  {stats.game.totalGames}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Games Won:</span>
                <span className="text-gold font-bold">
                  {stats.game.gamesWon}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Win Rate:</span>
                <span className="text-gold font-bold">
                  {stats.game.totalGames > 0
                    ? Math.round(
                        (stats.game.gamesWon / stats.game.totalGames) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/20 backdrop-blur border border-gold/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gold mb-4">Series Mode</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground/80">Series Played:</span>
                <span className="text-gold font-bold">
                  {stats.series.totalSeries}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Series Won:</span>
                <span className="text-gold font-bold">
                  {stats.series.seriesWon}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/80">Series Win Rate:</span>
                <span className="text-gold font-bold">
                  {stats.series.totalSeries > 0
                    ? Math.round(
                        (stats.series.seriesWon / stats.series.totalSeries) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Button */}
      <div className="fixed top-6 right-6 z-50">
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

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        onReset={resetAllStats}
        stats={stats}
      />

      {/* Post Game Stats Modal */}
      <PostGameStats
        isOpen={showPostGame}
        onClose={() => setShowPostGame(false)}
        gameWon={Math.random() > 0.5}
        finalScore={Math.floor(Math.random() * 100) + 50}
        mode={GameMode.Single}
      />
    </div>
  );
};

export default StatsDemo;
