import { cn } from "@/lib/utils";
import React from "react";

interface ProgressBarContainerProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
}

export const ProgressBarContainer: React.FC<ProgressBarContainerProps> = ({
  children,
  height = "h-3",
  className,
}) => (
  <div
    className={cn(
      "relative bg-gradient-to-r from-casino-black/40 to-casino-black/25 rounded-full overflow-hidden shadow-inner border border-casino-black/35",
      height,
      className
    )}
  >
    {children}
  </div>
);
