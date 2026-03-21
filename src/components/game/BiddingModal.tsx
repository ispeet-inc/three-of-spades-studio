import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { placeBid, passBid } from "@/store/gameSlice";
import { 
  selectCurrentBid, 
  selectCurrentBidder, 
  selectPassedPlayers, 
  selectBidTimer 
} from "@/store/selectors";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, PlayingCard } from "./PlayingCard";
import { cn } from "@/lib/utils";

export function HandPreview({ hand, compact = false }: { hand: Array<Card>; compact?: boolean }) {
  return (
    <div className="hand-preview">
      <div className={cn(
        "bg-casino-black/20 rounded-xl border border-gold/20",
        compact ? "p-2 mb-3" : "p-4 mb-6"
      )}>
        <div className="flex gap-0 justify-center flex-wrap">
          {hand.map((card, idx) => (
            <div key={idx} className="transform transition-transform duration-200">
              <PlayingCard 
                card={card} 
                size={compact ? 'sm' : 'md'}
                className={cn(
                  "shadow-card",
                  compact ? "-ml-4" : "-ml-6"
                )} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export const BiddingModal = () => {
  const dispatch = useAppDispatch();
  const { players, playerNames } = useAppSelector(state => state.game);
  const currentBid = useAppSelector(selectCurrentBid);
  const currentBidder = useAppSelector(selectCurrentBidder);
  const passedPlayers = useAppSelector(selectPassedPlayers);
  const bidTimer = useAppSelector(selectBidTimer);
  const [customBid, setCustomBid] = useState("");

  const minIncrement = currentBid < 200 ? 5 : 10;
  const maxBid = 250;
  const canBid = !passedPlayers.includes(0) && currentBidder === 0;

  const handleBid = (increment: number) => {
    const newBid = currentBid + increment;
    if (newBid <= maxBid) {
      dispatch(placeBid({ playerIndex: 0, bidAmount: newBid }));
    }
  };

  const handleCustomBid = () => {
    const value = Number(customBid);
    if (
      isNaN(value) ||
      value <= currentBid ||
      value > maxBid ||
      (currentBid < 200 && (value - currentBid) % 5 !== 0) ||
      (currentBid >= 200 && (value - currentBid) % 10 !== 0)
    ) {
      alert("Invalid custom bid.");
      return;
    }
    dispatch(placeBid({ playerIndex: 0, bidAmount: value }));
    setCustomBid("");
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl sm:text-2xl font-casino text-gold mb-1 sm:mb-2">
            Bidding Round
          </DialogTitle>
          <div className="w-16 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>

        {/* Premium Hand Preview */}
        <HandPreview hand={players[0].hand} compact />

        {/* Premium Bidding Information */}
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-xl p-2 sm:p-4 border border-gold/30 mb-3 sm:mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="bg-casino-black/20 rounded-lg p-2 sm:p-3 border border-gold/20">
              <div className="text-[10px] sm:text-xs font-medium text-gold/70 uppercase tracking-wider mb-0.5 sm:mb-1">Bid</div>
              <div className="text-lg sm:text-xl font-bold text-gold">{currentBid}</div>
            </div>
            <div className="bg-casino-black/20 rounded-lg p-2 sm:p-3 border border-gold/20">
              <div className="text-[10px] sm:text-xs font-medium text-gold/70 uppercase tracking-wider mb-0.5 sm:mb-1">Bidder</div>
              <div className="text-sm sm:text-lg font-semibold text-gold truncate">{playerNames[currentBidder]}</div>
            </div>
            <div className="bg-casino-black/20 rounded-lg p-2 sm:p-3 border border-gold/20">
              <div className="text-[10px] sm:text-xs font-medium text-gold/70 uppercase tracking-wider mb-0.5 sm:mb-1">Timer</div>
              <div className="text-lg sm:text-xl font-bold text-gold animate-pulse">{bidTimer}s</div>
            </div>
          </div>
        </div>

        {canBid ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Quick Bid Buttons */}
            <div className="flex gap-2 sm:gap-3 justify-center">
              {minIncrement === 5 && <Button 
                onClick={() => handleBid(minIncrement)} 
                disabled={currentBid + minIncrement > maxBid}
                className="bg-gradient-gold text-casino-black font-bold px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg min-h-[44px] hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                +{minIncrement}
              </Button>}
              <Button 
                onClick={() => handleBid(10)} 
                disabled={currentBid + 10 > maxBid}
                className="bg-gradient-gold text-casino-black font-bold px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg min-h-[44px] hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                +10
              </Button>
            </div>
            
            {/* Custom Bid Section */}
            <div className="bg-casino-black/20 rounded-xl p-3 sm:p-4 border border-gold/20">
              <div className="text-center mb-2 sm:mb-3">
                <div className="text-xs sm:text-sm font-medium text-gold/80 uppercase tracking-wider">Custom Bid</div>
              </div>
              <div className="flex gap-2 sm:gap-3 justify-center">
                <Input
                  type="number"
                  value={customBid}
                  onChange={(e) => setCustomBid(e.target.value)}
                  placeholder="Amount"
                  className="w-24 sm:w-32 bg-felt-green-light/50 border-gold/30 text-gold font-semibold text-center min-h-[44px] focus:border-gold focus:ring-gold/20"
                  min={currentBid + 1}
                  max={maxBid}
                />
                <Button 
                  onClick={handleCustomBid} 
                  disabled={!customBid}
                  className="bg-gradient-gold text-casino-black font-bold px-4 sm:px-6 min-h-[44px] hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Bid
                </Button>
              </div>
            </div>
            
            {/* Pass Button */}
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => dispatch(passBid({ playerIndex: 0 }))}
                className="border-2 border-red-500/60 text-red-300 hover:bg-red-500/20 hover:border-red-400 font-semibold px-6 sm:px-8 py-2 sm:py-3 min-h-[44px] transition-all duration-300"
              >
                Pass
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center bg-casino-black/20 rounded-xl p-4 sm:p-6 border border-gold/20">
            <div className="text-gold/70 text-base sm:text-lg font-medium mb-2">Waiting for other players...</div>
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
