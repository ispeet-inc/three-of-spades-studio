import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSuiteColor, getSuiteIcon } from "@/utils/suiteUtils";
import { GameConfig, SeriesProgress } from "../../types/game";
import { SeriesProgressBar } from "../ui/series-progress";
import { PlayingCard } from "./PlayingCard";

interface GameInfoProps {
  gameConfig: GameConfig | null;
  trick: number;
  isSeries: boolean;
  seriesProgress: SeriesProgress | null;
}

export const GameInfo = (props: GameInfoProps) => {
  if (!props.gameConfig) {
    return null;
  }
  const { trumpSuite, teammateCard, bidAmount } = props.gameConfig;
  return (
    <div className="bg-secondary/90 backdrop-blur border border-border/50 rounded-lg p-4 shadow-elevated">
      <h2 className="text-lg font-bold text-foreground mb-3">
        Three of Spades
      </h2>

      <div className="space-y-2 text-sm">
        {/* Series Progress - Using the new component */}
        {props.isSeries &&
          props.seriesProgress &&
          props.seriesProgress.totalGames > 1 && (
            <SeriesProgressBar
              currentGame={props.seriesProgress.currentGame}
              totalGames={props.seriesProgress.totalGames}
            />
          )}

        {/* Trump Suit */}
        {trumpSuite !== null && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Trump:</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="bg-white text-s">
                <span
                  className={cn(
                    "text-lg",
                    `text-casino-${getSuiteColor(trumpSuite)}`
                  )}
                >
                  {getSuiteIcon(trumpSuite)}
                </span>
              </Badge>
            </div>
          </div>
        )}

        {/* Teammate */}
        {teammateCard && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Teammate:</span>
            <PlayingCard card={teammateCard} mini />
          </div>
        )}

        {/* Current Bid */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Bid:</span>
          <Badge className="bg-gold text-casino-black font-bold">
            {bidAmount}
          </Badge>
        </div>
      </div>
    </div>
  );
};
