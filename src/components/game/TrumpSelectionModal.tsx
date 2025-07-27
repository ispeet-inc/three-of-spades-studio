import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { setBidAndTrump } from "@/store/gameSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSuiteIcon } from "@/utils/cardUtils";

export const TrumpSelectionModal = () => {
  const dispatch = useAppDispatch();
  const { players } = useAppSelector(state => state.game);
  const [trumpSuite, setTrumpSuite] = useState<number | null>(null);
  const [teammateCard, setTeammateCard] = useState<{suite: number; number: number} | null>(null);

  const suites = [
    { value: 0, icon: "♠", name: "Spades" },
    { value: 1, icon: "♥", name: "Hearts" },
    { value: 2, icon: "♦", name: "Diamonds" },
    { value: 3, icon: "♣", name: "Clubs" }
  ];

  const cardNumbers = [3, 5, 7, 8, 9, 10, 11, 12, 13, 1];

  const handleSubmit = () => {
    if (trumpSuite !== null && teammateCard) {
      dispatch(setBidAndTrump({
        trumpSuite,
        bidder: 0,
        teammateCard
      }));
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-casino text-gold mb-2">
            Choose Trump & Teammate
          </DialogTitle>
          <div className="w-20 h-1 bg-gradient-gold mx-auto rounded-full"></div>
          <p className="text-sm text-gold/70 mt-3 font-medium">Select your trump suit and teammate card</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Premium Trump Suite Selection */}
          <div className="bg-casino-black/20 rounded-xl p-5 border border-gold/30">
            <h3 className="text-lg font-semibold text-gold mb-4 text-center uppercase tracking-wide">
              Select Trump Suite
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {suites.map(suite => (
                <Button
                  key={suite.value}
                  variant={trumpSuite === suite.value ? "default" : "outline"}
                  onClick={() => setTrumpSuite(suite.value)}
                  className={`
                    h-16 flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300
                    ${trumpSuite === suite.value 
                      ? "bg-gradient-gold text-casino-black shadow-glow border-gold-dark" 
                      : "border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 hover:shadow-card"
                    }
                  `}
                >
                  <span className={`text-2xl ${suite.value === 1 || suite.value === 2 ? "text-red-500" : ""}`}>
                    {suite.icon}
                  </span>
                  <span className="font-casino">{suite.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Premium Teammate Card Selection */}
          <div className="bg-casino-black/20 rounded-xl p-5 border border-gold/30">
            <h3 className="text-lg font-semibold text-gold mb-4 text-center uppercase tracking-wide">
              Select Teammate Card
            </h3>
            <p className="text-xs text-gold/60 text-center mb-4 font-medium">
              Choose a card not in your hand to identify your partner
            </p>
            
            <div className="grid grid-cols-4 gap-4">
              {suites.map(suite => (
                <div key={suite.value} className="space-y-2">
                  {/* Suite Header */}
                  <div className="text-center bg-felt-green-light/30 rounded-lg py-2 border border-gold/20">
                    <span className={`text-2xl ${suite.value === 1 || suite.value === 2 ? "text-red-400" : "text-gold"}`}>
                      {suite.icon}
                    </span>
                  </div>
                  
                  {/* Card Numbers */}
                  <div className="space-y-1">
                    {cardNumbers.map(num => {
                      const hasCard = players[0].hand.some(card => 
                        card.suite === suite.value && card.number === num
                      );
                      if (hasCard) return null;
                      
                      const isSelected = teammateCard?.suite === suite.value && teammateCard?.number === num;
                      const displayNum = num === 1 ? 'A' : num === 11 ? 'J' : num === 12 ? 'Q' : num === 13 ? 'K' : num.toString();
                      
                      return (
                        <Button
                          key={num}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTeammateCard({ suite: suite.value, number: num })}
                          className={`
                            w-full text-sm font-bold transition-all duration-200 hover:scale-105
                            ${isSelected 
                              ? "bg-gradient-gold text-casino-black shadow-card border-gold-dark" 
                              : "border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
                            }
                          `}
                        >
                          {displayNum}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Confirm Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={trumpSuite === null || !teammateCard}
              className={`
                w-full h-14 text-lg font-bold font-casino transition-all duration-300
                ${trumpSuite !== null && teammateCard
                  ? "bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark"
                  : "bg-gray-600/50 text-gray-400 border-2 border-gray-500/30 cursor-not-allowed"
                }
              `}
            >
              {trumpSuite !== null && teammateCard 
                ? "🎯 Confirm Selection" 
                : "Select Trump & Teammate First"
              }
            </Button>
          </div>

          {/* Selection Summary */}
          {(trumpSuite !== null || teammateCard) && (
            <div className="bg-gold/10 rounded-xl p-4 border border-gold/40">
              <div className="text-center text-sm text-gold/80 font-medium">
                <div className="text-xs uppercase tracking-wider mb-2">Current Selection</div>
                <div className="flex justify-center gap-6">
                  {trumpSuite !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">Trump:</span>
                      <span className={`text-lg ${trumpSuite === 1 || trumpSuite === 2 ? "text-red-400" : "text-gold"}`}>
                        {suites[trumpSuite].icon}
                      </span>
                      <span className="font-semibold">{suites[trumpSuite].name}</span>
                    </div>
                  )}
                  {teammateCard && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">Teammate:</span>
                      <span className={`text-lg ${teammateCard.suite === 1 || teammateCard.suite === 2 ? "text-red-400" : "text-gold"}`}>
                        {suites[teammateCard.suite].icon}
                      </span>
                      <span className="font-semibold">
                        {teammateCard.number === 1 ? 'A' : 
                         teammateCard.number === 11 ? 'J' : 
                         teammateCard.number === 12 ? 'Q' : 
                         teammateCard.number === 13 ? 'K' : 
                         teammateCard.number.toString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};