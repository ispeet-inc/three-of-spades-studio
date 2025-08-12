import { PlayingCard } from "./PlayingCard";
import { TableCard } from "@/types/game";
import { useEffect, useState } from "react";

interface CenterTableProps {
  currentTrick: TableCard[];
  winner?: string;
  isCollectingCards?: boolean;
  showCardsPhase?: boolean;
  collectionWinner?: number | null;
  roundWinner?: number | null;
  playerNames?: Record<number, string>;
}

export const CenterTable = ({
  currentTrick, 
  winner, 
  isCollectingCards = false, 
  showCardsPhase = false, 
  collectionWinner = null,
  roundWinner = null,
  playerNames = {}
}: CenterTableProps) => {
  
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    if (isCollectingCards && collectionWinner !== null) {
      // Show points indicator after animation starts
      const timer = setTimeout(() => setShowPoints(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowPoints(false);
    }
  }, [isCollectingCards, collectionWinner]);
  
  // Calculate points from current trick
  const trickPoints = currentTrick.reduce((sum, card) => sum + card.points, 0);
  
  return (<div className="relative">
    {/* Winner Announcement */}
    {(winner || (showCardsPhase && roundWinner !== null)) && 
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center w-72">
        <div className="text-s text-gold/70 font-medium">
          {winner || (playerNames[roundWinner!] + " won the round!")}
        </div>
      </div>
    }

    {/* Points Indicator during collection */}
    {showPoints && collectionWinner !== null && trickPoints > 0 && (
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xl font-bold text-gold animate-fade-in">
          +{trickPoints} points
        </div>
      </div>
    )}

    {/* Playing Area Circle */}
    <div 
      className="w-80 h-80 rounded-full bg-gradient-to-br from-felt-green-light/30 to-felt-green-dark/60 border-4 border-gold/40 flex items-center justify-center shadow-elevated backdrop-blur-sm"
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

              const positions = {
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
              const collectionTargets = {
                0: "translate-y-[280px] translate-x-0", // Bottom
                1: "translate-x-[-280px] translate-y-0", // Left
                2: "translate-y-[-280px] translate-x-0", // Top
                3: "translate-x-[280px] translate-y-0", // Right
              };

              const position = positions[playerIndex as keyof typeof positions];
              const animationDelay = `${playerIndex * 150}ms`;
              const collectionDelay = `${playerIndex * 50}ms`;

              // Determine card styling based on game state
              let cardClassName = `shadow-elevated transition-all duration-200 ${position.cardClass}`;
              
              if (isCollectingCards && collectionWinner !== null) {
                // Collection animation
                const targetTransform = collectionTargets[collectionWinner as keyof typeof collectionTargets];
                cardClassName += ` transform ${targetTransform} scale-75 opacity-0 duration-2000`;
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