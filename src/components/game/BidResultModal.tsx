import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Crown, Gamepad2, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { GameConfig } from "../../types/game";
import { getSuiteColor, getSuiteIcon } from "../../utils/suiteUtils";
import { Badge } from "../ui/badge";
import { ModalHeader } from "../ui/ModalHeader";

interface BidResultModalProps {
  isOpen: boolean;
  gameConfig: GameConfig | null;
  playerNames: Record<number, string>;
  onClose: () => void;
  isObserver?: boolean;
}

export const BidResultModal: React.FC<BidResultModalProps> = ({
  isOpen,
  gameConfig,
  playerNames,
  onClose,
  isObserver = false,
}) => {
  const [contentVisible, setContentVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  // Trigger animations when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer1 = setTimeout(() => setContentVisible(true), 300);
      const timer2 = setTimeout(() => setButtonVisible(true), 600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setContentVisible(false);
      setButtonVisible(false);
    }
  }, [isOpen]);

  if (!gameConfig) {
    return null;
  }
  const { bidAmount, bidWinner, trumpSuite, teammateCard } = gameConfig;
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md bg-gradient-to-br from-felt-green-light/95 via-felt-green/95 to-felt-green-dark/95 border border-gold/30 shadow-2xl backdrop-blur-xl overflow-hidden">
        <DialogTitle className="sr-only">Bidding Complete!</DialogTitle>
        <DialogDescription className="sr-only">
          The bidding phase has ended. Here are the results of the auction.
        </DialogDescription>

        {/* Header */}
        <ModalHeader title="Bidding Complete!" className="mb-4" />

        <div className="space-y-4 px-2">
          {/* Winner Announcement */}
          <div
            className={cn(
              "p-4 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/5 rounded-lg border border-gold/40 shadow-md transition-all duration-700 ease-out",
              contentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{ animationDelay: "0ms" }}
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-gold" />
                <h3 className="text-lg font-bold text-gold">
                  {playerNames[bidWinner] || `Player ${bidWinner + 1}`}
                </h3>
                <Crown className="w-4 h-4 text-gold" />
              </div>
              <div className="text-sm font-medium text-gold/90">
                Winning bid: {bidAmount}
              </div>
            </div>
          </div>

          {/* Game Configuration */}
          <div
            className={cn(
              "grid grid-cols-2 gap-3 transition-all duration-700 ease-out",
              contentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{ animationDelay: "150ms" }}
          >
            {/* Trump Suite Card */}
            <div className="text-center p-4 bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent rounded-lg border border-casino-black/20 shadow-md">
              <div className="font-medium text-foreground text-sm mb-4">
                Trump Suite
              </div>
              <Badge
                variant="outline"
                className={`bg-white text-${getSuiteColor(trumpSuite)} text-sm font-bold border px-3 py-1`}
              >
                {getSuiteIcon(trumpSuite)}
              </Badge>
            </div>

            {/* Teammate Card */}
            <div className="text-center p-4 bg-gradient-to-r from-casino-black/10 via-casino-black/5 to-transparent rounded-lg border border-casino-black/20 shadow-md">
              <div className="font-medium text-foreground text-sm mb-4">
                Teammate Card
              </div>
              <Badge className="bg-white text-casino-black font-bold text-sm px-3 py-1">
                {teammateCard.id} {getSuiteIcon(teammateCard.suite)}
              </Badge>
            </div>
          </div>

          {/* Action Section */}
          <div
            className={cn(
              "transition-all duration-700 ease-out",
              buttonVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
            style={{ animationDelay: "300ms" }}
          >
            <div className="text-center">
              {!isObserver ? (
                <Button
                  onClick={onClose}
                  className="w-full h-12 text-base font-semibold bg-gold text-casino-black hover:bg-gold-light transition-colors duration-200 rounded-lg shadow-md hover:shadow-lg hover:shadow-gold/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Let's Begin!
                  </div>
                </Button>
              ) : (
                <div className="text-center py-3">
                  <div className="flex items-center justify-center gap-2 text-gold/70">
                    <div className="p-1.5 bg-gold/15 rounded-full border border-gold/25">
                      <Trophy className="w-4 h-4 text-gold/80" />
                    </div>
                    <span className="font-medium text-xs text-gold/80">
                      Observer mode - waiting for player action...
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
