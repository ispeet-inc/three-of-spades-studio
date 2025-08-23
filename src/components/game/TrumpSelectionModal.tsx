import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setBidAndTrump } from "@/store/gameSlice";
import { Card, Suite } from "@/types/game";
import { getTeammateOptions } from "@/utils/gameUtils";
import { SUITES } from "@/utils/suiteUtils";
import { useState } from "react";
import { HandPreview } from "./BiddingModal";
import { PlayingCard } from "./PlayingCard";

export const TrumpSelectionModal = () => {
  const dispatch = useAppDispatch();
  const { players } = useAppSelector(state => state.game.playerState);
  const [trumpSuite, setTrumpSuite] = useState<Suite | null>(null);
  const [teammateCard, setTeammateCard] = useState<Card | null>(null);
  const [teammateSuiteTab, setTeammateSuiteTab] = useState<number>(0);
  const [error, setError] = useState<string>("");

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
      dispatch(
        setBidAndTrump({
          trumpSuite: trumpSuite as number, // ensure type matches reducer
          bidder: 0,
          teammateCard: teammateCard as Card, // ensure not null
        })
      );
    }
  };

  const teammateOptions = getTeammateOptions(players[0].hand, teammateSuiteTab);

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-xl w-full bg-felt-green-dark border-0 text-foreground p-0">
        <div className="p-6">
          {/* Player Hand Display */}
          <HandPreview hand={players[0].hand} />

          <h2 className="text-xl font-bold mb-6 text-gold text-center">
            Choose Trump & Teammate Card
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trump Suite Selection */}
            <div>
              <label className="block font-semibold mb-2 text-foreground">
                Trump Suite
              </label>
              <div className="flex gap-3">
                {SUITES.map(s => (
                  <button
                    type="button"
                    key={s.value}
                    className={`
                      bg-felt-green text-foreground
                      rounded-lg px-4 py-3 text-lg font-semibold flex items-center gap-2
                      cursor-pointer transition-all duration-200 shadow-sm
                      ${
                        trumpSuite === s.value
                          ? "border-2 border-gold text-gold shadow-glow"
                          : "hover:border-foreground/30"
                      }
                    `}
                    onClick={() => setTrumpSuite(s.value)}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Teammate Card Selection */}
            <div>
              <label className="block font-semibold mb-2 text-foreground">
                Choose Teammate Card
              </label>

              {/* Suite Tabs */}
              <div className="flex gap-2 mb-3 justify-center">
                {SUITES.map(s => (
                  <button
                    type="button"
                    key={s.value}
                    className={`
                      bg-felt-green text-foreground
                      rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer 
                      transition-all duration-200
                      ${
                        teammateSuiteTab === s.value
                          ? "border-2 border-gold text-gold"
                          : "hover:border-foreground/30"
                      }
                    `}
                    onClick={() => setTeammateSuiteTab(s.value)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>

              {/* Teammate Cards Grid */}
              <div className="flex flex-wrap gap-2 justify-center">
                {teammateOptions.map(card => {
                  const isSelected =
                    teammateCard &&
                    card.suite === teammateCard.suite &&
                    card.number === teammateCard.number;
                  return (
                    <button
                      type="button"
                      key={`${card.suite}-${card.number}`}
                      className={`
                        bg-transparent border-2 border-transparent rounded-lg p-1
                        cursor-pointer transition-all duration-200 flex items-center justify-center
                        w-20 h-30 hover:border-foreground/30`}
                      onClick={() => setTeammateCard(card)}
                    >
                      <PlayingCard
                        card={card}
                        className={`hover:border-foreground/30 ${
                          isSelected && "border-2 border-gold shadow-glow"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive rounded-lg p-3 text-center text-destructive-foreground">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={trumpSuite === null || !teammateCard || !!error}
              className="
                w-full py-3 rounded-lg bg-gold text-primary-foreground font-bold text-lg
                transition-all duration-200 mt-4
                disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
                hover:bg-gold-light
              "
            >
              Submit
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
