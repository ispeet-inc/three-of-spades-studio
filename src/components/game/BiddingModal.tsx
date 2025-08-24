import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/types/game";
import { useState } from "react";
import { HandPreview } from "./HandPreview";

interface BiddingModalProps {
  isOpen: boolean;
  playerHand: Card[];
  currentBid: number;
  currentBidder: number;
  bidTimer: number;
  playerNames: Record<number, string>;
  canBid: boolean;
  onBid: (bidAmount: number) => void;
  onPass: () => void;
}

export const BiddingModal = ({
  isOpen,
  playerHand,
  currentBid,
  currentBidder,
  bidTimer,
  playerNames,
  canBid,
  onBid,
  onPass,
}: BiddingModalProps) => {
  const [customBid, setCustomBid] = useState("");

  const minIncrement = currentBid < 200 ? 5 : 10;
  const maxBid = 250;

  const handleBid = (increment: number) => {
    const newBid = currentBid + increment;
    if (newBid <= maxBid) {
      onBid(newBid);
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
    onBid(value);
    setCustomBid("");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-xl bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-casino text-gold mb-2">
            Bidding Round
          </DialogTitle>
          <div className="w-16 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>

        {/* Premium Hand Preview */}
        <HandPreview hand={playerHand} />

        {/* Premium Bidding Information */}
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-xl p-4 border border-gold/30 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-casino-black/20 rounded-lg p-3 border border-gold/20">
              <div className="text-xs font-medium text-gold/70 uppercase tracking-wider mb-1">
                Current Bid
              </div>
              <div className="text-xl font-bold text-gold">{currentBid}</div>
            </div>
            <div className="bg-casino-black/20 rounded-lg p-3 border border-gold/20">
              <div className="text-xs font-medium text-gold/70 uppercase tracking-wider mb-1">
                Bidder
              </div>
              <div className="text-lg font-semibold text-gold truncate">
                {playerNames[currentBidder]}
              </div>
            </div>
            <div className="bg-casino-black/20 rounded-lg p-3 border border-gold/20">
              <div className="text-xs font-medium text-gold/70 uppercase tracking-wider mb-1">
                Timer
              </div>
              <div className="text-xl font-bold text-gold animate-pulse">
                {bidTimer}s
              </div>
            </div>
          </div>
        </div>

        {canBid ? (
          <div className="space-y-4">
            {/* Quick Bid Buttons */}
            <div className="flex gap-3 justify-center">
              {minIncrement === 5 && (
                <Button
                  onClick={() => handleBid(minIncrement)}
                  disabled={currentBid + minIncrement > maxBid}
                  className="bg-gradient-gold text-casino-black font-bold px-6 py-3 text-lg hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  +{minIncrement}
                </Button>
              )}
              <Button
                onClick={() => handleBid(10)}
                disabled={currentBid + 10 > maxBid}
                className="bg-gradient-gold text-casino-black font-bold px-6 py-3 text-lg hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                +10
              </Button>
            </div>

            {/* Custom Bid Section */}
            <div className="bg-casino-black/20 rounded-xl p-4 border border-gold/20">
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gold/80 uppercase tracking-wider">
                  Custom Bid
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Input
                  type="number"
                  value={customBid}
                  onChange={e => setCustomBid(e.target.value)}
                  placeholder="Enter amount"
                  className="w-32 bg-felt-green-light/50 border-gold/30 text-gold font-semibold text-center focus:border-gold focus:ring-gold/20"
                  min={currentBid + 1}
                  max={maxBid}
                />
                <Button
                  onClick={handleCustomBid}
                  disabled={!customBid}
                  className="bg-gradient-gold text-casino-black font-bold px-6 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Bid
                </Button>
              </div>
            </div>

            {/* Pass Button */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={onPass}
                className="border-2 border-red-500/60 text-red-300 hover:bg-red-500/20 hover:border-red-400 font-semibold px-8 py-3 transition-all duration-300"
              >
                Pass
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center bg-casino-black/20 rounded-xl p-6 border border-gold/20">
            <div className="text-gold/70 text-lg font-medium mb-2">
              Waiting for other players...
            </div>
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
