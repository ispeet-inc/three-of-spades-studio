import { cn } from "@/lib/utils";

interface SeriesProgressBarProps {
  currentGame: number;
  totalGames: number;
  className?: string;
}

export const SeriesProgressBar: React.FC<SeriesProgressBarProps> = ({
  currentGame,
  totalGames,
  className,
}) => {
  return (
    <div className={cn("space-y-2 pb-2 border-b border-border/30", className)}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Series:</span>
        <span className="text-gold font-semibold">
          {currentGame} of {totalGames}
        </span>
      </div>
      {/* Minimal progress bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentGame / totalGames) * 100}%` }}
        />
      </div>
    </div>
  );
};
