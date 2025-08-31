import { cn } from "@/lib/utils";
import React from "react";

interface ProgressBarProps {
  width: number;
  isVisible: boolean;
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  width,
  isVisible,
  className,
  delay = 0,
  children,
}) => (
  <div
    className={cn(
      "h-full rounded-full transition-all duration-1500 ease-out shadow-sm",
      isVisible ? "opacity-100" : "opacity-0",
      className
    )}
    style={{
      width: isVisible ? `${width}%` : "0%",
      transitionDelay: `${delay}ms`,
    }}
  >
    {children}
  </div>
);

interface DualProgressBarProps {
  seriesWidth: number;
  gameWidth: number;
  isVisible: boolean;
  delay?: number;
  seriesClassName?: string;
  gameClassName?: string;
}

export const DualProgressBar: React.FC<DualProgressBarProps> = ({
  seriesWidth,
  gameWidth,
  isVisible,
  delay = 0,
  seriesClassName,
  gameClassName,
}) => (
  <>
    {/* Series Total Bar */}
    <ProgressBar
      width={seriesWidth}
      isVisible={isVisible}
      className={seriesClassName}
      delay={delay}
    />

    {/* Game Score Overlay */}
    <div
      className={cn(
        "absolute top-0 h-full rounded-full transition-all duration-2000 ease-out shadow-sm",
        isVisible ? "opacity-100" : "opacity-0",
        gameClassName
      )}
      style={{
        width: isVisible ? `${gameWidth}%` : "0%",
        left: isVisible ? `${seriesWidth}%` : "0%",
        transitionDelay: `${delay + 300}ms`,
      }}
    />
  </>
);
