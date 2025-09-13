import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  MAX_BID,
  MIN_INCREMENT_ABOVE_200,
  MIN_INCREMENT_BELOW_200,
} from "@/utils/constants";
import { useState } from "react";

interface BiddingControlsProps {
  currentBid: number;
  canBid: boolean;
  onBid: (amount: number) => void;
  onPass: () => void;
  isObserver?: boolean;
}

export const BiddingControls = ({
  currentBid,
  canBid,
  onBid,
  onPass,
  isObserver = false,
}: BiddingControlsProps) => {
  const [showCustomBid, setShowCustomBid] = useState(false);
  const [customBidAmount, setCustomBidAmount] = useState("");
  const { toast } = useToast();

  // Enhanced bidding logic from BiddingModal
  const minIncrement =
    currentBid < 200 ? MIN_INCREMENT_BELOW_200 : MIN_INCREMENT_ABOVE_200;
  const maxBid = MAX_BID;

  if (isObserver) {
    return null;
  }

  const handleCustomBid = () => {
    const amount = parseInt(customBidAmount);
    if (
      isNaN(amount) ||
      amount <= currentBid ||
      amount > maxBid ||
      (amount <= 200 && amount % MIN_INCREMENT_BELOW_200 !== 0) ||
      (amount > 200 && amount % MIN_INCREMENT_ABOVE_200 !== 0)
    ) {
      toast({
        title: "Invalid Bid",
        description:
          "Please enter a valid bid amount that follows the increment rules.",
        variant: "destructive",
      });
      return;
    }
    onBid(amount);
    setShowCustomBid(false);
    setCustomBidAmount("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomBid();
    } else if (e.key === "Escape") {
      setShowCustomBid(false);
      setCustomBidAmount("");
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-20">
      <div className="bg-gradient-to-br from-casino-black/80 to-casino-black/60 backdrop-blur-sm border border-gold/40 rounded-2xl p-4 shadow-elevated">
        {/* Single line of bidding buttons - Matching mockup design */}
        <div className="flex gap-2 items-center">
          {/* Show appropriate increment button based on current bid */}
          <Button
            onClick={() => onBid(currentBid + minIncrement)}
            disabled={!canBid || currentBid + minIncrement > maxBid}
            className="bg-gradient-gold text-casino-black font-bold px-3 py-2 text-sm hover:shadow-glow transition-all duration-300 h-10 min-w-[60px]"
          >
            +{minIncrement}
          </Button>
          <Button
            onClick={() => setShowCustomBid(true)}
            disabled={!canBid}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold px-3 py-2 text-sm hover:shadow-glow transition-all duration-300 h-10 min-w-[60px]"
          >
            ?
          </Button>
          <Button
            variant="outline"
            onClick={onPass}
            disabled={!canBid}
            className="border-2 border-red-500/60 text-red-300 hover:bg-red-500/20 hover:border-red-400 font-semibold px-3 py-2 transition-all duration-300 h-10 min-w-[60px]"
          >
            Pass
          </Button>
        </div>
      </div>

      {/* Custom Bid Modal */}
      {showCustomBid && (
        <div className="absolute bottom-0 right-0 bg-black/50 backdrop-blur-sm flex items-end justify-end z-50 w-full h-full">
          <div className="bg-gradient-to-br from-felt-green-light/95 to-felt-green-dark/95 border-2 border-gold/60 rounded-2xl p-6 shadow-2xl w-80 max-h-[80vh] overflow-y-auto mb-6 mr-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gold mb-2">
                Custom Bid
              </h3>
              <p className="text-gold/70 text-sm">Enter your bid amount</p>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                value={customBidAmount}
                onChange={e => setCustomBidAmount(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`${currentBid + minIncrement}`}
                className="w-full bg-felt-green-light/50 border-gold/30 text-gold font-semibold text-center focus:border-gold focus:ring-gold/20 h-12 text-lg rounded px-3"
                autoFocus
                min={currentBid + minIncrement}
                max={maxBid}
                step={minIncrement}
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowCustomBid(false);
                    setCustomBidAmount("");
                  }}
                  variant="outline"
                  className="flex-1 border-gold/60 text-gold hover:bg-gold/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCustomBid}
                  className="flex-1 bg-gradient-gold text-casino-black font-bold hover:shadow-glow"
                  disabled={
                    !customBidAmount || parseInt(customBidAmount) <= currentBid
                  }
                >
                  Bid
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
