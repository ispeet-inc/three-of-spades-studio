import { useAppSelector } from "@/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayingCard } from "./PlayingCard";

interface RoundSummaryModalProps {
  onClose: () => void;
}

export const RoundSummaryModal = ({ onClose }: RoundSummaryModalProps) => {
  const { tableCards, roundWinner, playerNames, players } = useAppSelector(state => state.game);
  
  // Get the last 4 cards played in this round
  const currentRoundCards = tableCards.slice(-4);

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Round Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium mb-2">Round Winner:</h3>
            <p className="text-lg font-bold text-primary">
              {roundWinner !== null ? playerNames[roundWinner] : 'Unknown'}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Cards Played:</h3>
            <div className="flex gap-2 justify-center">
              {currentRoundCards.map((card, idx) => (
                <div key={idx} className="text-center space-y-1">
                  <PlayingCard card={card} small />
                  <div className="text-xs text-muted-foreground">
                    {playerNames[card.player]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};