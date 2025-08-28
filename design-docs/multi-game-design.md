# Multi-Game Series Design & Implementation

## 🎯 Overview

This document details the UI design and implementation plan for transforming Three of Spades from a single-game experience to a multi-game series with cumulative scoring.

## 🎮 Game Mode Selection

### **StartScreen Enhancement**

**Current**: Single "Start Game" button
**Enhanced**: Game mode selection with separate buttons

#### **UI Layout**

```
┌─────────────────────────────────────┐
│           Welcome [PlayerName]      │
│                                     │
│         Three of Spades             │
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │ Single Game │ │   Series    │   │
│  │             │ │             │   │
│  │  1 Game     │ │ 4 Games     │   │
│  │             │ │             │   │
│  │             │ │             │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  Series: Compete across multiple    │
│  games with cumulative scoring!     │
│                                     │
│        [Start Game]                 │
└─────────────────────────────────────┘
```

#### **Button States & Behavior**

- **Single Game**: Default selected, highlighted (primary style)
- **Series**: Secondary style, becomes primary when selected
- **Start Game**: Enabled only after mode selection
- **Mode switching**: Click any mode button to select
- **Visual feedback**: Clear indication of selected mode

#### **Implementation Details**

```typescript
interface StartScreenProps {
  onStartGame: (playerName: string, gameMode: "single" | "series") => void;
}

// State management:
const [selectedMode, setSelectedMode] = useState<"single" | "series">("single");
const [seriesGames, setSeriesGames] = useState<number>(4); // Default 4, configurable

// Button click handlers:
const handleModeSelect = (mode: "single" | "series") => {
  setSelectedMode(mode);
};

const handleStartGame = () => {
  onStartGame(playerName, selectedMode);
};
```

## 🎯 Series Progress Visualization

### **Enhanced GameInfo Component**

**Current**: Shows Trump, Teammate, Bid, Round
**Enhanced**: Adds series progress, game counter, starting player

#### **Updated UI Layout**

```
┌─────────────────────────────────────┐
│         Three of Spades             │
├─────────────────────────────────────┤
│ Game: [2] of [4]                   │
│ ┌─●─●─○─○─┐                       │
│ Series Progress                     │
├─────────────────────────────────────┤
│ Trump: ♠️                           │
│ Teammate: [Card]                   │
│ Bid: 200                           │
│ Trick: 3                           │
│ Starting: Player 2                 │
└─────────────────────────────────────┘
```

#### **Progress Dots System**

- **●** = Completed game (filled green circle)
- **○** = Remaining games (empty gray circle)
- **Current game**: Highlighted with gold color and scale effect
- **Hover effect**: Show game number on hover
- **Responsive**: Adapts to different screen sizes

#### **Component Implementation**

```typescript
interface SeriesProgressDotsProps {
  currentGame: number;
  totalGames: number;
  className?: string;
}

const SeriesProgressDots: React.FC<SeriesProgressDotsProps> = ({
  currentGame,
  totalGames,
  className
}) => {
  const renderDots = () => {
    return Array.from({ length: totalGames }, (_, index) => {
      const isCompleted = index < currentGame - 1;
      const isCurrent = index === currentGame - 1;

      return (
        <span
          key={index}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-200",
            isCompleted && "bg-green-500", // Completed
            isCurrent && "bg-gold scale-125", // Current game
            !isCompleted && !isCurrent && "bg-gray-300" // Future games
          )}
          title={`Game ${index + 1}`}
        />
      );
    });
  };

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      {renderDots()}
    </div>
  );
};
```

## 📊 Collapsible Series Scoreboard

### **Design Philosophy**

- **Hidden by default**: Keeps main game area clean
- **Expandable on demand**: Click to view detailed scores
- **User preference**: Remembers expanded/collapsed state
- **Auto-collapse**: Automatically hides after inactivity

#### **Collapsed State**

```
┌─────────────────────────────────────┐
│ [📊] Series Scoreboard              │
│ (Click to expand)                   │
└─────────────────────────────────────┘
```

#### **Expanded State**

```
┌─────────────────────────────────────┐
│ [📊] Series Scoreboard              │
├─────────────────────────────────────┤
│ Game 1: P1(220) P2(0) P3(200) P4(0)│
│ Game 2: P1(0) P2(170) P3(0) P4(150)│
│ Game 3: P1(0) P2(0) P3(200) P4(0) │
│ Game 4: P1(200) P2(0) P3(0) P4(0) │
├─────────────────────────────────────┘
│ Total: P1(420) P2(170) P3(400) P4(150)│
│ Winner: Player 1 (420 pts)         │
└─────────────────────────────────────┘
```

#### **Component Implementation**

```typescript
interface CollapsibleScoreboardProps {
  seriesProgress: SeriesProgress;
  playerNames: Record<number, string>;
  defaultCollapsed?: boolean;
}

const CollapsibleScoreboard: React.FC<CollapsibleScoreboardProps> = ({
  seriesProgress,
  playerNames,
  defaultCollapsed = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultCollapsed);
  const [userPreference, setUserPreference] = useState<boolean | null>(null);

  // Load user preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scoreboard_expanded');
    if (saved !== null) {
      const preference = saved === 'true';
      setIsExpanded(preference);
      setUserPreference(preference);
    }
  }, []);

  // Auto-collapse timer (only for non-user preferences)
  useEffect(() => {
    if (isExpanded && !userPreference) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isExpanded, userPreference]);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    setUserPreference(newState);
    localStorage.setItem('scoreboard_expanded', newState.toString());
  };

  return (
    <div className="bg-secondary/90 backdrop-blur border border-border/50 rounded-lg p-4 shadow-elevated">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground">Series Scoreboard</h3>
        <button
          onClick={toggleExpanded}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={isExpanded ? "Collapse scoreboard" : "Expand scoreboard"}
        >
          {isExpanded ? "📊" : "📊"}
        </button>
      </div>

      {!isExpanded && (
        <div className="text-sm text-muted-foreground">
          Click to expand
        </div>
      )}

      {isExpanded && (
        <div className="space-y-2">
          {/* Game-by-game breakdown */}
          {Array.from({ length: seriesProgress.currentGame - 1 }, (_, index) => (
            <div key={index} className="text-xs border-b border-border/30 pb-1">
              Game {index + 1}: {renderGameScores(index + 1)}
            </div>
          ))}

          {/* Current game */}
          {seriesProgress.currentGame <= seriesProgress.totalGames && (
            <div className="text-xs border-b border-border/30 pb-1 font-semibold">
              Game {seriesProgress.currentGame}: In Progress
            </div>
          )}

          {/* Series totals */}
          <div className="pt-2 border-t border-border/50">
            <div className="text-sm font-semibold mb-1">Series Totals:</div>
            {renderSeriesTotals()}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🎬 Game Transitions & Modals

### **Game Summary Modal**

**Shown between games (30-second pause)**

#### **Modal Layout**

```
┌─────────────────────────────────────┐
│         Game 2 Complete!            │
├─────────────────────────────────────┤
│ Results:                            │
│ Player 2: +170 (bid winner)        │
│ Player 4: +150 (teammate)          │
│ Player 1: +0 (defender)            │
│ Player 3: +0 (defender)            │
├─────────────────────────────────────┤
│ Series Totals:                      │
│ Player 1: 420 | Player 2: 170      │
│ Player 3: 400 | Player 4: 150      │
├─────────────────────────────────────┤
│ Next game starting in: [15s]       │
│ Player 3 will start next game      │
└─────────────────────────────────────┘
```

#### **Implementation Details**

```typescript
interface GameSummaryModalProps {
  gameNumber: number;
  gameScores: Record<number, number>;
  seriesScores: Record<number, number>;
  nextStartingPlayer: number;
  isOpen: boolean;
  countdown: number; // seconds remaining
}

// Countdown logic:
const [countdown, setCountdown] = useState(30);

useEffect(() => {
  if (isOpen && countdown > 0) {
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [countdown, isOpen]);

// Auto-close when countdown reaches 0
useEffect(() => {
  if (countdown === 0) {
    onClose();
  }
}, [countdown, onClose]);
```

### **Series Completion Modal**

**Final modal when series ends**

#### **Modal Layout**

```
┌─────────────────────────────────────┐
│        Series Complete! 🎉          │
├─────────────────────────────────────┤
│ 🏆 Winner: Player 1 (420 pts)      │
├─────────────────────────────────────┤
│ Final Standings:                    │
│ 1st: Player 1 - 420 points         │
│ 2nd: Player 3 - 400 points         │
│ 3rd: Player 4 - 150 points         │
│ 4th: Player 2 - 170 points         │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐    │
│ │ New Series  │ │ Main Menu   │    │
│ └─────────────┘ └─────────────┘    │
└─────────────────────────────────────┘
```

## 🔧 Technical Implementation

### **State Management Updates**

#### **New Interfaces**

```typescript
interface SeriesProgress {
  currentGame: number;
  totalGames: number;
  gameScores: Record<number, Record<number, number>>; // game -> player -> score
  seriesScores: Record<number, number>; // player -> cumulative score
  startingPlayerIndex: number; // Current starting player (0-3)
  seriesWinner: number | null;
}

interface GameConfig {
  // ... existing fields
  totalGames: number; // New: number of games in series (default: 4)
  gameMode: "single" | "series";
}

interface GameState {
  // ... existing fields
  seriesProgress: SeriesProgress;
  gameMode: "single" | "series";
}
```

#### **Player Session Management**

```typescript
interface PlayerSession {
  playerId: string;
  playerName: string;
  playerIndex: number;
  isConnected: boolean;
  lastSeen: number;
}

interface GameState {
  // ... existing fields
  playerSessions: PlayerSession[]; // Fixed for series duration
}

// Player consistency:
- Players join once at series start
- Names/positions locked for entire series
- Disconnection handling with bot replacement
- Reconnection restores original player
```

### **Game Flow Updates**

#### **New Game Stages**

```typescript
export const GameStages = {
  // ... existing stages
  GAME_SUMMARY: "GAME_SUMMARY", // Show game results, 30s pause
  SERIES_COMPLETE: "SERIES_COMPLETE", // Series finished, show winner
} as const;
```

#### **New Actions**

```typescript
// In gameSlice
startNewGame: state => {
  /* Reset game state, rotate starting player */
};
completeGame: state => {
  /* Calculate game scores, update series scores */
};
completeSeries: state => {
  /* Determine series winner */
};
setGameMode: (state, action: PayloadAction<"single" | "series">) => {
  /* Set game mode */
};
```

## 📱 Responsive Design Considerations

### **Current Approach**

- **Desktop-first design**: Optimize for larger screens initially
- **Mobile redesign**: Planned for future phase
- **Component flexibility**: Design components to be easily adaptable

### **Future Mobile Considerations**

- **Touch-friendly**: Larger touch targets for mobile
- **Simplified layout**: Stack components vertically on small screens
- **Gesture support**: Swipe to expand/collapse scoreboard
- **Progressive disclosure**: Show most important info first

## 📋 Implementation Phases

### **Phase 1: Foundation UI (Week 1-2)**

- [ ] Enhance StartScreen with separate game mode buttons
- [ ] Create SeriesProgress interface and types
- [ ] Extend GameInfo for series display with dots
- [ ] Add game mode state management

### **Phase 2: Series Components (Week 3-4)**

- [ ] Create CollapsibleScoreboard component
- [ ] Implement SeriesProgressDots component
- [ ] Add scoreboard toggle functionality
- [ ] Create GameSummaryModal

### **Phase 3: Integration & Polish (Week 5-6)**

- [ ] Integrate all components into GameBoard
- [ ] Add smooth transitions and animations
- [ ] Implement localStorage for user preferences
- [ ] Add hover effects and accessibility

### **Phase 4: Testing & Refinement (Week 7-8)**

- [ ] Test game mode switching
- [ ] Validate series progression
- [ ] Test scoreboard collapse/expand
- [ ] Verify modal timing and transitions

## 🎯 Success Criteria

### **UI/UX Success**

- [ ] Clear game mode selection
- [ ] Intuitive series progress visualization
- [ ] Smooth transitions between games
- [ ] Accessible scoreboard management
- [ ] Responsive component behavior

### **Technical Success**

- [ ] Clean component architecture
- [ ] Efficient state management
- [ ] Proper user preference persistence
- [ ] Smooth animations and transitions
- [ ] Accessibility compliance

---

_This document serves as the comprehensive guide for implementing the multi-game series UI experience, ensuring consistency with the north star vision while maintaining excellent user experience._
