import { useAppSelector } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Star, Sparkles } from "lucide-react";

export const GameOverModal = () => {
  const { scores, teams, teamColors, playerNames } = useAppSelector(state => state.game);

  const winningTeam = scores[0] > scores[1] ? 0 : 1;
  const winningPlayers = teams[winningTeam] || [];
  const winningScore = scores[winningTeam];
  const losingScore = scores[winningTeam === 0 ? 1 : 0];

  const handleNewGame = () => {
    window.location.reload();
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-xl bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center mb-8">
          <DialogTitle className="text-4xl font-casino text-gold mb-4 flex items-center justify-center gap-4">
            <Trophy className="w-12 h-12 text-gold animate-bounce" />
            Game Over!
            <Trophy className="w-12 h-12 text-gold animate-bounce" />
          </DialogTitle>
          <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Victory Celebration */}
          <div className="text-center bg-gradient-to-r from-gold/30 to-gold/10 rounded-3xl p-8 border-2 border-gold/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-gold animate-pulse" />
                <Crown className="w-10 h-10 text-gold animate-bounce" />
                <Sparkles className="w-8 h-8 text-gold animate-pulse" />
              </div>
              
              <h3 className="text-4xl font-casino font-bold text-gold mb-6 animate-pulse">
                🎉 Team {winningTeam + 1} Wins! 🎉
              </h3>
              
              <div className="space-y-3">
                <div className="text-lg font-semibold text-gold/80 uppercase tracking-wider mb-4">
                  Champions
                </div>
                {winningPlayers.map((playerId, index) => (
                  <div 
                    key={playerId}
                    className="inline-block mx-2 px-6 py-3 rounded-xl text-lg font-bold bg-gradient-gold text-casino-black shadow-card border border-gold-dark transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      {playerNames[playerId]}
                      <Star className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final Scores Display */}
          <div className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <h3 className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              Final Scores
              <Trophy className="w-6 h-6" />
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Team 1 Score */}
              <div className={`text-center p-6 rounded-2xl border-2 transition-all duration-500
                ${winningTeam === 0 
                  ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse" 
                  : "bg-felt-green-light/20 border-gold/20"
                }`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {winningTeam === 0 && <Crown className="w-6 h-6 text-gold" />}
                  <div className="text-xl font-bold text-gold">Team 1</div>
                  {winningTeam === 0 && <Crown className="w-6 h-6 text-gold" />}
                </div>
                <div className="text-5xl font-casino font-bold text-gold mb-2">{scores[0]}</div>
                {winningTeam === 0 && (
                  <div className="text-sm text-gold/70 font-medium uppercase tracking-wider">
                    🏆 Winners!
                  </div>
                )}
              </div>

              {/* Team 2 Score */}
              <div className={`text-center p-6 rounded-2xl border-2 transition-all duration-500
                ${winningTeam === 1 
                  ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse" 
                  : "bg-blue-500/10 border-blue-400/30"
                }`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {winningTeam === 1 && <Crown className="w-6 h-6 text-gold" />}
                  <div className={`text-xl font-bold ${winningTeam === 1 ? "text-gold" : "text-blue-300"}`}>Team 2</div>
                  {winningTeam === 1 && <Crown className="w-6 h-6 text-gold" />}
                </div>
                <div className={`text-5xl font-casino font-bold mb-2 ${winningTeam === 1 ? "text-gold" : "text-blue-300"}`}>
                  {scores[1]}
                </div>
                {winningTeam === 1 && (
                  <div className="text-sm text-gold/70 font-medium uppercase tracking-wider">
                    🏆 Winners!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Play Again Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={handleNewGame} 
              className="w-full h-16 text-xl font-bold font-casino bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300 hover:scale-105 group"
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 group-hover:animate-spin" />
                🎮 Play Again
                <Sparkles className="w-6 h-6 group-hover:animate-spin" />
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};