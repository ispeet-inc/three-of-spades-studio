import {
  loadStats,
  resetStats,
  saveStats,
  updateGameStats,
  updateSeriesStats,
} from "@/lib/statsEngine";
import { GameLogEntry, PlayerStats, SeriesLogEntry } from "@/types/stats";
import { useCallback, useEffect, useState } from "react";

export const useStats = () => {
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());

  // Load stats from localStorage on mount
  useEffect(() => {
    setStats(loadStats());
  }, []);

  // Update stats when a game is completed
  const recordGameResult = useCallback(
    (gameEntry: GameLogEntry) => {
      const updatedStats = updateGameStats(stats, gameEntry);
      setStats(updatedStats);
      saveStats(updatedStats);
    },
    [stats]
  );

  // Update stats when a series is completed
  const recordSeriesResult = useCallback(
    (seriesEntry: SeriesLogEntry) => {
      const updatedStats = updateSeriesStats(stats, seriesEntry);
      setStats(updatedStats);
      saveStats(updatedStats);
    },
    [stats]
  );

  // Reset all stats
  const resetAllStats = useCallback(() => {
    const resetStatsData = resetStats();
    setStats(resetStatsData);
  }, []);

  // Refresh stats from localStorage
  const refreshStats = useCallback(() => {
    const freshStats = loadStats();
    setStats(freshStats);
  }, []);

  return {
    stats,
    recordGameResult,
    recordSeriesResult,
    resetAllStats,
    refreshStats,
  };
};
