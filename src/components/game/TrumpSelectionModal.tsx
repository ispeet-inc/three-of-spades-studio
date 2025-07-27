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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose Trump & Teammate</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Select Trump Suite:</h3>
            <div className="flex gap-2">
              {suites.map(suite => (
                <Button
                  key={suite.value}
                  variant={trumpSuite === suite.value ? "default" : "outline"}
                  onClick={() => setTrumpSuite(suite.value)}
                  className="flex items-center gap-2"
                >
                  <span className={suite.value === 1 || suite.value === 2 ? "text-red-500" : ""}>
                    {suite.icon}
                  </span>
                  {suite.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Select Teammate Card:</h3>
            <div className="grid grid-cols-4 gap-2">
              {suites.map(suite => (
                <div key={suite.value} className="space-y-1">
                  <div className="text-center text-sm font-medium">{suite.icon}</div>
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
                        className="w-full text-xs"
                      >
                        {displayNum}
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={trumpSuite === null || !teammateCard}
            className="w-full"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};