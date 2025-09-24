import React from "react";

interface WhitewashAnimationProps {
  isVisible: boolean;
}

const WhitewashAnimation: React.FC<WhitewashAnimationProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Premium backdrop with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-casino-black/60 via-casino-black/40 to-felt-green/30 backdrop-blur-sm" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="whitewash-pattern absolute inset-0 bg-gradient-radial from-gold/10 via-transparent to-transparent" />
      </div>
      
      {/* Enhanced confetti system with depth */}
      <div className="confetti-container absolute inset-0 overflow-hidden">
        {/* Primary confetti layer */}
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={`primary-${i}`}
            className="confetti-particle-primary absolute w-3 h-3 shadow-lg"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#FFD700', '#FFA500', '#FF6B6B'][Math.floor(Math.random() * 3)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
        
        {/* Secondary confetti layer for depth */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={`secondary-${i}`}
            className="confetti-particle-secondary absolute w-2 h-2 opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 4)],
              animationDelay: `${0.5 + Math.random() * 1.5}s`,
              animationDuration: `${2.5 + Math.random() * 1.5}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
        
        {/* Floating sparkle effects */}
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={`sparkle-${i}`}
            className="sparkle-particle absolute w-1 h-1 bg-gold rounded-full shadow-gold"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Premium text container with depth */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="whitewash-text-container relative">
          {/* Glow backdrop */}
          <div className="absolute inset-0 bg-gradient-radial from-gold/20 via-gold/10 to-transparent blur-3xl scale-150" />
          
          {/* Text shadow layer */}
          <div className="whitewash-text-shadow absolute inset-0 text-5xl md:text-6xl font-black text-casino-black/30 blur-sm">
            WHITEWASH!
          </div>
          
          {/* Main text with premium styling */}
          <div className="whitewash-text relative text-5xl md:text-6xl font-black text-center">
            <div className="relative">
              {/* Gradient text effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold via-yellow-300 to-gold bg-clip-text text-transparent animate-glow-pulse">
                WHITEWASH!
              </div>
              {/* Solid text for fallback */}
              <div className="relative text-gold drop-shadow-2xl">
                WHITEWASH!
              </div>
            </div>
          </div>
          
          {/* Floating accent elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gold/30 rounded-full blur-sm animate-float" />
          <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gold/40 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 -left-8 w-4 h-4 bg-gold/50 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </div>
      
      {/* Celebration border effect */}
      <div className="absolute inset-4 border-2 border-gold/20 rounded-3xl animate-pulse" />
      <div className="absolute inset-6 border border-gold/10 rounded-3xl" />
    </div>
  );
};

export default WhitewashAnimation;