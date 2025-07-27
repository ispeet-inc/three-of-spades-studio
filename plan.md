## Plan to Remove Mock State and Complete Redux Integration

### Current State Analysis:
1. **Game.tsx** currently uses hardcoded `mockGameState` instead of Redux state
2. **GameRedux.tsx** is already properly integrated with Redux and has all the necessary functionality
3. Missing features compared to old-code include:
   - Bot card visibility toggle functionality
   - Settings modal/panel
   - Proper game stage management in Game.tsx
   - Game initialization and start screen integration
   - All modal integrations (bidding, trump selection, round summary, game over)

### Implementation Steps:

#### ✅ Step 1: Replace Mock State in Game.tsx
- ✅ Remove the hardcoded `mockGameState` object
- ✅ Import Redux hooks (`useAppSelector`, `useAppDispatch`) 
- ✅ Import all necessary Redux actions from `gameSlice`
- ✅ Import game stages and modal components
- ✅ Transform Redux state to GameBoard props format (similar to GameRedux.tsx)

#### ✅ Step 2: Add Missing Game Logic to Game.tsx
- ✅ Add game initialization logic with start screen
- ✅ Add card play handling that dispatches `playCard` action
- ✅ Add bot move automation logic (useEffect for bot turns)
- ✅ Add bidding automation for bots
- ✅ Add trump selection automation for bots
- ✅ Add proper stage transitions

#### ✅ Step 3: Add Missing UI Features
- ✅ Integrate all modal components:
  - ✅ BiddingModal for bidding stage
  - ✅ TrumpSelectionModal for trump selection
  - ✅ RoundSummaryModal for round end
  - ✅ GameOverModal for game completion
- ✅ Add bot card visibility toggle feature:
  - ✅ Add state for `botCardsHidden` (boolean)
  - ✅ Add toggle handler `handleToggleBotCardsHidden`
  - ✅ Pass this to GameBoard and implement in PlayerArea components

#### ✅ Step 4: Add Settings Functionality
- ✅ Create a Settings modal/drawer component
- ✅ Add settings state management (bot card visibility, animations, etc.)
- ✅ Implement proper settings handler in Game.tsx
- ✅ Add settings persistence (localStorage)

#### ✅ Step 5: Implement Missing Game Features
- ✅ Add dealing animation state and handling
- ✅ Add feedback system integration (haptic-like effects)
- ✅ Add accessibility features and announcements
- ✅ Add error handling and loading states

#### ✅ Step 6: Route and Navigation Updates
- ✅ Update the main App.tsx routing to potentially make `/redux-game` the default
- ✅ Consider deprecating the mock Game.tsx or making it redirect to GameRedux
- ✅ Update Index.tsx to reflect the changes

#### ✅ Step 7: Code Organization and Cleanup
- ✅ Ensure consistent prop interfaces between components
- ✅ Add proper TypeScript types for all new functionality
- ✅ Remove duplicate code and consolidate game logic
- ✅ Add proper error boundaries and loading states

### ✅ Files that were changed:
1. ✅ `src/pages/Game.tsx` - Complete Redux integration
2. ✅ `src/components/game/GameBoard.tsx` - Add bot card visibility props
3. ✅ `src/components/game/PlayerArea.tsx` - Implement bot card hiding
4. ✅ `src/components/game/SettingsModal.tsx` - New settings component
5. ✅ `src/types/game.ts` - Additional type definitions if needed
6. ✅ `src/hooks/index.ts` - Export useAppSelector and useAppDispatch
7. ✅ `src/App.tsx` - Routing updates if needed
8. ✅ `src/pages/Index.tsx` - Updated button labels

### ✅ Key Features Implemented:
1. ✅ **Bot Card Visibility Toggle** - Allow hiding/showing bot cards
2. ✅ **Settings Panel** - Game preferences and options
3. ✅ **Complete Modal Integration** - All game stage modals
4. ✅ **Bot Automation** - Automated bot moves for all game stages
5. ✅ **State Transformation** - Proper Redux state to GameBoard props
6. ✅ **Game Initialization** - Start screen and game setup
7. ✅ **Animation States** - Dealing animations and transitions
8. ✅ **Accessibility** - Screen reader support and keyboard navigation

✅ **IMPLEMENTATION COMPLETE!** All plan items have been successfully implemented.