# Three of Spades — Design Direction

## Explored Approaches

### Theme Name: The Club Table

**Very Brief Intro:** A contemporary tabletop game with the material confidence of a premium physical edition: deep cloth, warm cards, restrained brass, and compact match notation that yields to the table. Social and approachable in ordinary play, focused and consequential at decisive moments.

**Probability:** 0.041

### Theme Name: Tournament Instrument

**Very Brief Intro:** A precise competitive interface organized like a professional match console, with dense score notation, crisp geometry, and minimal material texture. Strategy is foregrounded; atmosphere remains secondary.

**Probability:** 0.008

### Theme Name: Midnight Parlour

**Very Brief Intro:** A more theatrical evening-game identity with ink-black surfaces, oxblood accents, spotlighted cards, and heightened reveal moments. It feels intimate and dramatic, but risks overpowering everyday play.

**Probability:** 0.087

## Chosen Approach: The Club Table

### Design Movement

**Contemporary Gamesmanship**, combining modern premium board-game publishing, understated private-club interiors, and the tactile clarity of a well-made physical score set. The interface should feel designed for people who enjoy thinking together—not like a casino, esports broadcast, or generic dashboard.

### Core Principles

1. **The table is the game; interface chrome must yield to it.** The original spatial four-player geometry, center anchor, hand width, and control adjacency are preserved. Contract, score, series position, and history live in compact corners or an on-demand overlay rather than resizing the table.
2. **Material cues create identity, not decoration.** Cloth, ivory, brass, and ink appear through color, edge, grain, and depth; there are no ornamental chips, neon glows, or casino clichés.
3. **Ordinary play stays quiet; consequential moments earn emphasis.** Trick wins are subtle. Bidding, teammate reveal, game result, and series victory escalate in that order.
4. **Guidance occupies a reserved place.** Beginner help never covers cards or interrupts play. Hints explain the current decision and progressively recede; experts can disable them.

### Color Philosophy

The palette should feel like a physical game opened on a well-kept table at night. **Table Green** creates focus and continuity across gameplay. **Warm Ivory** makes every card and result sheet readable without the glare of white. **Muted Brass** denotes contract, progress, focus, and earned emphasis rather than decorating every boundary. A restrained **Oxblood Red** is reserved for red suits and destructive or failed-contract states.

| Token | Value | Purpose |
|---|---:|---|
| Table Green | `#143F31` | Signature play surface and brand anchor |
| Green Well | `#0B281F` | Outer frame, deep inset regions, modal scrim |
| Green Lift | `#205443` | Active seat, selected surface, hover depth |
| Warm Ivory | `#F4EBDD` | Cards, score sheets, primary light text surfaces |
| Aged Ivory | `#DED2BF` | Secondary paper, disabled cards, quiet dividers |
| Ink | `#20211D` | Card typography and light-surface text |
| Muted Brass | `#B69A62` | Contract, focus, progress, primary action |
| Brass Light | `#D1B77D` | High-contrast brass text and rare highlight |
| Oxblood | `#9E3F35` | Hearts, diamonds, failed contracts, destructive action |

Brass must remain scarce enough to signal meaning. Large flat gold fills, bright yellow controls, and glow effects are prohibited.

### Layout Paradigm

The desktop experience is a **full-viewport spatial table** built on the original production geometry rather than a dashboard grid. The four seats retain their cardinal edge anchors, the human hand remains centered along the lower edge, transient bidding controls remain adjacent at lower right, and the phase-responsive instrument remains centered without being shifted by permanent side chrome.

During bidding, the fixed center anchor becomes a circular auction instrument with each player’s bid attributed around the same cardinal positions as their seats. During play, the same anchor becomes the four-card trick. During teammate reveal, it briefly becomes the reveal stage. A compact upper-left match block carries essential context; an upper-right trigger opens the full match record as an overlay and returns directly to the unchanged table.

On phone landscape, those same anchors compress proportionally instead of changing hierarchy. Opponent names and card stacks hug the table edges, the player hand receives most of the width, and match details remain on demand. Portrait remains functional as a simplified fallback, but the interface may recommend rotation without blocking access.

### Signature Elements

1. **The Brass Register:** A compact four-game register in the upper-left match block, expanded into a full engraved series ledger only when the player opens match details.
2. **Ivory Score Slips:** Results, hints, and summaries appear as flat, warm score slips with clipped or subtly notched corners—not floating rounded cards.
3. **The Partner Mark:** A small split-spade glyph that begins incomplete and joins when the hidden teammate is revealed. It appears in the contract line, reveal moment, and final score record.

### Interaction Philosophy

Controls should feel like handled game pieces: immediate, precise, and lightly tactile. A playable card lifts 6–10 px with a stronger edge and shadow; an unavailable card remains readable but loses saturation and elevation. Selection uses position, outline, and a short notation label—not color alone.

Bids update the central auction instrument and compact match status simultaneously. Passing is deliberate but not alarming. The hint system presents one sentence near the current action, such as “Diamonds were led—follow diamonds while you still hold one.” The player can dismiss a hint, disable guidance from settings, or restore it from the on-demand match overlay.

### Animation

Frequent motion uses `transform` and `opacity` only, with a strong ease-out curve. The original semantic paths are preserved: cards deal toward their final seat, play from their originating edge into the center, hold for trick evaluation, and collect toward the winning cardinal seat. Card hover and button response run at 120–160 ms; card play and auction updates run at 180–240 ms; collection may run at 650–800 ms because the travel communicates state. Drawers and score slips enter within 220–280 ms. Nothing loops decoratively.

Dramatic moments escalate without changing visual language. A teammate reveal joins the split-spade mark and briefly warms the brass register. A game win brings in one result slip. A series victory may use one slower 420–520 ms composition change, followed by stillness. Reduced-motion mode removes travel and preserves only immediate state changes.

### Typography System

| Role | Typeface | Treatment |
|---|---|---|
| Brand and major results | **Fraunces** | Moderate optical size, soft-serif authority, never oversized |
| Interface and guidance | **DM Sans** | Clear sentence case, compact controls, comfortable reading |
| Bids, scores, timers, history | **IBM Plex Mono** | Tabular numerals, restrained uppercase labels, precise alignment |

The wordmark uses a customized Fraunces treatment with a bespoke interlocking Three/Spade symbol. Interface copy remains sans-serif so the game stays quick to scan. Mono notation is reserved for changing values and records.

### Brand Essence

**A beautifully made table for friends who enjoy strategy, memory, and shifting alliances.**

Personality: **observant, sociable, assured**.

### Brand Voice

Headlines are concise and confident. Instructions sound like a calm host at the table. CTAs describe the real action instead of using generic product language. Competitive language is welcome, but “epic,” “battle arena,” “dominate,” and casino-style hype are avoided.

Example lines:

> “Four games. One table. Plenty to remember.”

> “Contract set. Find your partner.”

### Wordmark & Logo

The core mark is a bold, compact **interlocking numeral 3 and spade silhouette**, constructed like a brass maker’s stamp. The lower curve of the 3 forms one side of the spade; the central notch remains visible at favicon size. The symbol contains no text and sits on a transparent background. The wordmark pairs this stamp with a customized Fraunces title whose terminal on “Three” subtly echoes the spade notch.

### Signature Brand Color

**Table Green — `#143F31`**. It should be unmistakably associated with Three of Spades and remain stable across the start screen, game table, summaries, and future private-room lobby.

## Product and Scope Decisions

The core experience is a committed four-game series. Bots provide the immediate solo experience; future private rooms support friends and longer tournament structures. P1 rebuilds all existing flows and logic: start, rules, single game, four-game series, bidding, trump and teammate selection, trick play, game and series summaries, stats, and observer-compatible states. Multiplayer lobby and room structures may be visually anticipated, but their networking implementation is outside the initial rebuild.

Names are the primary social identity; avatars, reactions, chat, and social-feed UI are intentionally absent. Beginner guidance is persistent at first, contextual during decisions, and progressively dismissible. Experts can turn hints off.

## Style Decisions

The original production table geometry is the layout source of truth. No persistent side panel may reduce or shift the play surface; the match record is accessed from compact corner chrome as an overlay. The spatial four-seat orientation, centered phase instrument, bottom hand, and transient lower-right controls remain stable. Desktop and phone landscape are the primary compositions; portrait remains accessible as a simplified fallback. Series victory receives the strongest visual emphasis, followed by game win, teammate reveal, bidding, and ordinary trick wins.
