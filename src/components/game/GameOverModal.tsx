import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FIRST_PLAYER_ID } from "@/utils/constants";
import { Crown, Gamepad2, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TeamScores } from "../../types/game";
import { ModalHeader } from "../ui/ModalHeader";

interface GameOverModalProps {
  isOpen: boolean;
  teams: Record<number, number[]>;
  scores: TeamScores;
  bidAmount: number;
  playerNames: Record<number, string>;
  onNewGame: () => void;
  isObserver?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  teams,
  scores,
  bidAmount,
  playerNames,
  onNewGame,
  isObserver = false,
}) => {
  const [scoresVisible, setScoresVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  // Determine winner based on bid - updated for new team system (1/2 instead of 0/1)
  const winningTeam = bidAmount !== null && scores.team1 >= bidAmount ? 1 : 2;
  const firstPlayerWon = teams[winningTeam].includes(FIRST_PLAYER_ID);

  // Trigger animations when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer1 = setTimeout(() => setScoresVisible(true), 300);
      const timer2 = setTimeout(() => setButtonVisible(true), 600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setScoresVisible(false);
      setButtonVisible(false);
    }
  }, [isOpen]);

  // Team data configuration
  const teamData = [
    {
      id: 1,
      name: "Bidding Team",
      score: scores.team1,
      players: teams[1].map(playerId => playerNames[playerId]).join(", "),
      isWinner: winningTeam === 1,
      animationDelay: "0ms",
    },
    {
      id: 2,
      name: "Defending Team",
      score: scores.team2,
      players: teams[2].map(playerId => playerNames[playerId]).join(", "),
      isWinner: winningTeam === 2,
      animationDelay: "150ms",
    },
  ];

  // Team Score Card Component
  const TeamScoreCard = ({ team }: { team: (typeof teamData)[0] }) => (
    <div
      className={cn(
        "group space-y-2 p-3 rounded-lg border transition-all duration-700 ease-out",
        scoresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        team.isWinner
          ? "bg-gradient-to-r from-gold/15 via-gold/10 to-gold/5 border-gold/40 shadow-lg"
          : "bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent border-casino-black/20 shadow-md"
      )}
      style={{ animationDelay: team.animationDelay }}
    >
      {/* Team Info Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-semibold text-xs tracking-wide",
              team.isWinner ? "text-gold" : "text-foreground"
            )}
          >
            {team.name}
          </span>
          {team.isWinner && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-gold/25 to-gold/15 px-2 py-0.5 rounded-full border border-gold/40 shadow-sm">
              <Crown className="w-3 h-3 text-gold" />
              <span className="text-gold text-xs font-bold tracking-wide">
                Winner
              </span>
              <Crown className="w-3 h-3 text-gold" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-bold text-sm tracking-wide",
              team.isWinner ? "text-gold" : "text-foreground"
            )}
          >
            {team.score} pts
          </span>
        </div>
      </div>

      {/* Players List */}
      <div className="text-xs text-gold/70 font-medium tracking-wider">
        {team.players}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-felt-green-light/95 via-felt-green/95 to-felt-green-dark/95 border border-gold/30 shadow-2xl backdrop-blur-xl overflow-hidden">
        <DialogTitle className="sr-only">
          {firstPlayerWon ? "You won!" : "You lost!"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Game over with final scores and team standings
        </DialogDescription>

        {/* Header */}
        <ModalHeader
          title={firstPlayerWon ? "You won!" : "You lost!"}
          className="mb-5"
        />

        <div className="space-y-4 px-2">
          {/* Final Scores Display */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground/95 text-center tracking-wider uppercase">
              Final Scores
            </h3>

            <div className="space-y-2.5">
              {teamData.map(team => (
                <TeamScoreCard key={team.id} team={team} />
              ))}
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-gradient-to-r from-casino-black/10 to-transparent rounded-lg border border-gold/15 p-3 shadow-md">
            <div className="text-center space-y-3">
              {!isObserver ? (
                <>
                  <h3 className="text-xs font-semibold text-gold/70 tracking-wide uppercase">
                    Ready for Another Round?
                  </h3>

                  {/* Play Again Button */}
                  <div
                    className={cn(
                      "transition-all duration-700 ease-out",
                      buttonVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    )}
                    style={{
                      animationDelay: "300ms",
                    }}
                  >
                    <Button
                      onClick={onNewGame}
                      className="w-full h-12 font-bold font-casino bg-gradient-to-r from-gold via-gold/95 to-gold/90 text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <Gamepad2 className="w-4 h-4 group-hover:animate-pulse" />
                        Play Again
                      </div>
                      {/* Ripple effect background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gold-light/20 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  <div className="flex items-center justify-center gap-2 text-gold/70">
                    <div className="p-1 bg-gold/15 rounded-full border border-gold/25">
                      <Trophy className="w-3.5 h-3.5 text-gold/80" />
                    </div>
                    <span className="font-medium text-xs tracking-wide text-gold/80">
                      Observer mode - waiting for player to start new game...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
