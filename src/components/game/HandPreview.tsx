import { Card } from "@/types/game";
import { PlayingCard } from "./PlayingCard";

interface HandPreviewProps {
  hand: Array<Card>;
}

export function HandPreview({ hand }: HandPreviewProps) {
  return (
    <div className="hand-preview">
      <div className="bg-casino-black/20 rounded-xl p-4 border border-gold/20 mb-6">
        <div className="flex gap-1 justify-center flex-wrap">
          {hand.map((card, idx) => (
            <div
              key={idx}
              className="transform hover:scale-105 transition-transform duration-200"
            >
              <PlayingCard card={card} className="shadow-card -ml-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
