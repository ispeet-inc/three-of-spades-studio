import { useAppSelector } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Sparkles } from "lucide-react";
import { selectTeams } from "@/store/selectors";
import { useIsMobile } from "@/hooks/use-mobile";

export const GameOverModal = () => {
  const teams = useAppSelector(selectTeams);
  const { scores, playerNames, bidAmount, bidder } = useAppSelector(
    state => state.game
  );
  const isMobile = useIsMobile();

  // Determine winner based on bid
  const winningTeam = scores[0] >= bidAmount ? 0 : 1;
  const firstPlayerWon = teams[winningTeam].includes(0);

  // todo - dispatch action to reset state, instead of reloading site.
  const handleNewGame = () => {
    window.location.reload();
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className={`${isMobile ? "max-w-sm mx-4" : "max-w-lg"} bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm`}
      >
        <DialogHeader className="text-center mb-4">
          <DialogTitle
            className={`${isMobile ? "text-2xl" : "text-3xl"} font-casino text-gold mb-2 flex items-center justify-center gap-2`}
          >
            {firstPlayerWon ? "You won!" : "You lost!"}
          </DialogTitle>
          <div className="w-16 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Final Scores Display */}
          <div className="bg-casino-black/30 rounded-2xl p-4 border border-gold/30">
            <h3
              className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-gold mb-3 text-center uppercase tracking-wide flex items-center justify-center gap-2`}
            >
              <Trophy className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`} />
              Final Scores
              <Trophy className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`} />
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Team 1 Score */}
              <div
                className={`text-center p-3 rounded-xl border-2 transition-all duration-500
                ${
                  winningTeam === 0
                    ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse"
                    : "bg-felt-green-light/20 border-gold/20"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {winningTeam === 0 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                  <div
                    className={`${isMobile ? "text-sm" : "text-base"} font-bold text-gold`}
                  >
                    Bidding Team
                  </div>
                  {winningTeam === 0 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                </div>
                <div
                  className={`${isMobile ? "text-3xl" : "text-4xl"} font-casino font-bold text-gold mb-1`}
                >
                  {scores[0]}
                </div>
                {winningTeam === 0 && (
                  <div className="text-xs text-gold/70 font-medium uppercase tracking-wider">
                    🏆 Winners!
                  </div>
                )}
                <div className="text-xs text-gold/70 font-medium tracking-wider">
                  {teams[0].map(playerId => playerNames[playerId]).join(", ")}
                </div>
              </div>

              {/* Team 2 Score */}
              <div
                className={`text-center p-3 rounded-xl border-2 transition-all duration-500
                ${
                  winningTeam === 1
                    ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse"
                    : "bg-blue-500/10 border-blue-400/30"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {winningTeam === 1 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                  <div
                    className={`${isMobile ? "text-sm" : "text-base"} font-bold ${winningTeam === 1 ? "text-gold" : "text-blue-300"}`}
                  >
                    Defending Team
                  </div>
                  {winningTeam === 1 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                </div>
                <div
                  className={`${isMobile ? "text-3xl" : "text-4xl"} font-casino font-bold mb-1 ${winningTeam === 1 ? "text-gold" : "text-blue-300"}`}
                >
                  {scores[1]}
                </div>
                <div className="text-xs text-gold/70 font-medium tracking-wider">
                  {teams[1].map(playerId => playerNames[playerId]).join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* Play Again Button */}
          <div className="text-center pt-2">
            <Button
              onClick={handleNewGame}
              className={`w-full ${isMobile ? "h-12 text-base" : "h-14 text-lg"} font-bold font-casino bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300 hover:scale-105 group`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles
                  className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} group-hover:animate-spin`}
                />
                🎮 Play Again
                <Sparkles
                  className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} group-hover:animate-spin`}
                />
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
