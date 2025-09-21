import React from "react";

interface WhitewashAnimationProps {
  isVisible: boolean;
}

const WhitewashAnimation: React.FC<WhitewashAnimationProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Screen flash overlay */}
      <div className="whitewash-overlay absolute inset-0 bg-transparent" />
      
      {/* Confetti particles */}
      <div className="confetti-container absolute inset-0 overflow-hidden">
        {/* Generate multiple confetti particles */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="confetti-particle absolute w-2 h-2 opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* WHITEWASH! text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="whitewash-text text-8xl md:text-9xl font-bold text-gold text-center">
          <div className="animate-glow-pulse">WHITEWASH!</div>
        </div>
      </div>
    </div>
  );
};

export default WhitewashAnimation;