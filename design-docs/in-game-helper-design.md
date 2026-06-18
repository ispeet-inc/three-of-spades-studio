# In-Game Helper System Design

## 🎯 Overview

A minimal, contextual helper system that provides subtle hints to new players during gameplay. The system is designed to be unobtrusive, educational, and seamlessly integrated into the existing casino-themed UI.

## 🏗️ Architecture

### Core Principles

- **Minimal Integration**: Minimal changes to existing codebase
- **Contextual Timing**: Hints appear at relevant game moments
- **Re-triggerable**: Hints can be shown multiple times (first X occurrences)
- **Universal**: Works for both single games and series
- **Non-Intrusive**: Never blocks gameplay or important UI

## 🎨 Visual Design

### Design System Integration

- **Colors**: Uses existing casino theme (gold accents, felt-green backgrounds)
- **Typography**: Matches existing game fonts and sizing
- **Animations**: Subtle fade-in/out (300ms), no garish effects
- **Positioning**: Tooltip-style near relevant UI elements

### Component Styling

```typescript
const hintStyles = {
  background: "bg-casino-black/90 backdrop-blur-sm",
  border: "border border-gold/30 rounded-lg",
  text: "text-casino-white text-sm font-medium",
  shadow: "shadow-lg",
  animation: "animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
};
```

## 🎮 Hint Categories

### 1. Bidding Phase

- **Trigger**: First time player enters bidding phase
- **Content**: "Bidding determines your team and target score"
- **Position**: Near bidding controls
- **Frequency**: Show first 3 times

### 2. Trump Selection

- **Trigger**: When player needs to select trump suite
- **Content**: "Choose a trump suite you have many cards in"
- **Position**: Near trump selection area
- **Frequency**: Show first 2 times

### 3. Card Playing

- **Trigger**: First card play of each game
- **Content**: "Follow the lead suite if you can"
- **Position**: Near player's hand
- **Frequency**: Show first 3 times

### 4. Game Transitions

- **Trigger**: After trick completion
- **Content**: "Your team scored X points this trick"
- **Position**: Near score display
- **Frequency**: Show first 2 times

## 🔧 Technical Implementation

### 1. Settings Integration

**File**: `src/components/game/SettingsModal.tsx`

```typescript
// Add to existing Gameplay Options section
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Lightbulb className="w-5 h-5 text-gold" />
    <Label htmlFor="helper-mode" className="text-gold font-medium">
      Helper Mode
    </Label>
  </div>
  <Switch
    id="helper-mode"
    checked={helperModeEnabled}
    onCheckedChange={setHelperModeEnabled}
    disabled={isObserver}
  />
</div>
```

### 2. Hint Component

**File**: `src/components/game/HintTooltip.tsx`

```typescript
interface HintTooltipProps {
  content: string;
  position: "top" | "bottom" | "left" | "right";
  visible: boolean;
  onDismiss: () => void;
  targetRef?: React.RefObject<HTMLElement>;
}

const HintTooltip: React.FC<HintTooltipProps> = ({
  content,
  position,
  visible,
  onDismiss,
  targetRef,
}) => {
  // Simple tooltip implementation with casino theme
};
```

### 3. Hint State Management

**File**: `src/hooks/useHintSystem.ts`

```typescript
interface HintState {
  enabled: boolean;
  hintsShown: Record<string, number>; // hintId -> count
  maxShows: Record<string, number>; // hintId -> max times to show
}

const useHintSystem = () => {
  const [hintState, setHintState] = useState<HintState>({
    enabled: false,
    hintsShown: {},
    maxShows: {
      "bidding-intro": 3,
      "trump-selection": 2,
      "card-playing": 3,
      "trick-completion": 2,
    },
  });

  const shouldShowHint = (hintId: string): boolean => {
    if (!hintState.enabled) return false;
    const currentCount = hintState.hintsShown[hintId] || 0;
    const maxCount = hintState.maxShows[hintId] || 0;
    return currentCount < maxCount;
  };

  const markHintShown = (hintId: string) => {
    setHintState(prev => ({
      ...prev,
      hintsShown: {
        ...prev.hintsShown,
        [hintId]: (prev.hintsShown[hintId] || 0) + 1,
      },
    }));
  };

  return { shouldShowHint, markHintShown, hintState };
};
```

## 🎯 Integration Points

### 1. GameBoard Component

**File**: `src/components/game/GameBoard.tsx`

```typescript
// Add hint system integration
const { shouldShowHint, markHintShown } = useHintSystem();

// Bidding hints
{shouldShowHint('bidding-intro') && (
  <HintTooltip
    content="Bidding determines your team and target score"
    position="top"
    visible={true}
    onDismiss={() => markHintShown('bidding-intro')}
    targetRef={biddingControlsRef}
  />
)}
```

### 2. GameRedux Component

**File**: `src/pages/GameRedux.tsx`

```typescript
// Add hint system provider
<HintProvider>
  <GameBoard {...props} />
</HintProvider>
```

## 📱 Responsive Design

### Mobile Considerations

- Hints use smaller text and padding on mobile
- Position hints to avoid blocking important UI elements
- Ensure hints are easily dismissible with touch

### Desktop Experience

- Hints appear near relevant UI elements
- Hover states for better interaction
- Keyboard navigation support

## 🚀 Implementation Plan

### Phase 1: Foundation (Day 1)

1. Add helper mode toggle to settings
2. Create HintTooltip component
3. Implement useHintSystem hook
4. Add basic hint state management

### Phase 2: Core Hints (Day 2)

1. Implement bidding phase hint
2. Add trump selection hint
3. Create card playing hint
4. Add game transition hints

### Phase 3: Integration (Day 3)

1. Integrate hints with GameBoard
2. Add proper positioning logic
3. Test across different screen sizes
4. Polish and refine

## 🔄 Future Enhancements

### Phase 2 Features (Future)

- **Adaptive Difficulty**: Reduce hint frequency as player improves
- **Advanced Hints**: More strategic suggestions for experienced players
- **Hint Analytics**: Track which hints are most helpful
- **Customizable Settings**: Allow players to choose hint types

### Technical Improvements

- **Performance**: Optimize hint rendering and state management
- **Accessibility**: Improve screen reader support
- **Internationalization**: Support for multiple languages

## 📊 Success Metrics

### User Experience

- Hint dismissal rate (should be low)
- Player retention after using hints
- User feedback on hint helpfulness

### Technical

- No performance impact on game
- Hints appear at correct moments
- System works reliably across devices

## 🎯 Design Goals

1. **Minimal**: Keep changes to existing codebase minimal
2. **Helpful**: Provide genuinely useful guidance to new players
3. **Unobtrusive**: Never interfere with gameplay experience
4. **Consistent**: Match existing design system perfectly
5. **Extensible**: Easy to add more hints in the future

---

_This design document serves as the foundation for implementing a minimal, effective helper system that enhances the new player experience without compromising the existing game's polish and performance._
