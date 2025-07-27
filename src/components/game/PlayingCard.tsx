import { cn } from "@/lib/utils";

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  isVisible?: boolean;
}

interface PlayingCardProps {
  card?: Card;
  isBack?: boolean;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-casino-red',
  diamonds: 'text-casino-red',
  clubs: 'text-casino-black',
  spades: 'text-casino-black'
};

export const PlayingCard = ({ 
  card, 
  isBack = false, 
  className, 
  onClick, 
  isSelected = false,
  isPlayable = true,
  size = 'md'
}: PlayingCardProps) => {
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-base'
  };

  const baseClasses = cn(
    "relative rounded-lg border-2 border-gray-300 cursor-pointer transition-all duration-300",
    "hover:scale-105 hover:shadow-elevated",
    sizeClasses[size],
    {
      "shadow-glow ring-2 ring-gold scale-105": isSelected,
      "opacity-50 cursor-not-allowed": !isPlayable,
      "animate-card-deal": true
    },
    className
  );

  if (isBack) {
    return (
      <div 
        className={cn(baseClasses, "bg-gradient-to-br from-casino-red via-red-600 to-red-800")}
        onClick={onClick}
      >
        <div className="absolute inset-1 bg-white/10 rounded border border-white/20">
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:4px_4px] rounded">
            <div className="flex items-center justify-center h-full">
              <div className="text-white/80 text-lg font-bold transform rotate-45">
                ♦
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className={cn(baseClasses, "bg-card border-dashed border-border/50 opacity-30")}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="w-4 h-4 rounded-full border border-current"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(baseClasses, "bg-gradient-card shadow-card")}
      onClick={onClick}
    >
      {/* Top left corner */}
      <div className={cn("absolute top-1 left-1 flex flex-col items-center", suitColors[card.suit])}>
        <div className="font-bold leading-none">{card.value}</div>
        <div className="text-xs leading-none">{suitSymbols[card.suit]}</div>
      </div>
      
      {/* Center symbol */}
      <div className={cn("absolute inset-0 flex items-center justify-center text-2xl", suitColors[card.suit])}>
        {suitSymbols[card.suit]}
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className={cn("absolute bottom-1 right-1 flex flex-col items-center rotate-180", suitColors[card.suit])}>
        <div className="font-bold leading-none">{card.value}</div>
        <div className="text-xs leading-none">{suitSymbols[card.suit]}</div>
      </div>
    </div>
  );
};