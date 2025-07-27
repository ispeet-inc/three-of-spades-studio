import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  text = "Loading...",
  fullScreen = false
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const content = (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "min-h-screen bg-gradient-felt",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 
        className={cn(
          sizeClasses[size], 
          "animate-spin text-gold"
        )}
        aria-hidden="true"
      />
      {text && (
        <p className={cn(
          textSizeClasses[size],
          "text-gold/80 font-medium"
        )}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading game content</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-felt">
        {content}
      </div>
    );
  }

  return content;
};

// Game-specific loading states
export const GameLoadingSpinner = () => (
  <LoadingSpinner 
    size="lg" 
    text="Preparing your premium casino experience..."
    fullScreen
  />
);

export const CardLoadingSpinner = () => (
  <LoadingSpinner 
    size="sm" 
    text="Dealing cards..."
    className="p-4"
  />
);

export const BotThinkingSpinner = () => (
  <LoadingSpinner 
    size="sm" 
    text="Bot is thinking..."
    className="p-2"
  />
);