import { cn } from "@/lib/utils";
import { Card, PlayerDisplayData, Suite } from "@/types/game";
import { PlayerPosition } from "@/utils/positionUtils";
import { PlayerInfo } from "./PlayerInfo";
import { PlayingCard } from "./PlayingCard";

interface PlayerAreaProps {
  player: PlayerDisplayData;
  runningSuite: Suite | null;
  position: PlayerPosition;
  onCardPlay?: (card: Card) => void;
  isDealing?: boolean;
  botCardsHidden?: boolean;
  isObserver?: boolean;
  viewerIndex?: number;
  isTeammateRevealed: boolean;
  /** Mobile-responsive: use compact layout */
  compact?: boolean;
  /** Landscape phone mode - extra tight */
  isLandscape?: boolean;
}

export const PlayerArea = ({
  player,
  runningSuite,
  position,
  onCardPlay,
  isDealing = false,
  botCardsHidden = false,
  isObserver = false,
  viewerIndex = 3,
  isTeammateRevealed = false,
  compact = false,
  isLandscape = false,
}: PlayerAreaProps) => {
  // SIMPLIFIED: Derive values inline where needed
  const isHuman = position === "bottom" && !isObserver;
  const isViewerPosition = player.id === `player-${viewerIndex}`;

  const isVertical = position === "left" || position === "right";

  const getPositionStyles = () => {
    switch (position) {
      case "bottom":
        return {
          container: "flex-col items-center",
          cardContainer: "flex-row justify-center",
          playerInfoOrder: "order-2",
          cardsOrder: "order-1",
        };
      case "top":
        return {
          container: "flex-col items-center",
          cardContainer: "flex-row justify-center",
          playerInfoOrder: "order-1",
          cardsOrder: "order-2",
        };
      case "left":
        return {
          container: "flex-row items-center",
          cardContainer: "flex-col justify-center",
          playerInfoOrder: "order-1",
          cardsOrder: "order-2",
        };
      case "right":
        return {
          container: "flex-row-reverse items-center",
          cardContainer: "flex-col justify-center",
          playerInfoOrder: "order-2",
          cardsOrder: "order-1",
        };
      default:
        return {
          container: "flex-col items-center",
          cardContainer: "flex-row justify-center",
          playerInfoOrder: "order-2",
          cardsOrder: "order-1",
        };
    }
  };

  // Function to determine if a card is playable
  const isCardPlayable = (
    hand: Array<Card>,
    card: Card,
    runningSuite: Suite | null
  ) => {
    if (runningSuite != null) {
      // Check if player has any cards of the running suite
      const hasRunningSuite = hand.some(card => card.suite === runningSuite);
      // If there's a running suite and player has cards of that suite,
      // they must play a card of that suite
      if (hasRunningSuite) {
        return card.suite === runningSuite;
      }
    }
    return true;
  };

  // Card overlap amounts based on compact mode and landscape
  const getCardOverlap = () => {
    if (isLandscape) {
      return {
        humanFan: "-ml-4",      // tighter overlap for landscape hand
        botHorizontal: "-ml-2.5",
        botVertical: "-mt-2.5",
        backHorizontal: "-ml-2.5",
        backVertical: "-mt-2.5",
        backSize: "w-4 h-7",   // smaller card backs in landscape
      };
    }
    if (compact) {
      return {
        humanFan: "-ml-3",
        botHorizontal: "-ml-2",
        botVertical: "-mt-2",
        backHorizontal: "-ml-2",
        backVertical: "-mt-2",
        backSize: "w-5 h-8",
      };
    }
    return {
      humanFan: "-ml-4",
      botHorizontal: "-ml-3",
      botVertical: "-mt-3",
      backHorizontal: "-ml-3",
      backVertical: "-mt-3",
      backSize: "w-8 h-12",
    };
  };

  const overlap = getCardOverlap();

  return (
    <div className={cn(
      "flex",
      isLandscape ? "gap-0.5" : compact ? "gap-1" : "gap-4",
      getPositionStyles().container
    )}>
      {/* Player Info */}
      <PlayerInfo
        player={player}
        isTeammateRevealed={isTeammateRevealed}
        compact={compact}
        isLandscape={isLandscape}
        className={cn(
          isLandscape
            ? (isVertical ? "min-w-[56px]" : "")
            : compact
              ? (isVertical ? "min-w-[70px]" : "")
              : (isVertical ? "min-w-[120px]" : "min-h-[120px]"),
          getPositionStyles().playerInfoOrder
        )}
      />

      {/* SIMPLIFIED: Cards with unified logic */}
      <div
        className={cn(
          "flex gap-0",
          getPositionStyles().cardContainer,
          getPositionStyles().cardsOrder
        )}
      >
        {player.hand.map((card, index) => {
          const shouldShowCardsFaceUp =
            isHuman || (isObserver && isViewerPosition);
          const isInteractive = isHuman && !isObserver;
          const dealDelay = isDealing ? index * 150 : 0;

          if (shouldShowCardsFaceUp) {
            // Show face-up card (human player or observed player in observer mode)
            return (
              <PlayingCard
                key={`card-${index}`}
                card={card}
                mini={position !== "bottom"}
                compact={compact}
                isLandscape={isLandscape}
                isPlayable={isInteractive && player.isCurrentPlayer}
                onClick={
                  isInteractive &&
                  player.isCurrentPlayer &&
                  isCardPlayable(player.hand, card, runningSuite)
                    ? () => onCardPlay?.(card)
                    : undefined
                }
                dealAnimation={isDealing}
                dealDelay={dealDelay}
                playerPosition={position}
                className={cn(
                  isHuman && index > 0 && overlap.humanFan,
                  !isHuman && index > 0 && (isVertical ? overlap.botVertical : overlap.botHorizontal),
                  "transition-all duration-300"
                )}
              />
            );
          } else {
            // Show card back (bot players or hidden cards)
            return (
              <div
                key={`card-back-${index}`}
                className={cn(
                  "relative bg-gradient-to-br from-accent to-accent-dark rounded-lg shadow-card",
                  overlap.backSize,
                  index > 0 && (isVertical ? overlap.backVertical : overlap.backHorizontal),
                  "transition-all duration-300",
                  isDealing &&
                    "animate-[deal-to-" + position + "_0.8s_ease-out_forwards]"
                )}
                style={{
                  animationDelay: isDealing ? `${dealDelay}ms` : undefined,
                }}
              >
                <div className="absolute inset-0.5 bg-gradient-to-br from-primary-light to-primary rounded border border-primary-light/20">
                  <div className="w-full h-full bg-gradient-to-br from-accent-subtle to-accent rounded-sm opacity-80" />
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
