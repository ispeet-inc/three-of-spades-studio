import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-felt-green-light to-felt-green-dark border-2 border-gold/40 shadow-elevated backdrop-blur-sm">
        <DialogHeader className="text-center mb-8">
          <DialogTitle className="text-4xl font-casino text-gold mb-4 flex items-center justify-center gap-4">
            🎮 How to Play Three of Spades
          </DialogTitle>
          <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Game Overview */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">🎯 Game Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gold/80 text-lg font-semibold tracking-wider text-center">
                Three of Spades is a strategic 4-player card game where players form teams and compete to win tricks while bidding for contracts. 
                The game uses a special deck with cards 3, 5, 7, 8, 9, 10, J, Q, K, A from all four suits.
              </p>
            </CardContent>
          </Card>

          {/* Objective */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">🏆 Objective</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gold/80 text-lg font-semibold tracking-wider text-center">
                Score points by winning tricks and meeting your team's bid. The team that wins the bidding must score at least their bid amount, 
                while the opposing team tries to prevent them from reaching their target.
              </p>
            </CardContent>
          </Card>

          {/* Game Setup */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">⚙️ Game Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 w-fit mx-auto">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-gradient-gold/20 text-gold border-gold/30 px-4 py-2 text-lg font-bold w-32 shrink-0 justify-center">Players</Badge>
                  <span className="text-gold/80 text-lg font-semibold tracking-wider">4 players (you + 3 AI opponents)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-gradient-gold/20 text-gold border-gold/30 px-4 py-2 text-lg font-bold w-32 shrink-0 justify-center">Deck</Badge>
                  <span className="text-gold/80 text-lg font-semibold tracking-wider">40 cards (3, 5, 7, 8, 9, 10, J, Q, K, A from each suit)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-gradient-gold/20 text-gold border-gold/30 px-4 py-2 text-lg font-bold w-32 shrink-0 justify-center">Teams</Badge>
                  <span className="text-gold/80 text-lg font-semibold tracking-wider">2 teams of 2 players each</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-gradient-gold/20 text-gold border-gold/30 px-4 py-2 text-lg font-bold w-32 shrink-0 justify-center">Dealing</Badge>
                  <span className="text-gold/80 text-lg font-semibold tracking-wider">Each player receives 10 cards</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Values */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">🃏 Card Values & Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-gold/10 rounded-xl border border-gold/30">
                    <span className="font-bold text-gold text-lg">Aces (A)</span>
                    <span className="text-gold/80 font-semibold">Highest rank (14), worth 10 points</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-gold/10 rounded-xl border border-gold/30">
                    <span className="font-bold text-gold text-lg">Face Cards (J, Q, K)</span>
                    <span className="text-gold/80 font-semibold">Worth 10 points each</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-gold/10 rounded-xl border border-gold/30">
                    <span className="font-bold text-gold text-lg">10s</span>
                    <span className="text-gold/80 font-semibold">Worth 10 points</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-gold/10 rounded-xl border border-gold/30">
                    <span className="font-bold text-gold text-lg">5s</span>
                    <span className="text-gold/80 font-semibold">Worth 5 points</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-gold/10 rounded-xl border border-gold/30">
                    <span className="font-bold text-casino-red text-lg">3 of Spades</span>
                    <span className="text-casino-red font-bold">Special card worth 30 points</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-gold/10 rounded-xl border border-gold/30">
                    <span className="font-bold text-gold text-lg">Other cards</span>
                    <span className="text-gold/80 font-semibold">Worth 0 points</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Phases */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">🎮 Game Phases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-gradient-gold/10 rounded-2xl border border-gold/30">
                <h4 className="font-bold text-xl mb-4 text-gold text-center">1. Bidding Phase</h4>
                <ul className="list-disc list-inside space-y-2 text-gold/80 text-lg font-semibold tracking-wider">
                  <li>Starting bid is 165 points</li>
                  <li>Players take turns bidding higher or passing</li>
                  <li>Bidding continues until only one player remains</li>
                  <li>The winner becomes the "bidder" and must score at least their bid amount</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-gold/10 rounded-2xl border border-gold/30">
                <h4 className="font-bold text-xl mb-4 text-gold text-center">2. Trump Selection</h4>
                <ul className="list-disc list-inside space-y-2 text-gold/80 text-lg font-semibold tracking-wider">
                  <li>The bidder chooses a <strong>Trump Suit</strong> (any suit that will be highest in the round)</li>
                  <li>The bidder selects a <strong>Teammate Card</strong> (a card they don't have in their hand)</li>
                  <li><strong>Team Formation</strong>: The player who has the teammate card becomes the bidder's partner</li>
                  <li><strong>Hidden Teams</strong>: Teams are not revealed until the teammate card is played</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-gold/10 rounded-2xl border border-gold/30">
                <h4 className="font-bold text-xl mb-4 text-gold text-center">3. Playing Phase</h4>
                <ul className="list-disc list-inside space-y-2 text-gold/80 text-lg font-semibold tracking-wider">
                  <li><strong>Starting</strong>: The bidder leads the first trick</li>
                  <li><strong>Following Suit</strong>: Players must follow the led suit if possible</li>
                  <li><strong>Trump</strong>: If you can't follow suit, you may play any card (including trump)</li>
                  <li><strong>Winning</strong>: Highest trump wins, or highest card of the led suit if no trump is played</li>
                  <li><strong>Trick Collection</strong>: The winner collects the trick and leads the next one</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Tips */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">💡 Strategy Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-gradient-gold/10 rounded-2xl border border-gold/30">
                <h4 className="font-bold text-xl mb-4 text-gold text-center">During Bidding</h4>
                <ul className="list-disc list-inside space-y-2 text-gold/80 text-lg font-semibold tracking-wider">
                  <li>Consider your hand strength before bidding</li>
                  <li>High-value cards (Aces, 10s, 5s, 3♠️) increase your chances</li>
                  <li>Trump cards can be powerful for winning tricks</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-gold/10 rounded-2xl border border-gold/30">
                <h4 className="font-bold text-xl mb-4 text-gold text-center">During Trump Selection</h4>
                <ul className="list-disc list-inside space-y-2 text-gold/80 text-lg font-semibold tracking-wider">
                  <li>Choose a trump suit you have many cards in</li>
                  <li>Select a teammate card that's likely in a strong player's hand</li>
                  <li>Consider the distribution of high-value cards</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-gold/10 rounded-2xl border border-gold/30">
                <h4 className="font-bold text-xl mb-4 text-gold text-center">During Play</h4>
                <ul className="list-disc list-inside space-y-2 text-gold/80 text-lg font-semibold tracking-wider">
                  <li><strong>Lead with Trump</strong>: Trump cards can win tricks even against higher cards of other suits</li>
                  <li><strong>Save High Cards</strong>: Don't waste Aces and 10s early unless necessary</li>
                  <li><strong>Watch for the Teammate Card</strong>: When it's played, teams are revealed</li>
                  <li><strong>Count Cards</strong>: Track which cards have been played to make better decisions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Key Rules */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">📋 Key Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-3 text-gold/80 text-lg font-semibold tracking-wider">
                <li><strong>Follow Suit</strong>: You must play a card of the led suit if you have one</li>
                <li><strong>Trump Power</strong>: Trump cards beat any non-trump card</li>
                <li><strong>3 of Spades</strong>: This special card is worth 30 points - protect it!</li>
                <li><strong>Team Play</strong>: Coordinate with your hidden partner through smart card play</li>
              </ul>
            </CardContent>
          </Card>

          {/* Tips for Beginners */}
          <Card className="bg-casino-black/30 rounded-3xl p-8 border border-gold/30">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gold mb-6 text-center uppercase tracking-wide">🎯 Tips for Beginners</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-3 text-gold/80 text-lg font-semibold tracking-wider">
                <li>Start by learning to follow suit correctly</li>
                <li>Pay attention to which cards have been played</li>
                <li>Don't be afraid to pass during bidding if your hand is weak</li>
                <li>Remember that the 3 of Spades is extremely valuable</li>
                <li>Watch for patterns in how your opponents play</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-6">
          <Button 
            onClick={onClose}
            className="w-full h-16 text-xl font-bold font-casino bg-gradient-gold text-casino-black shadow-glow hover:shadow-glow/80 border-2 border-gold-dark transition-all duration-300 hover:scale-105"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlayModal;
