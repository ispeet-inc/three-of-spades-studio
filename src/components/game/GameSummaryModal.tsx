import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SeriesProgress } from "../../types/game";

interface GameSummaryModalProps {
  seriesProgress: SeriesProgress;
  playerNames: Record<number, string>;
  viewerId: number;
  isOpen: boolean;
  countdown: number; // seconds remaining
  onClose: () => void;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  seriesProgress,
  playerNames,
  viewerId,
  isOpen,
  countdown: initialCountdown,
  onClose,
}) => {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [barsVisible, setBarsVisible] = useState(false);
  const [playersVisible, setPlayersVisible] = useState(false);

  const { gameScores, seriesScores, currentGame, startingPlayerIndex } =
    seriesProgress;

  console.log("currentGame", currentGame);

  // Memoized calculations
  const maxTotalScore = useMemo(
    () => Math.max(...Object.values(seriesScores)),
    [seriesScores]
  );
  const maxGameScore = useMemo(
    () => Math.max(...Object.values(gameScores[currentGame])),
    [gameScores, currentGame]
  );
  const minNonZeroScore = useMemo(
    () =>
      Math.min(
        ...Object.values(gameScores[currentGame]).filter(score => score > 0)
      ),
    [gameScores, currentGame]
  );

  // Helper functions
  const getPlayerName = useCallback(
    (playerId: number): string => {
      return playerNames[playerId] || `Player ${playerId + 1}`;
    },
    [playerNames]
  );

  // todo - add more nuance here.
  const getPlayerRole = useCallback(
    (playerId: number): string => {
      const score = gameScores[currentGame][playerId];
      if (score > 0) {
        return minNonZeroScore === maxGameScore
          ? "Winner"
          : score === maxGameScore
            ? "Bidder"
            : "Teammate";
      }
      return "";
    },
    [gameScores, maxGameScore, minNonZeroScore, currentGame]
  );

  const getGameTitle = useCallback(
    (isWinner: boolean): string => {
      return `Game ${currentGame} ${isWinner ? "won!" : "lost!"}`;
    },
    [currentGame]
  );

  const calculateBarWidths = useCallback(
    (seriesScore: number, gameScore: number) => {
      const seriesBarWidth = ((seriesScore - gameScore) / maxTotalScore) * 100;
      const gameBarWidth = (gameScore / maxTotalScore) * 100;
      return { seriesBarWidth, gameBarWidth };
    },
    [maxTotalScore]
  );

  // Countdown logic
  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isOpen]);

  // Auto-close when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      onClose();
    }
  }, [countdown, onClose]);

  // Trigger animations when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer1 = setTimeout(() => setBarsVisible(true), 300);
      const timer2 = setTimeout(() => setPlayersVisible(true), 150);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setBarsVisible(false);
      setPlayersVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isViewerWinner = gameScores[currentGame][viewerId] > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-gradient-to-br from-felt-green-light/95 via-felt-green/95 to-felt-green-dark/95 border border-gold/30 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="text-center mb-5 relative">
          <div className="relative">
            <DialogTitle className="text-2xl font-casino text-gold mb-2 flex items-center justify-center gap-2">
              {getGameTitle(isViewerWinner)}
            </DialogTitle>
          </div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4 px-2">
          {/* Series Leaderboard */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground/95 text-center tracking-wider uppercase">
              Series Leaderboard
            </h3>

            <div className="space-y-2.5">
              {Object.entries(seriesScores)
                .sort(([, a], [, b]) => b - a)
                .map(([playerId, seriesScore], index) => {
                  const playerIndex = parseInt(playerId);
                  const gameScore = gameScores[currentGame][playerIndex] || 0;
                  const isGameWinner = gameScore > 0;
                  const role = getPlayerRole(playerIndex);
                  const { seriesBarWidth, gameBarWidth } = calculateBarWidths(
                    seriesScore,
                    gameScore
                  );

                  return (
                    <div
                      key={playerId}
                      className={cn(
                        "group space-y-2 p-2.5 rounded-lg border transition-all duration-700 ease-out",
                        playersVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4",
                        isGameWinner
                          ? "bg-gradient-to-r from-gold/15 via-gold/10 to-gold/5 border-gold/40 shadow-lg"
                          : "bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent border-casino-black/20 shadow-md"
                      )}
                      style={{
                        animationDelay: `${index * 150}ms`,
                      }}
                    >
                      {/* Player Info Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-semibold text-xs tracking-wide",
                              isGameWinner ? "text-gold" : "text-foreground"
                            )}
                          >
                            {getPlayerName(playerIndex)}
                          </span>
                          {isGameWinner && (
                            <div className="flex items-center gap-1 bg-gradient-to-r from-gold/25 to-gold/15 px-2 py-0.5 rounded-full border border-gold/40 shadow-sm">
                              <span className="text-gold text-xs font-bold tracking-wide">
                                +{gameScore} ({role})
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-bold text-sm tracking-wide",
                              isGameWinner ? "text-gold" : "text-foreground"
                            )}
                          >
                            {seriesScore} pts
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="relative h-4 bg-gradient-to-r from-casino-black/30 to-casino-black/15 rounded-full overflow-hidden shadow-inner border border-casino-black/25">
                        {/* Series Total Bar */}
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1500 ease-out shadow-sm",
                            barsVisible ? "opacity-100" : "opacity-0",
                            isGameWinner
                              ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700"
                              : "bg-gradient-to-r from-blue-400/90 via-blue-500/80 to-blue-600/70"
                          )}
                          style={{
                            width: barsVisible ? `${seriesBarWidth}%` : "0%",
                            transitionDelay: `${index * 150 + 300}ms`,
                          }}
                        />

                        {/* Game Score Overlay */}
                        {gameScore > 0 && (
                          <div
                            className="absolute top-0 h-full bg-gradient-to-r from-gold via-gold/95 to-gold/90 rounded-full transition-all duration-2000 ease-out shadow-sm"
                            style={{
                              width: barsVisible ? `${gameBarWidth}%` : "0%",
                              left: barsVisible ? `${seriesBarWidth}%` : "0%",
                              transitionDelay: `${index * 150 + 600}ms`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Next Game Section */}
          <div className="bg-gradient-to-r from-casino-black/10 to-transparent rounded-lg border border-gold/15 p-3 shadow-md">
            <div className="text-center space-y-3">
              <h3 className="text-xs font-semibold text-gold/70 tracking-wide uppercase">
                Next Game Starting Soon
              </h3>

              {/* Countdown Timer */}
              <div className="relative inline-block">
                <div className="bg-gradient-to-r from-gold/20 to-gold/10 px-6 py-3 rounded-xl border border-gold/30 shadow-lg">
                  <div className="text-3xl font-black text-gold tracking-wide">
                    {countdown}s
                  </div>
                </div>
              </div>

              {/* Next Player Display */}
              <div className="flex items-center justify-center gap-2 text-gold/70">
                <div className="p-1 bg-gold/15 rounded-full border border-gold/25">
                  <Users className="w-3.5 h-3.5 text-gold/80" />
                </div>
                <span className="font-medium text-xs tracking-wide text-gold/80">
                  {getPlayerName(startingPlayerIndex)} starts next round.
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
