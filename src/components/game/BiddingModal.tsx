import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { placeBid, passBid } from "@/store/gameSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayingCard } from "./PlayingCard";

export const BiddingModal = () => {
  const dispatch = useAppDispatch();
  const { biddingState, players, playerNames } = useAppSelector(state => state.game);
  const [customBid, setCustomBid] = useState("");

  const { currentBid, currentBidder, passedPlayers, bidTimer } = biddingState;
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
    if (value > currentBid && value <= maxBid) {
      dispatch(placeBid({ playerIndex: 0, bidAmount: value }));
      setCustomBid("");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bidding Round</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-1 justify-center mb-4">
          {players[0].hand.slice(0, 6).map((card, idx) => (
            <PlayingCard key={idx} card={card} mini />
          ))}
        </div>

        <div className="space-y-2 text-sm">
          <div>Current Bid: <span className="font-bold">{currentBid}</span></div>
          <div>Current Bidder: <span className="font-bold">{playerNames[currentBidder]}</span></div>
          <div>Timer: <span className="font-bold">{bidTimer}s</span></div>
        </div>

        {canBid ? (
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => handleBid(minIncrement)} disabled={currentBid + minIncrement > maxBid}>
              +{minIncrement}
            </Button>
            <Button onClick={() => handleBid(10)} disabled={currentBid + 10 > maxBid}>
              +10
            </Button>
            <div className="flex gap-2">
              <Input
                type="number"
                value={customBid}
                onChange={(e) => setCustomBid(e.target.value)}
                placeholder="Custom bid"
                className="w-24"
              />
              <Button onClick={handleCustomBid} disabled={!customBid}>
                Bid
              </Button>
            </div>
            <Button variant="outline" onClick={() => dispatch(passBid({ playerIndex: 0 }))}>
              Pass
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">Waiting for other players...</div>
        )}
      </DialogContent>
    </Dialog>
  );
};