import { Card } from "@/types/game";
import { getSuiteName, getSuiteIcon, getSuiteColor } from "@/utils/cardUtils";

interface PlayingCardProps {
  card?: Card;
  hidden?: boolean;
  mini?: boolean;
  small?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const PlayingCard = ({ 
  card, 
  hidden = false, 
  mini = false, 
  small = false, 
  className = "",
  onClick,
  disabled = false
}: PlayingCardProps) => {
  if (!card && !hidden) {
    return null;
  }

  if (hidden) {
    return (
      <div 
        className={`
          relative bg-gradient-to-br from-accent to-accent-dark rounded-lg shadow-card
          ${mini ? "w-8 h-12" : small ? "w-12 h-18" : "w-16 h-24"}
          ${className}
        `}
      >
        <div className="absolute inset-1 bg-gradient-to-br from-primary-light to-primary rounded border border-primary-light/20">
          <div className="w-full h-full bg-gradient-to-br from-accent-subtle to-accent rounded-sm opacity-80" />
        </div>
      </div>
    );
  }

  if (!card) return null;

  const cardKey = `${card.id}_of_${getSuiteName(card.suite)}`;
  const suitIcon = getSuiteIcon(card.suite);
  const suitColor = getSuiteColor(card.suite);
  const displayValue = card.number === 1 ? 'A' : 
                      card.number === 11 ? 'J' : 
                      card.number === 12 ? 'Q' : 
                      card.number === 13 ? 'K' : 
                      card.number.toString();

  return (
    <div 
      className={`
        relative bg-gradient-to-br from-card to-card/90 rounded-lg shadow-card border border-card-border
        ${mini ? "w-8 h-12" : small ? "w-12 h-18" : "w-16 h-24"}
        ${onClick && !disabled ? "cursor-pointer hover:shadow-card-hover hover:scale-105 transition-all duration-200" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      {/* Card Content */}
      <div className="absolute inset-1 flex flex-col justify-between p-1">
        {/* Top Left */}
        <div className={`text-xs font-bold ${suitColor === 'red' ? 'text-destructive' : 'text-foreground'}`}>
          <div className="leading-none">{displayValue}</div>
          <div className="text-[10px] leading-none">{suitIcon}</div>
        </div>
        
        {/* Center Suit */}
        {!mini && (
          <div className={`text-center ${suitColor === 'red' ? 'text-destructive' : 'text-foreground'}`}>
            <div className={`${small ? "text-sm" : "text-lg"} leading-none`}>{suitIcon}</div>
          </div>
        )}
        
        {/* Bottom Right (rotated) */}
        <div className={`self-end transform rotate-180 text-xs font-bold ${suitColor === 'red' ? 'text-destructive' : 'text-foreground'}`}>
          <div className="leading-none">{displayValue}</div>
          <div className="text-[10px] leading-none">{suitIcon}</div>
        </div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-card-shine/10 to-transparent rounded-lg" />
    </div>
  );
};