import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { setBidAndTrump } from "@/store/gameSlice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getTeammateOptions } from "@/utils/gameUtils";
import { PlayingCard } from "./PlayingCard";
import { TeammateCard } from "@/types/game";
import { HandPreview } from "./BiddingModal";
import { SUITES } from "@/utils/suiteUtils";

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
      <DialogContent className="max-w-md w-full bg-felt-green-dark border-0 text-foreground p-0">
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
                {SUITES.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    className={`
                      bg-felt-green text-foreground border-2 border-transparent
                      rounded-lg px-4 py-3 text-lg font-semibold flex items-center gap-2
                      cursor-pointer transition-all duration-200 shadow-sm
                      ${trumpSuite === String(s.value) 
                        ? 'border-gold text-gold shadow-glow' 
                        : 'hover:border-foreground/30'
                      }
                    `}
                    onClick={() => setTrumpSuite(String(s.value))}
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
                {SUITES.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    className={`
                      bg-felt-green text-foreground border-2 border-transparent
                      rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer 
                      transition-all duration-200
                      ${teammateSuiteTab === s.value 
                        ? 'border-gold text-gold shadow-glow' 
                        : 'hover:border-foreground/30'
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
                {teammateOptions.map((card) => {
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
                        w-20 h-30
                        ${isSelected 
                          ? 'border-gold shadow-glow' 
                          : 'hover:border-foreground/30'
                        }
                      `}
                      onClick={() =>
                        setTeammateCard({
                          suite: card.suite,
                          number: card.number,
                        })
                      }
                    >
                      <PlayingCard card={card} />
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
              disabled={trumpSuite === "" || !teammateCard || !!error}
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