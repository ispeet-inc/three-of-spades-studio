import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { setBidAndTrump } from "@/store/gameSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { suiteMetadata } from "@/utils/suiteUtils";
import { getCardId } from "@/utils/cardUtils";
import { numbers } from "@/utils/constants";
import { PlayingCard } from "./PlayingCard";

export const TrumpSelectionModal = () => {
  const dispatch = useAppDispatch();
  const { players } = useAppSelector(state => state.game);
  const [trumpSuite, setTrumpSuite] = useState<number | null>(null);
  const [teammateCard, setTeammateCard] = useState<{suite: number; number: number} | null>(null);

  const handleSubmit = () => {
    if (trumpSuite !== null && teammateCard) {
      dispatch(setBidAndTrump({
        trumpSuite,
        bidder: 0,
        teammateCard
      }));
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-felt-green-dark via-felt-green to-felt-green-light border-2 border-gold/50 shadow-elevated backdrop-blur-sm animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={() => {}} 
          className="absolute top-4 right-4 text-gold/70 hover:text-gold transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Premium Player Hand Display */}
        <div className="mb-8">
          <div className="relative flex justify-center items-center min-h-[140px] bg-gradient-to-b from-casino-black/10 to-casino-black/30 rounded-2xl border-2 border-gold/40 p-6 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 rounded-2xl"></div>
            <div className="relative flex justify-center items-end">
              {players[0].hand.map((card, index) => {
                const totalCards = players[0].hand.length;
                const centerIndex = (totalCards - 1) / 2;
                const offsetFromCenter = index - centerIndex;
                const rotation = offsetFromCenter * 6;
                const xOffset = offsetFromCenter * 28;
                const yOffset = Math.abs(offsetFromCenter) * 6;
                
                return (
                  <div
                    key={card.id}
                    className="absolute transition-all duration-300 hover-scale"
                    style={{
                      transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rotation}deg)`,
                      zIndex: totalCards - Math.abs(offsetFromCenter),
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <PlayingCard 
                      card={card} 
                      size="sm"
                      className="hover:scale-110 transition-all duration-300 cursor-default shadow-card"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-casino text-gold mb-3 animate-fade-in">
            Choose Trump & Teammate Card
          </h1>
          <div className="w-32 h-1 bg-gradient-gold mx-auto rounded-full shadow-glow"></div>
          <p className="text-sm text-gold/80 mt-4 font-medium">Select your strategy to dominate the game</p>
        </div>
        
        <div className="space-y-8">
          {/* Elegant Trump Suite Selection */}
          <div className="bg-gradient-to-br from-casino-black/30 to-casino-black/10 rounded-2xl p-6 border-2 border-gold/40 shadow-card animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gold mb-2 uppercase tracking-widest">
                Select Trump Suite
              </h3>
              <div className="w-16 h-0.5 bg-gradient-gold mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {suiteMetadata.map((suite, index) => (
                <Button
                  key={suite.value}
                  variant={trumpSuite === suite.value ? "default" : "outline"}
                  onClick={() => setTrumpSuite(suite.value)}
                  className={`
                    h-20 flex items-center justify-center gap-4 font-bold text-xl transition-all duration-300 hover-scale group animate-fade-in
                    ${trumpSuite === suite.value 
                      ? "bg-gradient-gold text-casino-black shadow-glow border-2 border-gold-dark scale-105" 
                      : "border-2 border-gold/50 text-gold hover:bg-gold/20 hover:border-gold/80 hover:shadow-card bg-gradient-to-br from-felt-green-light/20 to-casino-black/20"
                    }
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className={`text-3xl transition-transform group-hover:scale-110 ${suite.value === 1 || suite.value === 2 ? "text-red-400" : ""}`}>
                    {suite.icon}
                  </span>
                  <span className="font-casino tracking-wider">{suite.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Elegant Teammate Card Selection */}
          <div className="bg-gradient-to-br from-casino-black/30 to-casino-black/10 rounded-2xl p-6 border-2 border-gold/40 shadow-card animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gold mb-2 uppercase tracking-widest">
                Select Teammate Card
              </h3>
              <div className="w-16 h-0.5 bg-gradient-gold mx-auto rounded-full"></div>
              <p className="text-sm text-gold/70 mt-3 font-medium">
                Choose a card not in your hand to identify your partner
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {suiteMetadata.map((suite, suiteIndex) => (
                <div key={suite.value} className="space-y-3 animate-fade-in" style={{ animationDelay: `${suiteIndex * 150}ms` }}>
                  {/* Elegant Suite Header */}
                  <div className="text-center bg-gradient-to-br from-felt-green-light/40 to-casino-black/20 rounded-xl py-3 border-2 border-gold/30 shadow-card">
                    <span className={`text-3xl ${suite.value === 1 || suite.value === 2 ? "text-red-400" : "text-gold"}`}>
                      {suite.icon}
                    </span>
                    <div className="text-xs text-gold/70 font-medium mt-1 tracking-wider uppercase">
                      {suite.name}
                    </div>
                  </div>
                  
                  {/* Card Numbers Grid */}
                  <div className="space-y-2">
                    {numbers.map((num, numIndex) => {
                      const hasCard = players[0].hand.some(card => 
                        card.suite === suite.value && card.number === num
                      );
                      if (hasCard) return null;
                      
                      const isSelected = teammateCard?.suite === suite.value && teammateCard?.number === num;
                      const displayNum = getCardId(num);
                      
                      return (
                        <Button
                          key={num}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTeammateCard({ suite: suite.value, number: num })}
                          className={`
                            w-full text-sm font-bold transition-all duration-300 hover-scale animate-fade-in
                            ${isSelected 
                              ? "bg-gradient-gold text-casino-black shadow-glow border-2 border-gold-dark scale-105" 
                              : "border-2 border-gold/40 text-gold hover:bg-gold/20 hover:border-gold/70 bg-gradient-to-br from-felt-green-light/10 to-casino-black/10"
                            }
                          `}
                          style={{ animationDelay: `${(suiteIndex * 150) + (numIndex * 50)}ms` }}
                        >
                          {displayNum}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          {(trumpSuite !== null || teammateCard) && (
            <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 rounded-xl p-5 border-2 border-gold/50 shadow-card animate-scale-in">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest mb-3 text-gold font-bold">Current Selection</div>
                <div className="flex justify-center gap-8">
                  {trumpSuite !== null && (
                    <div className="flex items-center gap-3 bg-casino-black/20 rounded-lg px-4 py-2 border border-gold/30">
                      <span className="text-sm opacity-80 font-medium">Trump:</span>
                      <span className={`text-2xl ${trumpSuite === 1 || trumpSuite === 2 ? "text-red-400" : "text-gold"}`}>
                        {suiteMetadata[trumpSuite].icon}
                      </span>
                      <span className="font-bold text-lg">{suiteMetadata[trumpSuite].name}</span>
                    </div>
                  )}
                  {teammateCard && (
                    <div className="flex items-center gap-3 bg-casino-black/20 rounded-lg px-4 py-2 border border-gold/30">
                      <span className="text-sm opacity-80 font-medium">Teammate:</span>
                      <span className={`text-2xl ${teammateCard.suite === 1 || teammateCard.suite === 2 ? "text-red-400" : "text-gold"}`}>
                        {suiteMetadata[teammateCard.suite].icon}
                      </span>
                      <span className="font-bold text-lg">
                        {getCardId(teammateCard.number)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Epic Confirm Button */}
          <div className="text-center pt-6">
            <Button 
              onClick={handleSubmit} 
              disabled={trumpSuite === null || !teammateCard}
              className={`
                w-full h-16 text-xl font-bold font-casino transition-all duration-500 hover-scale animate-fade-in
                ${trumpSuite !== null && teammateCard
                  ? "bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/60 border-2 border-gold-dark hover:scale-105" 
                  : "bg-gray-600/30 text-gray-500 border-2 border-gray-600/30 cursor-not-allowed"
                }
              `}
            >
              {trumpSuite !== null && teammateCard 
                ? "🎯 Confirm Selection & Start Game" 
                : "⚡ Select Trump & Teammate to Continue"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};