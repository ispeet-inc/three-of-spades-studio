import { PlayingCard } from "./PlayingCard";
import { TableCard } from "@/types/game";
import { useAppSelector } from "@/hooks/useAppSelector";
import { GameStages } from "@/store/gameStages";

interface CenterTableProps {
  currentTrick: TableCard[];
  winner?: string
}

export const CenterTable = ({currentTrick, winner}: CenterTableProps) => {
  const { 
    stage, 
    showCardsPhase, 
    isCollectingCards, 
    collectionWinner, 
    roundWinner,
    playerNames 
  } = useAppSelector(state => state.game);
  
  return (<div className="relative">
    {/* Round Winner Announcement */}
    {(showCardsPhase || isCollectingCards) && roundWinner !== null && (
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-center w-72">
        <div className="text-lg text-gold font-bold animate-fade-in">
          {playerNames[roundWinner]} wins the trick!
        </div>
        {showCardsPhase && (
          <div className="text-sm text-casino-white/70 mt-1">
            {currentTrick.reduce((sum, card) => sum + card.points, 0)} points
          </div>
        )}
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

              const positions = {
                0: { // Bottom player
                  container: "absolute bottom-4 left-1/2 transform -translate-x-1/2",
                  cardClass: "",
                  collectionTarget: "translate-y-48 translate-x-0" // Move down to bottom player
                },
                1: { // Left player  
                  container: "absolute left-4 top-1/2 transform -translate-y-1/2",
                  cardClass: "",
                  collectionTarget: "translate-x-48 translate-y-0" // Move left to left player
                },
                2: { // Top player
                  container: "absolute top-4 left-1/2 transform -translate-x-1/2", 
                  cardClass: "",
                  collectionTarget: "-translate-y-48 translate-x-0" // Move up to top player
                },
                3: { // Right player
                  container: "absolute right-4 top-1/2 transform -translate-y-1/2",
                  cardClass: "",
                  collectionTarget: "-translate-x-48 translate-y-0" // Move right to right player
                }
              };

              const position = positions[playerIndex as keyof typeof positions];
              const animationDelay = `${playerIndex * 150}ms`;
              
              // Determine if this card should animate to the winner
              const isWinningCard = roundWinner !== null && playerIndex === roundWinner;
              const shouldCollectToWinner = isCollectingCards && collectionWinner !== null;
              
              // Get the collection target based on winner position
              const winnerPosition = collectionWinner !== null ? positions[collectionWinner as keyof typeof positions] : null;

              return (
                <div 
                  key={playerIndex}
                  className={`
                    ${position.container} 
                    transition-all duration-1500 ease-out
                    ${showCardsPhase ? 'animate-fade-in' : ''}
                    ${shouldCollectToWinner ? (winnerPosition ? winnerPosition.collectionTarget : '') + ' opacity-0 scale-75' : ''}
                    ${isWinningCard && showCardsPhase ? 'ring-2 ring-gold/60 ring-offset-2 ring-offset-felt-green-dark' : ''}
                  `}
                  style={{ 
                    animationDelay: showCardsPhase ? animationDelay : `${playerIndex * 50}ms`,
                  }}
                >
                  <PlayingCard 
                    card={playedCard} 
                    className={`
                      shadow-elevated transition-all duration-300
                      ${!isCollectingCards ? 'hover:scale-105' : ''}
                      ${isWinningCard && showCardsPhase ? 'scale-105' : ''}
                      ${position.cardClass}
                    `}
                  />
                </div>
              );
            })
        }

        {/* Points Award Animation */}
        {isCollectingCards && collectionWinner !== null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-2xl font-bold text-gold animate-scale-in">
              +{currentTrick.reduce((sum, card) => sum + card.points, 0)}
            </div>
          </div>
        )}
      </div>
    </div>

  </div>);
}