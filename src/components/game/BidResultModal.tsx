import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { suitSymbols } from "@/utils/suiteUtils";
import React from "react";
import { GameConfig } from "../../types/game";
import { PlayingCard } from "./PlayingCard";

interface BidResultModalProps {
  isOpen: boolean;
  gameConfig: GameConfig | null;
  playerNames: Record<number, string>;
  onClose: () => void;
}

export const BidResultModal: React.FC<BidResultModalProps> = ({
  isOpen,
  gameConfig,
  playerNames,
  onClose,
}) => {
  if (!gameConfig) {
    return null;
  }
  const { bidAmount, bidWinner, trumpSuite, teammateCard } = gameConfig;
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary text-center">
            Bidding Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              <span className="text-accent-foreground">
                {playerNames[bidWinner] || `Player ${bidWinner + 1}`}
              </span>{" "}
              won the bid!
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Bid:</span>{" "}
                {bidAmount}
              </div>

              <div>
                <span className="font-medium text-muted-foreground">
                  Trump:
                </span>{" "}
                <span className="text-lg font-semibold">
                  {suitSymbols[trumpSuite]}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="font-medium text-muted-foreground">
                  Teammate Card:
                </span>
                <div className="scale-75">
                  <PlayingCard card={teammateCard} onClick={() => {}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Let's begin!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
