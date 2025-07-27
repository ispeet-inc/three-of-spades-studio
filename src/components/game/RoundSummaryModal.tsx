import { useAppSelector } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayingCard } from "./PlayingCard";
import { Trophy, Star, Crown } from "lucide-react";

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
      <DialogContent className="max-w-2xl bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-3xl font-casino text-gold mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-gold animate-pulse" />
            Round {round} Complete
            <Trophy className="w-8 h-8 text-gold animate-pulse" />
          </DialogTitle>
          <div className="w-20 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Winner Announcement */}
          <div className="text-center bg-gradient-to-r from-gold/20 to-gold/10 rounded-2xl p-6 border-2 border-gold/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="w-6 h-6 text-gold" />
                <h3 className="text-lg font-bold text-gold uppercase tracking-wider">Round Winner</h3>
                <Crown className="w-6 h-6 text-gold" />
              </div>
              <p className="text-3xl font-casino font-bold text-gold mb-2 animate-bounce">
                🎉 {winnerName} 🎉
              </p>
              <div className="text-sm text-gold/70 font-medium">
                Takes the trick and leads the next round
              </div>
            </div>
          </div>

          {/* Cards Played Section */}
          <div className="bg-casino-black/20 rounded-2xl p-6 border border-gold/30">
            <h3 className="text-xl font-semibold text-gold mb-4 text-center uppercase tracking-wide flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Cards Played This Round
              <Star className="w-5 h-5" />
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {currentRoundCards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`text-center space-y-3 p-4 rounded-xl border transition-all duration-300 hover:scale-105
                    ${card.player === roundWinner 
                      ? "bg-gradient-gold/20 border-gold shadow-glow" 
                      : "bg-felt-green-light/30 border-gold/20 hover:border-gold/40"
                    }`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="animate-card-deal">
                    <PlayingCard card={card} size="sm" className="shadow-card" />
                  </div>
                  <div className="space-y-1">
                    <div className={`text-sm font-bold ${card.player === roundWinner ? "text-gold" : "text-gold/80"}`}>
                      {playerNames[card.player]}
                    </div>
                    {card.player === roundWinner && (
                      <div className="text-xs text-gold/70 font-medium flex items-center justify-center gap-1">
                        <Crown className="w-3 h-3" />
                        Winner
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Scores */}
          <div className="bg-gradient-to-r from-casino-black/30 to-casino-black/20 rounded-2xl p-6 border border-gold/30">
            <h3 className="text-lg font-semibold text-gold mb-4 text-center uppercase tracking-wide">
              Current Game Score
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center bg-gradient-gold/10 rounded-xl p-4 border border-gold/30">
                <div className="text-sm font-medium text-gold/70 mb-2 uppercase tracking-wider">Team 1</div>
                <div className="text-3xl font-bold text-gold">{scores[0]}</div>
              </div>
              <div className="text-center bg-blue-500/10 rounded-xl p-4 border border-blue-400/30">
                <div className="text-sm font-medium text-blue-300/70 mb-2 uppercase tracking-wider">Team 2</div>
                <div className="text-3xl font-bold text-blue-300">{scores[1]}</div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={onClose} 
              className="w-full h-14 text-lg font-bold font-casino bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300 hover:scale-105"
            >
              🎮 Continue to Next Round
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};