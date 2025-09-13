import {
  DEFAULT_STATS,
  GameLogEntry,
  PlayerStats,
  SeriesLogEntry,
  StatsDisplay,
} from "@/types/stats";
import { GameMode } from "../types/game";

const STATS_STORAGE_KEY = "three-of-spades-stats";

/**
 * Safely round a number, returning 0 if the result is NaN
 */
const safeRound = (value: number): number => {
  const rounded = Math.round(value);
  return isNaN(rounded) ? 0 : rounded;
};

/**
 * Load stats from localStorage
 */
export const loadStats = (): PlayerStats => {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;

    const parsed = JSON.parse(stored) as PlayerStats;
    return parsed;
  } catch (error) {
    console.warn("Failed to load stats from localStorage:", error);
    return DEFAULT_STATS;
  }
};

/**
 * Save stats to localStorage
 */
export const saveStats = (stats: PlayerStats): void => {
  try {
    const updatedStats = {
      ...stats,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updatedStats));

    // Dispatch custom event to notify components of stats update
    window.dispatchEvent(new CustomEvent("statsUpdated"));
  } catch (error) {
    console.warn("Failed to save stats to localStorage:", error);
  }
};

/**
 * Update stats based on game log entry
 */
export const updateGameStats = (
  currentStats: PlayerStats,
  gameEntry: GameLogEntry
): PlayerStats => {
  const stats = { ...currentStats };
  const gameStats = stats.game;

  // Update game-level stats
  gameStats.totalGames += 1;
  gameStats.gamesWon += Number(gameEntry.isWon);
  gameStats.highestScore = Math.max(gameStats.highestScore, gameEntry.score);
  gameStats.currentStreak = gameEntry.isWon ? gameStats.currentStreak + 1 : 0;
  gameStats.bestStreak = Math.max(
    gameStats.bestStreak,
    gameStats.currentStreak
  );

  gameStats.bidsPlaced += Number(gameEntry.bidPlaced);
  gameStats.bidsWon += Number(gameEntry.bidPlaced && gameEntry.isWon);
  gameStats.whitewash += Number(gameEntry.whitewash);

  return stats;
};

/**
 * Update stats based on series log entry
 */
export const updateSeriesStats = (
  currentStats: PlayerStats,
  seriesEntry: SeriesLogEntry
): PlayerStats => {
  const stats = { ...currentStats };
  const seriesStats = stats.series;

  // Update series-level stats
  seriesStats.totalSeries += 1;
  seriesStats.seriesWon += Number(seriesEntry.isWon);
  seriesStats.highestSeriesScore = Math.max(
    seriesStats.highestSeriesScore,
    seriesEntry.score
  );
  seriesStats.currentSeriesStreak = seriesEntry.isWon
    ? seriesStats.currentSeriesStreak + 1
    : 0;
  seriesStats.bestSeriesStreak = Math.max(
    seriesStats.bestSeriesStreak,
    seriesStats.currentSeriesStreak
  );
  seriesStats.averageSeriesScore = safeRound(
    (seriesStats.averageSeriesScore * (seriesStats.totalSeries - 1) +
      seriesEntry.score) /
      seriesStats.totalSeries
  );

  return stats;
};

/**
 * Reset all stats
 */
export const resetStats = (): PlayerStats => {
  const resetStats = { ...DEFAULT_STATS };
  saveStats(resetStats);
  return resetStats;
};

/**
 * Generate display data for stats
 */
export const generateStatsDisplay = (
  stats: PlayerStats,
  mode: GameMode
): StatsDisplay[] => {
  const gameStats = stats.game;
  const seriesStats = stats.series;

  if (mode === GameMode.Series) {
    return [
      {
        label: "Total Series",
        value: seriesStats.totalSeries,
        icon: "🏆",
        description: "Total series",
      },
      {
        label: "Highest Score",
        value: seriesStats.highestSeriesScore,
        icon: "🏆",
        description: "Best score",
      },
      {
        label: "Win Rate",
        value: `${safeRound((seriesStats.seriesWon / Math.max(seriesStats.totalSeries, 1)) * 100)}%`,
        percentage:
          (seriesStats.seriesWon / Math.max(seriesStats.totalSeries, 1)) * 100,
        icon: "🎯",
        description: "Percentage of wins",
      },
      {
        label: "Current Streak",
        value: seriesStats.currentSeriesStreak,
        icon: "🔥",
        description: "Series wins in a row",
      },
      {
        label: "Best Streak",
        value: seriesStats.bestSeriesStreak,
        icon: "⭐",
        description: "Longest series winning streak",
      },
      {
        label: "Average Score",
        value: seriesStats.averageSeriesScore,
        icon: "📊",
        description: "Average score per series",
      },
    ];
  } else {
    return [
      {
        label: "Total Games",
        value: gameStats.totalGames,
        icon: "🏆",
        description: "Total games",
      },
      {
        label: "Highest Score",
        value: gameStats.highestScore,
        icon: "🏆",
        description: "Best score",
      },
      {
        label: "Win Rate",
        value: `${safeRound((gameStats.gamesWon / Math.max(gameStats.totalGames, 1)) * 100)}%`,
        percentage:
          (gameStats.gamesWon / Math.max(gameStats.totalGames, 1)) * 100,
        icon: "🎮",
        description: "Percentage of wins",
      },
      {
        label: "Bid & Win Rate",
        value: `${safeRound((gameStats.bidsWon / Math.max(gameStats.bidsPlaced, 1)) * 100)}%`,
        percentage:
          (gameStats.bidsWon / Math.max(gameStats.bidsPlaced, 1)) * 100,
        icon: "💎",
        description: "Percentage of bids won",
      },
      {
        label: "Whitewashes",
        value: gameStats.whitewash,
        icon: "❄️",
        description: "Number of times won all tricks",
      },
      {
        label: "Current Streak",
        value: gameStats.currentStreak,
        icon: "🔥",
        description: "Games won in a row",
      },
      {
        label: "Best Streak",
        value: gameStats.bestStreak,
        icon: "⭐",
        description: "Longest winning streak",
      },
    ];
  }
};

/**
 * Get quick stats for preview
 */
export const getQuickStats = (
  stats: PlayerStats,
  mode: GameMode
): StatsDisplay[] => {
  const allStats = generateStatsDisplay(stats, mode);
  // Return top 3 most important stats
  return allStats.slice(0, 3);
};
