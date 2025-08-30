import { cn } from "@/lib/utils";
import { SeriesProgress } from "@/types/game";
import { BarChart3, Trophy } from "lucide-react";

interface CollapsibleScoreboardProps {
  seriesProgress: SeriesProgress;
  playerNames: Record<number, string>;
  className?: string;
}

export const CollapsibleScoreboard: React.FC<CollapsibleScoreboardProps> = ({
  seriesProgress,
  playerNames,
  className,
}) => {
  const renderSeriesTotals = () => {
    const sortedPlayers = Object.entries(seriesProgress.seriesScores).sort(
      ([, a], [, b]) => b - a
    );

    return (
      <div className="space-y-2">
        {sortedPlayers.map(([playerId, score], index) => {
          const isWinner = index === 0;
          const playerName =
            playerNames[parseInt(playerId)] || `Player ${playerId}`;

          return (
            <div
              key={playerId}
              className={cn(
                "flex items-center justify-between",
                "px-3 py-2 rounded-lg",
                "transition-all duration-200",
                isWinner && "bg-gold/10 border border-gold/20"
              )}
            >
              <div className="flex items-center gap-2">
                {isWinner && <Trophy className="w-4 h-4 text-gold" />}
                <span
                  className={cn(
                    "font-medium",
                    isWinner ? "text-gold" : "text-foreground"
                  )}
                >
                  {playerName}
                </span>
              </div>
              <span
                className={cn(
                  "font-bold",
                  isWinner ? "text-gold" : "text-muted-foreground"
                )}
              >
                {score} pts
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "bg-secondary/90 backdrop-blur-md",
        "border border-border/50 rounded-xl",
        "shadow-elevated",
        "transition-all duration-300 ease-out",
        "overflow-hidden",
        "min-w-[280px] max-w-[400px]",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between",
          "p-4 pb-3",
          "border-b border-border/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">
              Series Scoreboard
            </h3>
            <p className="text-xs text-muted-foreground">
              {seriesProgress.currentGame - 1} of {seriesProgress.totalGames}{" "}
              games completed
            </p>
          </div>
        </div>
      </div>

      {/* Series Totals - Always Visible */}
      <div className={cn("px-4 py-3", "bg-accent/5")}>
        {renderSeriesTotals()}
      </div>
    </div>
  );
};
