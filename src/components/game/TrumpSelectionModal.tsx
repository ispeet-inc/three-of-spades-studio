import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Card, Suite } from "@/types/game";
import { getTeammateOptions } from "@/utils/gameUtils";
import { SUITES } from "@/utils/suiteUtils";
import { useState } from "react";
import { HandPreview } from "./HandPreview";
import { PlayingCard } from "./PlayingCard";

interface TrumpSelectionModalProps {
  isOpen: boolean;
  playerHand: Card[];
  onTrumpSelection: (trumpSuite: Suite, teammateCard: Card) => void;
}

export const TrumpSelectionModal = ({
  isOpen,
  playerHand,
  onTrumpSelection,
}: TrumpSelectionModalProps) => {
  const [trumpSuite, setTrumpSuite] = useState<Suite | null>(null);
  const [teammateCard, setTeammateCard] = useState<Card | null>(null);
  const [teammateSuiteTab, setTeammateSuiteTab] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const isMobile = useIsMobile();

  const validate = () => {
    if (trumpSuite === null) {
      setError("Please select a trump suite.");
      return false;
    }
    if (!teammateCard) {
      setError("Please select a teammate card.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && trumpSuite !== null && teammateCard !== null) {
      console.log("TrumpSelectionModal - trump chosen:  ", trumpSuite);
      console.log("TrumpSelectionModal - teammate chosen: ", teammateCard);
      onTrumpSelection(trumpSuite, teammateCard);
    }
  };

  const teammateOptions = getTeammateOptions(playerHand, teammateSuiteTab);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContent className={cn(
        "bg-felt-green-dark border-0 text-foreground p-0",
        isMobile ? "max-w-[calc(100vw-0.5rem)] max-h-[95vh]" : "max-w-xl w-full"
      )}>
        <DialogTitle className="sr-only">
          Choose Trump & Teammate Card
        </DialogTitle>
        <DialogDescription className="sr-only">
          Select a trump suite and teammate card to start the game
        </DialogDescription>
        <div className={cn("overflow-y-auto", isMobile ? "p-3 max-h-[90vh]" : "p-6")}>
          {/* Player Hand Display */}
          <HandPreview hand={playerHand} compact={isMobile} />

          <h2 className={cn(
            "font-bold text-gold text-center",
            isMobile ? "text-base mb-3" : "text-xl mb-6"
          )}>
            Choose Trump & Teammate Card
          </h2>

          <form onSubmit={handleSubmit} className={cn("space-y-4", !isMobile && "space-y-6")}>
            {/* Trump Suite Selection */}
            <div>
              <label className={cn("block font-semibold text-foreground", isMobile ? "text-xs mb-1" : "mb-2")}>
                Trump Suite
              </label>
              <div className={cn("flex", isMobile ? "gap-1.5" : "gap-3")}>
                {SUITES.map(s => (
                  <button
                    type="button"
                    key={s.value}
                    className={cn(
                      "bg-felt-green text-foreground rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all duration-200 shadow-sm touch-target",
                      isMobile ? "px-2 py-2 text-sm" : "px-4 py-3 text-lg gap-2",
                      trumpSuite === s.value
                        ? "border-2 border-gold text-gold shadow-glow"
                        : "hover:border-foreground/30"
                    )}
                    onClick={() => setTrumpSuite(s.value)}
                  >
                    <span className={isMobile ? "text-base" : "text-xl"}>{s.icon}</span>
                    {!isMobile && <span className="text-sm">{s.label}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Teammate Card Selection */}
            <div>
              <label className={cn("block font-semibold text-foreground", isMobile ? "text-xs mb-1" : "mb-2")}>
                Choose Teammate Card
              </label>

              {/* Suite Tabs */}
              <div className={cn("flex justify-center", isMobile ? "gap-1 mb-2" : "gap-2 mb-3")}>
                {SUITES.map(s => (
                  <button
                    type="button"
                    key={s.value}
                    className={cn(
                      "bg-felt-green text-foreground rounded-lg font-semibold cursor-pointer transition-all duration-200 touch-target",
                      isMobile ? "px-2 py-1.5 text-xs" : "px-4 py-2 text-sm",
                      teammateSuiteTab === s.value
                        ? "border-2 border-gold text-gold"
                        : "hover:border-foreground/30"
                    )}
                    onClick={() => setTeammateSuiteTab(s.value)}
                  >
                    {s.icon} {!isMobile && s.label}
                  </button>
                ))}
              </div>

              {/* Teammate Cards Display - Elegant Layout */}
              <div className={cn(
                "bg-casino-black/20 rounded-xl border border-gold/20",
                isMobile ? "p-2" : "p-4"
              )}>
                <div className="flex gap-0 justify-center flex-wrap">
                  {teammateOptions.map(card => {
                    const isSelected =
                      teammateCard &&
                      card.suite === teammateCard.suite &&
                      card.number === teammateCard.number;
                    return (
                      <div
                        key={`${card.suite}-${card.number}`}
                        className={cn(
                          "transform transition-all duration-200 cursor-pointer",
                          isSelected ? "scale-110 z-10" : "hover:scale-105"
                        )}
                        onClick={() => setTeammateCard(card)}
                      >
                        <PlayingCard
                          card={card}
                          compact={isMobile}
                          size={isMobile ? "sm" : "md"}
                          className={cn(
                            "shadow-card",
                            isMobile ? "-ml-3" : "-ml-6",
                            isSelected
                              ? "border-2 border-gold shadow-glow ring-2 ring-gold/50"
                              : "hover:border-gold/50"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && (
              <div className={cn(
                "bg-destructive/20 border border-destructive rounded-lg text-center text-destructive-foreground",
                isMobile ? "p-2 text-xs" : "p-3"
              )}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={trumpSuite === null || !teammateCard || !!error}
              className={cn(
                "w-full rounded-lg bg-gold text-primary-foreground font-bold transition-all duration-200 touch-target",
                "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
                "hover:bg-gold-light active:scale-95",
                isMobile ? "py-2.5 text-base mt-2" : "py-3 text-lg mt-4"
              )}
            >
              Submit
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
