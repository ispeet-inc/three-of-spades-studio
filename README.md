# Three of Spades

> **Four games. One table. Plenty to remember.**

Three of Spades is a four-player hidden-partner trick-taking game. Each auction decides the contract, trump suit, and card that will reveal the bidder’s teammate; the social puzzle changes as the hand unfolds and scores carry across a four-game series.

This branch presents **The Club Table**: a source-faithful redesign that treats the interface like a premium physical game set rather than a casino screen or generic dashboard. Deep green cloth anchors play, warm ivory carries records and guidance, and restrained brass marks contract, focus, and earned emphasis.

## Experience

| Surface | Purpose |
|---|---|
| **Start Table** | Name the player, choose a single game or four-game series, resume saved play, and open references. |
| **Match Table** | Preserve the four-seat spatial model through bidding, contract setup, trick play, and teammate reveal. |
| **Match Record** | Keep the contract, scores, guidance, series position, and actions available without shrinking the table. |
| **Result Sheets** | Explain game outcomes, cumulative movement, next starter, and final series ranking. |
| **Reference Surfaces** | Provide rules, strategy, statistics, guidance settings, and reduced-motion preferences. |

The primary composition targets desktop and phone landscape. Portrait remains functional and offers a concise rotation recommendation without blocking play. An observer view is available through `/?observer=true&viewer=0` and follows locally saved game state without exposing player actions.

## Design Documentation

The visual and interaction decisions are maintained as first-class product documentation:

| Document | Scope |
|---|---|
| [Club Table Design Philosophy](design-docs/club-table-design-philosophy.md) | Brand essence, core principles, layout source of truth, visual language, voice, and motion philosophy. |
| [Club Table Interface System](design-docs/club-table-interface-system.md) | Information architecture, stage mapping, tokens, responsive geometry, states, guidance, accessibility, and acceptance criteria. |
| [North Star Vision](design-docs/north-star-vision.md) | Wider product direction and future roadmap. |

## Local Development

```sh
npm install
npm run dev
```

The app is built with **React 19**, **TypeScript**, **Redux Toolkit and Redux Saga**, **Vite**, **Tailwind CSS 4**, and **Radix UI primitives**.

## Quality Gates

```sh
npm run type-check
npm test
npm run build
```

Run all release checks together with:

```sh
npm run check
```

The reducer regression suite includes completed-Series resume hydration so match mode, cumulative standings, and final result state survive restoration while transient deal motion is safely cleared.

## Product Principles

The table remains the game, and interface chrome yields to it. Material cues create identity rather than decoration. Ordinary trick play stays quiet while bidding, teammate reveal, game results, and series victory receive progressively stronger emphasis. Guidance always occupies a reserved place and can be reduced or disabled without removing required rule feedback.

Every surface should answer three questions without searching: **What is happening? What matters now? What can I do next?**
