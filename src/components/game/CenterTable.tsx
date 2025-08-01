import { PlayingCard } from "./PlayingCard";
import { TableCard } from "@/types/game";

interface CenterTableProps {
  currentTrick: TableCard[];
  round: number;
}

export const CenterTable = ({currentTrick, round}: CenterTableProps) => {

  return (<div className="relative">
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

              const position = positions[playerIndex as keyof typeof positions];
              const animationDelay = `${playerIndex * 150}ms`;

              return (
                <div 
                  key={playerIndex}
                  className={`${position.container} animate-fade-in`}
                  style={{ animationDelay }}
                >
                  <PlayingCard 
                    card={playedCard} 
                    className={`shadow-elevated hover:scale-105 transition-transform duration-200 ${position.cardClass}`}
                  />
                </div>
              );
            })
        }
      </div>
    </div>

    {/* Game Title */}
    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
      <div className="text-sm text-gold/70 font-medium">
        Round {round}
      </div>
    </div>
  </div>);
}