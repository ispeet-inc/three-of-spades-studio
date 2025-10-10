import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React from "react";

interface HintTooltipProps {
  content: string;
  position: "top" | "bottom" | "left" | "right";
  visible: boolean;
  onDismiss: () => void;
  targetRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export const HintTooltip: React.FC<HintTooltipProps> = ({
  content,
  position,
  visible,
  onDismiss,
  targetRef,
  className,
}) => {
  if (!visible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gold/30";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gold/30";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gold/30";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gold/30";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gold/30";
    }
  };

  return (
    <div
      className={cn(
        "absolute z-50 pointer-events-auto",
        "bg-casino-black/90 backdrop-blur-sm",
        "border border-gold/30 rounded-lg",
        "px-4 py-3 w-80",
        "text-casino-white text-sm font-medium",
        "shadow-lg",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        getPositionClasses(),
        className
      )}
      style={{
        ...(targetRef?.current && {
          left: position === "left" || position === "right" ? undefined : "50%",
          top: position === "top" || position === "bottom" ? undefined : "50%",
        }),
      }}
    >
      {/* Arrow */}
      <div className={cn("absolute w-0 h-0 border-4", getArrowClasses())} />

      {/* Content */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
        <span className="flex-1">{content}</span>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="absolute -top-1 -right-1 w-4 h-4 bg-casino-black/80 rounded-full flex items-center justify-center text-gold text-xs hover:bg-casino-black transition-colors duration-150"
        aria-label="Dismiss hint"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
