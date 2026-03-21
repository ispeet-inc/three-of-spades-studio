import { PlayingCard } from "./PlayingCard";
import { TableCard } from "@/types/game";
import { useEffect, useState } from "react";
import { TIMINGS } from "@/utils/constants";
import { cn } from "@/lib/utils";

interface CenterTableProps {
  currentTrick: TableCard[];
  winner?: string;
  isCollectingCards?: boolean;
  showCardsPhase?: boolean;
  collectionWinner?: number | null;
  roundWinner?: number | null;
  playerNames?: Record<number, string>;
  compact?: boolean;
}

export const CenterTable = ({
  currentTrick, 
  winner, 
  isCollectingCards = false, 
  showCardsPhase = false, 
  collectionWinner = null,
  roundWinner = null,
  playerNames = {},
  compact = false
}: CenterTableProps) => {
  
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    if (isCollectingCards && collectionWinner !== null) {
      // Show points indicator after animation starts
      const timer = setTimeout(() => setShowPoints(true), TIMINGS.collectionAnimationMs);
      return () => clearTimeout(timer);
    } else {
      setShowPoints(false);
    }
  }, [isCollectingCards, collectionWinner]);
  
  // Calculate points from current trick
  const trickPoints = currentTrick.reduce((sum, card) => sum + card.points, 0);

  const circleSize = compact ? "w-44 h-44 sm:w-80 sm:h-80" : "w-80 h-80";
  
  return (<div className="relative">
    {/* Winner Announcement */}
    {(winner || (showCardsPhase && roundWinner !== null)) && 
      <div className={cn(
        "absolute left-1/2 transform -translate-x-1/2 text-center",
        compact ? "-top-10 w-48" : "-top-16 w-72"
      )}>
        <div className={cn(
          "text-gold/70 font-medium",
          compact ? "text-xs" : "text-s"
        )}>
          {winner || (playerNames[roundWinner!] + " won the round!")}
        </div>
      </div>
    }

    {/* Points Indicator during collection */}
    {showPoints && collectionWinner !== null && trickPoints > 0 && (
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className={cn(
          "font-bold text-gold animate-fade-in",
          compact ? "text-sm" : "text-xl"
        )}>
          +{trickPoints} points
        </div>
      </div>
    )}

    {/* Playing Area Circle */}
    <div 
      className={cn(
        "rounded-full bg-gradient-to-br from-felt-green-light/30 to-felt-green-dark/60 border-4 border-gold/40 flex items-center justify-center shadow-elevated backdrop-blur-sm",
        circleSize
      )}
      role="region"
      aria-label={`Current trick: ${currentTrick.length} of 4 cards played`}
      aria-live="polite"
    >
      
      {/* Current Trick Cards - Positioned by Player */}
      <div className="relative w-full h-full">
        {/* Diamond Pattern Card Display */}
        {currentTrick.length > 0 && currentTrick.map((playedCard) => {
              if (!playedCard) return null;
              const playerIndex = playedCard.player;
              const isWinningCard = roundWinner === playerIndex;

              // Positions adapt based on compact mode
              const positions = compact ? {
                0: { // Bottom player
                  container: "absolute bottom-1 left-1/2 transform -translate-x-1/2",
                  cardClass: ""
                },
                1: { // Left player  
                  container: "absolute left-1 top-1/2 transform -translate-y-1/2",
                  cardClass: ""
                },
                2: { // Top player
                  container: "absolute top-1 left-1/2 transform -translate-x-1/2", 
                  cardClass: ""
                },
                3: { // Right player
                  container: "absolute right-1 top-1/2 transform -translate-y-1/2",
                  cardClass: ""
                }
              } : {
                0: { // Bottom player
                  container: "absolute bottom-4 left-1/2 transform -translate-x-1/2",
                  cardClass: ""
                },
                1: { // Left player  
                  container: "absolute left-4 top-1/2 transform -translate-y-1/2",
                  cardClass: ""
                },
                2: { // Top player
                  container: "absolute top-4 left-1/2 transform -translate-x-1/2", 
                  cardClass: ""
                },
                3: { // Right player
                  container: "absolute right-4 top-1/2 transform -translate-y-1/2",
                  cardClass: ""
                }
              };

              // Target positions for collection animation (winner's area)
              const collectionTargets = compact ? {
                0: "translate-y-[160px] translate-x-0", // Bottom
                1: "translate-x-[-160px] translate-y-0", // Left
                2: "translate-y-[-160px] translate-x-0", // Top
                3: "translate-x-[160px] translate-y-0", // Right
              } : {
                0: "translate-y-[280px] translate-x-0", // Bottom
                1: "translate-x-[-280px] translate-y-0", // Left
                2: "translate-y-[-280px] translate-x-0", // Top
                3: "translate-x-[280px] translate-y-0", // Right
              };

              const position = positions[playerIndex as keyof typeof positions];
              const animationDelay = `${playerIndex * TIMINGS.dealingStaggerMs}ms`;
              const collectionDelay = `${playerIndex * 50}ms`;

              // Determine card styling based on game state
              let cardClassName = `shadow-elevated transition-all duration-200 ${position.cardClass}`;
              
              if (isCollectingCards && collectionWinner !== null) {
                // Collection animation
                const targetTransform = collectionTargets[collectionWinner as keyof typeof collectionTargets];
                cardClassName += ` transform ${targetTransform} scale-75 opacity-0 duration-[${TIMINGS.collectionAnimationMs}ms]`;
              } else if (showCardsPhase && isWinningCard) {
                // Highlight winning card during display phase
                cardClassName += ` ring-2 ring-gold/60 shadow-[0_0_20px_rgba(255,215,0,0.4)] scale-105`;
              } else {
                cardClassName += ` hover:scale-105`;
              }

              return (
                <div 
                  key={playerIndex}
                  className={`${position.container} animate-fade-in`}
                  style={{ 
                    animationDelay: isCollectingCards ? collectionDelay : animationDelay 
                  }}
                >
                  <PlayingCard 
                    card={playedCard} 
                    size={compact ? 'sm' : 'md'}
                    className={cardClassName}
                  />
                </div>
              );
            })
        }
      </div>
    </div>

  </div>);
}
