import { Button } from "@/components/ui/button";
import { PlayingCard } from "@/components/game/PlayingCard";
import { useNavigate } from "react-router-dom";
import { Suite } from "@/types/game";
import { createCard } from "@/utils/cardUtils";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-gradient-felt relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')]" />
      
      <div className="relative min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Main Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gold mb-3 sm:mb-4 drop-shadow-2xl animate-float">
            Three of Spades
          </h1>
          <p className="text-base sm:text-xl text-foreground/90 mb-6 sm:mb-8 max-w-2xl px-4">
            Experience the ultimate premium card game with stunning visuals and smooth gameplay
          </p>
        </div>

        {/* Sample Cards Display */}
        <div className="flex gap-2 sm:gap-4 mb-8 sm:mb-12 perspective-1000">
          <div className="animate-card-deal" style={{ animationDelay: '0ms' }}>
            <PlayingCard 
              card={createCard(Suite.Spade, 1)} 
              size="md"
              className="sm:!w-20 sm:!h-30 hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="animate-card-deal" style={{ animationDelay: '200ms' }}>
            <PlayingCard 
              card={{ id: 'K-hearts', suite: 2, number: 13, rank: 13, points: 10, positionValue: 213, hash: 'K-of-heart' }} 
              size="md"
              className="sm:!w-20 sm:!h-30 hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="animate-card-deal" style={{ animationDelay: '400ms' }}>
            <PlayingCard 
              card={{ id: 'Q-diamonds', suite: 1, number: 12, rank: 12, points: 10, positionValue: 112, hash: 'Q-of-diamond' }} 
              size="md"
              className="sm:!w-20 sm:!h-30 hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="animate-card-deal" style={{ animationDelay: '600ms' }}>
            <PlayingCard 
              card={{ id: 'J-clubs', suite: 0, number: 11, rank: 11, points: 10, positionValue: 11, hash: 'J-of-club' }} 
              size="md"
              className="sm:!w-20 sm:!h-30 hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 mb-6 sm:mb-8">
          <Button 
            size="lg"
            onClick={() => navigate('/redux-game')}
            className="bg-gradient-gold text-casino-black font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-elevated hover:shadow-glow transition-all duration-300 active:scale-[0.98] min-h-[48px]"
          >
            Start Game!
          </Button>
        </div>

        {/* Features */}
        <div className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-4xl w-full px-4">
          <div className="text-center bg-secondary/20 backdrop-blur p-4 sm:p-6 rounded-lg border border-border/30">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎮</div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Premium Interface</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Beautiful casino-quality design with smooth animations</p>
          </div>
          <div className="text-center bg-secondary/20 backdrop-blur p-4 sm:p-6 rounded-lg border border-border/30">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">⚡</div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Fast Gameplay</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Quick and responsive card interactions</p>
          </div>
          <div className="text-center bg-secondary/20 backdrop-blur p-4 sm:p-6 rounded-lg border border-border/30">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">👥</div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Multiplayer Ready</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Support for 4-player team-based gameplay</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
