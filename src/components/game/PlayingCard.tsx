import { useRef } from "react";
import { Card } from "@/types/game";
import { getSuiteIcon, getSuiteColor } from "@/utils/cardUtils";
import { cn } from "@/lib/utils";
import { useFeedback } from "@/utils/feedbackSystem";

export type { Card };

interface PlayingCardProps {
  card: Card;
  isPlayable?: boolean;
  isSelected?: boolean;
  mini?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  dealAnimation?: boolean;
  dealDelay?: number;
  playerPosition?: 'bottom' | 'left' | 'top' | 'right';
}

export const PlayingCard = ({ 
  card, 
  isPlayable = false, 
  isSelected = false, 
  mini = false, 
  size = 'md',
  onClick, 
  className,
  dealAnimation = false,
  dealDelay = 0,
  playerPosition = 'bottom'
}: PlayingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { trigger } = useFeedback();
  const suitIcon = getSuiteIcon(card.suite);
  const suitColor = getSuiteColor(card.suite);
  const displayNumber = card.number === 1 ? 'A' : 
                       card.number === 11 ? 'J' :
                       card.number === 12 ? 'Q' :
                       card.number === 13 ? 'K' : 
                       card.number.toString();

  // Animation classes based on dealing position
  const getDealAnimation = () => {
    if (!dealAnimation) return '';
    
    const baseDelay = `animate-delay-[${dealDelay}ms]`;
    
    switch (playerPosition) {
      case 'bottom':
        return `animate-[deal-to-bottom_0.8s_ease-out_forwards] ${baseDelay}`;
      case 'left':
        return `animate-[deal-to-left_0.8s_ease-out_forwards] ${baseDelay}`;
      case 'top':
        return `animate-[deal-to-top_0.8s_ease-out_forwards] ${baseDelay}`;
      case 'right':
        return `animate-[deal-to-right_0.8s_ease-out_forwards] ${baseDelay}`;
      default:
        return '';
    }
  };

  const getCardSize = () => {
    if (mini) return "w-8 h-12";
    
    switch (size) {
      case 'sm':
        return "w-12 h-18";
      case 'lg':
        return "w-20 h-30";
      default: // 'md'
        return "w-16 h-24";
    }
  };

  const getTextSize = () => {
    if (mini) return {
      number: "text-[10px]",
      suit: "text-[8px]",
      center: "text-sm"
    };
    
    switch (size) {
      case 'sm':
        return {
          number: "text-xs",
          suit: "text-[10px]", 
          center: "text-lg"
        };
      case 'lg':
        return {
          number: "text-base",
          suit: "text-sm",
          center: "text-3xl"
        };
      default: // 'md'
        return {
          number: "text-sm",
          suit: "text-xs",
          center: "text-2xl"
        };
    }
  };

  const textSizes = getTextSize();

  const handleClick = () => {
    if (onClick) {
      trigger('cardPlay', { element: cardRef.current || undefined, intensity: 'medium' });
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative bg-white rounded-lg border-2 border-casino-black/20 shadow-card transition-all duration-300",
        getCardSize(),
        "cursor-pointer select-none overflow-hidden",
        isPlayable && "hover:scale-110 hover:shadow-card-hover hover:-translate-y-2 hover:border-gold/50 hover:animate-card-hover-lift",
        isSelected && "scale-105 shadow-card-selected border-gold -translate-y-1",
        !isPlayable && !onClick && "cursor-default",
        dealAnimation && getDealAnimation(),
        "transform-gpu", // Enable hardware acceleration
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => isPlayable && trigger('cardDeal', { element: cardRef.current || undefined, intensity: 'light' })}
      style={{
        animationDelay: dealAnimation ? `${dealDelay}ms` : undefined
      }}
    >
      {/* Card face */}
      <div className="absolute inset-1 bg-white rounded-md flex flex-col justify-between p-1">
        {/* Top left number and suit */}
        <div className={cn(
          "flex flex-col items-start leading-none",
          suitColor === 'red' ? "text-red-600" : "text-casino-black"
        )}>
          <span className={cn("font-bold", textSizes.number)}>{displayNumber}</span>
          <span className={textSizes.suit}>{suitIcon}</span>
        </div>

        {/* Center suit icon */}
        {!mini && (
          <div className="flex-1 flex items-center justify-center">
            <span className={cn(
              textSizes.center,
              suitColor === 'red' ? "text-red-600" : "text-casino-black"
            )}>
              {suitIcon}
            </span>
          </div>
        )}

        {/* Bottom right number and suit (rotated) */}
        <div className={cn(
          "flex flex-col items-end leading-none rotate-180 self-end",
          suitColor === 'red' ? "text-red-600" : "text-casino-black"
        )}>
          <span className={cn("font-bold", textSizes.number)}>{displayNumber}</span>
          <span className={textSizes.suit}>{suitIcon}</span>
        </div>
      </div>

      {/* Glow effect for playable cards */}
      {isPlayable && (
        <div className="absolute inset-0 rounded-lg bg-gold/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg border-2 border-gold bg-gold/10 pointer-events-none" />
      )}
    </div>
  );
};