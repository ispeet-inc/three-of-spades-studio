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
}) => (
  <div className={cn("text-center mb-4 relative", className)}>
    <div className="relative">
      <h2
        className={cn(
          "text-2xl font-casino text-gold mb-2 flex items-center justify-center gap-2",
          titleClassName
        )}
      >
        {title}
      </h2>
    </div>
    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto rounded-full"></div>
  </div>
);
