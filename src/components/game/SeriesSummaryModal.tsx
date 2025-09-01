import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Home, Play, Trophy } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SeriesProgress } from "../../types/game";
import { ModalHeader } from "../ui/ModalHeader";
import { ProgressBar } from "../ui/ProgressBar";
import { ProgressBarContainer } from "../ui/ProgressBarContainer";

interface SeriesSummaryModalProps {
  seriesProgress: SeriesProgress;
  playerNames: Record<number, string>;
  viewerId: number;
  isOpen: boolean;
  onNewSeries: () => void;
  onMainMenu: () => void;
}

export const SeriesSummaryModal: React.FC<SeriesSummaryModalProps> = ({
  seriesProgress,
  playerNames,
  viewerId,
  isOpen,
  onNewSeries,
  onMainMenu,
}) => {
  const [barsVisible, setBarsVisible] = useState(false);
  const [playersVisible, setPlayersVisible] = useState(false);
  const [winnerVisible, setWinnerVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  const { seriesScores, totalGames } = seriesProgress;

  // Memoized calculations
  const maxTotalScore = useMemo(
    () => Math.max(...Object.values(seriesScores)),
    [seriesScores]
  );

  const winner = useMemo(() => {
    const entries = Object.entries(seriesScores);
    return entries.reduce(
      (max, [playerId, score]) =>
        score > max.score ? { playerId: parseInt(playerId), score } : max,
      { playerId: 0, score: 0 }
    );
  }, [seriesScores]);

  const isViewerWinner = winner.playerId === viewerId;

  // Helper functions
  const getPlayerName = useCallback(
    (playerId: number): string => {
      return playerNames[playerId] || `Player ${playerId + 1}`;
    },
    [playerNames]
  );

  const getSeriesTitle = useCallback((isWinner: boolean): string => {
    return `Series ${isWinner ? "Won!" : "Complete!"} 🎉`;
  }, []);

  const calculateBarWidth = useCallback(
    (seriesScore: number) => {
      return (seriesScore / maxTotalScore) * 100;
    },
    [maxTotalScore]
  );

  // Trigger animations when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer1 = setTimeout(() => setWinnerVisible(true), 300);
      const timer2 = setTimeout(() => setBarsVisible(true), 600);
      const timer3 = setTimeout(() => setPlayersVisible(true), 900);
      const timer4 = setTimeout(() => setButtonsVisible(true), 1200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      setWinnerVisible(false);
      setBarsVisible(false);
      setPlayersVisible(false);
      setButtonsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl bg-gradient-to-br from-felt-green-light/95 via-felt-green/95 to-felt-green-dark/95 border border-gold/30 shadow-2xl backdrop-blur-xl overflow-hidden">
        <DialogTitle className="sr-only">
          {getSeriesTitle(isViewerWinner)}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Series complete with final standings and winner announcement
        </DialogDescription>
        {/* Header */}
        <ModalHeader title={getSeriesTitle(isViewerWinner)} />

        <div className="space-y-4 px-2">
          {/* Winner Announcement */}
          <div
            className={cn(
              "text-center space-y-3 transition-all duration-1000 ease-out",
              winnerVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <div className="relative inline-block">
              <div className="bg-gradient-to-r from-gold/25 via-gold/20 to-gold/15 px-6 py-3 rounded-xl border border-gold/40 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-gold animate-pulse" />
                  <div className="text-center">
                    <div className="text-base font-bold text-gold tracking-wide">
                      Winner: {getPlayerName(winner.playerId)}
                    </div>
                    <div className="text-xs text-gold/80 font-medium">
                      {winner.score} points
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Standings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground/95 text-center tracking-wider uppercase">
              Final Standings
            </h3>

            <div className="space-y-2">
              {Object.entries(seriesScores)
                .sort(([, a], [, b]) => b - a)
                .map(([playerId, seriesScore], index) => {
                  const playerIndex = parseInt(playerId);
                  const isWinner = playerIndex === winner.playerId;
                  const barWidth = calculateBarWidth(seriesScore);

                  return (
                    <div
                      key={playerId}
                      className={cn(
                        "group space-y-2 p-3 rounded-lg border transition-all duration-700 ease-out",
                        playersVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4",
                        isWinner
                          ? "bg-gradient-to-r from-gold/20 via-gold/15 to-gold/10 border-gold/50 shadow-lg"
                          : "bg-gradient-to-r from-casino-black/15 via-casino-black/10 to-transparent border-casino-black/30 shadow-md"
                      )}
                      style={{
                        animationDelay: `${index * 150}ms`,
                      }}
                    >
                      {/* Player Info Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
                              isWinner
                                ? "bg-gold text-casino-black shadow-md"
                                : "bg-casino-black/20 text-foreground"
                            )}
                          >
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={cn(
                                "font-semibold text-xs tracking-wide",
                                isWinner ? "text-gold" : "text-foreground"
                              )}
                            >
                              {getPlayerName(playerIndex)}
                            </span>
                            {isWinner && (
                              <Trophy className="w-3 h-3 text-gold animate-pulse" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-bold text-sm tracking-wide",
                              isWinner ? "text-gold" : "text-foreground"
                            )}
                          >
                            {seriesScore} pts
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <ProgressBarContainer>
                        <ProgressBar
                          width={barWidth}
                          isVisible={barsVisible}
                          delay={index * 150 + 300}
                          className={
                            isWinner
                              ? "bg-gradient-to-r from-gold via-gold/95 to-gold/90"
                              : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"
                          }
                        />
                      </ProgressBarContainer>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={cn(
              "flex gap-3 justify-center transition-all duration-1000 ease-out",
              buttonsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            <Button
              onClick={onNewSeries}
              className="group bg-gradient-to-r from-gold via-gold/95 to-gold/90 text-casino-black font-bold px-6 py-2 rounded-lg border border-gold/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-out"
            >
              <Play className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              New Series
            </Button>

            <Button
              onClick={onMainMenu}
              variant="outline"
              className="group bg-gradient-to-r from-casino-black/20 via-casino-black/15 to-transparent text-foreground font-semibold px-6 py-2 rounded-lg border border-casino-black/40 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out backdrop-blur-sm"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Main Menu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
