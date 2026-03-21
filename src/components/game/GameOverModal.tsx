import { useAppSelector } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Star, Sparkles } from "lucide-react";
import { selectTeams } from "@/store/selectors";
import { cn } from "@/lib/utils";

export const GameOverModal = () => {
  const teams = useAppSelector(selectTeams);
  const { scores, playerNames, bidAmount, bidder } = useAppSelector(state => state.game);

  const teamScores = {
    0: scores[0], // bidding team
    1: scores[1], // defending team
  };

  // teams[0] is always bidding team, teams[1] is always defending team
  const biddingTeam = 0;
  const defendingTeam = 1;
  
   // Determine winner based on bid
   let winningTeam = null;
   let bidMet = false;
   if (teamScores[biddingTeam] >= bidAmount) {
     winningTeam = biddingTeam;
     bidMet = true;
   } else {
     winningTeam = defendingTeam;
     bidMet = false;
   }
 
  const winningPlayers = teams[winningTeam] || [];

  const handleNewGame = () => {
    window.location.reload();
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center mb-4 sm:mb-8">
          <DialogTitle className="text-2xl sm:text-4xl font-casino text-gold mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-4">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gold animate-bounce" />
            Game Over!
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gold animate-bounce" />
          </DialogTitle>
          <div className="w-20 sm:w-24 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-8">
          {/* Victory Celebration */}
          <div className="text-center bg-gradient-to-r from-gold/30 to-gold/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-gold/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-gold animate-pulse" />
                <Crown className="w-7 h-7 sm:w-10 sm:h-10 text-gold animate-bounce" />
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-gold animate-pulse" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-casino font-bold text-gold mb-3 sm:mb-6 animate-pulse">
                Team {winningTeam + 1} Wins!
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="text-sm sm:text-lg font-semibold text-gold/80 tracking-wider mb-2 sm:mb-4">
                  {`${playerNames[bidder]} bid ${bidAmount}.`} 
                </div>
                <div className="text-sm sm:text-lg font-semibold text-gold/80 tracking-wider mb-2 sm:mb-4">
                  {bidMet ? "Bid and won!" : "Bid failed!"}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {winningPlayers.map((playerId, index) => (
                    <div 
                      key={playerId}
                      className="inline-block px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-bold bg-gradient-gold text-casino-black shadow-card border border-gold-dark"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Crown className="w-3 h-3 sm:w-5 sm:h-5" />
                        {playerNames[playerId]}
                        <Star className="w-3 h-3 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Final Scores Display */}
          <div className="bg-casino-black/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gold/30">
            <h3 className="text-lg sm:text-2xl font-semibold text-gold mb-3 sm:mb-6 text-center uppercase tracking-wide flex items-center justify-center gap-1 sm:gap-2">
              <Trophy className="w-4 h-4 sm:w-6 sm:h-6" />
              Final Scores
              <Trophy className="w-4 h-4 sm:w-6 sm:h-6" />
            </h3>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              {/* Team 1 Score */}
              <div className={cn(
                "text-center p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-500",
                winningTeam === 0 
                  ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse" 
                  : "bg-felt-green-light/20 border-gold/20"
              )}>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-3">
                  {winningTeam === 0 && <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-gold" />}
                  <div className="text-base sm:text-xl font-bold text-gold">Team 1</div>
                  {winningTeam === 0 && <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-gold" />}
                </div>
                <div className="text-3xl sm:text-5xl font-casino font-bold text-gold mb-1 sm:mb-2">{scores[0]}</div>
                {winningTeam === 0 && (
                  <div className="text-xs sm:text-sm text-gold/70 font-medium uppercase tracking-wider">
                    Winners!
                  </div>
                )}
              </div>

              {/* Team 2 Score */}
              <div className={cn(
                "text-center p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-500",
                winningTeam === 1 
                  ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse" 
                  : "bg-blue-500/10 border-blue-400/30"
              )}>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-3">
                  {winningTeam === 1 && <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-gold" />}
                  <div className={cn(
                    "text-base sm:text-xl font-bold",
                    winningTeam === 1 ? "text-gold" : "text-blue-300"
                  )}>Team 2</div>
                  {winningTeam === 1 && <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-gold" />}
                </div>
                <div className={cn(
                  "text-3xl sm:text-5xl font-casino font-bold mb-1 sm:mb-2",
                  winningTeam === 1 ? "text-gold" : "text-blue-300"
                )}>
                  {scores[1]}
                </div>
                {winningTeam === 1 && (
                  <div className="text-xs sm:text-sm text-gold/70 font-medium uppercase tracking-wider">
                    Champions!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Play Again Button */}
          <div className="text-center pt-1 sm:pt-4">
            <Button 
              onClick={handleNewGame} 
              className="w-full h-12 sm:h-16 text-lg sm:text-xl font-bold font-casino bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-spin" />
                Play Again
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-spin" />
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
