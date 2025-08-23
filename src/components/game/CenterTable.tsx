import { useAppSelector } from "@/hooks/useAppSelector";
import {
  selectCollectionWinner,
  selectIsCollectingCards,
  selectShowCardsPhase,
} from "@/store/selectors";
import { TableCard } from "@/types/game";
import { FIRST_PLAYER_ID, NUM_PLAYERS, TIMINGS } from "@/utils/constants";
import { useEffect, useState } from "react";
import { PlayingCard } from "./PlayingCard";

interface CenterTableProps {
  currentTrick: TableCard[];
  winner?: string;
  roundWinner?: number | null;
  playerNames?: Record<number, string>;
}

export const CenterTable = ({
  currentTrick,
  winner,
  roundWinner = null,
  playerNames = {},
}: CenterTableProps) => {
  const [showPoints, setShowPoints] = useState(false);

  // Use selectors directly instead of props
  const isCollectingCards = useAppSelector(selectIsCollectingCards);
  const showCardsPhase = useAppSelector(selectShowCardsPhase);
  const collectionWinner = useAppSelector(selectCollectionWinner);

  useEffect(() => {
    if (isCollectingCards && collectionWinner !== null) {
      // Show points indicator after animation starts
      const timer = setTimeout(
        () => setShowPoints(true),
        TIMINGS.collectionAnimationMs
      );
      return () => clearTimeout(timer);
    } else {
      setShowPoints(false);
    }
  }, [isCollectingCards, collectionWinner]);

  // Calculate points from current trick
  const trickPoints = currentTrick.reduce((sum, card) => sum + card.points, 0);

  return (
    <div className="relative">
      {/* Winner Announcement */}
      {(winner || (showCardsPhase && roundWinner !== null)) && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center w-72">
          <div className="text-s text-gold/70 font-medium">
            {winner || playerNames[roundWinner as number] + " won the round!"}
          </div>
        </div>
      )}

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
          {currentTrick.length > 0 &&
            currentTrick.map(playedCard => {
              if (!playedCard) return null;
              const playerIndex = playedCard.player;
              const isWinningCard = roundWinner === playerIndex;

              const playerPositions = {
                [FIRST_PLAYER_ID]: {
                  // Bottom player
                  container:
                    "absolute bottom-4 left-1/2 transform -translate-x-1/2",
                  cardClass: "",
                  collectionTarget: "translate-y-[280px] translate-x-0", // Bottom
                },
                [(FIRST_PLAYER_ID + 1) % NUM_PLAYERS]: {
                  // Left player
                  container:
                    "absolute left-4 top-1/2 transform -translate-y-1/2",
                  cardClass: "",
                  collectionTarget: "translate-x-[-280px] translate-y-0", // Left
                },
                [(FIRST_PLAYER_ID + 2) % NUM_PLAYERS]: {
                  // Top player
                  container:
                    "absolute top-4 left-1/2 transform -translate-x-1/2",
                  cardClass: "",
                  collectionTarget: "translate-y-[-280px] translate-x-0", // Top
                },
                [(FIRST_PLAYER_ID + 3) % NUM_PLAYERS]: {
                  // Right player
                  container:
                    "absolute right-4 top-1/2 transform -translate-y-1/2",
                  cardClass: "",
                  collectionTarget: "translate-x-[280px] translate-y-0", // Right
                },
              };

              const position =
                playerPositions[playerIndex as keyof typeof playerPositions];
              const animationDelay = `${playerIndex * TIMINGS.dealingStaggerMs}ms`;
              const collectionDelay = `${playerIndex * 50}ms`;

              // Determine card styling based on game state
              let cardClassName = `shadow-elevated transition-all duration-200 ${position.cardClass}`;

              if (isCollectingCards && collectionWinner !== null) {
                // Collection animation
                const targetTransform =
                  playerPositions[
                    collectionWinner as keyof typeof playerPositions
                  ].collectionTarget;
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
                    animationDelay: isCollectingCards
                      ? collectionDelay
                      : animationDelay,
                  }}
                >
                  <PlayingCard card={playedCard} className={cardClassName} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
