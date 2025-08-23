import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Suite } from "@/types/game";
import { getSuiteColor, getSuiteIcon } from "@/utils/suiteUtils";
import { Card, PlayingCard } from "./PlayingCard";

interface GameInfoProps {
  trumpSuit: Suite;
  bidAmount: number;
  round: number;
  teammateCard?: Card;
}

export const GameInfo = (props: GameInfoProps) => {
  return (
    <div className="bg-secondary/90 backdrop-blur border border-border/50 rounded-lg p-4 shadow-elevated">
      <h2 className="text-lg font-bold text-foreground mb-3">
        Three of Spades
      </h2>

      <div className="space-y-2 text-sm">
        {/* Trump Suit */}
        {props.trumpSuit !== null && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Trump:</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="bg-white text-s">
                <span
                  className={cn(
                    "text-lg",
                    `text-casino-${getSuiteColor(props.trumpSuit)}`
                  )}
                >
                  {getSuiteIcon(props.trumpSuit)}
                </span>
              </Badge>
            </div>
          </div>
        )}

        {/* Teammate */}
        {props.teammateCard && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Teammate:</span>
            <PlayingCard card={props.teammateCard} mini />
          </div>
        )}

        {/* Current Bid */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Bid:</span>
          <Badge className="bg-gold text-casino-black font-bold">
            {props.bidAmount}
          </Badge>
        </div>

        {/* Round */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Round:</span>
          <span className="font-semibold">{props.round}</span>
        </div>
      </div>
    </div>
  );
};
