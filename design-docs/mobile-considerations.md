Mobile considerations:

Touch targets: Ensure all interactive elements are at least 44px
Gesture hints: Add subtle visual cues for swipe actions
Progressive disclosure: Stack information vertically on small screens

Design todos:

- Add visual hierarchy with typography and spacing
- Add onboarding tooltips for first-time series players
  Animation Strategy
  Subtle micro-interactions: Hover effects, button states
  Smooth transitions: Between game stages
  Loading states: Card redistribution progress
  Celebration moments: Game completion, series wins

1. Performance
   Lazy load: Series scoreboard details
   Debounce: User preference saves
   Optimize: Re-renders during countdown

Game todos:

1. Series Abandonment Risk
   Problem: 4-game series is a significant time commitment
   Solution:
   Add "Quick Series" option (2-3 games)
   Show estimated time commitment upfront
   Allow series to be saved/resumed

ref: UI follow-ups for series

Series follow-ups:
Game Mode Selection
The proposed StartScreen enhancement is solid, but I'd suggest:
Visual Hierarchy: Make the selected mode more prominent (larger, different color, subtle animation)
Progressive Enhancement: Start with single game as default, but make series mode feel exciting and special
Clear Value Proposition: The series description could be more compelling - maybe add "Compete for glory across multiple games!"

Game Transitions
The 30-second countdown is perfect, but enhance with:
Progress Bar: Visual countdown bar to complement the timer
Next Game Preview: Show the starting player's name more prominently
Achievement Highlights: Celebrate big plays or comebacks between games
