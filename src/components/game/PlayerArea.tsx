import { cn } from "@/lib/utils";
import { PlayingCard } from "./PlayingCard";
import { Card, Suite } from "@/types/game";

interface PlayerAreaProps {
  player: {
    id: string;
    name: string;
    team: 1 | 2;
    cards: Card[];
    isCurrentPlayer?: boolean;
    isTeammate?: boolean;
    isBidder?: boolean;
  };
  runningSuite?: Suite,
  position: 'bottom' | 'left' | 'top' | 'right';
  onCardPlay?: (card: Card) => void;
  isDealing?: boolean;
  botCardsHidden?: boolean;
  compact?: boolean;
}

export const PlayerArea = ({ 
  player, 
  runningSuite,
  position, 
  onCardPlay,
  isDealing = false,
  botCardsHidden = false,
  compact = false
}: PlayerAreaProps) => {
  const isHuman = position === 'bottom';
  const isVertical = position === 'left' || position === 'right';

  // Turn indicator animation
  const turnIndicatorClass = player.isCurrentPlayer 
    ? "animate-turn-indicator border-gold/80 bg-gold/10" 
    : "border-casino-green/30";

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'flex-col items-center';
      case 'top':
        return 'flex-col items-center';
      case 'left':
        return 'flex-row items-center';
      case 'right':
        return 'flex-row-reverse items-center';
      default:
        return 'flex-col items-center';
    }
  };

  const getCardContainerClasses = () => {
    switch (position) {
      case 'bottom':
        return 'flex-row justify-center';
      case 'top':
        return 'flex-row justify-center';
      case 'left':
        return 'flex-col justify-center';
      case 'right':
        return 'flex-col justify-center';
      default:
        return 'flex-row justify-center';
    }
  };

  const getPlayerInfoOrder = () => {
    switch (position) {
      case 'bottom':
        return 'order-2';
      case 'top':
        return 'order-1';
      case 'left':
        return 'order-1';
      case 'right':
        return 'order-2';
      default:
        return 'order-2';
    }
  };

  const getCardsOrder = () => {
    switch (position) {
      case 'bottom':
        return 'order-1';
      case 'top':
        return 'order-2';
      case 'left':
        return 'order-2';
      case 'right':
        return 'order-1';
      default:
        return 'order-1';
    }
  };

  // Function to determine if a card is playable
  const isCardPlayable = (hand: Array<Card>, card: Card, runningSuite: Suite) => {

    if(runningSuite != null) {
      // Check if player has any cards of the running suite
      const hasRunningSuite = hand.some((card) => card.suite === runningSuite);
      // If there's a running suite and player has cards of that suite,
      // they must play a card of that suite
      if (hasRunningSuite) {
        return card.suite === runningSuite;
      }
    }
    return true;
  };

  // Card overlap amount based on compact mode and position
  const getCardOverlap = () => {
    if (compact) {
      if (isHuman) return "-ml-5"; // Tighter fan for human on mobile
      return isVertical ? "-mt-4" : "-ml-4";
    }
    if (isHuman) return "-ml-4";
    return isVertical ? "-mt-3" : "-ml-3";
  };

  // Bot card size on mobile
  const botCardSize = compact ? "w-6 h-9" : "w-8 h-12";
  const botCardOverlap = compact 
    ? (isVertical ? "-mt-4" : "-ml-4") 
    : (isVertical ? "-mt-3" : "-ml-3");

  return (
    <div className={cn(
      "flex",
      compact ? "gap-1.5" : "gap-4",
      getPositionClasses()
    )}>
      {/* Player Info */}
      <div className={cn(
        "relative rounded-xl border-2 transition-all duration-500",
        "bg-casino-green/20 backdrop-blur-sm",
        turnIndicatorClass,
        compact ? "p-1.5" : "p-4",
        compact 
          ? (isVertical ? "min-w-[60px]" : "min-h-[auto]")
          : (isVertical ? "min-w-[120px]" : "min-h-[120px]"),
        getPlayerInfoOrder()
      )}>
        <div className="text-center">
          <div className={cn(
            "font-bold mb-0.5",
            compact ? "text-[10px]" : "text-sm",
            player.isCurrentPlayer ? "text-gold" : "text-casino-white"
          )}>
            {compact ? player.name.split(' ')[0] : player.name} {player.isBidder && <span
              role="img"
              aria-label="Bid Winner"
            >
              👑
            </span>}
          </div>
          <div className={cn(
            "px-1.5 py-0.5 rounded-full",
            compact ? "text-[9px]" : "text-xs",
            player.team === 1 ? "bg-gold/20 text-gold" : "bg-blue-500/20 text-blue-300"
          )}>
            T{player.team}
          </div>
          {player.isTeammate && !compact && (
            <div className="text-xs text-green-400 mt-1">★ Teammate</div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className={cn(
        "flex gap-0",
        getCardContainerClasses(),
        getCardsOrder()
      )}>
        {isHuman ? (
          // Human player cards (all visible and playable)
          <>
            {player.cards.map((card, index) => {
              const dealDelay = isDealing ? index * 150 : 0;
              
              return (
                <PlayingCard
                  key={`${card.id}-${index}`}
                  card={card}
                  mini={false}
                  size={compact ? 'sm' : 'md'}
                  isPlayable={isHuman && player.isCurrentPlayer}
                  onClick={isHuman && player.isCurrentPlayer && isCardPlayable(player.cards, card, runningSuite) ? () => onCardPlay?.(card) : undefined}
                  dealAnimation={isDealing}
                  dealDelay={dealDelay}
                  playerPosition={position}
                  className={cn(
                    index > 0 && getCardOverlap(),
                    "transition-all duration-300"
                  )}
                />
              );
            })}
          </>
        ) : botCardsHidden ? (
          // Bot player cards (completely hidden)
          <div className={cn(
            "text-casino-white/60 rounded bg-casino-black/20",
            compact ? "text-[9px] p-1" : "text-xs p-2"
          )}>
            Hidden
          </div>
        ) : (
          // Bot player cards (back cards visible)
          <>
            {player.cards.map((card, index) => {
              const dealDelay = isDealing ? index * 150 : 0;
              
              return (
                <div
                  key={`bot-card-${index}`}
                  className={cn(
                    "relative bg-gradient-to-br from-accent to-accent-dark rounded-lg shadow-card",
                    botCardSize,
                    index > 0 && botCardOverlap,
                    "transition-all duration-300",
                    isDealing && "animate-[deal-to-" + position + "_0.8s_ease-out_forwards]"
                  )}
                  style={{
                    animationDelay: isDealing ? `${dealDelay}ms` : undefined
                  }}
                >
                  <div className="absolute inset-0.5 bg-gradient-to-br from-primary-light to-primary rounded border border-primary-light/20">
                    <div className="w-full h-full bg-gradient-to-br from-accent-subtle to-accent rounded-sm opacity-80" />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
