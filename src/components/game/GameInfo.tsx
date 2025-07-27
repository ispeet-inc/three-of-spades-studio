import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, PlayingCard } from "./PlayingCard";
import { Suite } from "@/types/game";
import { suitSymbols, suitColors } from "@/utils/suiteUtils";

interface GameState {
  players: Array<{
    id: string;
    name: string;
    team: 1 | 2;
    cards: Card[];
    isCurrentPlayer?: boolean;
    isTeammate?: boolean;
    isTrump?: boolean;
  }>;
  currentTrick: Card[];
  trumpSuit: Suite;
  currentBid: number;
  round: number;
  teamScores: { team1: number; team2: number };
  teammateCard?: Card;
}

interface GameInfoProps {
  gameState: GameState;
}

export const GameInfo = ({ gameState }: GameInfoProps) => {
  return (
    <div className="bg-secondary/90 backdrop-blur border border-border/50 rounded-lg p-4 shadow-elevated">
      <h2 className="text-lg font-bold text-foreground mb-3">Three of Spades</h2>
      
      <div className="space-y-2 text-sm">
        {/* Trump Suit */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Trump:</span>
          <div className="flex items-center gap-1">
            <span className={cn("text-lg", suitColors[gameState.trumpSuit])}>
              {suitSymbols[gameState.trumpSuit]}
            </span>
            <span className="font-semibold capitalize">{gameState.trumpSuit}</span>
          </div>
        </div>

        {/* Teammate */}
        {gameState.teammateCard && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Teammate:</span>
            <Badge variant="outline" className="text-xs">
              {/* todo fix this! */}
              <PlayingCard card={gameState.teammateCard} mini />
            </Badge>
          </div>
        )}

        {/* Current Bid */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Bid:</span>
          <Badge className="bg-gold text-casino-black font-bold">
            {gameState.currentBid}
          </Badge>
        </div>

        {/* Round */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Round:</span>
          <span className="font-semibold">{gameState.round}</span>
        </div>
      </div>
    </div>
  );
};