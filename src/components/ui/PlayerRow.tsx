import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import React from "react";

interface PlayerRowProps {
  playerId: number;
  playerName: string;
  score: number;
  rank?: number;
  isWinner?: boolean;
  isVisible: boolean;
  delay?: number;
  showRole?: boolean;
  role?: string;
  showTrophy?: boolean;
  className?: string;
}

export const PlayerRow: React.FC<PlayerRowProps> = ({
  playerId,
  playerName,
  score,
  rank,
  isWinner = false,
  isVisible,
  delay = 0,
  showRole = false,
  role,
  showTrophy = false,
  className,
}) => (
  <div
    className={cn(
      "group space-y-2 p-3 rounded-lg border transition-all duration-700 ease-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      isWinner
        ? "bg-gradient-to-r from-gold/20 via-gold/15 to-gold/10 border-gold/50 shadow-lg"
        : "bg-gradient-to-r from-casino-black/15 via-casino-black/10 to-transparent border-casino-black/30 shadow-md",
      className
    )}
    style={{
      animationDelay: `${delay}ms`,
    }}
  >
    {/* Player Info Row */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {rank !== undefined && (
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs",
              isWinner
                ? "bg-gold text-casino-black shadow-md"
                : "bg-casino-black/20 text-foreground"
            )}
          >
            {rank}
          </div>
        )}

        <div className="flex items-center gap-1">
          <span
            className={cn(
              "font-semibold text-xs tracking-wide",
              isWinner ? "text-gold" : "text-foreground"
            )}
          >
            {playerName}
          </span>

          {showRole && role && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-gold/25 to-gold/15 px-2 py-0.5 rounded-full border border-gold/40 shadow-sm">
              <span className="text-gold text-xs font-bold tracking-wide">
                +{score} ({role})
              </span>
            </div>
          )}

          {showTrophy && isWinner && (
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
          {score} pts
        </span>
      </div>
    </div>
  </div>
);
