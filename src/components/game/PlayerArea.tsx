import { cn } from "@/lib/utils";
import { PlayingCard, Card } from "./PlayingCard";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: string;
  name: string;
  team: 1 | 2;
  cards: Card[];
  isCurrentPlayer?: boolean;
  isTeammate?: boolean;
  isTrump?: boolean;
}

interface PlayerAreaProps {
  player: Player;
  position: 'top' | 'left' | 'right' | 'bottom';
  onCardClick?: (card: Card) => void;
  showCards?: boolean;
}

export const PlayerArea = ({ 
  player, 
  position, 
  onCardClick, 
  showCards = false 
}: PlayerAreaProps) => {
  const isBottomPlayer = position === 'bottom';
  const cardCount = player.cards.length;

  const positionClasses = {
    top: 'justify-center items-start',
    left: 'justify-start items-center flex-col',
    right: 'justify-end items-center flex-col',
    bottom: 'justify-center items-end'
  };

  const cardContainerClasses = {
    top: 'flex-row',
    left: 'flex-col',
    right: 'flex-col', 
    bottom: 'flex-row'
  };

  const playerInfoClasses = {
    top: 'mb-2',
    left: 'mb-4 rotate-90',
    right: 'mb-4 -rotate-90',
    bottom: 'mt-2'
  };

  return (
    <div className={cn("flex", positionClasses[position])}>
      {/* Player Info */}
      <div className={cn("flex items-center gap-2 z-10", playerInfoClasses[position])}>
        <div className={cn(
          "px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-300 backdrop-blur-sm",
          {
            "bg-gradient-gold text-casino-black border-gold shadow-glow animate-glow-pulse": player.isCurrentPlayer,
            "bg-felt-green-light/80 text-gold border-gold/50": !player.isCurrentPlayer,
            "ring-2 ring-blue-400/50": player.isTeammate
          }
        )}>
          <span className="font-ui font-medium">{player.name}</span>
        </div>
        
        <Badge 
          variant={player.team === 1 ? "default" : "secondary"}
          className={cn(
            "text-xs font-semibold border",
            player.team === 1 
              ? "bg-gradient-gold text-casino-black border-gold-dark" 
              : "bg-blue-500/90 text-white border-blue-600"
          )}
        >
          Team {player.team}
        </Badge>
        
        {player.isTrump && (
          <Badge className="bg-casino-red/90 text-white text-xs animate-glow-pulse border border-casino-red">
            👑 Trump
          </Badge>
        )}
      </div>

      {/* Cards */}
      <div className={cn("flex gap-1", cardContainerClasses[position])}>
        {player.cards.map((card, index) => {
          const shouldShowCard = isBottomPlayer || showCards;
          const rotation = position === 'left' ? 90 : position === 'right' ? -90 : 0;
          
          return (
            <div
              key={`${card.id}-${index}`}
              className={cn("transition-all duration-300", {
                "hover:-translate-y-2": isBottomPlayer,
                "-ml-3": position === 'bottom' && index > 0,
                "-mt-3": (position === 'left' || position === 'right') && index > 0,
              })}
              style={{
                transform: `rotate(${rotation}deg)`,
                zIndex: index,
                animationDelay: `${index * 100}ms`
              }}
            >
              <PlayingCard
                card={shouldShowCard ? card : undefined}
                hidden={!shouldShowCard}
                onClick={() => onCardClick?.(card)}
                isPlayable={isBottomPlayer}
              />
            </div>
          );
        })}
      </div>

      {/* Card count for hidden hands */}
      {!showCards && !isBottomPlayer && (
        <div className={cn(
          "text-xs text-muted-foreground mt-1 px-2 py-1 bg-muted/50 rounded",
          position === 'left' || position === 'right' ? 'rotate-0' : ''
        )}>
          {cardCount} cards
        </div>
      )}
    </div>
  );
};