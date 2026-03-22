import { cn } from "@/lib/utils";
import { TeamScores as TeamScoresType } from "@/types/game";

interface TeamScoresDisplayProps {
  scores: TeamScoresType;
  animateScore: Record<keyof TeamScoresType, boolean>;
  isTeammateRevealed: boolean;
  /** Mobile-responsive: use compact layout */
  compact?: boolean;
}

export const TeamScoresDisplay = ({
  scores,
  animateScore,
  isTeammateRevealed,
  compact = false,
}: TeamScoresDisplayProps) => {
  if (!isTeammateRevealed) {
    return null;
  }

  if (compact) {
    return (
      <>
        <div
          className="bg-gradient-gold text-casino-black px-2 py-1 rounded-lg shadow-elevated border border-gold-dark"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div
              className={cn(
                "text-sm font-bold",
                animateScore.team1 && "animate-score-update"
              )}
              aria-label={`Team 1 score: ${scores.team1} points`}
            >
              {scores.team1}
            </div>
            <div className="text-[8px]">T1</div>
          </div>
        </div>
        <div
          className="bg-blue-500 text-white px-2 py-1 rounded-lg shadow-elevated border border-blue-600"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div
              className={cn(
                "text-sm font-bold",
                animateScore.team2 && "animate-score-update"
              )}
              aria-label={`Team 2 score: ${scores.team2} points`}
            >
              {scores.team2}
            </div>
            <div className="text-[8px]">T2</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="bg-gradient-gold text-casino-black px-6 py-3 rounded-xl shadow-elevated border border-gold-dark"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div
            className={cn(
              "text-2xl font-bold",
              animateScore.team1 && "animate-score-update"
            )}
            aria-label={`Team 1 score: ${scores.team1} points`}
          >
            {scores.team1}
          </div>
          <div className="text-sm">Team 1</div>
        </div>
      </div>
      <div
        className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow-elevated border border-blue-600"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div
            className={cn(
              "text-2xl font-bold",
              animateScore.team2 && "animate-score-update"
            )}
            aria-label={`Team 2 score: ${scores.team2} points`}
          >
            {scores.team2}
          </div>
          <div className="text-sm">Team 2</div>
        </div>
      </div>
    </>
  );
};
