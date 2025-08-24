import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FIRST_PLAYER_ID } from "@/utils/constants";
import { Crown, Sparkles, Trophy } from "lucide-react";
import { TeamScores } from "../../types/game";

interface GameOverModalProps {
  isOpen: boolean;
  teams: Record<number, number[]>;
  scores: TeamScores;
  bidAmount: number;
  bidWinner: number;
  playerNames: Record<number, string>;
  isMobile: boolean;
  onNewGame: () => void;
}

export const GameOverModal = ({
  isOpen,
  teams,
  scores,
  bidAmount,
  bidWinner,
  playerNames,
  isMobile,
  onNewGame,
}: GameOverModalProps) => {
  // Determine winner based on bid - updated for new team system (1/2 instead of 0/1)
  const winningTeam = bidAmount !== null && scores.team1 >= bidAmount ? 1 : 2; // Changed from 0/1 to 1/2
  const firstPlayerWon = teams[winningTeam].includes(FIRST_PLAYER_ID);

  return (
    <Dialog open={isOpen}>
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
                  winningTeam === 1
                    ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse"
                    : "bg-felt-green-light/20 border-gold/20"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {winningTeam === 1 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                  <div
                    className={`${isMobile ? "text-sm" : "text-base"} font-bold text-gold`}
                  >
                    Bidding Team
                  </div>
                  {winningTeam === 1 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                </div>
                <div
                  className={`${isMobile ? "text-3xl" : "text-4xl"} font-casino font-bold text-gold mb-1`}
                >
                  {scores.team1}
                </div>
                <div className="text-xs text-gold/70 font-medium tracking-wider">
                  {teams[1].map(playerId => playerNames[playerId]).join(", ")}
                </div>
              </div>

              {/* Team 2 Score */}
              <div
                className={`text-center p-3 rounded-xl border-2 transition-all duration-500
                ${
                  winningTeam === 2
                    ? "bg-gradient-gold/20 border-gold shadow-glow animate-pulse"
                    : "bg-blue-500/10 border-blue-400/30"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {winningTeam === 2 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                  <div
                    className={`${isMobile ? "text-sm" : "text-base"} font-bold ${winningTeam === 2 ? "text-gold" : "text-blue-300"}`}
                  >
                    Defending Team
                  </div>
                  {winningTeam === 2 && (
                    <Crown
                      className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-gold`}
                    />
                  )}
                </div>
                <div
                  className={`${isMobile ? "text-3xl" : "text-4xl"} font-casino font-bold mb-1 ${winningTeam === 2 ? "text-gold" : "text-blue-300"}`}
                >
                  {scores.team2}
                </div>
                <div className="text-xs text-gold/70 font-medium tracking-wider">
                  {teams[2].map(playerId => playerNames[playerId]).join(", ")}
                </div>
              </div>
            </div>
          </div>

          {/* Play Again Button */}
          <div className="text-center pt-2">
            <Button
              onClick={onNewGame}
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
