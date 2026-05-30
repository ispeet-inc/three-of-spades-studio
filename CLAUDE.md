# Three of Spades — Claude Context

## Project
A 4-player trick-taking card game (2v2 teams with secret teammate reveal). Built with React + TypeScript, Redux Toolkit, redux-saga, Tailwind CSS, shadcn/ui, and Vite.

## Dev Commands
```bash
npm run dev          # start dev server
npm run type-check   # TypeScript check (no emit)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run build        # production build
```

## Agents
Three project agents live in `.claude/agents/`. Use them for any non-trivial work:

| Agent | Use when... |
|-------|------------|
| **tech-lead** | Designing a solution, breaking down an issue, or implementing changes that span multiple systems |
| **bob** | Implementing game logic, Redux state changes, sagas, scoring rules, bot AI |
| **ui-expert** | Implementing component changes, layout, styling, animations, modals |

Default flow: **tech-lead designs → bob + ui-expert implement**.

## Key Architecture Facts
- All game state lives in one Redux slice: `src/store/gameSlice.ts`
- Side effects (bot turns, trick timing, bidding timer) are in sagas: `src/store/sagas/`
- Stage transitions are validated by `isValidStageTransition()` in `src/store/gameStages.ts`
- Human player is always index 3 (`FIRST_PLAYER_ID = 3`), positioned at bottom
- Observer mode: open `/:viewerIndex` in a second tab; state syncs via localStorage
- Stats persist to localStorage under key `"three-of-spades-stats"`

## Game Rules (quick reference)
- 40-card deck (3–A per suit, no 2s). Total points = 250.
- 3♠ = 30pts. Ace/10/J/Q/K = 10pts each. 5 = 5pts. Others = 0.
- Bidding opens at 165 (forced minimum opener). Max bid = 250.
- Bid winner picks trump suite + a secret teammate card (not in their hand).
- Teammate revealed publicly when they play that card.
- Whitewash = bidding team wins all 250 pts → +50 bonus.
- Series = 4 games, cumulative scoring, starting player rotates each game.
