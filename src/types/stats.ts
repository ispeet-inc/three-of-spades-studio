import { GameMode } from "./game";

export interface GameStats {
  totalGames: number;
  gamesWon: number;
  highestScore: number;
  bidsPlaced: number;
  bidsWon: number;
  whitewash: number;
  currentStreak: number;
  bestStreak: number;
}

export interface SeriesStats {
  totalSeries: number;
  seriesWon: number;
  highestSeriesScore: number;
  currentSeriesStreak: number;
  bestSeriesStreak: number;
  averageSeriesScore: number;
}

export interface PlayerStats {
  // Game-level stats (for both single and series games)
  game: GameStats;

  // Series-level stats (only for series mode)
  series: SeriesStats;

  // Metadata
  lastUpdated: string;
}

export interface GameLogEntry {
  mode: GameMode;
  isWon: boolean;
  score: number;
  bidPlaced: boolean;
  whitewash: boolean;
  timestamp: string;
}

export interface SeriesLogEntry {
  isWon: boolean;
  score: number;
  timestamp: string;
}

export interface StatsDisplay {
  label: string;
  value: string | number;
  percentage?: number;
  icon: string;
  trend?: "up" | "down" | "neutral";
  description: string;
}

export const DEFAULT_GAME_STATS: GameStats = {
  totalGames: 0,
  gamesWon: 0,
  highestScore: 0,
  bidsPlaced: 0,
  bidsWon: 0,
  whitewash: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export const DEFAULT_SERIES_STATS: SeriesStats = {
  totalSeries: 0,
  seriesWon: 0,
  highestSeriesScore: 0,
  currentSeriesStreak: 0,
  bestSeriesStreak: 0,
  averageSeriesScore: 0,
};

export const DEFAULT_STATS: PlayerStats = {
  game: DEFAULT_GAME_STATS,
  series: DEFAULT_SERIES_STATS,
  lastUpdated: new Date().toISOString(),
};
