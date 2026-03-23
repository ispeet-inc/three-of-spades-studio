import { cn } from "@/lib/utils";
import { Card } from "@/types/game";
import { PlayingCard } from "./PlayingCard";

interface HandPreviewProps {
  hand: Array<Card>;
  compact?: boolean;
}

export function HandPreview({ hand, compact = false }: HandPreviewProps) {
  return (
    <div className="hand-preview">
      <div className={cn(
        "bg-casino-black/20 rounded-xl border border-gold/20",
        compact ? "p-2 mb-3" : "p-4 mb-6"
      )}>
        <div className="flex gap-0 justify-center flex-wrap">
          {hand.map((card, idx) => (
            <div
              key={idx}
              className="transform hover:scale-105 transition-transform duration-200"
            >
              <PlayingCard
                card={card}
                compact={compact}
                size={compact ? "sm" : "md"}
                className={cn("shadow-card", compact ? "-ml-3" : "-ml-6")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
