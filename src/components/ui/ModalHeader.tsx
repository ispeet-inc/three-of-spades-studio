import { useMobileLayout } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import React from "react";

interface ModalHeaderProps {
  title: string;
  className?: string;
  titleClassName?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  className,
  titleClassName,
}) => {
  const { isPhoneLandscape } = useMobileLayout();

  return (
    <div className={cn(
      "text-center relative",
      isPhoneLandscape ? "mb-2" : "mb-4",
      className
    )}>
      <div className="relative">
        <h2
          className={cn(
            "font-casino text-gold flex items-center justify-center gap-2",
            isPhoneLandscape ? "text-lg mb-1" : "text-2xl mb-2",
            titleClassName
          )}
        >
          {title}
        </h2>
      </div>
      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto rounded-full"></div>
    </div>
  );
};
