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
    title: "During Bidding",
    icon: "💰",
    tips: [
      "Consider your hand strength before bidding",
      "High-value cards (Aces, 10s, 5s, 3♠️) increase your chances",
      "Trump cards can be powerful for winning tricks",
    ],
  },
  {
    title: "During Trump Selection",
    icon: "👑",
    tips: [
      "Choose a trump suit you have many cards in",
      "Select a teammate card that's likely in a strong player's hand",
      "Consider the distribution of high-value cards",
    ],
  },
  {
    title: "During Play",
    icon: "🎮",
    tips: [
      "Lead with Trump: Trump cards can win tricks even against higher cards of other suits",
      "Save High Cards: Don't waste Aces and 10s early unless necessary",
      "Watch for the Teammate Card: When it's played, teams are revealed",
      "Count Cards: Track which cards have been played to make better decisions",
    ],
  },
];

const BEGINNER_TIPS = [
  "Start by learning to follow suit correctly",
  "Pay attention to which cards have been played",
  "Don't be afraid to pass during bidding if your hand is weak",
  "Remember that the 3 of Spades is extremely valuable",
  "Watch for patterns in how your opponents play",
];

const CARD_CATEGORIES = [
  {
    category: "High Value Cards",
    cards: [
      {
        name: "Aces (A)",
        value: "Highest rank (14), worth 10 points",
        icon: "🃏",
      },
      {
        name: "Face Cards (J, Q, K)",
        value: "Worth 10 points each",
        icon: "👑",
      },
      { name: "10s", value: "Worth 10 points", icon: "🔟" },
    ],
  },
  {
    category: "Special Cards",
    cards: [
      { name: "5s", value: "Worth 5 points", icon: "5️⃣" },
      {
        name: "3 of Spades",
        value: "Special card worth 30 points",
        icon: "♠️",
        highlight: true,
      },
      {
        name: "Other cards",
        value: "Worth 0 points",
        icon: "🃏",
      },
    ],
  },
  {
    category: "Game Mechanics",
    cards: [
      {
        name: "Trump Suit",
        value: "Chosen by bidder, highest in round",
        icon: "⭐",
      },
      {
        name: "Teammate Card",
        value: "Determines hidden partner",
        icon: "🤝",
      },
      {
        name: "Trick Taking",
        value: "Follow suit or play trump",
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
      <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-3xl p-0">
        <DialogHeader className="text-center p-4 sm:p-8 border-b border-gray-100">
          <Button
            onClick={onClose}
            className="absolute top-6 right-6 h-10 w-10 p-0 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Play className="h-8 w-8 text-gold" />
            <DialogTitle className="text-xl sm:text-3xl font-bold text-casino-black">
              How to Play
            </DialogTitle>
            <Target className="h-8 w-8 text-gold" />
          </div>
          <DialogDescription className="sr-only">
            Learn the rules, strategy, and tips for playing Three of Spades
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 sm:p-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gray-50 border border-gray-200 rounded-xl p-1 mb-4 sm:mb-8">
              {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-white data-[state=active]:text-gold data-[state=active]:shadow-sm text-gray-600 font-medium rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm touch-target"
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="quick-start" className="space-y-8">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <SectionHeading>Game Overview</SectionHeading>
                  <SectionDescription>
                    Three of Spades is a strategic 4-player card game where
                    players form teams and compete to win tricks while bidding
                    for contracts.
                  </SectionDescription>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {GAME_SETUP_ITEMS.map((item, index) => (
                    <InfoCard key={index} {...item} />
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-casino-black">
                    Key Rules
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {KEY_RULES.map((rule, index) => (
                      <RuleCard key={index} {...rule} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-8">
              <div className="space-y-6">
                <SectionHeading>Game Phases</SectionHeading>
                <div className="space-y-4 max-w-3xl mx-auto">
                  {GAME_PHASES.map((phase, index) => (
                    <PhaseCard key={index} {...phase} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-8">
              <div className="space-y-6">
                <SectionHeading>Strategy Tips</SectionHeading>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {STRATEGY_SECTIONS.map((section, index) => (
                    <StrategyCard key={index} {...section} />
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-casino-black text-center">
                    Tips for Beginners
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {BEGINNER_TIPS.map((tip, index) => (
                      <TipCard key={index} tip={tip} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reference" className="space-y-8">
              <div className="space-y-6">
                <SectionHeading>Card Values & Ranking</SectionHeading>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {CARD_CATEGORIES.map((category, index) => (
                    <CategoryCard key={index} {...category} />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center pt-8">
              <Button
              onClick={onClose}
              className="w-full h-10 sm:h-14 text-base sm:text-lg font-semibold bg-gold text-casino-black hover:bg-gold-light active:scale-95 transition-all duration-200 rounded-xl touch-target"
            >
              Got it! Let's Play!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlayModal;
