import { cn } from "@/lib/utils";
import { PlayerDisplayData } from "@/types/game";
import { Crown, Star } from "lucide-react";

interface PlayerInfoProps {
  player: PlayerDisplayData;
  isTeammateRevealed: boolean;
  className?: string;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  player,
  isTeammateRevealed,
  className,
}) => {
  return (
    <div
      className={cn(
        "group relative p-4 rounded-2xl border border-gold/30 bg-black/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-glow",
        className,
        player.isCurrentPlayer
          ? "animate-turn-indicator border-gold/80 bg-gold/10"
          : "border-casino-green/30"
      )}
    >
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span
            className={cn(
              "text-base font-bold",
              player.isCurrentPlayer ? "text-gold" : "text-white"
            )}
          >
            {player.name}
          </span>
          {player.isBidWinner && (
            <Crown className="w-4 h-4 text-gold animate-pulse" />
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          {isTeammateRevealed && (
            <div
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold",
                player.team === 1
                  ? "bg-gold text-casino-black shadow-lg"
                  : "bg-blue-500 text-white shadow-lg"
              )}
            >
              Team {player.team}
            </div>
          )}
          {player.isFirstPersonTeammate && (
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <Star className="w-3 h-3 fill-green-400" />
              Teammate
            </div>
          )}
        </div>

        <div className="text-gold font-bold text-sm">{player.score} pts</div>
      </div>
    </div>
  );
};
