import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { setBidAndTrump } from "@/store/gameSlice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { suiteMetadata } from "@/utils/suiteUtils";
import { getTeammateOptions } from "@/utils/gameUtils";
import { PlayingCard } from "./PlayingCard";
import { TeammateCard } from "@/types/game";

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
      <DialogContent className="max-w-md w-full bg-casino-green-dark border-0 text-casino-cream p-0">
        <div className="p-6">
          {/* Player Hand Display */}
          <div className="flex justify-center items-end h-32 relative mb-4">
            {players[0].hand.map((card, idx) => {
              const overlap = 40;
              const marginLeft = idx === 0 ? "0px" : `${-overlap}px`;
              return (
                <div
                  key={idx}
                  className="relative"
                  style={{
                    marginLeft,
                    zIndex: idx,
                  }}
                >
                  <PlayingCard card={card} size="sm" />
                </div>
              );
            })}
          </div>

          <h2 className="text-xl font-bold mb-6 text-casino-gold text-center">
            Choose Trump & Teammate Card
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trump Suite Selection */}
            <div>
              <label className="block font-semibold mb-2 text-casino-cream">
                Trump Suite
              </label>
              <div className="flex gap-3">
                {suiteMetadata.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    className={`
                      bg-casino-forest text-casino-cream border-2 border-transparent
                      rounded-lg px-4 py-3 text-lg font-semibold flex items-center gap-2
                      cursor-pointer transition-all duration-200 shadow-sm
                      ${trumpSuite === String(s.value) 
                        ? 'border-casino-gold text-casino-gold shadow-casino-gold/30 shadow-lg' 
                        : 'hover:border-casino-cream/30'
                      }
                    `}
                    onClick={() => setTrumpSuite(String(s.value))}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Teammate Card Selection */}
            <div>
              <label className="block font-semibold mb-2 text-casino-cream">
                Choose Teammate Card
              </label>
              
              {/* Suite Tabs */}
              <div className="flex gap-2 mb-3 justify-center">
                {suiteMetadata.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    className={`
                      bg-casino-forest text-casino-cream border-2 border-transparent
                      rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer 
                      transition-all duration-200
                      ${teammateSuiteTab === s.value 
                        ? 'border-casino-gold text-casino-gold shadow-casino-gold/30 shadow-md' 
                        : 'hover:border-casino-cream/30'
                      }
                    `}
                    onClick={() => setTeammateSuiteTab(s.value)}
                  >
                    {s.icon} {s.name}
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
                          ? 'border-casino-gold shadow-casino-gold/50 shadow-md' 
                          : 'hover:border-casino-cream/30'
                        }
                      `}
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
              <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 text-center text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={trumpSuite === "" || !teammateCard || !!error}
              className="
                w-full py-3 rounded-lg bg-casino-gold text-casino-green font-bold text-lg
                transition-all duration-200 mt-4
                disabled:bg-casino-cream/20 disabled:text-casino-cream/50 disabled:cursor-not-allowed
                hover:bg-casino-gold-light
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