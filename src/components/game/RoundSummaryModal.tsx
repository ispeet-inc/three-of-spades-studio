import { useAppSelector } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayingCard } from "./PlayingCard";
import { Trophy, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoundSummaryModalProps {
  onClose: () => void;
}

export const RoundSummaryModal = ({ onClose }: RoundSummaryModalProps) => {
  const { tableCards, roundWinner, playerNames, players, scores, round } = useAppSelector(state => state.game);
  
  // Get the last 4 cards played in this round
  const currentRoundCards = tableCards.slice(-4);
  const winnerName = roundWinner !== null ? playerNames[roundWinner] : 'Unknown';

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center mb-3 sm:mb-6">
          <DialogTitle className="text-xl sm:text-3xl font-casino text-gold mb-1 sm:mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-gold animate-pulse" />
            Round {round} Complete
            <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-gold animate-pulse" />
          </DialogTitle>
          <div className="w-16 sm:w-20 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-6">
          {/* Winner Announcement */}
          <div className="text-center bg-gradient-to-r from-gold/20 to-gold/10 rounded-xl sm:rounded-2xl p-3 sm:p-6 border-2 border-gold/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-gold" />
                <h3 className="text-sm sm:text-lg font-bold text-gold uppercase tracking-wider">Round Winner</h3>
                <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-gold" />
              </div>
              <p className="text-xl sm:text-3xl font-casino font-bold text-gold mb-1 sm:mb-2">
                {winnerName}
              </p>
              <div className="text-xs sm:text-sm text-gold/70 font-medium">
                Takes the trick and leads the next round
              </div>
            </div>
          </div>

          {/* Cards Played Section */}
          <div className="bg-casino-black/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gold/30">
            <h3 className="text-sm sm:text-xl font-semibold text-gold mb-3 sm:mb-4 text-center uppercase tracking-wide flex items-center justify-center gap-1 sm:gap-2">
              <Star className="w-3 h-3 sm:w-5 sm:h-5" />
              Cards Played
              <Star className="w-3 h-3 sm:w-5 sm:h-5" />
            </h3>
            
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-4 justify-items-center">
              {currentRoundCards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "text-center space-y-1 sm:space-y-3 p-1.5 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-300",
                    card.player === roundWinner 
                      ? "bg-gradient-gold/20 border-gold shadow-glow" 
                      : "bg-felt-green-light/30 border-gold/20"
                  )}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="animate-card-deal">
                    <PlayingCard card={card} size="sm" className="shadow-card" />
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className={cn(
                      "font-bold",
                      "text-[10px] sm:text-sm",
                      card.player === roundWinner ? "text-gold" : "text-gold/80"
                    )}>
                      {playerNames[card.player]}
                    </div>
                    {card.player === roundWinner && (
                      <div className="text-[9px] sm:text-xs text-gold/70 font-medium flex items-center justify-center gap-0.5 sm:gap-1">
                        <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Winner
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Scores */}
          <div className="bg-gradient-to-r from-casino-black/30 to-casino-black/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gold/30">
            <h3 className="text-sm sm:text-lg font-semibold text-gold mb-2 sm:mb-4 text-center uppercase tracking-wide">
              Current Score
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="text-center bg-gradient-gold/10 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gold/30">
                <div className="text-xs sm:text-sm font-medium text-gold/70 mb-1 sm:mb-2 uppercase tracking-wider">Team 1</div>
                <div className="text-xl sm:text-3xl font-bold text-gold">{scores[0]}</div>
              </div>
              <div className="text-center bg-blue-500/10 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-blue-400/30">
                <div className="text-xs sm:text-sm font-medium text-blue-300/70 mb-1 sm:mb-2 uppercase tracking-wider">Team 2</div>
                <div className="text-xl sm:text-3xl font-bold text-blue-300">{scores[1]}</div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center pt-1 sm:pt-4">
            <Button 
              onClick={onClose} 
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold font-casino bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300 active:scale-[0.98]"
            >
              Continue to Next Round
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
