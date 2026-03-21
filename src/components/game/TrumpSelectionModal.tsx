import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { setBidAndTrump } from "@/store/gameSlice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getTeammateOptions } from "@/utils/gameUtils";
import { PlayingCard } from "./PlayingCard";
import { TeammateCard } from "@/types/game";
import { HandPreview } from "./BiddingModal";
import { SUITES } from "@/utils/suiteUtils";
import { cn } from "@/lib/utils";

export const TrumpSelectionModal = () => {
  const dispatch = useAppDispatch();
  const { players } = useAppSelector(state => state.game);
  const [trumpSuite, setTrumpSuite] = useState<string>("");
  const [teammateCard, setTeammateCard] = useState<TeammateCard | null>(null);
  const [teammateSuiteTab, setTeammateSuiteTab] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const validate = () => {
    if (trumpSuite === "" || trumpSuite === null) {
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
    if (validate()) {
      dispatch(setBidAndTrump({
        trumpSuite: Number(trumpSuite),
        bidder: 0,
        teammateCard
      }));
    }
  };

  const teammateOptions = getTeammateOptions(players[0].hand, teammateSuiteTab);

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-xl w-full bg-felt-green-dark border-0 text-foreground p-0">
        <div className="p-3 sm:p-6">
          {/* Player Hand Display */}
          <HandPreview hand={players[0].hand} compact />

          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gold text-center">
            Choose Trump & Teammate Card
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Trump Suite Selection */}
            <div>
              <label className="block font-semibold mb-2 text-foreground text-sm sm:text-base">
                Trump Suite
              </label>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {SUITES.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    className={cn(
                      "bg-felt-green text-foreground rounded-lg font-semibold flex items-center gap-1 sm:gap-2",
                      "cursor-pointer transition-all duration-200 shadow-sm",
                      "px-3 py-2 text-base sm:px-4 sm:py-3 sm:text-lg",
                      "min-h-[44px]",
                      trumpSuite === String(s.value) 
                        ? 'border-2 border-gold text-gold shadow-glow' 
                        : 'border border-transparent hover:border-foreground/30'
                    )}
                    onClick={() => setTrumpSuite(String(s.value))}
                  >
                    <span className="text-lg sm:text-xl">{s.icon}</span>
                    <span className="text-xs sm:text-sm">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Teammate Card Selection */}
            <div>
              <label className="block font-semibold mb-2 text-foreground text-sm sm:text-base">
                Choose Teammate Card
              </label>
              
              {/* Suite Tabs */}
              <div className="flex gap-1.5 sm:gap-2 mb-3 justify-center flex-wrap">
                {SUITES.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    className={cn(
                      "bg-felt-green text-foreground rounded-lg font-semibold cursor-pointer",
                      "transition-all duration-200",
                      "px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm",
                      "min-h-[36px] sm:min-h-[40px]",
                      teammateSuiteTab === s.value 
                        ? 'border-2 border-gold text-gold' 
                        : 'border border-transparent hover:border-foreground/30'
                    )}
                    onClick={() => setTeammateSuiteTab(s.value)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>

              {/* Teammate Cards Grid */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                {teammateOptions.map((card) => {
                  const isSelected =
                    teammateCard &&
                    card.suite === teammateCard.suite &&
                    card.number === teammateCard.number;
                  return (
                    <button
                      type="button"
                      key={`${card.suite}-${card.number}`}
                      className={cn(
                        "bg-transparent rounded-lg p-0.5 sm:p-1",
                        "cursor-pointer transition-all duration-200 flex items-center justify-center",
                        "min-h-[44px]",
                        isSelected 
                          ? "border-2 border-gold shadow-glow" 
                          : "border-2 border-transparent hover:border-foreground/30"
                      )}
                      onClick={() =>
                        setTeammateCard({
                          suite: card.suite,
                          number: card.number,
                        })
                      }
                    >
                      <PlayingCard card={card} size="sm" />
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive rounded-lg p-2 sm:p-3 text-center text-destructive-foreground text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={trumpSuite === "" || !teammateCard || !!error}
              className={cn(
                "w-full py-3 rounded-lg bg-gold text-primary-foreground font-bold",
                "text-base sm:text-lg min-h-[48px]",
                "transition-all duration-200 mt-2 sm:mt-4",
                "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
                "hover:bg-gold-light active:scale-[0.98]"
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
