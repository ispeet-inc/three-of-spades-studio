# Multi-Game Series Design & Implementation

## 🎯 Overview

This document details the **UI design and implementation plan** for transforming Three of Spades from a single-game experience to a multi-game series with cumulative scoring.

**Note**: The technical foundation (Redux store, saga flow, state management) is already 100% complete and working. This document focuses purely on UI components and user experience enhancements.

## 🏗️ Foundation Status

### **✅ COMPLETED (Foundation Implementation)**

- Redux store with series progress management (`SeriesProgress` interface)
- Game flow saga with multi-game transitions
- Card redistribution between games (`resetGameStateForNewGame`)
- Score calculation and series accumulation (`calculateGameScores`)
- Starting player rotation logic (`rotateStartingPlayer`)
- All game stages and actions implemented (`GAME_SUMMARY`, `SERIES_SUMMARY`)
- Game mode management (`single` vs `series`)

### **✅ COMPLETED (UI Implementation)**

- StartScreen with game mode selection (Single/Series)
- SeriesProgressBar component for progress visualization
- GameInfo integration with series progress display
- CollapsibleScoreboard component with toggle functionality
- GameSummaryModal for between-game transitions
- SeriesSummaryModal for series completion
- Full integration with GameBoard and GameRedux
- Observer mode support across all components

### **🎯 IMPLEMENTATION STATUS**

**Multi-game series functionality is 100% complete and fully functional.** All core UI components have been implemented and integrated, providing a complete multi-game experience with:

- Game mode selection (Single vs Series)
- Series progress visualization
- Between-game transitions with modals
- Series completion celebration
- Scoreboard management
- Full observer mode support

The implementation successfully delivers the intended user experience while maintaining consistency with the existing design system and technical architecture.

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

#### **Color & Animation Specifications**

**Color Strategy:**

- **Selected mode**: `bg-gold text-casino-black` (primary button style)
- **Unselected mode**: `bg-secondary text-secondary-foreground` (subtle but visible)
- **Mode switching**: Smooth `transition-colors` with `duration-normal` (300ms)

**Animation Strategy:**

- **Mode selection**: `hover:scale-105` with `duration-fast` (150ms)
- **Button press**: Existing `animate-button-press` (100ms)
- **Transition**: `fade-in` with `duration-slow` (500ms) for new content
- **Hover effects**: `hover:shadow-xl` with `transition-all duration-300`

#### **Implementation Details**

```typescript
interface StartScreenProps {
  onStartGame: (playerName: string, gameMode: "single" | "series") => void;
}

// State management:
const [selectedMode, setSelectedMode] = useState<"single" | "series">("single");

// Button click handlers:
const handleModeSelect = (mode: "single" | "series") => {
  setSelectedMode(mode);
};

const handleStartGame = () => {
  onStartGame(playerName, selectedMode);
};
```

#### **Integration with Existing Foundation**

```typescript
// In GameRedux.tsx - Update StartScreen usage:
<StartScreen
  onStartGame={(playerName: string, gameMode: "single" | "series") => {
    // Set game mode first
    dispatch(setGameMode(gameMode));
    // Then start game with existing logic
    handleStartGame(playerName);
  }}
/>
```

## 🎯 Series Progress Visualization

### **Enhanced GameInfo Component**

**Current**: Shows Trump, Teammate, Bid, Trick  
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

#### **Color & Animation Specifications**

**Color Strategy:**

- **Completed games**: `bg-green-500` (success state)
- **Current game**: `bg-gold` with `scale-125` (highlighted)
- **Future games**: `bg-gray-300` (muted, placeholder)
- **Container**: Integrate with existing `bg-secondary/90` GameInfo container

**Animation Strategy:**

- **Current game**: Add subtle `animate-glow-pulse` for attention
- **Hover effects**: `hover:scale-110` with `duration-fast` (150ms)
- **Progress updates**: `animate-score-update` when games complete
- **Transitions**: `transition-all duration-200` for smooth state changes

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
            isCurrent && "bg-gold scale-125 animate-glow-pulse", // Current game with pulse
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

#### **Integration with Existing Foundation**

```typescript
// In GameInfo.tsx - Add series progress:
import { selectSeriesProgress, selectCurrentGame, selectTotalGames } from "@/store/selectors";

export const GameInfo = (props: GameInfoProps) => {
  const seriesProgress = useAppSelector(selectSeriesProgress);
  const currentGame = useAppSelector(selectCurrentGame);
  const totalGames = useAppSelector(selectTotalGames);

  // ... existing trump/teammate/bid/trick display ...

  {/* NEW: Series Progress */}
  {seriesProgress.totalGames > 1 && (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Game:</span>
        <span className="text-gold font-semibold">{currentGame} of {totalGames}</span>
      </div>
      <SeriesProgressDots currentGame={currentGame} totalGames={totalGames} />
    </div>
  )}
};
```

**Color & Animation Enhancements:**

- **Game counter**: `text-gold` with `font-semibold` for emphasis
- **Starting player**: Add `text-accent` (orange-red) for next player indication
- **Container**: Maintain existing `bg-secondary/90 backdrop-blur` styling
- **Transitions**: `fade-in` with `duration-normal` (300ms) for new content

## 📊 Collapsible Series Scoreboard

### **Design Philosophy**

- **Hidden by default**: Keeps main game area clean
- **Expandable on demand**: Click to view detailed scores
- **User preference**: Remembers expanded/collapsed state
- **Auto-collapse**: Automatically hides after inactivity

#### **Color & Animation Specifications**

**Color Strategy:**

- **Container**: Use existing `bg-secondary/90 backdrop-blur border-border/50`
- **Headers**: `text-foreground` with `font-semibold`
- **Game scores**: `text-muted-foreground` for completed, `text-foreground` for current
- **Series totals**: `text-gold` for winner, `font-bold` for emphasis
- **Toggle button**: `text-muted-foreground hover:text-foreground`

**Animation Strategy:**

- **Expand/collapse**: Smooth height transitions with `duration-normal` (300ms)
- **Auto-collapse**: `fade-out` with `duration-fast` (150ms)
- **Score updates**: `animate-score-update` for new totals
- **Hover effects**: `transition-colors duration-200` for interactive elements

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
          className="text-muted-foreground hover:text-foreground transition-colors duration-200"
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

#### **Integration with Existing Foundation**

```typescript
// In GameBoard.tsx - Add scoreboard toggle:
const [showScoreboard, setShowScoreboard] = useState(false);

// Add toggle button in header area
<button onClick={() => setShowScoreboard(!showScoreboard)}>
  📊 Series Scoreboard
</button>

// Conditionally render scoreboard
{showScoreboard && (
  <CollapsibleScoreboard
    seriesProgress={seriesProgress}
    playerNames={playerNames}
  />
)}
```

## 🎬 Game Transitions & Modals

### **Game Summary Modal**

**Shown between games (30-second pause)**

#### **Color & Animation Specifications**

**Color Strategy:**

- **Modal background**: Use `bg-card` with `text-card-foreground`
- **Countdown timer**: `text-gold` with `animate-glow-pulse`
- **Next player**: `text-accent` (orange-red) for emphasis
- **Game results**: `text-foreground` with `font-semibold`
- **Series totals**: `text-gold` for current leader

**Animation Strategy:**

- **Modal entrance**: `fade-in` with `duration-slow` (500ms)
- **Countdown**: `animate-glow-pulse` for urgency
- **Score updates**: `animate-score-update` for new totals
- **Button interactions**: `animate-button-press` and `hover:scale-105`

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

#### **Integration with Existing Foundation**

```typescript
// In GameRedux.tsx - Add modal for GAME_SUMMARY stage:
{gameState.gameProgress.stage === GameStages.GAME_SUMMARY && (
  <GameSummaryModal
    isOpen={true}
    gameNumber={seriesProgress.currentGame - 1}
    gameScores={seriesProgress.gameScores[seriesProgress.currentGame - 1] || {}}
    seriesScores={seriesProgress.seriesScores}
    nextStartingPlayer={seriesProgress.startingPlayerIndex}
    countdown={30}
    onClose={() => {
      // Modal auto-closes, saga handles next game transition
    }}
  />
)}
```

### **Series Completion Modal**

**Final modal when series ends**

#### **Color & Animation Specifications**

**Color Strategy:**

- **Modal background**: Use `bg-card` with `text-card-foreground`
- **Winner announcement**: `text-gold` with `font-bold` and `animate-victory-pulse`
- **Final standings**: `text-foreground` with `font-semibold`
- **Primary button**: `bg-gold text-casino-black` (New Series)
- **Secondary button**: `bg-secondary text-secondary-foreground` (Main Menu)

**Animation Strategy:**

- **Modal entrance**: `fade-in` with `duration-slow` (500ms)
- **Winner celebration**: `animate-game-win-celebration` (1.2s)
- **Button interactions**: `animate-button-press` and `hover:scale-105`
- **Victory effects**: `animate-victory-pulse` for winner highlight

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

#### **Integration with Existing Foundation**

```typescript
// In GameRedux.tsx - Add modal for SERIES_SUMMARY stage:
{gameState.gameProgress.stage === GameStages.SERIES_SUMMARY && (
  <SeriesCompletionModal
    isOpen={true}
    seriesProgress={seriesProgress}
    playerNames={playerNames}
    onNewSeries={() => {
      // Reset to INIT stage, saga will handle new series
      dispatch(setStage(GameStages.INIT));
    }}
    onMainMenu={() => {
      // Navigate to main menu
      navigate('/');
    }}
  />
)}
```

## 🔧 Technical Integration

### **Existing Foundation (No Changes Needed)**

- `GameState.seriesProgress` - Series management
- `GameState.gameMode` - Single vs series mode
- `startNextGame`, `completeGame`, `completeSeries` actions
- Multi-game stage transitions (`GAME_SUMMARY`, `SERIES_SUMMARY`)

### **UI Integration Points**

- Connect StartScreen to `setGameMode` action
- Display series progress from `selectSeriesProgress` selector
- Show game transitions using existing game stages
- Integrate modals with existing game flow

### **Design System Integration**

**Color Palette Extension:**

- **Series Progress**: Leverage existing `gold`, `green-500`, `gray-300` for dots
- **Game Transitions**: Use `accent` (orange-red) for emphasis and highlights
- **Modal States**: Maintain `card`, `secondary`, and `muted` color hierarchy
- **Success States**: Extend `green-500` for completed games, `gold` for current

**Animation System Integration:**

- **Timing Consistency**: Use established `duration-fast` (150ms), `duration-normal` (300ms), `duration-slow` (500ms)
- **Existing Animations**: Leverage `animate-glow-pulse`, `animate-score-update`, `animate-victory-pulse`
- **Transition Classes**: Maintain `transition-all`, `transition-colors` patterns
- **Hover Effects**: Use consistent `hover:scale-105` and `hover:shadow-xl` patterns

### **Component Integration Examples**

#### **StartScreen → Redux**

```typescript
// Current: onStartGame(playerName)
// Updated: onStartGame(playerName, gameMode)
// Action: setGameMode(gameMode) + existing game start logic
```

#### **GameInfo → Series Progress**

```typescript
// Use existing selectors:
// - selectSeriesProgress() for game counter
// - selectCurrentGame() for current game number
// - selectTotalGames() for total games
```

#### **Modals → Game Stages**

```typescript
// Connect to existing stages:
// - GAME_SUMMARY stage triggers GameSummaryModal
// - SERIES_SUMMARY stage triggers SeriesCompletionModal
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

### **Animation & Color Adaptations for Mobile**

**Mobile Animation Adjustments:**

- **Reduced motion**: Respect `prefers-reduced-motion` for accessibility
- **Simplified transitions**: Use `duration-fast` (150ms) for mobile performance
- **Touch feedback**: Leverage existing `animate-button-press` for touch interactions
- **Gesture animations**: Plan for `animate-ripple-effect` on touch events

**Mobile Color Considerations:**

- **Contrast optimization**: Ensure `gold` and `accent` colors meet mobile accessibility standards
- **Touch targets**: Use `bg-secondary` with clear borders for interactive elements
- **Progressive disclosure**: Leverage `text-muted-foreground` for secondary information

## 📋 Implementation Phases

### **Phase 1: Foundation UI (Week 1-2)** ✅ **COMPLETED**

- [x] Update StartScreen interface to support game mode selection
- [x] ~~Create SeriesProgressDots component~~ **SKIPPED** - Using progress bar instead
- [x] ~~Extend GameInfo for series display with dots~~ **SKIPPED** - Using progress bar instead
- [x] Add game mode state management in parent components

**Color & Animation Focus:**

- ✅ Implement gold/primary button styling for selected game mode
- ✅ Add `hover:scale-105` and `animate-button-press` interactions
- ✅ Create smooth `transition-colors duration-300` for mode switching
- ~~Integrate `animate-glow-pulse` for current game progress dots~~ **SKIPPED**

### **Phase 2: Series Components (Week 3-4)** ✅ **COMPLETED**

- [x] Create CollapsibleScoreboard component
- [x] Implement scoreboard toggle functionality
- [x] Create GameSummaryModal
- [x] Create SeriesCompletionModal (SeriesSummaryModal)

**Color & Animation Focus:**

- ✅ Implement `bg-secondary/90 backdrop-blur` container styling
- ✅ Add smooth height transitions with `duration-normal` (300ms)
- ~~Create `animate-score-update` effects for score changes~~ **SKIPPED**
- ✅ Implement `text-gold` highlighting for winners and leaders

### **Phase 3: Integration & Polish (Week 5-6)** ✅ **COMPLETED**

- [x] Integrate all components into GameBoard
- [x] Add smooth transitions and animations
- ~~Implement localStorage for user preferences~~ **SKIPPED**
- [x] Add hover effects and accessibility

**Color & Animation Focus:**

- ✅ Integrate `animate-fade-in` with `duration-slow` (500ms) for modals
- ~~Implement `animate-glow-pulse` for countdown timers~~ **SKIPPED**
- ✅ Add `animate-victory-pulse` and `animate-game-win-celebration` for series completion
- ✅ Ensure consistent `transition-all duration-300` patterns across components

### **Phase 4: Testing & Refinement (Week 7-8)** ✅ **COMPLETED**

- [x] Test game mode switching
- [x] Validate series progression
- [x] Test scoreboard collapse/expand
- [x] Verify modal timing and transitions

## 🎯 Success Criteria

### **UI/UX Success** ✅ **ACHIEVED**

- [x] Clear game mode selection
- [x] Intuitive series progress visualization (using progress bar)
- [x] Smooth transitions between games
- [x] Accessible scoreboard management
- [x] Responsive component behavior

### **Design System Success** ✅ **ACHIEVED**

- [x] Consistent color palette usage (`gold`, `accent`, `secondary`)
- [x] Proper animation timing (`fast`, `normal`, `slow`)
- [x] Smooth transitions (`transition-all`, `transition-colors`)
- [x] Accessible contrast ratios for all color combinations
- [x] Performance-optimized animations (respects `prefers-reduced-motion`)

### **Technical Success** ✅ **ACHIEVED**

- [x] Clean component architecture
- [x] Efficient integration with existing Redux
- [x] ~~Proper user preference persistence~~ **SKIPPED** - Not required for core functionality
- [x] Smooth animations and transitions
- [x] Accessibility compliance

---

_This document serves as the comprehensive guide for implementing the multi-game series UI experience, building upon the completed technical foundation to ensure consistency with the north star vision while maintaining excellent user experience._
