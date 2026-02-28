import {
  BookOpen,
  Lightbulb,
  Play,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Data constants
const TAB_CONFIG = [
  { value: "quick-start", label: "Quick Start", icon: Zap },
  { value: "rules", label: "Game Rules", icon: BookOpen },
  { value: "strategy", label: "Strategy", icon: Lightbulb },
  { value: "reference", label: "Reference", icon: Trophy },
];

const GAME_SETUP_ITEMS = [
  { icon: "👥", label: "Players", value: "4 players" },
  { icon: "🃏", label: "Deck", value: "40 cards" },
  { icon: "🤝", label: "Teams", value: "2 teams" },
  { icon: "🎯", label: "Dealing", value: "10 cards each" },
];

const KEY_RULES = [
  {
    icon: "🔄",
    title: "Follow Suit",
    desc: "Play cards of the led suit when possible",
  },
  {
    icon: "👑",
    title: "Trump Power",
    desc: "Trump cards beat any non-trump card",
  },
  {
    icon: "♠️",
    title: "3 of Spades",
    desc: "Worth 30 points - protect it!",
  },
  {
    icon: "🤝",
    title: "Team Play",
    desc: "Coordinate with your hidden partner",
  },
];

const GAME_PHASES = [
  {
    phase: "1. Bidding Phase",
    icon: "💰",
    items: [
      "Starting bid is 165 points",
      "Players take turns bidding higher or passing",
      "Bidding continues until only one player remains",
      "The winner becomes the 'bidder' and must score at least their bid amount",
    ],
  },
  {
    phase: "2. Trump Selection",
    icon: "👑",
    items: [
      "The bidder chooses a Trump Suit (any suit that will be highest in the round)",
      "The bidder selects a Teammate Card (a card they don't have in their hand)",
      "Team Formation: The player who has the teammate card becomes the bidder's partner",
      "Hidden Teams: Teams are not revealed until the teammate card is played",
    ],
  },
  {
    phase: "3. Playing Phase",
    icon: "🎮",
    items: [
      "Starting: The bidder leads the first trick",
      "Following Suit: Players must follow the led suit if possible",
      "Trump: If you can't follow suit, you may play any card (including trump)",
      "Winning: Highest trump wins, or highest card of the led suit if no trump is played",
      "Trick Collection: The winner collects the trick and leads the next one",
    ],
  },
];

const STRATEGY_SECTIONS = [
  {
    title: "Bidding Wisdom",
    icon: "💰",
    tips: [
      "The 175 Rule: Only bid high if you have 5+ cards of one suit or the 3 of Spades.",
      "Don't bluff: The bots calculate hand strength accurately and will call your bluff.",
      "Passing is Strategic: If your hand is weak, pass and let others take the risk.",
    ],
  },
  {
    title: "Partner Hunting",
    icon: "🤝",
    tips: [
      "Watch the 'Feed': If a player drops an Ace/10 on your winning trick, they are likely your partner.",
      "The Reveal: The game shifts from 1v3 to 2v2 once the teammate card is played.",
      "Support your ally: Once revealed, sacrifice your high cards to help your partner win.",
    ],
  },
  {
    title: "The 3 of Spades Trap",
    icon: "♠️",
    tips: [
      "The Game Changer: Worth 30 points, it can swing the entire game.",
      "Bleed Trumps: Lead trumps early to make it safe to play the 3 of Spades later.",
      "Calculated Risk: Never play it early unless you are certain of the win.",
    ],
  },
];

const BEGINNER_TIPS = [
  "Points matter more than tricks: A single trick with the 3 of Spades is worth 30 points.",
  "Learn the 'Reveal': Your partner is secret until the teammate card is played.",
  "Watch the bots: They prioritize points over tricks and will support their teammate.",
  "Save high cards: Don't waste Aces and 10s early unless necessary to win a big trick.",
  "Draw out trumps: If you are the bidder, lead your trump suit early to clear the way.",
];

const CARD_CATEGORIES = [
  {
    category: "High Value Cards",
    cards: [
      {
        name: "Aces (A)",
        value: "Highest rank (14), worth 10 points. Use to capture high-point tricks.",
        icon: "🃏",
      },
      {
        name: "Face Cards (J, Q, K)",
        value: "Worth 10 points each. The foundation of your team's score.",
        icon: "👑",
      },
      { name: "10s", value: "Worth 10 points. Highly sought after by opponents.", icon: "🔟" },
    ],
  },
  {
    category: "Special Cards",
    cards: [
      { name: "5s", value: "Worth 5 points. Small but critical bonuses.", icon: "5️⃣" },
      {
        name: "3 of Spades",
        value: "Special card worth 30 points. The most hunted card in the game.",
        icon: "♠️",
        highlight: true,
      },
      {
        name: "Other cards",
        value: "Worth 0 points. Use to draw out trumps or follow suit.",
        icon: "🃏",
      },
    ],
  },
  {
    category: "Game Mechanics",
    cards: [
      {
        name: "Trump Suit",
        value: "Chosen by bidder, highest in round. Beats any non-trump card.",
        icon: "⭐",
      },
      {
        name: "Teammate Card",
        value: "Determines hidden partner. Teams are revealed when played.",
        icon: "🤝",
      },
      {
        name: "Trick Taking",
        value: "Follow suit or play trump. Points are collected from won tricks.",
        icon: "🎯",
      },
    ],
  },
];

// Reusable components
const InfoCard: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="font-semibold text-casino-black text-sm">{label}</div>
    <div className="text-gray-600 text-xs">{value}</div>
  </div>
);

const RuleCard: React.FC<{
  icon: string;
  title: string;
  desc: string;
}> = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-xl text-gold">{icon}</div>
    <div>
      <div className="font-semibold text-casino-black text-sm">{title}</div>
      <div className="text-gray-600 text-xs">{desc}</div>
    </div>
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-start gap-3 text-gray-700 text-sm">
        <div className="w-1.5 h-1.5 bg-gold rounded-full mt-2 flex-shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const PhaseCard: React.FC<{
  phase: string;
  icon: string;
  items: string[];
}> = ({ phase, icon, items }) => (
  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-2xl">{icon}</div>
      <h4 className="font-bold text-lg text-casino-black">{phase}</h4>
    </div>
    <BulletList items={items} />
  </div>
);

const StrategyCard: React.FC<{
  title: string;
  icon: string;
  tips: string[];
}> = ({ title, icon, tips }) => (
  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
    <div className="text-center mb-4">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-bold text-casino-black text-lg mb-3">{title}</h4>
    </div>
    <BulletList items={tips} />
  </div>
);

const TipCard: React.FC<{ tip: string }> = ({ tip }) => (
  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
    <div className="text-xl mb-2">💡</div>
    <p className="text-gray-700 text-sm">{tip}</p>
  </div>
);

const CardValueCard: React.FC<{
  name: string;
  value: string;
  icon: string;
  highlight?: boolean;
}> = ({ name, value, icon, highlight = false }) => (
  <div
    className={`p-3 rounded-lg border ${
      highlight ? "border-casino-red bg-red-50" : "border-gray-200 bg-white"
    } hover:border-gray-300 transition-colors duration-200`}
  >
    <div className="flex items-center gap-3">
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <div
          className={`font-semibold text-sm ${
            highlight ? "text-casino-red" : "text-casino-black"
          }`}
        >
          {name}
        </div>
        <div className="text-xs text-gray-600 leading-tight">{value}</div>
      </div>
    </div>
  </div>
);

const CategoryCard: React.FC<{
  category: string;
  cards: Array<{
    name: string;
    value: string;
    icon: string;
    highlight?: boolean;
  }>;
}> = ({ category, cards }) => (
  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
    <h4 className="font-bold text-casino-black text-lg mb-4 text-center">
      {category}
    </h4>
    <div className="space-y-3">
      {cards.map((card, index) => (
        <CardValueCard key={index} {...card} />
      ))}
    </div>
  </div>
);

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h3 className="text-2xl font-bold text-casino-black text-center">
    {children}
  </h3>
);

const SectionDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
    {children}
  </p>
);

// Main component
const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("quick-start");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-3xl p-0">
        <DialogHeader className="text-center p-8 border-b border-gray-100">
          <Button
            onClick={onClose}
            className="absolute top-6 right-6 h-10 w-10 p-0 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Play className="h-8 w-8 text-gold" />
            <DialogTitle className="text-3xl font-bold text-casino-black">
              How to Play
            </DialogTitle>
            <Target className="h-8 w-8 text-gold" />
          </div>
          <DialogDescription className="sr-only">
            Learn the rules, strategy, and tips for playing Three of Spades
          </DialogDescription>

          <Tabs
            defaultValue="quick-start"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 h-14 bg-gray-100/50 p-1 rounded-2xl">
              {TAB_CONFIG.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-gold data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="font-semibold">{tab.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </DialogHeader>

        <div className="p-8">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="quick-start" className="mt-0 space-y-8">
              <div className="text-center space-y-4">
                <SectionHeading>Master the Game of Shadows</SectionHeading>
                <SectionDescription>
                  Three of Spades is a strategic 4-player trick-taking game where{" "}
                  <span className="font-bold text-gold">points matter more than tricks</span>. 
                  Bid for control, declare a secret partner, and capture the elusive 3 of Spades.
                </SectionDescription>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GAME_SETUP_ITEMS.map((item, index) => (
                  <InfoCard key={index} {...item} />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KEY_RULES.map((rule, index) => (
                  <RuleCard key={index} {...rule} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rules" className="mt-0 space-y-8">
              <div className="text-center">
                <SectionHeading>Game Phases</SectionHeading>
              </div>

              <div className="space-y-4">
                {GAME_PHASES.map((phase, index) => (
                  <PhaseCard key={index} {...phase} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="mt-0 space-y-8">
              <div className="text-center">
                <SectionHeading>Strategy Tips</SectionHeading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STRATEGY_SECTIONS.map((section, index) => (
                  <StrategyCard key={index} {...section} />
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-casino-black text-xl text-center">
                  Tips for Beginners
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {BEGINNER_TIPS.map((tip, index) => (
                    <TipCard key={index} tip={tip} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reference" className="mt-0 space-y-8">
              <div className="text-center">
                <SectionHeading>Card Values & Ranking</SectionHeading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CARD_CATEGORIES.map((category, index) => (
                  <CategoryCard key={index} {...category} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-8 pt-0">
          <Button
            onClick={onClose}
            className="w-full h-14 bg-gold hover:bg-gold/90 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Got it! Let's Play!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlayModal;
